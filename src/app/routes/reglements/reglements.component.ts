import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../services/notification.service';
import { reglemntService } from '../../services/reglement.service';

// _____________models____________
import { articleCriteria } from '../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ReglementCriteria } from 'src/app/models/reglement.criteria';
import { CommercialService } from 'src/app/services/commercial.service';
import { VentesService } from 'src/app/services/vente.service';
import { StockService } from 'src/app/services/stock.service';
import { baseComponent } from '../base-component/base-component.component';
import { SettingsService } from '@delon/theme';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-reglements',
  templateUrl: './reglements.component.html',
  styleUrls: ['./reglements.component.less'],
})
export class reglementsComponent extends baseComponent implements OnInit {
  private reglementForm: FormGroup = new FormGroup({});
  private loading: boolean = true;
  @ViewChild('rangePicker') rangePicker!: NzDatePickerComponent;

  private reglementModal: boolean = false;
  private totalReglement: number = 0;
  private firstReglement: number = 0;
  private maxResults: number = 10;
  private isUpdate: boolean = false;
  private reglementCriteria: ReglementCriteria = new ReglementCriteria();

  private listOfReglement: any[] = [];

  private listOfCommerciaux: any[] = [];
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
    private reglementService: reglemntService,
    private commercialService: CommercialService,
    private ventesService: VentesService,
    private stockService: StockService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.createFormReglement();
    this.ROLE_ADD = this.hasPermission('add_reglement');
    this.ROLE_UPDATE = this.hasPermission('update_reglement');
    this.ROLE_DELETE = this.hasPermission('delete_reglement');
  }

  ngOnInit(): void {
    // this.getReglementByCriteria();
    this.getCommerciaux();
    this.getPaymentsMode();
  }

  public createFormReglement() {
    this.reglementForm = this.fb.group({
      id: [null],
      commercial_id: [null, [Validators.required]],
      commercial: [null, [Validators.required]],
      payment_mode_id: [null, [Validators.required]],
      montant: [null, [Validators.required]],
      date: [new Date(), [Validators.required]],
      chequeInfo: this.fb.group({
        date: [null],
        reference: [null],
      }),
    });
  }

  public getCommerciaux() {
    this.commercialService.getCommerciaux().subscribe(
      (response: any) => {
        this.listOfCommerciaux = response;
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

  public toDay(type: string) {
    switch (type) {
      case '30J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 30);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.reglementCriteria.date = [date_start, date_end];
        this.reglementCriteria.dateStart = date_start;
        this.reglementCriteria.dateEnd = date_end;
        break;
      case '7J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 7);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.reglementCriteria.date = [date_start, date_end];
        this.reglementCriteria.dateStart = date_start;
        this.reglementCriteria.dateEnd = date_end;
        break;
      case 'HIER':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 1);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.reglementCriteria.date = [date_start, date_end];
        this.reglementCriteria.dateStart = date_start;
        this.reglementCriteria.dateEnd = date_end;
        break;
      case 'TODAY':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.reglementCriteria.date = [date_start, date_end];
        this.reglementCriteria.dateStart = date_start;
        this.reglementCriteria.dateEnd = date_end;

        break;
      default:
        break;
    }
    this.rangePicker.close();
    this.searchCommercialeMode();
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
    this.reglementCriteria = new ReglementCriteria();
    this.filterApplyList = [];
    this.getReglementByCriteria();
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'commercialId':
        this.reglementCriteria.commercialId = null;
        this.reglementCriteria.commercial = null;

        break;
      case 'paymentMethodId':
        this.reglementCriteria.paymentMethodId = null;
        this.reglementCriteria.paymentMethod = null;
        break;
      case 'date':
        this.reglementCriteria.date = null;
        this.reglementCriteria.dateStart = null;
        this.reglementCriteria.dateEnd = null;
        break;
      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.reglementCriteria.page = 1;
    this.firstReglement = 1;
    this.getReglementByCriteria();
  }

  public getReglementByCriteria() {
    this.loading = true;
    this.reglementService.getReglementByCriteria(this.reglementCriteria).subscribe(
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
      this.reglementCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.reglementCriteria.sortField = currentSort.key;
      this.reglementCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.reglementCriteria.maxResults = params.pageSize;
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

  public selectCommerciale(commerciale: any) {
    if (commerciale) {
      this.reglementForm.patchValue({ commercial_id: commerciale.id });
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

  public searchCommercialeMode() {
    if (this.reglementCriteria.commercial) {
      this.reglementCriteria.commercialId = this.reglementCriteria.commercial.id;
      this.search('Commerciale', this.reglementCriteria.commercialId, 'purple', 'commercialId', this.reglementCriteria.commercial.name);
    }

    if (this.reglementCriteria.paymentMethod) {
      this.reglementCriteria.paymentMethodId = this.reglementCriteria.paymentMethod.id;
      this.search('Mode ', this.reglementCriteria.paymentMethodId, 'orange', 'paymentMethodId', this.reglementCriteria.paymentMethod.label);
    }
    if (this.reglementCriteria.date) {
      this.search('Date', this.reglementCriteria.date, 'magenta', 'date');
    }
    this.reglementCriteria.page = 1;
    this.firstReglement = 1;
    this.getReglementByCriteria();
  }

  public changeModePaimentFilter(event: any) {
    if (!event) {
      this.resetSearch('paymentMethodId');
    }
  }

  public changeCommercialeFilter(event: any) {
    if (!event) {
      this.resetSearch('commercialId');
    }
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      this.reglementCriteria.dateStart = result[0];
      this.reglementCriteria.dateEnd = result[1];
      this.reglementCriteria.dateStart.setHours(0, 0, 0);
      this.reglementCriteria.dateEnd.setHours(23, 59, 59);
      this.searchCommercialeMode();
    } else {
      this.reglementCriteria.dateStart = null;
      this.reglementCriteria.dateEnd = null;
      this.resetSearch('date');
    }
  }

  public exportData(type: string) {
    var data = { type: type, criteria: this.reglementCriteria, table: 'reglements' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        if (type == 'excel') {
          link.download = 'réglements.xlsx';
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
