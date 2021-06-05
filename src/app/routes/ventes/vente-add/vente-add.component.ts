import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';
import { VentesService } from '../../../services/vente.service';
import { StockService } from 'src/app/services/stock.service';
import { clientService } from 'src/app/services/client.service';
import { CommercialService } from 'src/app/services/commercial.service';

// _____________models____________
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { articleCriteria } from 'src/app/models/article.criteria';
import { Vente } from 'src/app/models/vente.model';

import { Router } from '@angular/router';

@Component({
  selector: 'app-vente-add',
  templateUrl: './vente-add.component.html',
  styleUrls: ['./vente-add.component.less'],
})
export class venteAddComponent implements OnInit {
  private venteForm: FormGroup = new FormGroup({});
  private clientForm: FormGroup = new FormGroup({});
  private commercialeForm: FormGroup = new FormGroup({});
  private articleCriteria: articleCriteria = new articleCriteria();
  private clickSave: boolean = false;
  private modalConfirm: boolean = false;
  private listOfPaymentsMode: any[] = [];
  private listOfClients: any[] = [];
  private listOfCommerciaux: any[] = [];

  private modalClient: boolean = false;
  private modalCommerciale: boolean = false;

  private listOfVille: any[] = [];
  // private listeOfArticles: any[] = [];
  private listeOfArticles: any[] = [];

  private listOfModeExp: any[] = [];

