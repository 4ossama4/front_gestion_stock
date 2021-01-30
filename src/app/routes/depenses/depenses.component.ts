import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../services/notification.service';
import { depenseService } from '../../services/depense.service';

// _____________models____________
import { articleCriteria } from '../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { DepenseCriteria } from 'src/app/models/depense.criteria';
import { CommercialService } from 'src/app/services/commercial.service';
import { VentesService } from 'src/app/services/vente.service';
import { SettingsService } from '@delon/theme';
import { baseComponent } from '../base-component/base-component.component';

@Component({
  selector: 'app-depenses',
  templateUrl: './depenses.component.html',
  styleUrls: ['./depenses.component.less'],
})
export class depensesComponent extends baseComponent implements OnInit {
  private depenseForm: FormGroup = new FormGroup({});
  private loading: boolean = true;

  private depenseModal: boolean = false;
  private totalDepense: number = 0;
  private firstDepense: number = 0;
  private maxResults: number = 10;
  private isUpdate: boolean = false;
  private depenseCriteria: DepenseCriteria = new DepenseCriteria();

  private listOfDepenses: any[] = [];

  private listOfNatures: any[] = [];
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
    private depenseService: depenseService,
    private commercialService: CommercialService,
    private ventesService: VentesService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.createFormDepense();
    this.ROLE_ADD = this.hasPermission('add_depense');
    this.ROLE_UPDATE = this.hasPermission('update_depense');
    this.ROLE_DELETE = this.hasPermission('delete_depense');
  }

  ngOnInit(): void {
    this.getDepensesByCriteria();
    this.getNatures();
    this.getPaymentsMode();
  }

  public createFormDepense() {
    this.depenseForm = this.fb.group({
      id: [null],
      nature_id: [null, [Validators.required]],
      payment_mode_id: [null, [Validators.required]],
      montant: [null, [Validators.required]],
      date: [new Date(), [Validators.required]],
      object: [null],
      chequeInfo: this.fb.group({
        date: [null],
        reference: [null],
      }),
    });
  }

  public getNatures() {
    this.depenseService.getNatures().subscribe(
      (response: any) => {
        this.listOfNatures = response;
      },
      (error) => {},
    );
  }

  public getDepenses() {
    this.loading = true;
    this.depenseService.getDepenses().subscribe(
      (response: any) => {
        this.listOfDepenses = response;
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

  public deleteDepense(depense: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer cette dépense',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(depense),
    });
  }

  public confirmationDelete(depense: number) {
    this.depenseService.delete(depense).subscribe(
      (response) => {
        this.getDepensesByCriteria();
        this.notificationService.createNotification('success', 'Dépense a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  public closeModalAdd() {
    this.depenseForm.reset();
    this.depenseModal = false;
  }

  public openModalAdd() {
    this.isUpdate = false;
    this.depenseModal = true;
  }

  public saveDepense() {
    for (const i in this.depenseForm.controls) {
      this.depenseForm.controls[i].markAsDirty();
      this.depenseForm.controls[i].updateValueAndValidity();
    }

    if (this.depenseForm.valid) {
      if (this.isUpdate) {
        this.depenseService.update(this.depenseForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Dépense a été modifié avec succes', null);
            this.getDepensesByCriteria();
          },
          (error) => {},
        );
      } else {
        this.depenseService.store(this.depenseForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Dépense a été ajouté avec succes', null);
            this.getDepensesByCriteria();
          },
          (error) => {},
        );
      }
    }
  }

  nzCompareSelectedByID(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id == o2.id : o1 == o2;
  }

  public openModalUpdate(depense: any) {
    this.isUpdate = true;
    this.depenseForm.patchValue(depense);
    if (depense.cheque_info) {
      this.depenseForm.patchValue({ chequeInfo: depense.cheque_info });
    }
    this.depenseModal = true;
  }

  public deleteFilter(index: any, filter: any) {
    this.resetSearch(filter.type);
  }

  public deleteAllfilter() {
    this.depenseCriteria = new DepenseCriteria();
    this.filterApplyList = [];
    this.getDepensesByCriteria();
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'natureId':
        this.depenseCriteria.natureId = null;
        break;
      case 'paymentMethodId':
        this.depenseCriteria.paymentMethodId = null;
        break;
      case 'date':
        this.depenseCriteria.date = null;
        this.depenseCriteria.dateStart = null;
        this.depenseCriteria.dateEnd = null;
        break;
      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.depenseCriteria.page = 1;
    this.firstDepense = 1;
    this.getDepensesByCriteria();
  }

  public getDepensesByCriteria() {
    this.loading = true;
    this.depenseService.getDepensesByCriteria(this.depenseCriteria).subscribe(
      (response: any) => {
        this.listOfDepenses = response.data;
        this.totalDepense = response.total;
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
      this.depenseCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.depenseCriteria.sortField = currentSort.key;
      this.depenseCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.depenseCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getDepensesByCriteria();
    }
  }

  public search(label: string, value: any, color: any, type: any) {
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
        this.filterApplyList[index] = { label: label, value: value, color: color, type: type };
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
        this.filterApplyList.push({ label: label, value: value, color: color, type: type });
      }
    }
    console.log(' this.filterApplyList.', this.filterApplyList);
  }

  private modalCheque: boolean = false;
  public changeModePaiment(event: any) {
    if (!this.isUpdate) {
      if (event == 2 || event == 4) {
        this.modalCheque = true;
        const chequeInfo = <FormGroup>this.depenseForm.get('chequeInfo');
        chequeInfo.controls.date.setValidators([Validators.required]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([Validators.required]);
        chequeInfo.controls.reference.updateValueAndValidity();
      } else {
        const chequeInfo = <FormGroup>this.depenseForm.get('chequeInfo');
        chequeInfo.patchValue({ date: null, reference: null });
        chequeInfo.controls.date.setValidators([]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([]);
        chequeInfo.controls.reference.updateValueAndValidity();
      }
    } else {
      if (event == 2 || event == 4) {
        this.modalCheque = true;
        const chequeInfo = <FormGroup>this.depenseForm.get('chequeInfo');
        chequeInfo.controls.date.setValidators([Validators.required]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([Validators.required]);
        chequeInfo.controls.reference.updateValueAndValidity();
      } else {
        this.modalCheque = false;
        const chequeInfo = <FormGroup>this.depenseForm.get('chequeInfo');
        chequeInfo.controls.date.setValidators([]);
        chequeInfo.controls.date.updateValueAndValidity();

        chequeInfo.controls.reference.setValidators([]);
        chequeInfo.controls.reference.updateValueAndValidity();
      }
    }
  }

  public searchNMode() {
    if (this.depenseCriteria.natureId) {
      this.search('Nature', this.depenseCriteria.natureId, 'purple', 'natureId');
    }

    if (this.depenseCriteria.paymentMethodId) {
      this.search('Mode ', this.depenseCriteria.paymentMethodId, 'orange', 'paymentMethodId');
    }
    if (this.depenseCriteria.date) {
      this.search('Date', this.depenseCriteria.date, 'magenta', 'date');
    }
    this.depenseCriteria.page = 1;
    this.firstDepense = 1;
    this.getDepensesByCriteria();
  }

  public changeModePaimentFilter(event: any) {
    if (!event) {
      this.resetSearch('paymentMethodId');
    }
  }

  public changeNatureFilter(event: any) {
    if (!event) {
      this.resetSearch('natureId');
    }
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      this.depenseCriteria.dateStart = result[0];
      this.depenseCriteria.dateEnd = result[1];
      this.depenseCriteria.dateStart.setHours(0, 0, 0);
      this.depenseCriteria.dateEnd.setHours(23, 59, 59);
      this.searchNMode();
    } else {
      this.depenseCriteria.dateStart = null;
      this.depenseCriteria.dateEnd = null;
      this.resetSearch('date');
    }
  }

  public saveNature(nature: HTMLInputElement) {
    const value = nature.value;
    if (this.listOfNatures.indexOf(value) === -1 && value) {
      this.depenseService.storeNature({ label: value }).subscribe(
        (response: any) => {
          this.getNatures();
          this.depenseForm.patchValue({ nature_id: response.id });
          nature.value = '';
          this.notificationService.createNotification('success', 'Nature a été ajouté avec succes', null);
        },
        (error) => {},
      );
    }
  }
}
