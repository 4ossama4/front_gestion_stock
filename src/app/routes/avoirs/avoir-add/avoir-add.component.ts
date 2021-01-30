import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TransferChange, TransferItem, TransferSelectChange } from 'ng-zorro-antd/transfer';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';
import { avoirService } from '../../../services/avoir.service';
import { StockService } from 'src/app/services/stock.service';
import { clientService } from 'src/app/services/client.service';
import { CommercialService } from 'src/app/services/commercial.service';

// _____________models____________
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { articleCriteria } from 'src/app/models/article.criteria';

import { ActivatedRoute, Router } from '@angular/router';
import { VentesService } from 'src/app/services/vente.service';
import { venteCriteria } from 'src/app/models/vente.criteria';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-avoir-add',
  templateUrl: './avoir-add.component.html',
  styleUrls: ['./avoir-add.component.less'],
})
export class avoirAddComponent implements OnInit {
  private avoirForm: FormGroup = new FormGroup({});
  private clientForm: FormGroup = new FormGroup({});
  private commercialeForm: FormGroup = new FormGroup({});
  private articleCriteria: articleCriteria = new articleCriteria();
  private clickSave: boolean = false;
  private venteCriteria: venteCriteria = new venteCriteria();

  private listOfClients: any[] = [];

  private listeOfVente: any[] = [];
  private totalVente: number = 0;
  private firstVente: number = 0;
  private maxResultsVente: number = 10;

  private loadingVente: boolean = false;
  private venteSelected: any;