  private modalCheque: boolean = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalService: NzModalService,
    private ventesService: VentesService,
    private stockService: StockService,
    private clientService: clientService,
    private commercialService: CommercialService,
    private notificationService: NotificationService,
  ) {
    this.createFormVente();
    this.getClients();
    this.createFormClient();
    this.createFormCommerciale();
    this.getVilles();
    this.getPaymentsMode();
    this.getModeExp();
    this.getCommerciaux();
  }

  ngOnInit(): void {
    this.getReferenceVente(new Date().getFullYear());
  }

  public getReferenceVente(year: any) {
    this.ventesService.getReferenceVente(year).subscribe(
      (response: any) => {
        console.log('response', response);
        this.venteForm.patchValue({ reference: '' + response.count + '/' + response.year.toString().substring(2, 4) });
        this.venteForm.patchValue({ count: response.count, year: response.year });
      },
      (error) => { },
    );
  }

  public goToList() {
    this.router.navigate(['ventes/list']);
  }

  public createFormVente() {
    this.venteForm = this.fb.group({
      id: [null],
      client_id: [null, [Validators.required]],
      client: [null, [Validators.required]],
      commercial_id: [null],
      commerciale: [null],
      date: [new Date(), [Validators.required]],
      payment_mode_id: [null, [Validators.required]],
      reference: ['1/20', [Validators.required]],
      is_bl: [false],
      is_facture: [false],
      count: [null],
      year: [null],
      is_paid: [false],
      prix_vente_ttc: [0, [Validators.required]],
      prix_vente_ttc_with_remise: [0, [Validators.required]],
      prix_vente_ht: [null],
      commercial_total: [null],
      net_vente: [null],
      avance: [0],
      transport: [null],
      remarques: [null],
      remiseAuto: [0],
      mode_exp_id: [null],
      marge_vente: [null],
      chequeInfo: this.fb.group({
        date: [null],
        reference: [null],
      }),
      lignes_vente: this.fb.array([]),
    });
  }

  public changePriceVente(event: any, index: any) {
    const valeurParam = (<FormArray>this.venteForm.get('lignes_vente')).at(index);
    if (event) {
      valeurParam.patchValue({
        total: event * valeurParam.value.quantite,
        prix_vente_avec_remise: event - event * (valeurParam.value.remise / 100),
      });
      valeurParam.patchValue({
        total_with_remise: (event - event * (valeurParam.value.remise / 100)) * valeurParam.value.quantite,
      });
      const lignes_vente = this.venteForm.value.lignes_vente;

      this.venteForm.patchValue({ prix_vente_ttc: 0 });
      this.venteForm.patchValue({ prix_vente_ttc_with_remise: 0 });
      lignes_vente.forEach((element: any) => {
        this.venteForm.patchValue({
          prix_vente_ttc: parseFloat(this.venteForm.value.prix_vente_ttc) + element.prix_vente * element.quantite,
        });
        this.venteForm.patchValue({
          prix_vente_ttc_with_remise:
            parseFloat(this.venteForm.value.prix_vente_ttc_with_remise) + element.prix_vente_avec_remise * element.quantite,
        });
      });
      this.venteForm.patchValue({
        prix_vente_ht: parseFloat(this.venteForm.value.prix_vente_ttc_with_remise) / 1.2,
      });
      if (this.venteForm.value.commerciale) {
        this.venteForm.patchValue({
          commercial_total:
            parseFloat(this.venteForm.value.prix_vente_ht) * (parseFloat(this.venteForm.value.commerciale.commission) / 100),
        });
      }
      this.venteForm.patchValue({
        net_vente:
          parseFloat(this.venteForm.value.prix_vente_ttc_with_remise) - this.venteForm.value.commerciale
            ? parseFloat(this.venteForm.value.commercial_total)
            : 0,
      });
    }
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

  public getPaymentsMode() {
    this.ventesService.getPaymentsMode().subscribe(
      (response: any) => {
        this.listOfPaymentsMode = response;
      },
      (error) => { },
    );
  }

  public getModeExp() {
    this.ventesService.getModeExp().subscribe(
      (response: any) => {
        this.listOfModeExp = response;
      },
      (error) => { },
    );
  }

  public saveMode(mode: HTMLInputElement) {
    const value = mode.value;
    if (this.listOfPaymentsMode.indexOf(value) === -1 && value) {
      this.ventesService.storeMode({ label: value }).subscribe(
        (response: any) => {
          this.getPaymentsMode();
          this.venteForm.patchValue({ payment_mode_id: response.id });
          mode.value = '';
          this.notificationService.createNotification('success', 'Mode de payment a été ajouté avec succes', null);
        },
        (error) => {
          // this.notificationService.createNotification('error', 'error de supprission', null)
        },
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

  public addCommerciale() {
    this.commercialeForm.reset({ commission: 0 });
    this.modalCommerciale = true;
  }

  public hideModalCommerciale() {
    this.modalCommerciale = false;
  }

  public createFormCommerciale() {
    this.commercialeForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      telephone: [null],
      fixe: [null, []],
      email: [null, [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      addresse: [null, []],
      ville_id: [null, []],
      commission: [0, []],
    });
  }

  public saveCommerciale() {
    for (const i in this.commercialeForm.controls) {
      this.commercialeForm.controls[i].markAsDirty();
      this.commercialeForm.controls[i].updateValueAndValidity();
    }
    if (this.commercialeForm.valid) {
      this.commercialService.store(this.commercialeForm.value).subscribe(
        (reponse: any) => {
          this.hideModalCommerciale();
          this.venteForm.patchValue({ commerciale: reponse });
          this.notificationService.createNotification('success', 'Commerciale a été ajouté avec succes', null);
          this.getCommerciaux();
        },
        (error) => { },
      );
    }
  }

  confirmVente() {
    this.clickSave = true;
    for (const i in this.venteForm.controls) {
      this.venteForm.controls[i].markAsDirty();
      this.venteForm.controls[i].updateValueAndValidity();
    }

    if (this.venteForm.valid && this.venteForm.value.lignes_vente.length > 0) {
      if (!this.venteForm.value.is_paid) {
        if (
          this.venteForm.value.client.max_credit &&
          this.venteForm.value.client.credit + this.venteForm.value.prix_vente_ttc_with_remise >= this.venteForm.value.client.max_credit
        ) {
          this.clientInvalid = true;
        } else {
          this.clientInvalid = false;
          this.modalConfirm = true;
        }
      } else {
        this.clientInvalid = false;
        this.modalConfirm = true;
      }
    }
  }
  loadingSave: boolean = false;
  vente: any;
  saveVente() {
    this.clickSave = true;
    this.loadingSave = true;
    for (const i in this.venteForm.controls) {
      this.venteForm.controls[i].markAsDirty();
      this.venteForm.controls[i].updateValueAndValidity();
    }
    this.venteForm.patchValue({ marge_vente: 0 });
    this.venteForm.value.lignes_vente.forEach((ligne: any) => {
      ligne.marge = ligne.total_with_remise - ligne.article.prix_achat * ligne.quantite;
      this.venteForm.patchValue({ marge_vente: this.venteForm.value.marge_vente + ligne.marge });
    });

    console.log('this.venteForm', this.venteForm.value);

    if (this.venteForm.valid && !this.clientInvalid && this.venteForm.value.lignes_vente.length > 0) {

      this.ventesService.getReferenceVente(new Date().getFullYear()).subscribe(
        (response: any) => {
          console.log('response', response);
          this.venteForm.patchValue({ reference: '' + response.count + '/' + response.year.toString().substring(2, 4) });
          this.venteForm.patchValue({ count: response.count, year: response.year });
          this.ventesService.store(this.venteForm.value).subscribe(
            (reponse) => {
              this.notificationService.createNotification('success', 'Vente a été ajouté avec succes', null);
              this.goToList();
              this.clickSave = false;
              this.loadingSave = false;
            },
            (error) => {
              this.loadingSave = false;
            },
          );
        },
        (error) => { },
      );

    }
  }

  addLigneVente(
    vente_id?: any,
    article_id?: any,
    article?: any,
    articleValid: any = true,
    articleExiste: any = false,
    designation?: any,
    quantite: any = 0,
    prix_vente?: any,
    remise: any = this.venteForm.value.remiseAuto,
    prix_vente_avec_remise?: any,
    total?: any,
    total_with_remise?: any,
  ) {
    const control = <FormArray>this.venteForm.get('lignes_vente');
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

  public deleteLigneVente(index: any) {
    const control = <FormArray>this.venteForm.get('lignes_vente');
    control.removeAt(index);
    this.calculePriceVente();
  }

  onlyNumberKey(event: any) {
    return event.charCode == 8 || event.charCode == 0 ? null : event.charCode >= 48 && event.charCode <= 57;
  }

  public plusQte(index: any) {
    const valeurParam = (<FormArray>this.venteForm.get('lignes_vente')).at(index);
    valeurParam.patchValue({ quantite: valeurParam.value.quantite + 1 });
    this.checkQteArticle(valeurParam);
    this.changePriceTotal(valeurParam);
    this.calculePriceVente();
  }

  public minQte(index: any) {
    const valeurParam = (<FormArray>this.venteForm.get('lignes_vente')).at(index);
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
    const valeurParam = (<FormArray>this.venteForm.get('lignes_vente')).at(index);
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
      // this.articleCriteria.referenceNotSpaceLike = event.replace(/\s/g, '');
      this.articleCriteria.referenceNotSpaceLike = event.replace(/[&\/\\#\s,;\-\_+()$~%.'":*?<>{}]/g, '');
      // this.articleCriteria.refOrgAndreferenceLike.replace(/\s/g, '');
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
                  prix_vente: article.prix_vente,
                  prix_achat: article.prix_achat
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
    const valeurParam = (<FormArray>this.venteForm.get('lignes_vente')).at(index);
    console.log('articles', this.venteForm.value.lignes_vente);
    console.log('event', event)
    const foundArticle = this.venteForm.value.lignes_vente.find((element: any) => element.article_id == event.id);
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
        prix_achat: event.prix_achat
      });
    }
    console.log('foundArticle', foundArticle);
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
        total: valeurParam.value.prix_vente * valeurParam.value.quantite,
        prix_vente_avec_remise: valeurParam.value.prix_vente - valeurParam.value.prix_vente * (valeurParam.value.remise / 100),
        total_with_remise:
          (valeurParam.value.prix_vente - valeurParam.value.prix_vente * (valeurParam.value.remise / 100)) * valeurParam.value.quantite,
      });
    }
  }

  public onMouseupRemise(index: any) {
    const valeurParam = (<FormArray>this.venteForm.get('lignes_vente')).at(index);
    this.changePriceTotal(valeurParam);
    this.calculePriceVente();
  }

  public calculePriceVente() {
    const lignes_vente = this.venteForm.value.lignes_vente;
    this.venteForm.patchValue({ prix_vente_ttc: 0, prix_vente_ttc_with_remise: 0 });
    lignes_vente.forEach((element: any) => {
      this.venteForm.patchValue({
        prix_vente_ttc: this.venteForm.value.prix_vente_ttc + element.total,
        prix_vente_ttc_with_remise: this.venteForm.value.prix_vente_ttc_with_remise + element.total_with_remise,
      });
    });
    this.venteForm.patchValue({
      prix_vente_ht: parseFloat(this.venteForm.value.prix_vente_ttc_with_remise) / 1.2,
    });
    if (this.venteForm.value.commerciale) {
      this.venteForm.patchValue({
        commercial_total: parseFloat(this.venteForm.value.prix_vente_ht) * (parseFloat(this.venteForm.value.commerciale.commission) / 100),
      });
    }
    this.venteForm.patchValue({
      net_vente:
        parseFloat(this.venteForm.value.prix_vente_ttc_with_remise) - this.venteForm.value.commerciale
          ? parseFloat(this.venteForm.value.commercial_total)
          : 0,
    });
  }

  public selectCommerciale(commerciale: any) {
    if (commerciale) {
      this.venteForm.patchValue({ commercial_id: commerciale.id });
      this.calculePriceVente();
    }
  }

  public nzOnOpenChangeDate(open: any) {
    if (!open) {
      this.getReferenceVente(this.venteForm.value.date.getFullYear());
    }
  }

  public applyRemiseAuto() {
    const valeurParam = <FormArray>this.venteForm.get('lignes_vente');
    valeurParam.controls.forEach((element, index) => {
      element.patchValue({ remise: this.venteForm.value.remiseAuto });
      this.onMouseupRemise(index);
    });
  }

  public saveModeExp(mode: HTMLInputElement) {
    const value = mode.value;
    if (this.listOfModeExp.indexOf(value) === -1 && value) {
      this.ventesService.storeModeExp({ label: value }).subscribe(
        (response: any) => {
          this.getModeExp();
          this.venteForm.patchValue({ mode_exp_id: response.id });
          mode.value = '';
          this.notificationService.createNotification('success', 'Mode  a été ajouté avec succes', null);
        },
        (error) => {
          // this.notificationService.createNotification('error', 'error de supprission', null)
        },
      );
    }
  }

  public changeModePaiment(event: any) {
    console.log('event', event);

    if (event == 2 || event == 4) {
      this.modalCheque = true;
    } else {
      const chequeInfo = <FormGroup>this.venteForm.get('chequeInfo');
      chequeInfo.patchValue({ date: null, reference: null });
    }
  }

  public hideModalCheque() {
    this.modalCheque = false;
    this.venteForm.patchValue({ payment_mode_id: null });
    const chequeInfo = <FormGroup>this.venteForm.get('chequeInfo');
    chequeInfo.patchValue({ date: null, reference: null });
  }

  public saveInfoCheque() {
    if (this.venteForm.value.chequeInfo.date && this.venteForm.value.chequeInfo.reference) {
      this.modalCheque = false;
    }
  }
}
