import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../services/notification.service';
import { reglemntFournissuerService } from '../../services/reglement-fournisseur.service';

// _____________models____________
import { articleCriteria } from '../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ReglementFournisseursCriteria } from 'src/app/models/reglementFournisseur.criteria';
import { FournisseurService } from 'src/app/services/fournisseur.service';
import { VentesService } from 'src/app/services/vente.service';
import { StockService } from 'src/app/services/stock.service';
import { baseComponent } from '../base-component/base-component.component';
import { SettingsService } from '@delon/theme';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-reglements-fournisseur',
  templateUrl: './reglements-fournisseur.component.html',
  styleUrls: ['./reglements-fournisseur.component.less'],
})
export class reglementsFournisseurComponent extends baseComponent implements OnInit {
  private reglementForm: FormGroup = new FormGroup({});
  private loading: boolean = true;
  @ViewChild('rangePicker') rangePicker!: NzDatePickerComponent;

  private reglementModal: boolean = false;
  private totalReglement: number = 0;
  private firstReglement: number = 0;
  private maxResults: number = 10;
  private isUpdate: boolean = false;
  private ReglementFournisseursCriteria: ReglementFournisseursCriteria = new ReglementFournisseursCriteria();

  private listOfReglement: any[] = [];

  private listOfFournisseurs: any[] = [];
  private listOfPaymentsMode: any[] = [];

  private from: number = 0;
  private to: number = 0;
  private filterApplyList: any[] = [];

  private ROLE_ADD: boolean = false;
  private ROLE_UPDATE: boolean = false;
  private ROLE_DELETE: boolean = false;

  constructor(
    private fb: FormBuilder,
    protected settings: SettingsService,
    private reglementService: reglemntFournissuerService,
    private fournisseurService: FournisseurService,
    private ventesService: VentesService,
    private stockService: StockService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.createFormReglement();
    this.ROLE_ADD = this.hasPermission('add_freglement');
    this.ROLE_UPDATE = this.hasPermission('update_freglement');
    this.ROLE_DELETE = this.hasPermission('delete_freglement');
  }

  ngOnInit(): void {
    // this.getReglementByCriteria();
    this.getFounisseurs();
    this.getPaymentsMode();
  }

  public createFormReglement() {
    this.reglementForm = this.fb.group({
      id: [null],
      fournisseur_id: [null, [Validators.required]],
      fournisseur: [null, [Validators.required]],
      payment_mode_id: [null, [Validators.required]],
      montant: [null, [Validators.required]],
      date: [new Date(), [Validators.required]],
      chequeInfo: this.fb.group({
        date: [null],
        reference: [null],
      }),
    });
  }

  public getFounisseurs() {
    this.fournisseurService.getFournisseurs().subscribe(
      (response: any) => {
        this.listOfFournisseurs = response;
      },
      (error) => {},
    );
  }

