import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../services/notification.service';
import { encaissementService } from '../../services/encaissement.service';

// _____________models____________
import { articleCriteria } from '../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { EncaissementCriteria } from 'src/app/models/encaissement.criteria';
import { clientService } from 'src/app/services/client.service';
import { VentesService } from 'src/app/services/vente.service';
import { StockService } from 'src/app/services/stock.service';
import { SettingsService } from '@delon/theme';
import { baseComponent } from '../base-component/base-component.component';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-encaissements',
  templateUrl: './encaissements.component.html',
  styleUrls: ['./encaissements.component.less'],
})
export class encaissementComponent extends baseComponent implements OnInit {
  private encaissementForm: FormGroup = new FormGroup({});
  private loading: boolean = true;
  @ViewChild('rangePicker') rangePicker!: NzDatePickerComponent;

  private encaissementModal: boolean = false;
  private totalEncaissement: number = 0;
  private firstEncaissement: number = 0;
  private maxResults: number = 10;
  private isUpdate: boolean = false;
  private encaissementCriteria: EncaissementCriteria = new EncaissementCriteria();

  private listOfEncaissement: any[] = [];

  private listOfClients: any[] = [];
  private listOfPaymentsMode: any[] = [];

  private from: number = 0;
  private to: number = 0;
  private filterApplyList: any[] = [];

  private ROLE_ADD: boolean = false;
  private ROLE_UPDATE: boolean = false;
  private ROLE_DELETE: boolean = false;

  constructor(
    private fb: FormBuilder,
    private encaissementService: encaissementService,
    private clientService: clientService,
    private ventesService: VentesService,
    private modalService: NzModalService,
    protected settings: SettingsService,
    private stockService: StockService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.createFormEncaissement();
    this.ROLE_ADD = this.hasPermission('add_encaissement');
    this.ROLE_UPDATE = this.hasPermission('update_encaissement');
    this.ROLE_DELETE = this.hasPermission('delete_encaissement');
  }

  ngOnInit(): void {
    // this.getEncaissementsByCriteria();
    this.getClients();
    this.getPaymentsMode();
  }

  public createFormEncaissement() {
    this.encaissementForm = this.fb.group({
      id: [null],
      client_id: [null, [Validators.required]],
      client: [null, [Validators.required]],
      payment_mode_id: [null, [Validators.required]],
      montant: [null, [Validators.required]],
      date: [new Date(), [Validators.required]],
      chequeInfo: this.fb.group({
        date: [null],
        reference: [null],
      }),
    });
  }

  public getClients() {
    this.clientService.getClients().subscribe(
      (response: any) => {
        this.listOfClients = response;
      },
      (error) => { },
    );
  }

