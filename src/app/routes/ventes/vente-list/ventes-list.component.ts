import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
// import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { environment } from '../../../../environments/environment';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';

// _____________models____________
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Router } from '@angular/router';
import { VentesService } from 'src/app/services/vente.service';
import { venteCriteria } from 'src/app/models/vente.criteria';
import { Vente } from 'src/app/models/vente.model';
import { clientService } from 'src/app/services/client.service';
import { NzDatePickerComponent, NzRangePickerComponent } from 'ng-zorro-antd/date-picker';
import { CommercialService } from 'src/app/services/commercial.service';
import { StockService } from 'src/app/services/stock.service';
import { FactureService } from 'src/app/services/facture.service';
import { baseComponent } from '../../base-component/base-component.component';
import { SettingsService } from '@delon/theme';
import { articleCriteria } from 'src/app/models/article.criteria';

@Component({
  selector: 'app-ventes-list',
  templateUrl: './ventes-list.component.html',
  styleUrls: ['./ventes-list.component.less'],
})
export class venteListComponent extends baseComponent implements OnInit {
  // private listeOfVente: any[] = [];
  private listeOfVente: any[] = [];
  private listOfCommerciaux: any[] = [];
  private listeOfClients: any[] = [];
  private loading: boolean = false;
  private totalVente: number = 0;
  private firstVente: number = 0;
  private maxResults: number = 10;
  private isVisibleChercheDate: boolean = false;
  private venteCriteria: venteCriteria = new venteCriteria();
  @ViewChild('rangePicker') rangePicker!: NzDatePickerComponent;
  private somme_ventes = 0;
  private filterApplyList: any[] = [];
  private modalFacture: boolean = false;

  private from: number = 0;
  private to: number = 0;

  private venteSelected: any;
  private modalInfoFacture: boolean = false;
  private facturesVente: any;

