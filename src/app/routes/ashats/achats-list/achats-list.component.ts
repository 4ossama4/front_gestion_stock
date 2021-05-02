import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';

// _____________models____________
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Router } from '@angular/router';
import { AchatsService } from 'src/app/services/achat.service';
import { achatCriteria } from 'src/app/models/achat.criteria';
import { FournisseurService } from 'src/app/services/fournisseur.service';
import { NzDatePickerComponent, NzRangePickerComponent } from 'ng-zorro-antd/date-picker';
import { StockService } from 'src/app/services/stock.service';
import { baseComponent } from '../../base-component/base-component.component';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-achats-list',
  templateUrl: './achats-list.component.html',
  styleUrls: ['./achats-list.component.less'],
})
export class achatsListComponent extends baseComponent implements OnInit {
  private listeOfAchat: any[] = [];
  private listOfTypesAchat = [
    { text: 'Devise', value: 1 },
    { text: 'DH', value: 0 },
  ];
  private listeOfFournisseurs: any[] = [];
  private loading: boolean = false;
  private totalAchats: number = 0;
  private firstAchat: number = 0;
  private maxResults: number = 10;
  private isVisibleChercheDate: boolean = false;
  private achatCriteria: achatCriteria = new achatCriteria();
  @ViewChild('rangePicker') rangePicker!: NzDatePickerComponent;

  private filterApplyList: any[] = [];
  private somme_achats = 0;
  private from: number = 0;
  private to: number = 0;
  private ROLE_ADD: boolean = false;
  private ROLE_UPDATE: boolean = false;
  private ROLE_DELETE: boolean = false;
  private ROLE_PRINT: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    protected settings: SettingsService,
    private achatsService: AchatsService,
    private modalService: NzModalService,
    private stockService: StockService,
    private fournisseurService: FournisseurService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.ROLE_ADD = this.hasPermission('add_achat');
    this.ROLE_UPDATE = this.hasPermission('update_achat');
    this.ROLE_DELETE = this.hasPermission('delete_achat');
    this.ROLE_PRINT = this.hasPermission('print_achat');
  }

  ngOnInit(): void {
    // this.getAchatByCriteria();
    this.getFournisseur();
  }

  addAchat() {
    this.router.navigate(['achats/add']);
  }

  goToView(item: any) {
    this.router.navigate(['achats/view/' + item.id]);
  }

  public getAchats() {
    this.loading = true;
    this.achatsService.getAchats().subscribe(
      (reponse: any) => {
        this.listeOfAchat = reponse;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public getAchatByCriteria() {
    this.loading = true;
    this.achatsService.getAchatsByCriteria(this.achatCriteria).subscribe(
      (response: any) => {
        this.listeOfAchat = response.data;
        this.totalAchats = response.total;
        this.loading = false;
        this.from = response.from;
        this.to = response.to;
        this.somme_achats = response.somme_achats;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'referenceLike':
        this.achatCriteria.referenceLike = null;
        break;
      case 'fournisseurId':
        this.achatCriteria.fournisseurId = null;
        this.achatCriteria.fournisseur = null;
        break;
      case 'createdById':
        this.achatCriteria.createdById = null;
        break;
      case 'dateStart':
        this.achatCriteria.dateStart = null;
        break;
      case 'dateEnd':
        this.achatCriteria.dateEnd = null;
        break;
      case 'date':
        this.achatCriteria.date = null;
        this.achatCriteria.dateStart = null;
        this.achatCriteria.dateEnd = null;
        break;
      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.achatCriteria.page = 1;
    this.firstAchat = 1;
    this.getAchatByCriteria();
  }

  public searchGlobal() {
    if (this.achatCriteria.date) {
      this.search('Date', this.achatCriteria.date, 'magenta', 'date');
    }
    if (this.achatCriteria.referenceLike) {
      this.search('Réference', this.achatCriteria.referenceLike, 'orange', 'referenceLike');
    }

    if (this.achatCriteria.fournisseur) {
      this.achatCriteria.fournisseurId = this.achatCriteria.fournisseur.id;
      this.search('Fournisseur', this.achatCriteria.fournisseurId, 'green', 'fournisseurId', this.achatCriteria.fournisseur.name);
    }
    this.achatCriteria.page = 1;
    this.firstAchat = 1;
    this.getAchatByCriteria();
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
    // this.getAchatByCriteria();
  }

  public getFournisseur() {
    this.fournisseurService.getFournisseurs().subscribe(
      (response: any) => {
        this.listeOfFournisseurs = response;
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

    if (params.filter && params.filter.length > 0) {
      this.achatCriteria.typeDevise = params.filter[0].value;
    }

    const currentSort = sort.find((item) => item.value !== null);
    if (params.pageIndex) {
      this.achatCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.achatCriteria.sortField = currentSort.key;
      this.achatCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.achatCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getAchatByCriteria();
    }
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      this.achatCriteria.dateStart = result[0];
      this.achatCriteria.dateEnd = result[1];
      this.achatCriteria.dateStart.setHours(0, 0, 0);
      this.achatCriteria.dateEnd.setHours(23, 59, 59);
      this.searchGlobal();
    } else {
      this.achatCriteria.dateStart = null;
      this.achatCriteria.dateEnd = null;
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
        this.achatCriteria.date = [date_start, date_end];
        this.achatCriteria.dateStart = date_start;
        this.achatCriteria.dateEnd = date_end;
        break;
      case '7J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 7);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.achatCriteria.date = [date_start, date_end];
        this.achatCriteria.dateStart = date_start;
        this.achatCriteria.dateEnd = date_end;
        break;
      case 'HIER':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 1);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.achatCriteria.date = [date_start, date_end];
        this.achatCriteria.dateStart = date_start;
        this.achatCriteria.dateEnd = date_end;
        break;
      case 'TODAY':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.achatCriteria.date = [date_start, date_end];
        this.achatCriteria.dateStart = date_start;
        this.achatCriteria.dateEnd = date_end;

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
    this.achatCriteria = new achatCriteria();
    this.filterApplyList = [];
    this.getAchatByCriteria();
  }

  editAchat(item: any) {
    this.router.navigate(['achats/edit/' + item.id]);
  }

  exportAsPDF(item: any) {
    this.achatsService.print(item).subscribe(
      (response: any) => {
        console.log('ccc');
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        window.open(downloadURL);
        // link.download = 'achat.pdf';
        // link.click();
      },
      (error) => { },
    );
  }

  public filterByType(list: string[], item: any) {
    console.log('filter');
  }

  public exportData(type: string) {
    var data = { type: type, criteria: this.achatCriteria, table: 'achats' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => { },
      (error) => { },
    );
  }

  public deleteAchat(data: any) {
    this.modalService.confirm({
      nzTitle: 'Confirmation !',
      nzContent: 'Voulez vous vraiment supprimer cette achat ?',
      nzOkText: 'Oui',
      nzCancelText: 'Non',
      nzOnOk: () => {
        if (!this.loadingSave) {
          this.confirmDelete(data);
        }

      },
    });
  }
  loadingSave: boolean = false
  public confirmDelete(data: any) {
    this.loadingSave = true;
    this.achatsService.delete(data.id).subscribe(
      (response: any) => {
        this.notificationService.createNotification('success', 'Achat a été supprimer avec succes', null);
        this.getAchatByCriteria();
        this.loadingSave = false;
      },
      (error) => {
        this.loadingSave = false;
        this.notificationService.createNotification('error', 'erreur de suppression', null);
      },
    );
  }
}