  public getEncaissement() {
    this.loading = true;
    this.encaissementService.getEncaissements().subscribe(
      (response: any) => {
        this.listOfEncaissement = response;
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
      (error) => { },
    );
  }

  public deleteEncaissement(encaissement: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer cette encaissement',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(encaissement),
    });
  }

  public confirmationDelete(encaissement: number) {
    this.encaissementService.delete(encaissement).subscribe(
      (response) => {
        this.getEncaissementsByCriteria();
        this.notificationService.createNotification('success', 'Encaissement a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  public closeModalAdd() {
    this.encaissementForm.reset();
    this.encaissementModal = false;
    this.modalCheque = false;
    this.loadingSave = false;
  }

  public openModalAdd() {
    this.encaissementModal = true;
    this.modalCheque = false;
  }
  private loadingSave: boolean = false
  public saveEncaissement() {
    for (const i in this.encaissementForm.controls) {
      this.encaissementForm.controls[i].markAsDirty();
      this.encaissementForm.controls[i].updateValueAndValidity();
    }

    if (this.encaissementForm.valid) {
      this.loadingSave = true;
      if (this.isUpdate) {
        this.encaissementService.update(this.encaissementForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Encaissement a été modifié avec succes', null);
            this.getEncaissementsByCriteria();
          },
          (error) => { this.loadingSave = false; },
        );
      } else {
        this.encaissementService.store(this.encaissementForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Encaissement a été ajouté avec succes', null);
            this.getEncaissementsByCriteria();
          },
          (error) => { this.loadingSave = false; },
        );
      }
    }
  }

  nzCompareSelectedByID(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id == o2.id : o1 == o2;
  }

  public openModalUpdate(encaissement: any) {
    this.isUpdate = true;
    this.encaissementForm.patchValue(encaissement);
    if (encaissement.cheque_info) {
      this.encaissementForm.patchValue({ chequeInfo: encaissement.cheque_info });
    }
    this.encaissementModal = true;
  }

  public deleteFilter(index: any, filter: any) {
    this.resetSearch(filter.type);
  }

  public deleteAllfilter() {
    this.encaissementCriteria = new EncaissementCriteria();
    this.filterApplyList = [];
    this.getEncaissementsByCriteria();
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'clientId':
        this.encaissementCriteria.clientId = null;
        this.encaissementCriteria.client = null;
        break;
      case 'paymentMethodId':
        this.encaissementCriteria.paymentMethodId = null;
        this.encaissementCriteria.paymentMethod = null;
        break;
      case 'date':
        this.encaissementCriteria.date = null;
        this.encaissementCriteria.dateStart = null;
        this.encaissementCriteria.dateEnd = null;
        break;
      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.encaissementCriteria.page = 1;
    this.firstEncaissement = 1;
    this.getEncaissementsByCriteria();
  }

  public getEncaissementsByCriteria() {
    this.loading = true;
    this.encaissementService.getEncaissementsByCriteria(this.encaissementCriteria).subscribe(
      (response: any) => {
        this.listOfEncaissement = response.data;
        this.totalEncaissement = response.total;
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
      this.encaissementCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.encaissementCriteria.sortField = currentSort.key;
      this.encaissementCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.encaissementCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getEncaissementsByCriteria();
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
    // this.getEncaissementsByCriteria();
  }

  public selectClient(client: any) {
    if (client) {
      this.encaissementForm.patchValue({ client_id: client.id });
    }
  }

  private modalCheque: boolean = false;
  public changeModePaiment(event: any) {
    if (!this.isUpdate) {
      if (event == 2 || event == 4) {
        this.modalCheque = true;
        const chequeInfo = <FormGroup>this.encaissementForm.get('chequeInfo');
        chequeInfo.controls.date.setValidators([Validators.required]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([Validators.required]);
        chequeInfo.controls.reference.updateValueAndValidity();
      } else {
        const chequeInfo = <FormGroup>this.encaissementForm.get('chequeInfo');
        chequeInfo.patchValue({ date: null, reference: null });
        chequeInfo.controls.date.setValidators([]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([]);
        chequeInfo.controls.reference.updateValueAndValidity();
      }
    } else {
      if (event == 2 || event == 4) {
        this.modalCheque = true;
        const chequeInfo = <FormGroup>this.encaissementForm.get('chequeInfo');
        chequeInfo.controls.date.setValidators([Validators.required]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([Validators.required]);
        chequeInfo.controls.reference.updateValueAndValidity();
      } else {
        this.modalCheque = false;
        const chequeInfo = <FormGroup>this.encaissementForm.get('chequeInfo');
        chequeInfo.controls.date.setValidators([]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([]);
        chequeInfo.controls.reference.updateValueAndValidity();
      }
    }
  }

  public searchClientMode() {
    if (this.encaissementCriteria.client) {
      this.encaissementCriteria.clientId = this.encaissementCriteria.client.id;
      this.search('Client', this.encaissementCriteria.clientId, 'purple', 'clientId', this.encaissementCriteria.client.name);
    }

    if (this.encaissementCriteria.paymentMethod) {
      this.encaissementCriteria.paymentMethodId = this.encaissementCriteria.paymentMethod.id;
      this.search(
        'Mode ',
        this.encaissementCriteria.paymentMethodId,
        'orange',
        'paymentMethodId',
        this.encaissementCriteria.paymentMethod.label,
      );
    }
    if (this.encaissementCriteria.date) {
      this.search('Date', this.encaissementCriteria.date, 'magenta', 'date');
    }
    this.encaissementCriteria.page = 1;
    this.firstEncaissement = 1;
    this.getEncaissementsByCriteria();
  }

  public changeModePaimentFilter(event: any) {
    if (!event) {
      this.resetSearch('paymentMethodId');
    }
  }

  public changeClientFilter(event: any) {
    if (!event) {
      this.resetSearch('clientId');
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
        this.encaissementCriteria.date = [date_start, date_end];
        this.encaissementCriteria.dateStart = date_start;
        this.encaissementCriteria.dateEnd = date_end;
        break;
      case '7J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 7);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.encaissementCriteria.date = [date_start, date_end];
        this.encaissementCriteria.dateStart = date_start;
        this.encaissementCriteria.dateEnd = date_end;
        break;
      case 'HIER':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 1);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.encaissementCriteria.date = [date_start, date_end];
        this.encaissementCriteria.dateStart = date_start;
        this.encaissementCriteria.dateEnd = date_end;
        break;
      case 'TODAY':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.encaissementCriteria.date = [date_start, date_end];
        this.encaissementCriteria.dateStart = date_start;
        this.encaissementCriteria.dateEnd = date_end;

        break;
      default:
        break;
    }
    this.rangePicker.close();
    this.searchClientMode();
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      this.encaissementCriteria.dateStart = result[0];
      this.encaissementCriteria.dateEnd = result[1];
      this.encaissementCriteria.dateStart.setHours(0, 0, 0);
      this.encaissementCriteria.dateEnd.setHours(23, 59, 59);
      this.searchClientMode();
    } else {
      this.encaissementCriteria.dateStart = null;
      this.encaissementCriteria.dateEnd = null;
      this.resetSearch('date');
    }
  }

  public exportData(type: string) {
    var data = { type: type, criteria: this.encaissementCriteria, table: 'encaissements' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        if (type == 'excel') {
          link.download = 'Encaissements.xlsx';
          link.click();
        } else {
          window.open(downloadURL);
        }
        this.notificationService.createNotification('success', 'Encaissements a été exporté avec succes', null);
      },
      (error) => { },
    );
  }
}
