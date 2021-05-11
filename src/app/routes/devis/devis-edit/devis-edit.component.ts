import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from '@angular/router';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';
import { DevisService } from '../../../services/devis.service';
import { StockService } from 'src/app/services/stock.service';
import { clientService } from 'src/app/services/client.service';
import { CommercialService } from 'src/app/services/commercial.service';

// _____________models____________
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { articleCriteria } from 'src/app/models/article.criteria';
import { Vente } from 'src/app/models/vente.model';

@Component({
  selector: 'app-devis-edit',
  templateUrl: './devis-edit.component.html',
  styleUrls: ['./devis-edit.component.less'],
})
export class devisEditComponent implements OnInit {
  private venteForm: FormGroup = new FormGroup({});
  private clientForm: FormGroup = new FormGroup({});
  private articleCriteria: articleCriteria = new articleCriteria();
  private clickSave: boolean = false;
  private modalConfirm: boolean = false;
  private listOfClients: any[] = [];
  private listOfCommerciaux: any[] = [];

  private modalClient: boolean = false;

  private modalCheque: boolean = false;

  private listOfVille: any[] = [];
  // private listeOfArticles: any[] = [];
  private listeOfArticles: any[] = [];
  private venteId: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalService: NzModalService,
    private devisService: DevisService,
    private stockService: StockService,
    private clientService: clientService,
    private route: ActivatedRoute,
    private commercialService: CommercialService,
    private notificationService: NotificationService,
  ) {
    this.createFormVente();
    this.getClients();
    this.createFormClient();
    this.getVilles();
    this.getCommerciaux();
    this.getAllArticle();
  }

  ngOnInit(): void {
    this.venteId = this.route.snapshot.paramMap.get('id');
    this.getVente();
    // this.getReferenceVente(new Date().getFullYear());
  }

  public getAllArticle() {
    this.stockService.getStocks().subscribe(
      (response: any) => {
        this.listeOfArticles = response;
      },
      (error) => { },
    );
  }

  public getVente() {
    const control = <FormArray>this.venteForm.get('lignes_devis');

    this.devisService.getDevisById(this.venteId).subscribe(
      (response: any) => {
        console.log('response', response.data);
        this.venteForm.patchValue(response.data);
        this.modalCheque = false;
        this.venteForm.patchValue({
          date: response.data.date_devis,
          reference: response.data.reference_devis,
          prix_devis_ttc: response.data.prix_devis_ttc,
          prix_devis_ttc_with_remise: response.data.prix_devis_ttc_with_remise,
          prix_devis_ht: response.data.prix_devis_ht,
          net_devis: response.data.net_devis,
        });
        const chequeInfo = <FormGroup>this.venteForm.get('chequeInfo');
        chequeInfo.patchValue({
          date: response.data.cheque ? response.data.cheque.date : null,
          reference: response.data.cheque ? response.data.cheque.reference : null,
        });

        response.data.lignes_devis.forEach((ligne_vente: any) => {
          control.push(
            this.patchValues(
              ligne_vente.devis_id,
              ligne_vente.article_id,
              ligne_vente.article,
              true,
              false,
              ligne_vente.article.designation,
              ligne_vente.quantite,
              ligne_vente.prix_devis,
              ligne_vente.remise,
              ligne_vente.prix_devis_avec_remise,
              ligne_vente.total,
              ligne_vente.total_with_remise,
            ),
          );
        });
        console.log(' this.venteForm', this.venteForm.value);
      },
      (error) => { },
    );
  }

  nzCompareSelectedByID(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id == o2.id : o1 == o2;
  }

  nzCompareSelectedByreference(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.reference == o2.reference : o1 == o2;
  }

  public getReferenceVente(year: any) {
    this.devisService.getReferenceDevis(year).subscribe(
      (response: any) => {
        console.log('response', response);
        this.venteForm.patchValue({ reference: '' + response.count + '/' + response.year.toString().substring(2, 4) });
        this.venteForm.patchValue({ count: response.count, year: response.year });
      },
      (error) => { },
    );
  }

  public goToList() {
    this.router.navigate(['devis/list']);
  }

  public createFormVente() {
    this.venteForm = this.fb.group({
      id: [null],
      client_id: [null, [Validators.required]],
      client: [null, [Validators.required]],
      date: [new Date(), [Validators.required]],
      date_expire: [null],
      reference: [null, [Validators.required]],
      count: [null],
      year: [null],
      prix_devis_ttc: [0, [Validators.required]],
      prix_devis_ttc_with_remise: [0, [Validators.required]],
      prix_devis_ht: [null],
      net_devis: [null],
      remarques: [null],
      remiseAuto: [0],
      chequeInfo: this.fb.group({
        date: [null],
        reference: [null],
      }),
      lignes_devis: this.fb.array([]),
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

  public addClient() {
    this.modalClient = true;
  }

  public hideModalClient() {
    this.modalClient = false;
    this.clientForm.reset({ credit: 0, remise: 0 });
  }

  public createFormClient() {
    this.clientForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      telephone: [null],
      fixe: [null, []],
      email: [null, [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      addresse: [null, []],
      ville_id: [null, []],
      max_credit: [null, []],
      credit: [0, []],
      remise: [0, []],
    });
  }

  public saveVille(ville: HTMLInputElement) {
    const value = ville.value;
    if (this.listOfVille.indexOf(value) === -1 && value) {
      this.clientService.storeVille({ label: value }).subscribe(
        (response: any) => {
          this.clientForm.patchValue({ ville_id: response.id });
          this.getVilles();
          this.notificationService.createNotification('success', 'Ville a été ajouté avec succes', null);
        },
        (error) => { },
      );
    }
  }

  public getVilles() {
    this.clientService.getVilles().subscribe(
      (response: any) => {
        this.listOfVille = response;
      },
      (error) => { },
    );
  }

  public saveClient() {
    for (const i in this.clientForm.controls) {
      this.clientForm.controls[i].markAsDirty();
      this.clientForm.controls[i].updateValueAndValidity();
    }

    if (this.clientForm.valid) {
      this.clientService.store(this.clientForm.value).subscribe(
        (reponse: any) => {
          this.hideModalClient();
          this.venteForm.patchValue({ client_id: reponse.id });
          this.notificationService.createNotification('success', 'Client a été ajouté avec succes', null);
          this.getClients();
        },
        (error) => { },
      );
    }
  }

  public getCommerciaux() {
    this.commercialService.getCommerciaux().subscribe(
      (response: any) => {
        this.listOfCommerciaux = response;
      },
      (error) => { },
    );
  }

  confirmVente() {
    this.clickSave = true;
    for (const i in this.venteForm.controls) {
      this.venteForm.controls[i].markAsDirty();
      this.venteForm.controls[i].updateValueAndValidity();
    }

    if (this.venteForm.valid && this.venteForm.value.lignes_devis.length > 0) {
      this.clientInvalid = false;
      this.modalConfirm = true;
    }
  }

  vente: any;
  saveVente() {
    this.clickSave = true;
    for (const i in this.venteForm.controls) {
      this.venteForm.controls[i].markAsDirty();
      this.venteForm.controls[i].updateValueAndValidity();
    }

    if (this.venteForm.valid && !this.clientInvalid && this.venteForm.value.lignes_devis.length > 0) {
      this.devisService.update(this.venteForm.value).subscribe(
        (reponse) => {
          this.notificationService.createNotification('success', 'Vente a été modifié avec succes', null);
          this.goToList();
          this.clickSave = false;
        },
        (error) => { },
      );
    }
  }

  addLigneVente(
    devis_id?: any,
    article_id?: any,
    article?: any,
    articleValid: any = true,
    articleExiste: any = false,
    designation?: any,
    quantite: any = 0,
    prix_devis?: any,
    remise: any = this.venteForm.value.remiseAuto,
    prix_devis_avec_remise?: any,
    total?: any,
    total_with_remise?: any,
  ) {
    const control = <FormArray>this.venteForm.get('lignes_devis');
    control.push(
      this.patchValues(
        devis_id,
        article_id,
        article,
        articleValid,
        articleExiste,
        designation,
        quantite,
        prix_devis,
        remise,
        prix_devis_avec_remise,
        total,
        total_with_remise,
      ),
    );
  }

  private patchValues(
    devis_id: any,
    article_id: any,
    article: any,
    articleValid: any,
    articleExiste: any,
    designation: any,
    quantite: any,
    prix_devis: any,
    remise: any,
    prix_devis_avec_remise: any,
    total: any,
    total_with_remise: any,
  ) {
    return this.fb.group({
      devis_id: [devis_id],
      article_id: [article_id, [Validators.required]],
      article: [article],
      articleValid: [articleValid, [Validators.required]],
      articleExiste: [articleExiste, [Validators.required]],
      designation: [designation],
      quantite: [quantite, Validators.min(1)],
      prix_devis: [prix_devis, [Validators.required]],
      remise: [remise],
      prix_devis_avec_remise: [prix_devis_avec_remise],
      total: [total],
      total_with_remise: [total_with_remise],
      marge: [null],
    });
  }

  public deleteLigneVente(index: any) {
    const control = <FormArray>this.venteForm.get('lignes_devis');
    control.removeAt(index);
    this.calculePriceVente();
  }

  onlyNumberKey(event: any) {
    return event.charCode == 8 || event.charCode == 0 ? null : event.charCode >= 48 && event.charCode <= 57;
  }

  public plusQte(index: any) {
    const valeurParam = (<FormArray>this.venteForm.get('lignes_devis')).at(index);
    valeurParam.patchValue({ quantite: valeurParam.value.quantite + 1 });
    this.checkQteArticle(valeurParam);
    this.changePriceTotal(valeurParam);
    this.calculePriceVente();
  }

  public minQte(index: any) {
    const valeurParam = (<FormArray>this.venteForm.get('lignes_devis')).at(index);
    if (valeurParam.value.quantite > 0) {
      valeurParam.patchValue({ quantite: valeurParam.value.quantite - 1 });
      this.checkQteArticle(valeurParam);
      this.changePriceTotal(valeurParam);
      this.calculePriceVente();
    }
  }

  public checkQteArticle(valeurParam: any) {
    if (valeurParam.value.article && valeurParam.value.quantite > valeurParam.value.article.quantite) {
      valeurParam.patchValue({ articleValid: null });
    } else {
      valeurParam.patchValue({ articleValid: true });
    }
  }

  onMouseupQte(index: any) {
    console.log('eeeee');
    const valeurParam = (<FormArray>this.venteForm.get('lignes_devis')).at(index);
    this.checkQteArticle(valeurParam);
    this.changePriceTotal(valeurParam);
    this.calculePriceVente();
  }
  isLoadingArticle: boolean = false;

  public getArticles(event: any, index: any) {
    this.listeOfArticles = [];

    if (event) {
      this.isLoadingArticle = true;

      this.articleCriteria.maxResults = 20;
      // this.articleCriteria.referenceLike = event;
      this.articleCriteria.referenceNotSpaceLike = event.replace(/\s/g, '');
      this.stockService.getStocksByCriteria2(this.articleCriteria).subscribe(
        (response: any) => {
          if (response.data) {
            response.data.forEach((article: any) => {
              this.listeOfArticles.push(
                {
                  id: article.id,
                  reference: article.reference,
                  designation: article.designation,
                  quantite: article.quantite,
                  marque: article.marque,
                  prix_vente: article.prix_vente

                }
              )
            });
          }
          this.isLoadingArticle = false;

        },
        (error) => {
          this.isLoadingArticle = false;
        },
      );
    } else {
      this.listeOfArticles = [];
    }
  }

  public onChangeArticle(event: any, index: any) {
    const valeurParam = (<FormArray>this.venteForm.get('lignes_devis')).at(index);
    const foundArticle = this.venteForm.value.lignes_devis.find((element: any) => element.article_id == event.id);
    if (foundArticle) {
      valeurParam.patchValue({ articleExiste: null });
    } else {
      valeurParam.patchValue({
        article_id: event.id,
        prix_devis: event.prix_vente,
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

  clientInvalid: boolean = false;

  public selectClient(client: any) {
    if (client) {
      this.venteForm.patchValue({ client_id: client.id });
      if (client.max_credit && client.credit >= client.max_credit) {
        this.clientInvalid = true;
      } else {
        this.clientInvalid = false;
      }
    }
  }

  public changePriceTotal(valeurParam: any) {
    if (valeurParam.value.article) {
      valeurParam.patchValue({
        total: valeurParam.value.article.prix_vente * valeurParam.value.quantite,
        prix_devis_avec_remise:
          valeurParam.value.article.prix_vente - valeurParam.value.article.prix_vente * (valeurParam.value.remise / 100),
        total_with_remise:
          (valeurParam.value.article.prix_vente - valeurParam.value.article.prix_vente * (valeurParam.value.remise / 100)) *
          valeurParam.value.quantite,
      });
    }
  }

  public onMouseupRemise(index: any) {
    const valeurParam = (<FormArray>this.venteForm.get('lignes_devis')).at(index);
    this.changePriceTotal(valeurParam);
    this.calculePriceVente();
  }

  public calculePriceVente() {
    const lignes_devis = this.venteForm.value.lignes_devis;
    this.venteForm.patchValue({ prix_devis_ttc: 0, prix_devis_ttc_with_remise: 0 });
    lignes_devis.forEach((element: any) => {
      this.venteForm.patchValue({
        prix_devis_ttc: this.venteForm.value.prix_devis_ttc + element.total,
        prix_devis_ttc_with_remise: this.venteForm.value.prix_devis_ttc_with_remise + element.total_with_remise,
      });
    });
    this.venteForm.patchValue({
      prix_devis_ht: parseFloat(this.venteForm.value.prix_devis_ttc_with_remise) / 1.2,
    });

    this.venteForm.patchValue({
      net_devis: parseFloat(this.venteForm.value.prix_devis_ttc_with_remise),
    });
  }

  public nzOnOpenChangeDate(open: any) {
    if (!open) {
      this.getReferenceVente(this.venteForm.value.date.getFullYear());
    }
  }

  public applyRemiseAuto() {
    const valeurParam = <FormArray>this.venteForm.get('lignes_devis');
    valeurParam.controls.forEach((element, index) => {
      element.patchValue({ remise: this.venteForm.value.remiseAuto });
      this.onMouseupRemise(index);
    });
  }

  public changeModePaiment(event: any) {
    console.log('event', event);
    if (event == 2 || event == 4) {
      this.modalCheque = true;
    }
  }

  public hideModalCheque() {
    this.modalCheque = false;
    // this.venteForm.patchValue({ payment_mode_id: null });
    // const chequeInfo = <FormGroup>this.venteForm.get('chequeInfo');
    // chequeInfo.patchValue({ date: null, reference: null });
  }

  public saveInfoCheque() {
    if (this.venteForm.value.chequeInfo.date && this.venteForm.value.chequeInfo.reference) {
      this.modalCheque = false;
    }
  }

  public changePriceVente(event: any, index: any) {
    const valeurParam = (<FormArray>this.venteForm.get('lignes_devis')).at(index);
    if (event) {
      valeurParam.patchValue({
        total: event * valeurParam.value.quantite,
        prix_devis_avec_remise: event - event * (valeurParam.value.remise / 100),
      });
      valeurParam.patchValue({
        total_with_remise: (event - event * (valeurParam.value.remise / 100)) * valeurParam.value.quantite,
      });
      const lignes_devise = this.venteForm.value.lignes_devis;

      this.venteForm.patchValue({ prix_devis_ttc: 0 });
      this.venteForm.patchValue({ prix_devis_ttc_with_remise: 0 });
      lignes_devise.forEach((element: any) => {
        this.venteForm.patchValue({
          prix_devis_ttc: parseFloat(this.venteForm.value.prix_devis_ttc) + element.prix_devis * element.quantite,
        });
        this.venteForm.patchValue({
          prix_devis_ttc_with_remise:
            parseFloat(this.venteForm.value.prix_devis_ttc_with_remise) + element.prix_devis_avec_remise * element.quantite,
        });
      });
      this.venteForm.patchValue({
        prix_devis_ht: parseFloat(this.venteForm.value.prix_devis_ttc_with_remise) / 1.2,
      });
      this.venteForm.patchValue({
        net_devis: parseFloat(this.venteForm.value.prix_devis_ttc_with_remise),
      });
    } else {
      // valeurParam.patchValue({ prix_devis_avec_remise: 0 });
    }
  }
}
