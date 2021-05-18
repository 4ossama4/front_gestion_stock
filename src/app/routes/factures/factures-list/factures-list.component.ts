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
import { FactureService } from 'src/app/services/facture.service';
import { factureCriteria } from 'src/app/models/facture.criteria';
import { clientService } from 'src/app/services/client.service';
import { NzDatePickerComponent, NzRangePickerComponent } from 'ng-zorro-antd/date-picker';
import { CommercialService } from 'src/app/services/commercial.service';
import { StockService } from 'src/app/services/stock.service';
import { SettingsService } from '@delon/theme';
import { baseComponent } from '../../base-component/base-component.component';

@Component({
  selector: 'app-factures-list',
  templateUrl: './factures-list.component.html',
  styleUrls: ['./factures-list.component.less'],
})
export class facturesListComponent extends baseComponent implements OnInit {
  private listeOfFactures: any[] = [];
  private listOfCommerciaux: any[] = [];
  private listeOfClients: any[] = [];
  private loading: boolean = false;
  private totalFactures: number = 0;
  private firstFacture: number = 0;
  private maxResults: number = 10;
  private isVisibleChercheDate: boolean = false;
  private factureCriteria: factureCriteria = new factureCriteria();
  @ViewChild('rangePicker') rangePicker!: NzDatePickerComponent;

  private filterApplyList: any[] = [];
  private modalFacture: boolean = false;

  private from: number = 0;
  private to: number = 0;

  private ROLE_DELETE: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    protected settings: SettingsService,
    private stockService: StockService,
    private factureService: FactureService,
    private modalService: NzModalService,
    private clientServices: clientService,
    private commercialService: CommercialService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.ROLE_DELETE = this.hasPermission('delete_facture');
  }

  ngOnInit(): void {
    // this.getFactureByCriteria();
    // this.getFactures();
    this.getClients();
    this.getCommerciaux();
  }

  public getFactures() {
    this.loading = true;
    this.factureService.getFactures().subscribe(
      (response: any) => {
        this.listeOfFactures = response;
        // this.totalFactures = response.total;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public getFactureByCriteria() {
    this.loading = true;
    this.factureService.getFacturesByCriteria(this.factureCriteria).subscribe(
      (response: any) => {
        this.listeOfFactures = response.data;
        this.totalFactures = response.total;
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
        this.factureCriteria.referenceLike = null;
        break;
      case 'clientId':
        this.factureCriteria.clientId = null;
        this.factureCriteria.client = null;
        break;
      case 'createdById':
        this.factureCriteria.createdById = null;
        break;
      case 'commercialeId':
        this.factureCriteria.commercialeId = null;
        this.factureCriteria.commerciale = null;
        break;
      case 'dateStart':
        this.factureCriteria.dateStart = null;
        break;
      case 'dateEnd':
        this.factureCriteria.dateEnd = null;
        break;
      case 'date':
        this.factureCriteria.date = null;
        this.factureCriteria.dateStart = null;
        this.factureCriteria.dateEnd = null;
        break;
      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.factureCriteria.page = 1;
    this.firstFacture = 1;
    this.getFactureByCriteria();
  }

  public searchGlobal() {
    if (this.factureCriteria.date) {
      this.search('Date', this.factureCriteria.date, 'magenta', 'date');
    }
    if (this.factureCriteria.referenceLike) {
      this.search('Réference', this.factureCriteria.referenceLike, 'orange', 'referenceLike');
    }
    if (this.factureCriteria.client) {
      this.factureCriteria.clientId = this.factureCriteria.client.id;
      this.search('Client', this.factureCriteria.clientId, 'green', 'clientId', this.factureCriteria.client.name);
    }
    if (this.factureCriteria.commerciale) {
      this.factureCriteria.commercialeId = this.factureCriteria.commerciale.id;
      this.search('Commerciale', this.factureCriteria.commercialeId, 'green', 'commercialeId', this.factureCriteria.commerciale.name);
    }
    this.factureCriteria.page = 1;
    this.firstFacture = 1;
    this.getFactureByCriteria();
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
    // this.getFactureByCriteria();
  }

  public getClients() {
    this.clientServices.getClients().subscribe(
      (response: any) => {
        this.listeOfClients = response;
      },
      (error) => { },
    );
  }

  public getCommerciaux() {
    this.commercialService.getCommerciaux().subscribe(
      (response: any) => {
        this.listOfCommerciaux = response;
      },
      (error) => { },
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
      this.factureCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.factureCriteria.sortField = currentSort.key;
      this.factureCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.factureCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getFactureByCriteria();
    }
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      this.factureCriteria.dateStart = result[0];
      this.factureCriteria.dateEnd = result[1];
      this.factureCriteria.dateStart.setHours(0, 0, 0);
      this.factureCriteria.dateEnd.setHours(23, 59, 59);
      this.searchGlobal();
    } else {
      this.factureCriteria.dateStart = null;
      this.factureCriteria.dateEnd = null;
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
        this.factureCriteria.date = [date_start, date_end];
        this.factureCriteria.dateStart = date_start;
        this.factureCriteria.dateEnd = date_end;
        break;
      case '7J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 7);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.factureCriteria.date = [date_start, date_end];
        this.factureCriteria.dateStart = date_start;
        this.factureCriteria.dateEnd = date_end;
        break;
      case 'HIER':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 1);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.factureCriteria.date = [date_start, date_end];
        this.factureCriteria.dateStart = date_start;
        this.factureCriteria.dateEnd = date_end;
        break;
      case 'TODAY':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.factureCriteria.date = [date_start, date_end];
        this.factureCriteria.dateStart = date_start;
        this.factureCriteria.dateEnd = date_end;

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
    // this.filterApplyList.splice(index, 1);
  }

  public deleteAllfilter() {
    this.factureCriteria = new factureCriteria();
    this.filterApplyList = [];
    this.getFactureByCriteria();
  }

  public getFacture(data: any) {
    this.factureService.factureFileById(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        window.open(downloadURL);
      },
      (error) => { },
    );
  }

  public deleteFacture(facture: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer cette facture',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(facture),
    });
  }

  public confirmationDelete(facture: number) {
    this.factureService.delete(facture).subscribe(
      (response) => {
        this.getFactureByCriteria();
        this.notificationService.createNotification('success', 'facture a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  editFacture(item: any) {
    this.router.navigate(['factures/edit/' + item.id]);
  }
}