  public listeOfAvoir: any[] = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalService: NzModalService,
    private avoirService: avoirService,
    private clientService: clientService,
    private ventesService: VentesService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
  ) {
    this.createFormAvoir();
    this.getClients();
  }

  ngOnInit(): void {
    this.getReferenceAvoir(new Date().getFullYear());
  }

  public getVentesByCriteria() {
    this.loadingVente = true;
    this.venteCriteria.isAvoir = true;
    this.ventesService.getVentesByCriteria(this.venteCriteria).subscribe(
      (response: any) => {
        this.listeOfVente = response.data;
        this.totalVente = response.total;
        this.loadingVente = false;
        var vente_id = parseFloat(this.activatedRoute.snapshot.queryParamMap.get('vente') || '');
        if (vente_id) {
          var vente = this.listeOfVente.filter((item) => item.id == vente_id)[0];
          this.selectVente(vente);
        }
      },
      (error) => {
        this.loadingVente = false;
      },
    );
  }

  public getReferenceAvoir(year: any) {
    this.avoirService.getReferenceAvoir(year).subscribe(
      (response: any) => {
        this.avoirForm.patchValue({ reference: '' + response.count + '/' + response.year.toString().substring(2, 4) });
        this.avoirForm.patchValue({ count: response.count, year: response.year });
      },
      (error) => { },
    );
  }

  public goToList() {
    this.router.navigate(['avoirs/list']);
  }

  public createFormAvoir() {
    this.avoirForm = this.fb.group({
      id: [null],
      vente_id: [null, [Validators.required]],
      client_id: [null, [Validators.required]],
      client: [null, [Validators.required]],
      commercial_id: [null],
      date: [new Date(), [Validators.required]],
      reference: [null, [Validators.required]],
      count: [null],
      year: [null],
      dateVenteCriteria: [null],
      referenceVenteCriteria: [null],
      prix_avoir_ttc: [null, [Validators.required]],
      prix_avoir_ttc_with_remise: [null, [Validators.required]],
      lignes_avoir: this.fb.array([]),
    });
  }

  public getClients() {
    this.clientService.getClients().subscribe(
      (response: any) => {
        this.listOfClients = response;
        var client_id = parseFloat(this.activatedRoute.snapshot.queryParamMap.get('client') || '');

        if (client_id) {
          var client = this.listOfClients.filter((item) => item.id == client_id)[0];
          console.log('client', client);
          this.avoirForm.patchValue({ client: client });
          this.selectClient(client);
        }
      },
      (error) => { },
    );
  }

  saveAvoir() {
    this.clickSave = true;
    this.avoirForm.patchValue({
      commercial_id: this.venteSelected.commercial ? this.venteSelected.commercial.id : null,
      vente_id: this.venteSelected.id,
    });
    for (const i in this.avoirForm.controls) {
      this.avoirForm.controls[i].markAsDirty();
      this.avoirForm.controls[i].updateValueAndValidity();
    }

    if (this.avoirForm.valid && this.listeOfAvoir.length > 0) {
      const lignes_avoir: FormArray = new FormArray([...this.listeOfAvoir.map((item) => new FormControl(item))]);
      this.avoirForm.setControl('lignes_avoir', lignes_avoir);

      console.log('this.avoirForm', this.avoirForm.value);
      this.avoirService.store(this.avoirForm.value).subscribe(
        (reponse) => {
          this.notificationService.createNotification('success', 'Avoir a été ajouté avec succes', null);
          this.goToList();
          this.clickSave = false;
        },
        (error) => { },
      );
    }
  }

  public nzOnOpenChangeDate(open: any) {
    if (!open) {
      this.getReferenceAvoir(this.avoirForm.value.date.getFullYear());
    }
  }

  public selectClient(client: any) {
    if (client) {
      this.avoirForm.patchValue({ client_id: client.id, referenceVenteCriteria: null, dateVenteCriteria: null });
      this.venteCriteria.clientId = client.id;
      this.venteCriteria.referenceLike = null;
      this.venteCriteria.dateStart = null;
      this.venteCriteria.dateEnd = null;
      this.venteCriteria.date = null;
    } else {
      this.avoirForm.patchValue({ client_id: null, referenceVenteCriteria: null, dateVenteCriteria: null });
      this.venteCriteria.clientId = null;
      this.venteCriteria.referenceLike = null;
      this.venteCriteria.dateStart = null;
      this.venteCriteria.dateEnd = null;
      this.venteCriteria.date = null;
    }
    this.venteSelected = null;
    this.editId = null;
    this.getVentesByCriteria();
  }

  public sort(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
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

  public currentPageDataChange(event: any) {
    console.log('event', event);
  }

  public searchVenteByCriteria() {
    if (this.avoirForm.value.referenceVenteCriteria) {
      this.venteCriteria.referenceLike = this.avoirForm.value.referenceVenteCriteria;
    } else {
      this.venteCriteria.referenceLike = null;
    }
    this.getVentesByCriteria();
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      this.venteCriteria.dateStart = result[0];
      this.venteCriteria.dateEnd = result[1];
      this.venteCriteria.dateStart.setHours(0, 0, 0);
      this.venteCriteria.dateEnd.setHours(23, 59, 59);
    }

    console.log('dd');
    if (result && result.length == 0) {
      this.venteCriteria.dateStart = null;
      this.venteCriteria.dateEnd = null;
      this.venteCriteria.date = null;
    }
  }

  public selectVente(vente: any) {
    this.venteSelected = vente;
    this.venteSelected.lignes_vente.forEach((element: any) => {
      element.checked = false;
    });
    this.listeOfAvoir = [];
    this.editId = null;
  }

  public avoirArticle(ret: TransferChange) {
    if (ret.from == 'left' && ret.to == 'right') {
      ret.list.forEach((element) => {
        element.qte = element.quantite_restante;
        element.quantite = element.quantite_restante;

        this.listeOfAvoir.push(element);
      });
    }
    if (ret.from == 'right' && ret.to == 'left') {
      ret.list.forEach((ligne, index) => {
        const i = this.listeOfAvoir.indexOf(ligne);
        this.listeOfAvoir.splice(i, 1);
      });
    }
    this.calculeTotalAvoir();
  }

  public selectArticle(ret: {}) { }

  public calculeTotalAvoir() {
    console.log('ventesel', this.listeOfAvoir);
    if (this.listeOfAvoir) {
      this.avoirForm.patchValue({ prix_avoir_ttc_with_remise: 0, prix_avoir_ttc: 0 });
      this.listeOfAvoir.forEach((element) => {
        this.avoirForm.patchValue({
          prix_avoir_ttc: this.avoirForm.value.prix_avoir_ttc + element.qte * element.prix_vente,
          prix_avoir_ttc_with_remise: this.avoirForm.value.prix_avoir_ttc_with_remise + element.prix_vente_avec_remise * element.qte,
        });
      });
    }
  }

  public editId: any = null;
  startEdit(index: number): void {
    this.editId = index;
    this.listeOfAvoir[index].qte = this.listeOfAvoir[index].quantite_restante;
  }

  stopEdit(index: number): void {
    this.editId = null;
    this.listeOfAvoir[index].qte = this.listeOfAvoir[index].quantite;
    this.listeOfAvoir[index].total = this.listeOfAvoir[index].quantite * this.listeOfAvoir[index].prix_vente;
    this.listeOfAvoir[index].total_with_remise = this.listeOfAvoir[index].quantite * this.listeOfAvoir[index].prix_vente_avec_remise;
    console.log('this.listeOfAvoir[index].total_with_remise');
    this.calculeTotalAvoir();
  }

  public cancel() {

  }
}
