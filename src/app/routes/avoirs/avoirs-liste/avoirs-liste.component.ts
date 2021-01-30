import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';
import { avoirService } from '../../../services/avoir.service';

// _____________models____________
import { articleCriteria } from '../../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { avoirCriteria } from 'src/app/models/avoir.criteria';
import { clientService } from 'src/app/services/client.service';
import { VentesService } from 'src/app/services/vente.service';
import { StockService } from 'src/app/services/stock.service';
import { SettingsService } from '@delon/theme';
import { baseComponent } from '../../base-component/base-component.component';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-avoirs-liste',
  templateUrl: './avoirs-liste.component.html',
  styleUrls: ['./avoirs-liste.component.less'],
})
export class avoirListeComponent extends baseComponent implements OnInit {
  private loading: boolean = true;
  @ViewChild('rangePicker') rangePicker!: NzDatePickerComponent;

  private totalAvoirs: number = 0;
  private firstAvoirs: number = 0;
  private maxResults: number = 10;
  private avoirCriteria: avoirCriteria = new avoirCriteria();

  private listOfAvoirs: any[] = [];

  private listOfClients: any[] = [];

  private from: number = 0;
  private to: number = 0;
  private filterApplyList: any[] = [];
  private ROLE_ADD: boolean = false;
  private ROLE_UPDATE: boolean = false;
  private ROLE_DELETE: boolean = false;
  private ROLE_PRINT: boolean = false;
  constructor(
    private fb: FormBuilder,
    private avoirsService: avoirService,
    private clientService: clientService,
    protected settings: SettingsService,
    private router: Router,
    private stockService: StockService,
    private ventesService: VentesService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.ROLE_ADD = this.hasPermission('add_avoir');
    this.ROLE_UPDATE = this.hasPermission('update_avoir');
    this.ROLE_DELETE = this.hasPermission('delete_avoir');
    this.ROLE_PRINT = this.hasPermission('print_avoir');
  }

  ngOnInit(): void {
    this.getAvoirsByCriteria();
    this.getClients();
  }

  public getClients() {
    this.clientService.getClients().subscribe(
      (response: any) => {
        this.listOfClients = response;
      },
      (error) => {},
    );
  }

  public getAvoirs() {
    this.loading = true;
    this.avoirsService.getAvoirs().subscribe(
      (response: any) => {
        this.listOfAvoirs = response;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public deleteAvoir(avoir: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer cette avoir',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(avoir),
    });
  }

  public confirmationDelete(avoir: number) {
    this.avoirsService.delete(avoir).subscribe(
      (response) => {
        this.getAvoirsByCriteria();
        this.notificationService.createNotification('success', 'Avoir a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  public openModalAdd() {
    this.router.navigate(['avoirs/add']);
  }

  nzCompareSelectedByID(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id == o2.id : o1 == o2;
  }

  public openModalUpdate(avoir: any) {
    this.router.navigate(['avoirs/edit/' + avoir.id]);
  }

  public deleteFilter(index: any, filter: any) {
    this.resetSearch(filter.type);
  }

  public deleteAllfilter() {
    this.avoirCriteria = new avoirCriteria();
    this.filterApplyList = [];
    this.getAvoirsByCriteria();
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'clientId':
        this.avoirCriteria.clientId = null;
        this.avoirCriteria.client = null;
        break;
      case 'date':
        this.avoirCriteria.date = null;
        this.avoirCriteria.dateStart = null;
        this.avoirCriteria.dateEnd = null;
        break;
      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.avoirCriteria.page = 1;
    this.firstAvoirs = 1;
    this.getAvoirsByCriteria();
  }

  public getAvoirsByCriteria() {
    this.loading = true;
    this.avoirsService.getAvoirsByCriteria(this.avoirCriteria).subscribe(
      (response: any) => {
        this.listOfAvoirs = response.data;
        this.totalAvoirs = response.total;
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
      this.avoirCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.avoirCriteria.sortField = currentSort.key;
      this.avoirCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.avoirCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getAvoirsByCriteria();
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
    // this.getAvoirsByCriteria();
  }

  public searchClientMode() {
    if (this.avoirCriteria.client) {
      this.avoirCriteria.clientId = this.avoirCriteria.client.id;
      this.search('Client', this.avoirCriteria.clientId, 'purple', 'clientId', this.avoirCriteria.client.name);
    }

    if (this.avoirCriteria.date) {
      this.search('Date', this.avoirCriteria.date, 'magenta', 'date');
    }
    this.avoirCriteria.page = 1;
    this.firstAvoirs = 1;
    this.getAvoirsByCriteria();
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
        this.avoirCriteria.date = [date_start, date_end];
        this.avoirCriteria.dateStart = date_start;
        this.avoirCriteria.dateEnd = date_end;
        break;
      case '7J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 7);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.avoirCriteria.date = [date_start, date_end];
        this.avoirCriteria.dateStart = date_start;
        this.avoirCriteria.dateEnd = date_end;
        break;
      case 'HIER':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 1);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.avoirCriteria.date = [date_start, date_end];
        this.avoirCriteria.dateStart = date_start;
        this.avoirCriteria.dateEnd = date_end;
        break;
      case 'TODAY':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.avoirCriteria.date = [date_start, date_end];
        this.avoirCriteria.dateStart = date_start;
        this.avoirCriteria.dateEnd = date_end;

        break;
      default:
        break;
    }
    this.rangePicker.close();
    this.searchClientMode();
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      this.avoirCriteria.dateStart = result[0];
      this.avoirCriteria.dateEnd = result[1];
      this.avoirCriteria.dateStart.setHours(0, 0, 0);
      this.avoirCriteria.dateEnd.setHours(23, 59, 59);
      this.searchClientMode();
    } else {
      this.avoirCriteria.dateStart = null;
      this.avoirCriteria.dateEnd = null;
      this.resetSearch('date');
    }
  }

  expandSet = new Set<number>();
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  public exportData(type: string) {
    var data = { type: type, criteria: this.avoirCriteria, table: 'avoirs' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => {},
      (error) => {},
    );
  }

  exportAsPDF(item: any) {
    this.avoirsService.print(item).subscribe(
      (response: any) => {
        console.log('ccc');
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        window.open(downloadURL);
        // link.download = 'achat.pdf';
        // link.click();
      },
      (error) => {},
    );
  }
}