  public getReglements() {
    this.loading = true;
    this.reglementService.getReglements().subscribe(
      (response: any) => {
        this.listOfReglement = response;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public getPaymentsMode() {
    this.ventesService.getPaymentsMode().subscribe(
      (response: any) => {
        this.listOfPaymentsMode = response;
      },
      (error) => {},
    );
  }

  public deleteReglement(reglement: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer cette reglement',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(reglement),
    });
  }

  public confirmationDelete(reglement: number) {
    this.reglementService.delete(reglement).subscribe(
      (response) => {
        this.getReglementByCriteria();
        this.notificationService.createNotification('success', 'Reglement a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  public closeModalAdd() {
    this.reglementForm.reset();
    this.reglementModal = false;
    this.modalCheque = false;
  }

  public openModalAdd() {
    this.isUpdate = false;
    this.reglementModal = true;
    this.modalCheque = false;
  }

  public saveReglement() {
    for (const i in this.reglementForm.controls) {
      this.reglementForm.controls[i].markAsDirty();
      this.reglementForm.controls[i].updateValueAndValidity();
    }

    if (this.reglementForm.valid) {
      if (this.isUpdate) {
        this.reglementService.update(this.reglementForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Réglement a été modifié avec succes', null);
            this.getReglementByCriteria();
          },
          (error) => {},
        );
      } else {
        this.reglementService.store(this.reglementForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Réglement a été ajouté avec succes', null);
            this.getReglementByCriteria();
          },
          (error) => {},
        );
      }
    }
  }

  nzCompareSelectedByID(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id == o2.id : o1 == o2;
  }

  public openModalUpdate(reglement: any) {
    this.isUpdate = true;
    this.reglementForm.patchValue(reglement);
    if (reglement.cheque_info) {
      this.reglementForm.patchValue({ chequeInfo: reglement.cheque_info });
    }
    this.reglementModal = true;
  }

  public deleteFilter(index: any, filter: any) {
    this.resetSearch(filter.type);
  }

  public deleteAllfilter() {
    this.ReglementFournisseursCriteria = new ReglementFournisseursCriteria();
    this.filterApplyList = [];
    this.getReglementByCriteria();
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'fournisseurId':
        this.ReglementFournisseursCriteria.fournisseurId = null;
        this.ReglementFournisseursCriteria.fournisseur = null;

        break;
      case 'paymentMethodId':
        this.ReglementFournisseursCriteria.paymentMethodId = null;
        this.ReglementFournisseursCriteria.paymentMethod = null;
        break;
      case 'date':
        this.ReglementFournisseursCriteria.date = null;
        this.ReglementFournisseursCriteria.dateStart = null;
        this.ReglementFournisseursCriteria.dateEnd = null;
        break;
      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.ReglementFournisseursCriteria.page = 1;
    this.firstReglement = 1;
    this.getReglementByCriteria();
  }

  public getReglementByCriteria() {
    this.loading = true;
    this.reglementService.getReglementByCriteria(this.ReglementFournisseursCriteria).subscribe(
      (response: any) => {
        this.listOfReglement = response.data;
        this.totalReglement = response.total;
        this.from = response.from;
        this.to = response.to;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public sort(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    if (params.pageIndex) {
      this.ReglementFournisseursCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.ReglementFournisseursCriteria.sortField = currentSort.key;
      this.ReglementFournisseursCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.ReglementFournisseursCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getReglementByCriteria();
    }
  }

  public search(label: string, value: any, color: any, type: any, name?: string) {
    const found = this.filterApplyList.find((item) => item.type == type);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      if (label == 'Date') {
        var date1 = new Date(value[0]).toLocaleString('fr-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        var date2 = new Date(value[1]).toLocaleString('fr-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        this.filterApplyList[index] = { label: label, value: '< ' + date1 + ' , ' + date2 + ' >', color: color, type: type };
      } else {
        this.filterApplyList[index] = { label: label, value: value, color: color, type: type, name: name };
      }
    } else {
      console.log('label', label);
      if (label == 'Date') {
        var date1 = new Date(value[0]).toLocaleString('fr-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        var date2 = new Date(value[1]).toLocaleString('fr-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

        this.filterApplyList.push({ label: label, value: '< ' + date1 + ' , ' + date2 + ' >', color: color, type: type });
      } else {
        this.filterApplyList.push({ label: label, value: value, color: color, type: type, name: name });
      }
    }
    console.log(' this.filterApplyList.', this.filterApplyList);
  }

  public selectFounisseur(fournisseur: any) {
    if (fournisseur) {
      this.reglementForm.patchValue({ fournisseur_id: fournisseur.id });
    }
  }

  private modalCheque: boolean = false;
  public changeModePaiment(event: any) {
    if (!this.isUpdate) {
      if (event == 2 || event == 4) {
        this.modalCheque = true;
        const chequeInfo = <FormGroup>this.reglementForm.get('chequeInfo');
        chequeInfo.controls.date.setValidators([Validators.required]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([Validators.required]);
        chequeInfo.controls.reference.updateValueAndValidity();
      } else {
        const chequeInfo = <FormGroup>this.reglementForm.get('chequeInfo');
        chequeInfo.patchValue({ date: null, reference: null });
        chequeInfo.controls.date.setValidators([]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([]);
        chequeInfo.controls.reference.updateValueAndValidity();
      }
    } else {
      if (event == 2 || event == 4) {
        this.modalCheque = true;
        const chequeInfo = <FormGroup>this.reglementForm.get('chequeInfo');
        chequeInfo.controls.date.setValidators([Validators.required]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([Validators.required]);
        chequeInfo.controls.reference.updateValueAndValidity();
      } else {
        this.modalCheque = false;
        const chequeInfo = <FormGroup>this.reglementForm.get('chequeInfo');
        chequeInfo.controls.date.setValidators([]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([]);
        chequeInfo.controls.reference.updateValueAndValidity();
      }
    }
  }

  public searchFournisseurMode() {
    if (this.ReglementFournisseursCriteria.fournisseur) {
      this.ReglementFournisseursCriteria.fournisseurId = this.ReglementFournisseursCriteria.fournisseur.id;
      this.search(
        'Fournisseur',
        this.ReglementFournisseursCriteria.fournisseurId,
        'purple',
        'fournisseurId',
        this.ReglementFournisseursCriteria.fournisseur.name,
      );
    }

    if (this.ReglementFournisseursCriteria.paymentMethod) {
      this.ReglementFournisseursCriteria.paymentMethodId = this.ReglementFournisseursCriteria.paymentMethod.id;
      this.search(
        'Mode ',
        this.ReglementFournisseursCriteria.paymentMethodId,
        'orange',
        'paymentMethodId',
        this.ReglementFournisseursCriteria.paymentMethod.label,
      );
    }
    if (this.ReglementFournisseursCriteria.date) {
      this.search('Date', this.ReglementFournisseursCriteria.date, 'magenta', 'date');
    }
    this.ReglementFournisseursCriteria.page = 1;
    this.firstReglement = 1;
    this.getReglementByCriteria();
  }

  public changeModePaimentFilter(event: any) {
    if (!event) {
      this.resetSearch('paymentMethodId');
    }
  }

  public changeFounisseurFilter(event: any) {
    if (!event) {
      this.resetSearch('fournisseurId');
    }
  }

  public toDay(type: string) {
    switch (type) {
      case '30J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 30);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.ReglementFournisseursCriteria.date = [date_start, date_end];
        this.ReglementFournisseursCriteria.dateStart = date_start;
        this.ReglementFournisseursCriteria.dateEnd = date_end;
        break;
      case '7J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 7);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.ReglementFournisseursCriteria.date = [date_start, date_end];
        this.ReglementFournisseursCriteria.dateStart = date_start;
        this.ReglementFournisseursCriteria.dateEnd = date_end;
        break;
      case 'HIER':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 1);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.ReglementFournisseursCriteria.date = [date_start, date_end];
        this.ReglementFournisseursCriteria.dateStart = date_start;
        this.ReglementFournisseursCriteria.dateEnd = date_end;
        break;
      case 'TODAY':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.ReglementFournisseursCriteria.date = [date_start, date_end];
        this.ReglementFournisseursCriteria.dateStart = date_start;
        this.ReglementFournisseursCriteria.dateEnd = date_end;

        break;
      default:
        break;
    }
    this.rangePicker.close();
    this.searchFournisseurMode();
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      this.ReglementFournisseursCriteria.dateStart = result[0];
      this.ReglementFournisseursCriteria.dateEnd = result[1];
      this.ReglementFournisseursCriteria.dateStart.setHours(0, 0, 0);
      this.ReglementFournisseursCriteria.dateEnd.setHours(23, 59, 59);
      this.searchFournisseurMode();
    } else {
      this.ReglementFournisseursCriteria.dateStart = null;
      this.ReglementFournisseursCriteria.dateEnd = null;
      this.resetSearch('date');
    }
  }

  public exportData(type: string) {
    var data = { type: type, criteria: this.ReglementFournisseursCriteria, table: 'freglements' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        if (type == 'excel') {
          link.download = 'Fournisseur_réglements.xlsx';
          link.click();
        } else {
          window.open(downloadURL);
        }
        this.notificationService.createNotification('success', 'Réglements a été exporté avec succes', null);
      },
      (error) => {},
    );
  }
}