  private ROLE_ADD: boolean = false;
  private ROLE_UPDATE: boolean = false;
  private ROLE_DELETE: boolean = false;
  private ROLE_ADD_FACTURE: boolean = false;
  private ROLE_SHOW_FACTURE: boolean = false;
  private ROLE_PRINT_BL: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    protected settings: SettingsService,
    private stockService: StockService,
    private ventesService: VentesService,
    private modalService: NzModalService,
    private clientServices: clientService,
    private factureService: FactureService,
    private commercialService: CommercialService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.ROLE_ADD = this.hasPermission('add_vente');
    this.ROLE_UPDATE = this.hasPermission('update_vente');
    this.ROLE_DELETE = this.hasPermission('delete_vente');
    this.ROLE_ADD_FACTURE = this.hasPermission('add_facture');
    this.ROLE_SHOW_FACTURE = this.hasPermission('show_factures');
    this.ROLE_PRINT_BL = this.hasPermission('bl_vente');
  }

  ngOnInit(): void {
    // this.getVentesByCriteria();
    // this.getVentes();
    this.getClients();
    this.getCommerciaux();
  }

  addVente() {
    this.router.navigate(['ventes/add']);
  }

  goToView(item: any) {
    this.router.navigate(['ventes/view/' + item.id]);
  }

  public getVentes() {
    this.loading = true;
    this.ventesService.getVentes().subscribe(
      (response: any) => {
        this.listeOfVente = response;
        // this.totalVente = response.total;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public getVentesByCriteria() {
    this.loading = true;
    this.ventesService.getVentesByCriteria(this.venteCriteria).subscribe(
      (response: any) => {
        this.listeOfVente = response.data;
        this.totalVente = response.total;
        this.from = response.from;
        this.to = response.to;
        this.somme_ventes = response.somme_ventes;
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
        this.venteCriteria.referenceLike = null;
        break;
      case 'clientId':
        this.venteCriteria.clientId = null;
        this.venteCriteria.client = null;
        break;
      case 'createdById':
        this.venteCriteria.createdById = null;
        break;
      case 'commercialeId':
        this.venteCriteria.commercialeId = null;
        this.venteCriteria.commerciale = null;
        break;

      case 'paymentMethodId':
        this.venteCriteria.paymentMethodId = null;
        break;
      case 'dateStart':
        this.venteCriteria.dateStart = null;
        break;
      case 'dateEnd':
        this.venteCriteria.dateEnd = null;
        break;
      case 'date':
        this.venteCriteria.date = null;
        this.venteCriteria.dateStart = null;
        this.venteCriteria.dateEnd = null;
        break;
      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.venteCriteria.page = 1;
    this.firstVente = 1;
    this.getVentesByCriteria();
  }

  public searchGlobal() {
    if (this.venteCriteria.date) {
      this.search('Date', this.venteCriteria.date, 'magenta', 'date');
    }
    if (this.venteCriteria.referenceLike) {
      this.search('Réference', this.venteCriteria.referenceLike, 'orange', 'referenceLike');
    }
    if (this.venteCriteria.client) {
      this.venteCriteria.clientId = this.venteCriteria.client.id;
      this.search('Client', this.venteCriteria.clientId, 'green', 'clientId', this.venteCriteria.client.name);
    }
    if (this.venteCriteria.commerciale) {
      this.venteCriteria.commercialeId = this.venteCriteria.commerciale.id;
      this.search('Commerciale', this.venteCriteria.commercialeId, 'green', 'commercialeId', this.venteCriteria.commerciale.name);
    }
    this.venteCriteria.page = 1;
    this.firstVente = 1;
    this.getVentesByCriteria();
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
    // this.getVentesByCriteria();
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
      this.venteCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.venteCriteria.sortField = currentSort.key;
      this.venteCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.venteCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getVentesByCriteria();
    }
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      this.venteCriteria.dateStart = result[0];
      this.venteCriteria.dateEnd = result[1];
      this.venteCriteria.dateStart.setHours(0, 0, 0);
      this.venteCriteria.dateEnd.setHours(23, 59, 59);
      this.searchGlobal();
    } else {
      this.venteCriteria.dateStart = null;
      this.venteCriteria.dateEnd = null;
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
        this.venteCriteria.date = [date_start, date_end];
        this.venteCriteria.dateStart = date_start;
        this.venteCriteria.dateEnd = date_end;
        break;
      case '7J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 7);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.venteCriteria.date = [date_start, date_end];
        this.venteCriteria.dateStart = date_start;
        this.venteCriteria.dateEnd = date_end;
        break;
      case 'HIER':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 1);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.venteCriteria.date = [date_start, date_end];
        this.venteCriteria.dateStart = date_start;
        this.venteCriteria.dateEnd = date_end;
        break;
      case 'TODAY':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.venteCriteria.date = [date_start, date_end];
        this.venteCriteria.dateStart = date_start;
        this.venteCriteria.dateEnd = date_end;

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
    this.venteCriteria = new venteCriteria();
    this.filterApplyList = [];
    this.getVentesByCriteria();
  }

  editVente(item: any) {
    this.router.navigate(['ventes/edit/' + item.id]);
  }

  @ViewChild('MyDIv', { static: false }) MyDIv?: ElementRef;

  exportAsPDF(item: any) {
    this.ventesService.print(item).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        window.open(downloadURL);
        this.notificationService.createNotification('success', '', null);
        this.getVentesByCriteria();
      },
      (error) => { },
    );
  }

  exportAsPDFOuther(data: any) {
    this.modalFacture = true;

    this.ventesService.getVenteFactureById(data.id).subscribe((response: any) => {
      this.venteSelected = response.data;
      var date = this.venteSelected.date_vente.split(' ');
      var dateJMY = date[0].split('-');
      var dateHM = date[1].split(':');
      console.log('this.dateHM', dateJMY);
      this.venteSelected.date_vente = new Date(dateJMY[0], dateJMY[1] - 1, dateJMY[2], dateHM[0], dateHM[1], dateHM[2]);

      if (response.data) {
        this.venteSelected.count = response.reference;
        this.venteSelected.ref_facture = '' + response.reference + '/' + new Date().getFullYear().toString().substring(2, 4);
      }
    });
    this.createFormVente();
  }

  hideModal() {
    this.modalFacture = false;
    this.loadingSave = false;
  }
  loadingSave: boolean = false;
  public printFacture() {
    if (this.venteSelected && this.venteSelected.lignes_vente && this.venteSelected.lignes_vente.length > 0) {
      this.venteSelected.lignes_vente.forEach((element: any) => {
        element.facture_id = null;
      });
      this.loadingSave = true;

      this.ventesService.getVenteFactureById(this.venteSelected.id).subscribe((response: any) => {
        if (response.reference) {
          this.venteSelected.count = response.reference;
          this.venteSelected.ref_facture = '' + response.reference + '/' + new Date().getFullYear().toString().substring(2, 4);
        }

        for (const i in this.lignesFactuceForm.controls) {
          this.lignesFactuceForm.controls[i].markAsDirty();
          this.lignesFactuceForm.controls[i].updateValueAndValidity();
        }
        if (this.lignesFactuceForm.valid) {
          this.venteSelected.lignesFactuceForm = this.lignesFactuceForm.value;
          this.venteSelected.prix_vente_ht = this.venteSelected.prix_vente_ht + (this.lignesFactuceForm.value.prix_facture_ht ? this.lignesFactuceForm.value.prix_facture_ht : 0);
          this.venteSelected.prix_vente_ttc = this.venteSelected.prix_vente_ttc + (this.lignesFactuceForm.value.prix_facture_ttc ? this.lignesFactuceForm.value.prix_facture_ttc : 0)
          this.venteSelected.prix_vente_ttc_with_remise = this.venteSelected.prix_vente_ttc_with_remise + (this.lignesFactuceForm.value.prix_facture_ttc_with_remise ? this.lignesFactuceForm.value.prix_facture_ttc_with_remise : 0)
          console.log('this.venteSelected', this.venteSelected);
          // this.ventesService.printFacture(this.venteSelected).subscribe(
          //   (response: any) => {
          //     var downloadURL = window.URL.createObjectURL(response);
          //     var link = document.createElement('a');
          //     link.href = downloadURL;;
          //     window.open(downloadURL);
          //     this.notificationService.createNotification('success', 'Facture a été crée avec succes', null);
          //     this.getVentesByCriteria();
          //     this.hideModal();
          //   },
          //   (error) => { this.loadingSave = false; },
          // );
        }


      }, (error) => { this.loadingSave = false; });

    }
  }

  public removeVentePrint(vente: any) {
    const index = this.venteSelected.lignes_vente.indexOf(vente);
    if (index > -1) {
      this.venteSelected.lignes_vente.splice(index, 1);
    }
    this.venteSelected.prix_vente_ttc_with_remise = 0;
    this.venteSelected.prix_vente_ttc = 0;
    this.venteSelected.lignes_vente.forEach((ligne: any) => {
      this.venteSelected.prix_vente_ttc_with_remise += ligne.total_with_remise;
      this.venteSelected.prix_vente_ttc += ligne.total;
    });
    this.venteSelected.prix_vente_ht = this.venteSelected.prix_vente_ttc_with_remise / 1.2;
    if (this.venteSelected.commercial) {
      this.venteSelected.commercial_profit = this.venteSelected.prix_vente_ht * (this.venteSelected.commercial.commission / 100);
    }
    this.venteSelected.net_vente = this.venteSelected.prix_vente_ttc_with_remise - this.venteSelected.commercial_profit;
  }

  public hideModalInfoFacture() {
    this.modalInfoFacture = false;
    this.facturesVente = null;
  }

  public showModalInfoFacture(vente: any) {
    this.modalFacture = false;
    this.modalInfoFacture = true;

    this.ventesService.getFacturesByVente(vente.id).subscribe(
      (response: any) => {
        console.log('response', response);
        this.facturesVente = response;
        if (this.facturesVente) {
          this.facturesVente.forEach((element: any) => {
            element.expand = false;
          });
        }
      },
      (error) => { },
    );
  }

  editId?: any = null;
  public changeQte() {
    this.venteSelected.prix_vente_ttc_with_remise = 0;
    this.venteSelected.prix_vente_ttc = 0;
    this.venteSelected.lignes_vente.forEach((ligne: any) => {
      ligne.total_with_remise = ligne.quantite_facture * ligne.prix_vente_avec_remise;
      ligne.total = ligne.quantite_facture * ligne.prix_vente;
      this.venteSelected.prix_vente_ttc_with_remise += ligne.total_with_remise;
      this.venteSelected.prix_vente_ttc += ligne.total;
    });
    this.venteSelected.prix_vente_ht = this.venteSelected.prix_vente_ttc_with_remise / 1.2;
    if (this.venteSelected.commercial) {
      this.venteSelected.commercial_profit = this.venteSelected.prix_vente_ht * (this.venteSelected.commercial.commission / 100);
    }
    this.venteSelected.net_vente = this.venteSelected.prix_vente_ttc_with_remise - this.venteSelected.commercial_profit;

    this.editId = null;
  }

  public changePrixVente() {
    this.venteSelected.prix_vente_ttc_with_remise = 0;
    this.venteSelected.prix_vente_ttc = 0;
    this.venteSelected.lignes_vente.forEach((ligne: any) => {
      ligne.total = ligne.quantite_facture * ligne.prix_vente;
      ligne.prix_vente_avec_remise = ligne.prix_vente - ligne.prix_vente * (ligne.remise / 100);
      ligne.total_with_remise = ligne.quantite_facture * ligne.prix_vente_avec_remise;
      this.venteSelected.prix_vente_ttc_with_remise += ligne.total_with_remise;
      this.venteSelected.prix_vente_ttc += ligne.total;
    });
    this.venteSelected.prix_vente_ht = this.venteSelected.prix_vente_ttc_with_remise / 1.2;
    if (this.venteSelected.commercial) {
      this.venteSelected.commercial_profit = this.venteSelected.prix_vente_ht * (this.venteSelected.commercial.commission / 100);
    }
    this.venteSelected.net_vente = this.venteSelected.prix_vente_ttc_with_remise - this.venteSelected.commercial_profit;
    this.editId = null;
  }

  public changeRemise() {
    this.venteSelected.prix_vente_ttc_with_remise = 0;
    this.venteSelected.prix_vente_ttc = 0;
    this.venteSelected.lignes_vente.forEach((ligne: any) => {
      ligne.prix_vente_avec_remise = ligne.prix_vente - ligne.prix_vente * (ligne.remise / 100);
      ligne.total_with_remise = ligne.quantite_facture * ligne.prix_vente_avec_remise;
      this.venteSelected.prix_vente_ttc_with_remise += ligne.total_with_remise;
    });
    this.venteSelected.prix_vente_ht = this.venteSelected.prix_vente_ttc_with_remise / 1.2;
    if (this.venteSelected.commercial) {
      this.venteSelected.commercial_profit = this.venteSelected.prix_vente_ht * (this.venteSelected.commercial.commission / 100);
    }
    this.venteSelected.net_vente = this.venteSelected.prix_vente_ttc_with_remise - this.venteSelected.commercial_profit;

    this.editId = null;
  }

  startEdit(id: any, ligne: any): void {
    this.editId = id;
  }

  public exportData(type: string) {
    var data = { type: type, criteria: this.venteCriteria, table: 'ventes' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => { },
      (error) => { },
    );
  }

  public gotoAvoir(data: any) {
    this.router.navigate(['avoirs/add'], { queryParams: { client: data.client.id, vente: data.id } });
  }

  public showFacture(data: any) {
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

  public deleteVente(data: any) {
    this.modalService.confirm({
      nzTitle: 'Confirmation !',
      nzContent: 'Voulez vous vraiment supprimer cette vente ?',
      nzOkText: 'Oui',
      nzCancelText: 'Non',
      nzOnOk: () => {
        this.confirmDelete(data);
      },
    });
  }

  public confirmDelete(data: any) {
    this.ventesService.delete(data.id).subscribe(
      (response: any) => {
        this.notificationService.createNotification('success', 'Vente a été supprimer avec succes', null);
        this.getVentesByCriteria();
      },
      (error) => {
        this.notificationService.createNotification('error', 'erreur de suppression', null);
      },
    );
  }

  public bonRammasage(data: any) {
    this.ventesService.bonRamassage(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        window.open(downloadURL);
        this.notificationService.createNotification('success', 'Bon de ramassage a été téléchargé avec succes', null);
      },
      (error) => { },
    );
  }

  // __________add ligne facture _______
  addLigneFacture(
    vente_id: any = this.venteSelected.id,
    article_id?: any,
    article?: any,
    articleValid: any = true,
    articleExiste: any = false,
    designation?: any,
    quantite: any = 0,
    prix_vente?: any,
    remise: any = 0,
    prix_vente_avec_remise?: any,
    total?: any,
    total_with_remise?: any,
  ) {
    const control = <FormArray>this.lignesFactuceForm.get('lignes_facture');
    control.push(
      this.patchValues(
        vente_id,
        article_id,
        article,
        articleValid,
        articleExiste,
        designation,
        quantite,
        prix_vente,
        remise,
        prix_vente_avec_remise,
        total,
        total_with_remise,
      ),
    );
  }

  private patchValues(
    vente_id: any,
    article_id: any,
    article: any,
    articleValid: any,
    articleExiste: any,
    designation: any,
    quantite: any,
    prix_vente: any,
    remise: any,
    prix_vente_avec_remise: any,
    total: any,
    total_with_remise: any,
  ) {
    return this.fb.group({
      vente_id: [vente_id],
      article_id: [article_id, [Validators.required]],
      article: [article],
      articleValid: [articleValid, [Validators.required]],
      articleExiste: [articleExiste, [Validators.required]],
      designation: [designation],
      quantite: [quantite, Validators.min(1)],
      prix_vente: [prix_vente, [Validators.required]],
      remise: [remise],
      prix_vente_avec_remise: [prix_vente_avec_remise],
      total: [total],
      total_with_remise: [total_with_remise],
      marge: [null],
    });
  }

  private lignesFactuceForm: FormGroup = new FormGroup({});

  public createFormVente() {
    this.lignesFactuceForm = this.fb.group({
      prix_facture_ttc: [0, [Validators.required]],
      prix_facture_ttc_with_remise: [0, [Validators.required]],
      prix_facture_ht: [0],
      net_facture: [0],
      remiseAuto: [0],
      lignes_facture: this.fb.array([]),
    });
  }

  private listeOfArticles: any[] = [];

  public getArticles(event: any, index: any) {
    if (event) {
      let ArticleCriteria = new articleCriteria()
      ArticleCriteria.maxResults = 1000;
      ArticleCriteria.referenceNotSpaceLike = event.replace(/[&\/\\#\s,;\-\_+()$~%.'":*?<>{}]/g, '');
      this.stockService.getStocksByCriteria(ArticleCriteria).subscribe(
        (response: any) => {
          this.listeOfArticles = response.data;
        },
        (error) => { },
      );
    } else {
      this.listeOfArticles = [];
    }
  }

  public onChangeArticle(event: any, index: any) {
    const valeurParam = (<FormArray>this.lignesFactuceForm.get('lignes_facture')).at(index);
    const foundArticle = this.lignesFactuceForm.value.lignes_facture.find((element: any) => element.article_id == event.id);
    if (foundArticle) {
      valeurParam.patchValue({ articleExiste: null });
    } else {
      valeurParam.patchValue({
        article_id: event.id,
        prix_vente: event.prix_vente,
        designation: event.designation,
        quantite: 0,
        // remise: 0,
        total: 0,
        total_with_remise: 0,
        articleValid: true,
        articleExiste: false,
      });
    }
  }

  onMouseupQte(index: any) {
    console.log('eeeee');
    const valeurParam = (<FormArray>this.lignesFactuceForm.get('lignes_facture')).at(index);
    this.checkQteArticle(valeurParam);
    this.changePriceTotal(valeurParam);
    this.calculePriceVente();
  }

  public checkQteArticle(valeurParam: any) {
    if (valeurParam.value.article && valeurParam.value.quantite > valeurParam.value.article.quantite) {
      valeurParam.patchValue({ articleValid: null });
    } else {
      valeurParam.patchValue({ articleValid: true });
    }
  }

  public changePriceTotal(valeurParam: any) {
    if (valeurParam.value.article) {
      valeurParam.patchValue({
        total: valeurParam.value.prix_vente * valeurParam.value.quantite,
        prix_vente_avec_remise: valeurParam.value.prix_vente - valeurParam.value.prix_vente * (valeurParam.value.remise / 100),
        total_with_remise:
          (valeurParam.value.prix_vente - valeurParam.value.prix_vente * (valeurParam.value.remise / 100)) * valeurParam.value.quantite,
      });
    }
  }

  public calculePriceVente() {
    const lignes_facture = this.lignesFactuceForm.value.lignes_facture;
    this.lignesFactuceForm.patchValue({ prix_facture_ttc: 0, prix_facture_ttc_with_remise: 0 });
    lignes_facture.forEach((element: any) => {
      this.lignesFactuceForm.patchValue({
        prix_facture_ttc: this.lignesFactuceForm.value.prix_facture_ttc + element.total,
        prix_facture_ttc_with_remise: this.lignesFactuceForm.value.prix_facture_ttc_with_remise + element.total_with_remise,
      });
    });
    this.lignesFactuceForm.patchValue({
      prix_facture_ht: parseFloat(this.lignesFactuceForm.value.prix_facture_ttc_with_remise) / 1.2,
    });

    this.lignesFactuceForm.patchValue({
      net_facture:
        parseFloat(this.lignesFactuceForm.value.prix_facture_ttc_with_remise),
    });
  }

  public changePriceVente(event: any, index: any) {
    const valeurParam = (<FormArray>this.lignesFactuceForm.get('lignes_facture')).at(index);
    if (event) {
      valeurParam.patchValue({
        total: event * valeurParam.value.quantite,
        prix_vente_avec_remise: event - event * (valeurParam.value.remise / 100),
      });
      valeurParam.patchValue({
        total_with_remise: (event - event * (valeurParam.value.remise / 100)) * valeurParam.value.quantite,
      });
      const lignes_facture = this.lignesFactuceForm.value.lignes_facture;

      this.lignesFactuceForm.patchValue({ prix_facture_ttc: 0 });
      this.lignesFactuceForm.patchValue({ prix_facture_ttc_with_remise: 0 });

      lignes_facture.forEach((element: any) => {
        this.lignesFactuceForm.patchValue({
          prix_facture_ttc: parseFloat(this.lignesFactuceForm.value.prix_facture_ttc) + element.prix_vente * element.quantite,
        });
        this.lignesFactuceForm.patchValue({
          prix_facture_ttc_with_remise:
            parseFloat(this.lignesFactuceForm.value.prix_facture_ttc_with_remise) + element.prix_vente_avec_remise * element.quantite,
        });
      });
      this.lignesFactuceForm.patchValue({
        prix_facture_ht: parseFloat(this.lignesFactuceForm.value.prix_facture_ttc_with_remise) / 1.2,
      });

      this.lignesFactuceForm.patchValue({
        net_vente:
          parseFloat(this.lignesFactuceForm.value.prix_facture_ttc_with_remise),
      });
    }
  }

  public onMouseupRemise(index: any) {
    const valeurParam = (<FormArray>this.lignesFactuceForm.get('lignes_facture')).at(index);
    this.changePriceTotal(valeurParam);
    this.calculePriceVente();
  }

  public deleteLigneVente(index: any) {
    const control = <FormArray>this.lignesFactuceForm.get('lignes_facture');
    control.removeAt(index);
    this.calculePriceVente();
  }
}
