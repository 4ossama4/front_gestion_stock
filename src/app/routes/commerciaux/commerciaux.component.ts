import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../services/notification.service';
import { CommercialService } from '../../services/commercial.service';

// _____________models____________
import { articleCriteria } from '../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { commercialCriteria } from 'src/app/models/commercial.criteria';
import { SettingsService } from '@delon/theme';
import { baseComponent } from '../base-component/base-component.component';
import { StockService } from 'src/app/services/stock.service';

@Component({
  selector: 'app-commerciaux',
  templateUrl: './commerciaux.component.html',
  styleUrls: ['./commerciaux.component.less'],
})
export class commercialComponent extends baseComponent implements OnInit {
  private commercialeForm: FormGroup = new FormGroup({});
  private releverForm: FormGroup = new FormGroup({});

  private loading: boolean = true;

  private commercialeModal: boolean = false;
  private totalCommerciale: number = 0;
  private firstCommerciale: number = 0;
  private maxResults: number = 10;
  private isUpdate: boolean = false;
  private commercialeCriteria: commercialCriteria = new commercialCriteria();

  private timeLineModal: boolean = false;
  private listOfCommerciaux: any[] = [];

  private listOfVille: any[] = [];
  private somme_profit = 0;

  private ROLE_ADD: boolean = false;
  private ROLE_UPDATE: boolean = false;
  private ROLE_DELETE: boolean = false;
  private ROLE_RELEVER: boolean = false;

  constructor(
    private fb: FormBuilder,
    protected settings: SettingsService,
    private stockService: StockService,
    private commercialService: CommercialService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.createFormCommerciale();
    this.createFormRelever();

    this.ROLE_ADD = this.hasPermission('add_commercial');
    this.ROLE_UPDATE = this.hasPermission('update_commercial');
    this.ROLE_DELETE = this.hasPermission('delete_commercial');
    this.ROLE_RELEVER = this.hasPermission('show_releve_commercial');
  }

  ngOnInit(): void {
    this.getVilles();
    // this.getCommerciauxByCriteria();
  }

  public createFormCommerciale() {
    this.commercialeForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      telephone: [null],
      fixe: [null, []],
      email: [null, [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      addresse: [null, []],
      ville_id: [null, []],
      commission: [0, []],
    });
  }

  public getCommerciaux() {
    this.loading = true;
    this.commercialService.getCommerciaux().subscribe(
      (response: any) => {
        this.listOfCommerciaux = response;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public deleteCommerciale(Commerciale: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer ce commerciale',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(Commerciale),
    });
  }

  public confirmationDelete(Commerciale: number) {
    this.commercialService.delete(Commerciale).subscribe(
      (response) => {
        this.getCommerciauxByCriteria();
        this.notificationService.createNotification('success', 'Commerciale a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  public closeModalAdd() {
    this.commercialeForm.reset({ commission: 0 });
    this.commercialeModal = false;
  }

  public openModalAdd() {
    this.commercialeModal = true;
  }

  public saveCommerciale() {
    for (const i in this.commercialeForm.controls) {
      this.commercialeForm.controls[i].markAsDirty();
      this.commercialeForm.controls[i].updateValueAndValidity();
    }

    if (this.commercialeForm.valid) {
      if (this.isUpdate) {
        this.commercialService.update(this.commercialeForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Commerciale a été modifié avec succes', null);
            this.getCommerciauxByCriteria();
          },
          (error) => {},
        );
      } else {
        this.commercialService.store(this.commercialeForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Commerciale a été ajouté avec succes', null);
            this.getCommerciauxByCriteria();
          },
          (error) => {},
        );
      }
    }
  }

  public getVilles() {
    this.commercialService.getVilles().subscribe(
      (response: any) => {
        this.listOfVille = response;
      },
      (error) => {},
    );
  }

  public saveVille(ville: HTMLInputElement) {
    const value = ville.value;
    if (this.listOfVille.indexOf(value) === -1 && value) {
      this.commercialService.storeVille({ label: value }).subscribe(
        (response: any) => {
          this.commercialeForm.patchValue({ ville_id: response.id });
          this.getVilles();
          this.notificationService.createNotification('success', 'Ville a été ajouté avec succes', null);
        },
        (error) => {},
      );
    }
  }

  public openModalUpdate(Commerciale: any) {
    this.isUpdate = true;
    this.commercialeForm.patchValue(Commerciale);
    this.commercialeModal = true;
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'nameLike':
        this.commercialeCriteria.nameLike = null;
        break;
      case 'addressLike':
        this.commercialeCriteria.addressLike = null;
        break;
      case 'telephoneLike':
        this.commercialeCriteria.telephoneLike = null;
        break;
      case 'fixeLike':
        this.commercialeCriteria.fixeLike = null;
        break;
      case 'villeId':
        this.commercialeCriteria.villeId = null;
        break;
      default:
        break;
    }
    this.commercialeCriteria.page = 1;
    this.firstCommerciale = 1;
    this.getCommerciauxByCriteria();
  }

  public getCommerciauxByCriteria() {
    this.loading = true;
    this.commercialService.getCommerciauxByCriteria(this.commercialeCriteria).subscribe(
      (response: any) => {
        this.listOfCommerciaux = response.data;
        this.totalCommerciale = response.total;
        this.somme_profit = response.somme_profit;
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
      this.commercialeCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.commercialeCriteria.sortField = currentSort.key;
      this.commercialeCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.commercialeCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getCommerciauxByCriteria();
    }
  }

  public search() {
    this.commercialeCriteria.page = 1;
    this.firstCommerciale = 1;
    this.getCommerciauxByCriteria();
  }

  createFormRelever() {
    this.releverForm = this.fb.group({
      id: [null, [Validators.required]],
      dateStart: [null, [Validators.required]],
      dateEnd: [null, [Validators.required]],
      date: [null],
    });
  }
  private commercialSelected: any;
  public showTimeLineModal(data: any) {
    this.commercialSelected = data;
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

  public listeOfrelever: any[] = [];
  public loadingReleve: boolean = false;

  public getRelever() {
    for (const i in this.releverForm.controls) {
      this.releverForm.controls[i].markAsDirty();
      this.releverForm.controls[i].updateValueAndValidity();
    }
    if (this.releverForm.valid) {
      this.loadingReleve = true;
      this.commercialService.releveCommercial(this.releverForm.value).subscribe(
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

  public hideTimeLineModal() {
    this.timeLineModal = false;
    this.commercialSelected = null;
    this.releverForm.reset();
    this.listeOfrelever = [];
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
      this.commercialService.imprimerReleveCommercial(this.releverForm.value).subscribe(
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
    var data = { type: type, criteria: this.commercialeCriteria, table: 'commerciaux' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        if (type == 'excel') {
          link.download = 'commerciaux.xlsx';
          link.click();
        } else {
          window.open(downloadURL);
        }
        this.notificationService.createNotification('success', 'Commerciaux a été exporté avec succes', null);
      },
      (error) => {},
    );
  }
}
