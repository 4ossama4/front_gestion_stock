import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';
import { DevisService } from '../../../services/devis.service';
import { StockService } from 'src/app/services/stock.service';
import { clientService } from 'src/app/services/client.service';

// _____________models____________
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { articleCriteria } from 'src/app/models/article.criteria';
import { Vente } from 'src/app/models/vente.model';

import { Router } from '@angular/router';

@Component({
  selector: 'app-devis-add',
  templateUrl: './devis-add.component.html',
  styleUrls: ['./devis-add.component.less'],
})
export class devisAddComponent implements OnInit {
  private venteForm: FormGroup = new FormGroup({});
  private clientForm: FormGroup = new FormGroup({});
  private articleCriteria: articleCriteria = new articleCriteria();
  private clickSave: boolean = false;
  private modalConfirm: boolean = false;
  private listOfPaymentsMode: any[] = [];
  private listOfClients: any[] = [];

  private modalClient: boolean = false;

  private listOfVille: any[] = [];
  // private listeOfArticles: any[] = [];
  private listeOfArticles: any[] = [];

  private modalCheque: boolean = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalService: NzModalService,
    private devisService: DevisService,
    private stockService: StockService,
    private clientService: clientService,
    private notificationService: NotificationService,
  ) {
    this.createFormVente();
    this.getClients();
    this.createFormClient();
    this.getVilles();
    this.getPaymentsMode();
  }

  ngOnInit(): void {
    this.getReferenceVente(new Date().getFullYear());
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
      reference: ['1/20', [Validators.required]],
      count: [null],
      year: [null],
      prix_devis_ttc: [0, [Validators.required]],
      prix_devis_ttc_with_remise: [0, [Validators.required]],
      prix_devis_ht: [null],
      net_devis: [null],
      remarques: [null],
      remiseAuto: [0],
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

  public getPaymentsMode() {
    this.devisService.getPaymentsMode().subscribe(
      (response: any) => {
        this.listOfPaymentsMode = response;
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

    console.log('this.venteForm', this.venteForm.value);

    if (this.venteForm.valid && !this.clientInvalid && this.venteForm.value.lignes_devis.length > 0) {
      this.devisService.store(this.venteForm.value).subscribe(
        (reponse) => {
          this.notificationService.createNotification('success', 'Vente a été ajouté avec succes', null);
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
      this.articleCriteria.referenceNotSpaceLike = event.replace(/\s/g, '');
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
    console.log('articles', this.venteForm.value.lignes_devis);
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
