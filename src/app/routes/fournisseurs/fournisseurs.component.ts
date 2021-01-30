import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../services/notification.service';
import { FournisseurService } from '../../services/fournisseur.service';

// _____________models____________
import { articleCriteria } from '../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { fournisseurCriteria } from 'src/app/models/fournisseur.criteria';
import { SettingsService } from '@delon/theme';
import { baseComponent } from '../base-component/base-component.component';
import { StockService } from 'src/app/services/stock.service';

@Component({
  selector: 'app-fournisseurs',
  templateUrl: './fournisseurs.component.html',
  styleUrls: ['./fournisseurs.component.less'],
})
export class fournisseurComponent extends baseComponent implements OnInit {
  private fournisseurForm: FormGroup = new FormGroup({});
  private loading: boolean = true;
  private fournisseurModal: boolean = false;
  private totalFournisseurs: number = 0;
  private firstFournisseur: number = 0;
  private maxResults: number = 10;
  private fournisseurCriteria: fournisseurCriteria = new fournisseurCriteria();

  private listOfFournisseurs: any[] = [];
  private isUpdate: boolean = false;

  private ROLE_ADD: boolean = false;
  private ROLE_UPDATE: boolean = false;
  private ROLE_DELETE: boolean = false;
  private ROLE_RELEVER: boolean = false;

  constructor(
    private fb: FormBuilder,
    protected settings: SettingsService,
    private modalService: NzModalService,
    private stockService: StockService,
    private fournisseurService: FournisseurService,
    private notificationService: NotificationService,
  ) {
    super(settings);

    this.createFormFournisseur();
    this.createFormRelever();
    this.ROLE_ADD = this.hasPermission('add_fournisseur');
    this.ROLE_UPDATE = this.hasPermission('update_fournisseur');
    this.ROLE_DELETE = this.hasPermission('delete_fournisseur');
    this.ROLE_RELEVER = this.hasPermission('show_releve_fournisseur');
  }

  ngOnInit(): void {
    this.getFournisseursByCriteria();
  }

  public createFormFournisseur() {
    this.fournisseurForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      telephone: [null, [Validators.required]],
      fixe: [null, []],
      email: [null, [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      addresse: [null, []],
    });
  }

  public getFournisseurs() {
    this.loading = true;
    this.fournisseurService.getFournisseurs().subscribe(
      (response: any) => {
        this.listOfFournisseurs = response;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public closeModalAdd() {
    this.fournisseurForm.reset();
    this.fournisseurModal = false;
  }

  public openModalAdd() {
    this.fournisseurModal = true;
  }

  public saveFournisseurs() {
    for (const i in this.fournisseurForm.controls) {
      this.fournisseurForm.controls[i].markAsDirty();
      this.fournisseurForm.controls[i].updateValueAndValidity();
    }

    if (this.fournisseurForm.valid) {
      if (this.isUpdate) {
        this.fournisseurService.update(this.fournisseurForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Fournisseur a été modifié avec succes', null);
            this.getFournisseursByCriteria();
          },
          (error) => {},
        );
      } else {
        this.fournisseurService.store(this.fournisseurForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Fournisseur a été ajouté avec succes', null);
            this.getFournisseursByCriteria();
          },
          (error) => {},
        );
      }
    }
  }

  public openModalUpdate(stock: any) {
    this.isUpdate = true;
    this.fournisseurForm.patchValue(stock);
    this.fournisseurModal = true;
  }

  public deleteFournisseur(fournisseur: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer ce fournisseur',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(fournisseur),
    });
  }

  public confirmationDelete(fournisseur: number) {
    this.fournisseurService.delete(fournisseur).subscribe(
      (response) => {
        this.getFournisseursByCriteria();
        this.notificationService.createNotification('success', 'Fournisseur a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  public getFournisseursByCriteria() {
    this.loading = true;
    this.fournisseurService.getFournisseursByCriteria(this.fournisseurCriteria).subscribe(
      (response: any) => {
        this.listOfFournisseurs = response.data;
        this.totalFournisseurs = response.total;
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
      this.fournisseurCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.fournisseurCriteria.sortField = currentSort.key;
      this.fournisseurCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.fournisseurCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getFournisseursByCriteria();
    }
  }

  public search() {
    this.fournisseurCriteria.page = 1;
    this.firstFournisseur = 1;
    this.getFournisseursByCriteria();
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'nameLike':
        this.fournisseurCriteria.nameLike = null;
        break;
      case 'addressLike':
        this.fournisseurCriteria.addressLike = null;
        break;
      case 'telephoneLike':
        this.fournisseurCriteria.telephoneLike = null;
        break;
      case 'fixeLike':
        this.fournisseurCriteria.fixeLike = null;
        break;
      default:
        break;
    }
    this.fournisseurCriteria.page = 1;
    this.firstFournisseur = 1;
    this.getFournisseursByCriteria();
  }

  public exportData(type: string) {
    var data = { type: type, criteria: this.fournisseurCriteria, table: 'fournisseurs' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        if (type == 'excel') {
          link.download = 'fournisseur.xlsx';
          link.click();
        } else {
          window.open(downloadURL);
        }
        this.notificationService.createNotification('success', 'Fournisseur a été exporté avec succes', null);
      },
      (error) => {},
    );
  }

  public hideTimeLineModal() {
    this.timeLineModal = false;
    this.fournisseurSelected = null;
    this.releverForm.reset();
    this.listeOfrelever = [];
  }
  public listeOfrelever: any[] = [];

  private timeLineModal: boolean = false;
  public fournisseurSelected: any;

  public showTimeLineModal(data: any) {
    this.fournisseurSelected = data;
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

  private releverForm: FormGroup = new FormGroup({});
  public loadingReleve: boolean = false;

  createFormRelever() {
    this.releverForm = this.fb.group({
      id: [null, [Validators.required]],
      dateStart: [null, [Validators.required]],
      dateEnd: [null, [Validators.required]],
      date: [null],
    });
  }

  public getRelever() {
    for (const i in this.releverForm.controls) {
      this.releverForm.controls[i].markAsDirty();
      this.releverForm.controls[i].updateValueAndValidity();
    }
    if (this.releverForm.valid) {
      this.loadingReleve = true;
      this.fournisseurService.releveFournisseur(this.releverForm.value).subscribe(
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
      this.fournisseurService.imprimerReleveFournisseur(this.releverForm.value).subscribe(
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
}
