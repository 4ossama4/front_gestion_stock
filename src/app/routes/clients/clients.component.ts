import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../services/notification.service';
import { clientService } from '../../services/client.service';

// _____________models____________
import { articleCriteria } from '../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { clientCriteria } from 'src/app/models/client.criteria';
import { StockService } from 'src/app/services/stock.service';
import { baseComponent } from '../base-component/base-component.component';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.less'],
})
export class clientComponent extends baseComponent implements OnInit {
  private clientForm: FormGroup = new FormGroup({});
  private loading: boolean = true;
  private releverForm: FormGroup = new FormGroup({});

  private clientModal: boolean = false;
  private totalClients: number = 0;
  private firstClient: number = 0;
  private maxResults: number = 10;
  private isUpdate: boolean = false;
  private clientCriteria: clientCriteria = new clientCriteria();

  private listOfClients: any[] = [];

  private listOfVille: any[] = [];
  private somme_credit = 0;

  private ROLE_ADD: boolean = false;
  private ROLE_UPDATE: boolean = false;
  private ROLE_DELETE: boolean = false;
  private ROLE_RELEVER: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clientService: clientService,
    protected settings: SettingsService,
    private stockService: StockService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.createFormClient();
    this.createFormRelever();
    this.ROLE_ADD = this.hasPermission('add_client');
    this.ROLE_UPDATE = this.hasPermission('update_client');
    this.ROLE_DELETE = this.hasPermission('delete_client');
    this.ROLE_RELEVER = this.hasPermission('show_releve_client');
  }

  ngOnInit(): void {
    this.getVilles();
    // this.getclientByCriteria();
  }

  public createFormClient() {
    this.clientForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      telephone: [null],
      fixe: [null, []],
      email: [null, [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      addresse: [null, []],
      ville_id: [null, []],
      max_credit: [null, []],
      credit: [0, []],
      remise: [null, []],
    });
  }

  public getClients() {
    this.loading = true;
    this.clientService.getClients().subscribe(
      (response: any) => {
        this.listOfClients = response;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public deleteClient(client: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer ce client',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(client),
    });
  }

  public confirmationDelete(client: number) {
    this.clientService.delete(client).subscribe(
      (response) => {
        this.getclientByCriteria();
        this.notificationService.createNotification('success', 'Client a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  public closeModalAdd() {
    this.clientForm.reset({ credit: 0 });
    this.clientModal = false;
  }

  public openModalAdd() {
    this.clientModal = true;
  }

  public saveClient() {
    for (const i in this.clientForm.controls) {
      this.clientForm.controls[i].markAsDirty();
      this.clientForm.controls[i].updateValueAndValidity();
    }

    if (this.clientForm.valid) {
      if (this.isUpdate) {
        this.clientService.update(this.clientForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Client a été modifié avec succes', null);
            this.getclientByCriteria();
          },
          (error) => {},
        );
      } else {
        this.clientService.store(this.clientForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Client a été ajouté avec succes', null);
            this.getclientByCriteria();
          },
          (error) => {},
        );
      }
    }
  }

  public getVilles() {
    this.clientService.getVilles().subscribe(
      (response: any) => {
        this.listOfVille = response;
      },
      (error) => {},
    );
  }

  public saveVille(ville: HTMLInputElement) {
    const value = ville.value;
    if (this.listOfVille.indexOf(value) === -1 && value) {
      this.clientService.storeVille({ label: value }).subscribe(
        (response: any) => {
          this.clientForm.patchValue({ ville_id: response.id });
          this.getVilles();
          this.notificationService.createNotification('success', 'Ville a été ajouté avec succes', null);
        },
        (error) => {},
      );
    }
  }

  public openModalUpdate(client: any) {
    this.isUpdate = true;
    this.clientForm.patchValue(client);
    this.clientModal = true;
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'nameLike':
        this.clientCriteria.nameLike = null;
        break;
      case 'addressLike':
        this.clientCriteria.addressLike = null;
        break;
      case 'telephoneLike':
        this.clientCriteria.telephoneLike = null;
        break;
      case 'fixeLike':
        this.clientCriteria.fixeLike = null;
        break;
      case 'villeId':
        this.clientCriteria.villeId = null;
        break;
      default:
        break;
    }
    this.clientCriteria.page = 1;
    this.firstClient = 1;
    this.getclientByCriteria();
  }

  public getclientByCriteria() {
    this.loading = true;
    this.clientService.getClientsByCriteria(this.clientCriteria).subscribe(
      (response: any) => {
        this.listOfClients = response.data;
        this.totalClients = response.total;
        this.somme_credit = response.somme_credit;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public sort(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    console.log('params', params);
    const currentSort = sort.find((item) => item.value !== null);
    if (params.pageIndex) {
      this.clientCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.clientCriteria.sortField = currentSort.key;
      this.clientCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.clientCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getclientByCriteria();
    }
  }

  public search() {
    this.clientCriteria.page = 1;
    this.firstClient = 1;
    this.getclientByCriteria();
  }

  private timeLineModal: boolean = false;

  public hideTimeLineModal() {
    this.timeLineModal = false;
    this.clientSelected = null;
    this.releverForm.reset();
    this.listeOfrelever = [];
  }

  createFormRelever() {
    this.releverForm = this.fb.group({
      id: [null, [Validators.required]],
      dateStart: [null, [Validators.required]],
      dateEnd: [null, [Validators.required]],
      date: [null],
    });
  }

  public listeOfrelever: any[] = [];
  public loadingReleve: boolean = false;
  public clientSelected: any;
  public showTimeLineModal(data: any) {
    this.clientSelected = data;
    this.timeLineModal = true;
    this.createFormRelever();
    this.releverForm.patchValue({ id: data.id });
    var dateDebut = new Date();
    dateDebut.setDate(1);
    dateDebut.setHours(0, 0, 0);
    var lastDayOfMonth = new Date(dateDebut.getFullYear(), dateDebut.getMonth() + 1, 0);
    var dateFin = new Date();
    dateFin.setDate(lastDayOfMonth.getDate());
    dateFin.setHours(23, 59, 59);

    this.releverForm.patchValue({ dateStart: dateDebut, dateEnd: dateFin });
    this.releverForm.patchValue({ date: [dateDebut, dateFin] });
    this.getRelever();
  }

  public getRelever() {
    for (const i in this.releverForm.controls) {
      this.releverForm.controls[i].markAsDirty();
      this.releverForm.controls[i].updateValueAndValidity();
    }
    if (this.releverForm.valid) {
      this.loadingReleve = true;
      this.clientService.releveClient(this.releverForm.value).subscribe(
        (response: any) => {
          this.listeOfrelever = response;
          this.loadingReleve = false;
        },
        (error) => {
          this.loadingReleve = false;
        },
      );
    }
  }

  onChangeDate(result: Date[]): void {
    if (result && result.length > 0) {
      result[0].setHours(0, 0, 0);
      result[1].setHours(23, 59, 59);
      this.releverForm.patchValue({ dateStart: result[0], dateEnd: result[1] });
    }

    if (result && result.length == 0) {
      this.releverForm.patchValue({ dateStart: null, dateEnd: null });
    }
  }

  public imprimerRelever() {
    if (this.releverForm.valid) {
      this.clientService.imprimerReleveClient(this.releverForm.value).subscribe(
        (response: any) => {
          var downloadURL = window.URL.createObjectURL(response);
          var link = document.createElement('a');
          link.href = downloadURL;
          window.open(downloadURL);
        },
        (error) => {},
      );
    }
  }

  public exportData(type: string) {
    var data = { type: type, criteria: this.clientCriteria, table: 'clients' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        if (type == 'excel') {
          link.download = 'clients.xlsx';
          link.click();
        } else {
          window.open(downloadURL);
        }
        this.notificationService.createNotification('success', 'Clients a été exporté avec succes', null);
      },
      (error) => {},
    );
  }
}
