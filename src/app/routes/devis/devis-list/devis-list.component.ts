import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
// import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { environment } from '../../../../environments/environment';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';

// _____________models____________
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Router } from '@angular/router';
import { DevisService } from 'src/app/services/devis.service';
import { devisCriteria } from 'src/app/models/devis.criteria';
import { clientService } from 'src/app/services/client.service';
import { NzDatePickerComponent, NzRangePickerComponent } from 'ng-zorro-antd/date-picker';
import { StockService } from 'src/app/services/stock.service';
import { FactureService } from 'src/app/services/facture.service';
import { baseComponent } from '../../base-component/base-component.component';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-devis-list',
  templateUrl: './devis-list.component.html',
  styleUrls: ['./devis-list.component.less'],
})
export class devisListComponent extends baseComponent implements OnInit {
  private listeOfDevis: any[] = [];
  private listOfCommerciaux: any[] = [];
  private listeOfClients: any[] = [];
  private loading: boolean = false;
  private totalDevis: number = 0;
  private firstDevis: number = 0;
  private maxResults: number = 10;
  private isVisibleChercheDate: boolean = false;
  private devisCriteria: devisCriteria = new devisCriteria();
  @ViewChild('rangePicker') rangePicker!: NzDatePickerComponent;

  private filterApplyList: any[] = [];
  private modalFacture: boolean = false;

  private from: number = 0;
  private to: number = 0;

  private modalInfoFacture: boolean = false;

  private ROLE_ADD: boolean = false;
  private ROLE_UPDATE: boolean = false;
  private ROLE_DELETE: boolean = false;
  private ROLE_PRINT: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    protected settings: SettingsService,
    private stockService: StockService,
    private devisService: DevisService,
    private modalService: NzModalService,
    private clientServices: clientService,
    private factureService: FactureService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.ROLE_ADD = this.hasPermission('add_devis');
    this.ROLE_UPDATE = this.hasPermission('update_devis');
    this.ROLE_DELETE = this.hasPermission('delete_devis');
    this.ROLE_PRINT = this.hasPermission('print_devis');
  }

  ngOnInit(): void {
    this.getClients();
  }

  addDevis() {
    this.router.navigate(['devis/add']);
  }

  goToView(item: any) {
    this.router.navigate(['devis/view/' + item.id]);
  }

  public getDevis() {
    this.loading = true;
    this.devisService.getDevis().subscribe(
      (response: any) => {
        this.listeOfDevis = response;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public getDevisByCriteria() {
    this.loading = true;
    this.devisService.getDevisByCriteria(this.devisCriteria).subscribe(
      (response: any) => {
        this.listeOfDevis = response.data;
        this.totalDevis = response.total;
        this.from = response.from;
        this.to = response.to;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'referenceLike':
        this.devisCriteria.referenceLike = null;
        break;
      case 'clientId':
        this.devisCriteria.clientId = null;
        this.devisCriteria.client = null;
        break;
      case 'createdById':
        this.devisCriteria.createdById = null;
        break;

      case 'dateStart':
        this.devisCriteria.dateStart = null;
        break;
      case 'dateEnd':
        this.devisCriteria.dateEnd = null;
        break;
      case 'date':
        this.devisCriteria.date = null;
        this.devisCriteria.dateStart = null;
        this.devisCriteria.dateEnd = null;
        break;
      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.devisCriteria.page = 1;
    this.firstDevis = 1;
    this.getDevisByCriteria();
  }

  public searchGlobal() {
    if (this.devisCriteria.date) {
      this.search('Date', this.devisCriteria.date, 'magenta', 'date');
    }
    if (this.devisCriteria.referenceLike) {
      this.search('Réference', this.devisCriteria.referenceLike, 'orange', 'referenceLike');
    }
    if (this.devisCriteria.client) {
      this.devisCriteria.clientId = this.devisCriteria.client.id;
      this.search('Client', this.devisCriteria.clientId, 'green', 'clientId', this.devisCriteria.client.name);
    }
    this.devisCriteria.page = 1;
    this.firstDevis = 1;
    this.getDevisByCriteria();
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
  }

  public getClients() {
    this.clientServices.getClients().subscribe(
      (response: any) => {
        this.listeOfClients = response;
      },
      (error) => {},
    );
  }

  public currentPageDataChange(event: any) {
    console.log('event', event);
  }

  public sort(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    console.log('params', params);
    const currentSort = sort.find((item) => item.value !== null);
    if (params.pageIndex) {
      this.devisCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.devisCriteria.sortField = currentSort.key;
      this.devisCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.devisCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getDevisByCriteria();
    }
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      this.devisCriteria.dateStart = result[0];
      this.devisCriteria.dateEnd = result[1];
      this.devisCriteria.dateStart.setHours(0, 0, 0);
      this.devisCriteria.dateEnd.setHours(23, 59, 59);
      this.searchGlobal();
    } else {
      this.devisCriteria.dateStart = null;
      this.devisCriteria.dateEnd = null;
      this.resetSearch('date');
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
        this.devisCriteria.date = [date_start, date_end];
        this.devisCriteria.dateStart = date_start;
        this.devisCriteria.dateEnd = date_end;
        break;
      case '7J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 7);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.devisCriteria.date = [date_start, date_end];
        this.devisCriteria.dateStart = date_start;
        this.devisCriteria.dateEnd = date_end;
        break;
      case 'HIER':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 1);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.devisCriteria.date = [date_start, date_end];
        this.devisCriteria.dateStart = date_start;
        this.devisCriteria.dateEnd = date_end;
        break;
      case 'TODAY':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.devisCriteria.date = [date_start, date_end];
        this.devisCriteria.dateStart = date_start;
        this.devisCriteria.dateEnd = date_end;

        break;
      default:
        break;
    }
    this.rangePicker.close();
    this.searchGlobal();
  }

  public deleteFilter(index: any, filter: any) {
    console.log('filter', filter);
    this.resetSearch(filter.type);
  }

  public deleteAllfilter() {
    this.devisCriteria = new devisCriteria();
    this.filterApplyList = [];
    this.getDevisByCriteria();
  }

  editDevis(item: any) {
    this.router.navigate(['devis/edit/' + item.id]);
  }

  public exportData(type: string) {
    var data = { type: type, criteria: this.devisCriteria, table: 'devis' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => {},
      (error) => {},
    );
  }

  public deleteDevis(data: any) {
    this.modalService.confirm({
      nzTitle: 'Confirmation !',
      nzContent: 'Voulez vous vraiment supprimer ce Devis ?',
      nzOkText: 'Oui',
      nzCancelText: 'Non',
      nzOnOk: () => {
        this.confirmDelete(data);
      },
    });
  }

  public confirmDelete(data: any) {
    this.devisService.delete(data.id).subscribe(
      (response: any) => {
        this.notificationService.createNotification('success', 'Devis a été supprimer avec succes', null);
        this.getDevisByCriteria();
      },
      (error) => {
        this.notificationService.createNotification('error', 'erreur de suppression', null);
      },
    );
  }

  exportAsPDF(item: any) {
    this.devisService.print(item).subscribe(
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
