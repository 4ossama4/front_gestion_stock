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
import { DemandeService } from 'src/app/services/demande.service';
import { demandeCriteria } from 'src/app/models/demande.criteria';
import { clientService } from 'src/app/services/client.service';
import { NzDatePickerComponent, NzRangePickerComponent } from 'ng-zorro-antd/date-picker';
import { CommercialService } from 'src/app/services/commercial.service';
import { StockService } from 'src/app/services/stock.service';
import { SettingsService } from '@delon/theme';
import { baseComponent } from '../../base-component/base-component.component';

@Component({
  selector: 'app-demandes-list',
  templateUrl: './demandes-list.component.html',
  styleUrls: ['./demandes-list.component.less'],
})
export class demandesListComponent extends baseComponent implements OnInit {
  private listeOfDemandes: any[] = [];
  private listOfCommerciaux: any[] = [];
  private listeOfClients: any[] = [];
  private loading: boolean = false;
  private totalDemandes: number = 0;
  private firstDemandes: number = 0;
  private maxResults: number = 10;
  private isVisibleChercheDate: boolean = false;
  private demandeCriteria: demandeCriteria = new demandeCriteria();
  @ViewChild('rangePicker') rangePicker!: NzDatePickerComponent;

  private filterApplyList: any[] = [];
  private modalDemande: boolean = false;

  private from: number = 0;
  private to: number = 0;

  private ROLE_DELETE: boolean = false;
  private listOfEtat = [{ id: 1, label: 'En attent' }, { id: 2, label: 'En cours' }, { id: 3, label: 'Accepté' }, { id: 4, label: 'Réfuser' }, { id: 5, label: 'Livré' }]
  constructor(
    private fb: FormBuilder,
    private router: Router,
    protected settings: SettingsService,
    private stockService: StockService,
    private demandeService: DemandeService,
    private modalService: NzModalService,
    private clientServices: clientService,
    private commercialService: CommercialService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.ROLE_DELETE = this.hasPermission('delete_facture');
  }

  ngOnInit(): void {
    this.getClients();
    this.getCommerciaux();
  }


  public getDemandesByCriteria() {
    this.loading = true;
    this.demandeService.getDemandesByCriteria(this.demandeCriteria).subscribe(
      (response: any) => {
        this.listeOfDemandes = response.data;
        this.listeOfDemandes = [
          {
            id: 1,
            client: { name: 'Ossama Attalib' },
            date_demande: '12/02/2020 17:00:00',
            created_at: '05/02/2020 17:00:00',
            etat: { id: 1, label: 'En attent', color: 'orange' },
            montant: 1700.56
          },
          {
            id: 2,
            client: { name: 'Elmekki abd' },
            date_demande: '12/02/2020 15:00:00',
            created_at: '05/02/2020 15:00:00',
            etat: { id: 1, label: 'En cours', color: 'purple' },
            montant: 1700.56
          },
          {
            id: 3,
            client: { name: 'Hafid elmo' },
            date_demande: '12/02/2020 17:00:00',
            created_at: '05/02/2020 17:00:00',
            etat: { id: 1, label: 'Accepté', color: 'gold' },
            montant: 1700.56
          },
          {
            id: 4,
            client: { name: 'Khadeja alaoui' },
            date_demande: '12/02/2020 17:00:00',
            created_at: '05/02/2020 17:00:00',
            etat: { id: 1, label: 'Réfuser', color: 'red' },
            montant: 1700.56
          },
          {
            id: 5,
            client: { name: 'Fatima fathi' },
            date_demande: '12/02/2020 17:00:00',
            created_at: '05/02/2020 17:00:00',
            etat: { id: 1, label: 'Livré', color: 'green' },
            montant: 1700.56
          }
        ]
        this.totalDemandes = response.total;
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
        this.demandeCriteria.referenceLike = null;
        break;
      case 'clientId':
        this.demandeCriteria.clientId = null;
        this.demandeCriteria.client = null;
        break;
      case 'createdById':
        this.demandeCriteria.createdById = null;
        break;
      case 'commercialeId':
        this.demandeCriteria.commercialeId = null;
        this.demandeCriteria.commerciale = null;
        break;
      case 'dateStart':
        this.demandeCriteria.dateStart = null;
        break;
      case 'dateEnd':
        this.demandeCriteria.dateEnd = null;
        break;
      case 'date':
        this.demandeCriteria.date = null;
        this.demandeCriteria.dateStart = null;
        this.demandeCriteria.dateEnd = null;
        break;
      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.demandeCriteria.page = 1;
    this.firstDemandes = 1;
    this.getDemandesByCriteria();
  }

  public searchGlobal() {
    if (this.demandeCriteria.date) {
      this.search('Date', this.demandeCriteria.date, 'magenta', 'date');
    }
    if (this.demandeCriteria.referenceLike) {
      this.search('Réference', this.demandeCriteria.referenceLike, 'orange', 'referenceLike');
    }
    if (this.demandeCriteria.client) {
      this.demandeCriteria.clientId = this.demandeCriteria.client.id;
      this.search('Client', this.demandeCriteria.clientId, 'green', 'clientId', this.demandeCriteria.client.name);
    }
    if (this.demandeCriteria.commerciale) {
      this.demandeCriteria.commercialeId = this.demandeCriteria.commerciale.id;
      this.search('Commerciale', this.demandeCriteria.commercialeId, 'green', 'commercialeId', this.demandeCriteria.commerciale.name);
    }
    this.demandeCriteria.page = 1;
    this.firstDemandes = 1;
    this.getDemandesByCriteria();
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
    // this.getDemandesByCriteria();
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
      this.demandeCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.demandeCriteria.sortField = currentSort.key;
      this.demandeCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.demandeCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getDemandesByCriteria();
    }
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      this.demandeCriteria.dateStart = result[0];
      this.demandeCriteria.dateEnd = result[1];
      this.demandeCriteria.dateStart.setHours(0, 0, 0);
      this.demandeCriteria.dateEnd.setHours(23, 59, 59);
      this.searchGlobal();
    } else {
      this.demandeCriteria.dateStart = null;
      this.demandeCriteria.dateEnd = null;
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
        this.demandeCriteria.date = [date_start, date_end];
        this.demandeCriteria.dateStart = date_start;
        this.demandeCriteria.dateEnd = date_end;
        break;
      case '7J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 7);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.demandeCriteria.date = [date_start, date_end];
        this.demandeCriteria.dateStart = date_start;
        this.demandeCriteria.dateEnd = date_end;
        break;
      case 'HIER':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 1);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.demandeCriteria.date = [date_start, date_end];
        this.demandeCriteria.dateStart = date_start;
        this.demandeCriteria.dateEnd = date_end;
        break;
      case 'TODAY':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.demandeCriteria.date = [date_start, date_end];
        this.demandeCriteria.dateStart = date_start;
        this.demandeCriteria.dateEnd = date_end;

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
    this.demandeCriteria = new demandeCriteria();
    this.filterApplyList = [];
    this.getDemandesByCriteria();
  }

  public getDemande(data: any) {
    this.demandeService.demandeFileById(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        window.open(downloadURL);
      },
      (error) => { },
    );
  }

  public deleteDemande(demande: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer cette demande',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(demande),
    });
  }

  public confirmationDelete(demande: number) {
    this.demandeService.delete(demande).subscribe(
      (response) => {
        this.getDemandesByCriteria();
        this.notificationService.createNotification('success', 'Demande a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  goToView(item: any) {
    this.router.navigate(['demandes/view/' + item.id]);
  }
}
