import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';
import { AchatsService } from '../../../services/achat.service';

// _____________models____________
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FournisseurService } from 'src/app/services/fournisseur.service';
import { StockService } from 'src/app/services/stock.service';
import { articleCriteria } from 'src/app/models/article.criteria';
import { Router } from '@angular/router';

@Component({
  selector: 'app-achats-add',
  templateUrl: './achats-add.component.html',
  styleUrls: ['./achats-add.component.less'],
})
export class achatsAddComponent implements OnInit {
  private achatForm: FormGroup = new FormGroup({});
  private fournisseurForm: FormGroup = new FormGroup({});
  private articleCriteria: articleCriteria = new articleCriteria();
  private modalConfirm: boolean = false;
  private listOfFournisseur: any[] = [
    // {
    //   id: 1,
    //   name: 'abdellah',
    //   telephone: '0675832012',
    //   fixe: '057423932',
    //   email: 'abdellah@gmail.com',
    //   addresse: 'driouch',
    // },
    // {
    //   id: 2,
    //   name: 'ossama',
    //   telephone: '0675832012',
    //   fixe: '057423932',
    //   email: 'abdellah@gmail.com',
    //   addresse: 'driouch',
    // },
  ];
  private listeOfArticles: any[] = [];
  // private listeOfArticles: any[] = [
  //   {
  //     id: 1,
  //     famille: { id: 1, label: 'famille1' },
  //     sous_famille: { id: 1, label: 'soufamille1' },
  //     code_barre: '1498216428712',
  //     designation: 'Filtre huile clio 4',
  //     marque: { id: 1, label: 'marque1' },
  //     reference: 'Ref1',
  //     references: [
  //       {
  //         id: 1,
  //         label: '5000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 1,
  //         },
  //       },
  //       {
  //         id: 2,
  //         label: '60000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 2,
  //         },
  //       },
  //       {
  //         id: 3,
  //         label: '7000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 3,
  //         },
  //       },
  //     ],
  //     quantite: 10,
  //     prix_achat: 50,
  //     prix_vente: 11,
  //     remarques: 'Pas de remarques',
  //   },
  //   {
  //     id: 2,
  //     famille: { id: 1, label: 'famille1' },
  //     sous_famille: { id: 1, label: 'soufamille1' },
  //     code_barre: '1498216428712',
  //     designation: 'Filtre huile clio 4',
  //     marque: { id: 1, label: 'marque1' },
  //     reference: 'Ref2',
  //     references: [
  //       {
  //         id: 1,
  //         label: '5000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 1,
  //         },
  //       },
  //       {
  //         id: 2,
  //         label: '60000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 2,
  //         },
  //       },
  //       {
  //         id: 3,
  //         label: '7000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 3,
  //         },
  //       },
  //     ],
  //     quantite: 10,
  //     prix_achat: 50,
  //     prix_vente: 11,
  //     remarques: 'Pas de remarques',
  //   },
  //   {
  //     id: 3,
  //     famille: { id: 1, label: 'famille1' },
  //     sous_famille: { id: 1, label: 'soufamille1' },
  //     code_barre: '1498216428712',
  //     designation: 'Filtre huile clio 4',
  //     marque: { id: 1, label: 'marque1' },
  //     reference: 'Ref3',
  //     references: [
  //       {
  //         id: 1,
  //         label: '5000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 1,
  //         },
  //       },
  //       {
  //         id: 2,
  //         label: '60000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 2,
  //         },
  //       },
  //       {
  //         id: 3,
  //         label: '7000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 3,
  //         },
  //       },
  //     ],
  //     quantite: 10,
  //     prix_achat: 50,
  //     prix_vente: 11,
  //     remarques: 'Pas de remarques',
  //   },
  //   {
  //     id: 4,
  //     famille: { id: 1, label: 'famille1' },
  //     sous_famille: { id: 1, label: 'soufamille1' },
  //     code_barre: '1498216428712',
  //     designation: 'Filtre huile clio 4',
  //     marque: { id: 1, label: 'marque1' },
  //     reference: 'Ref4',
  //     references: [
  //       {
  //         id: 1,
  //         label: '5000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 1,
  //         },
  //       },
  //       {
  //         id: 2,
  //         label: '60000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 2,
  //         },
  //       },
  //       {
  //         id: 3,
  //         label: '7000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 3,
  //         },
  //       },
  //     ],
  //     quantite: 10,
  //     prix_achat: 50,
  //     prix_vente: 11,
  //     remarques: 'Pas de remarques',
  //   },
  //   {
  //     id: 5,
  //     famille: { id: 1, label: 'famille1' },
  //     sous_famille: { id: 1, label: 'soufamille1' },
  //     code_barre: '1498216428712',
  //     designation: 'Filtre huile clio 4',
  //     marque: { id: 1, label: 'marque1' },
  //     reference: 'Ref5',
  //     references: [
  //       {
  //         id: 1,
  //         label: '5000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 1,
  //         },
  //       },
  //       {
  //         id: 2,
  //         label: '60000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 2,
  //         },
  //       },
  //       {
  //         id: 3,
  //         label: '7000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 3,
  //         },
  //       },
  //     ],
  //     quantite: 10,
  //     prix_achat: 50,
  //     prix_vente: 11,
  //     remarques: 'Pas de remarques',
  //   },
  //   {
  //     id: 6,
  //     famille: { id: 1, label: 'famille1' },
  //     sous_famille: { id: 1, label: 'soufamille1' },
  //     code_barre: '1498216428712',
  //     designation: 'Filtre huile clio 4',
  //     marque: { id: 1, label: 'marque1' },
  //     reference: 'Ref6',
  //     references: [
  //       {
  //         id: 1,
  //         label: '5000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 1,
  //         },
  //       },
  //       {
  //         id: 2,
  //         label: '60000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 2,
  //         },
  //       },
  //       {
  //         id: 3,
  //         label: '7000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 3,
  //         },
  //       },
  //     ],
  //     quantite: 10,
  //     prix_achat: 50,
  //     prix_vente: 11,
  //     remarques: 'Pas de remarques',
  //   },
  //   {
  //     id: 7,
  //     famille: { id: 1, label: 'famille1' },
  //     sous_famille: { id: 1, label: 'soufamille1' },
  //     code_barre: '1498216428712',
  //     designation: 'Filtre huile clio 4',
  //     marque: { id: 1, label: 'marque1' },
  //     reference: 'Ref7',
  //     references: [
  //       {
  //         id: 1,
  //         label: '5000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 1,
  //         },
  //       },
  //       {
  //         id: 2,
  //         label: '60000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 2,
  //         },
  //       },
  //       {
  //         id: 3,
  //         label: '7000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 3,
  //         },
  //       },
  //     ],
  //     quantite: 10,
  //     prix_achat: 50,
  //     prix_vente: 11,
  //     remarques: 'Pas de remarques',
  //   },
  //   {
  //     id: 8,
  //     famille: { id: 1, label: 'famille1' },
  //     sous_famille: { id: 1, label: 'soufamille1' },
  //     code_barre: '1498216428712',
  //     designation: 'Filtre huile clio 4',
  //     marque: { id: 1, label: 'marque1' },
  //     reference: 'Ref8',
  //     references: [
  //       {
  //         id: 1,
  //         label: '5000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 1,
  //         },
  //       },
  //       {
  //         id: 2,
  //         label: '60000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 2,
  //         },
  //       },
  //       {
  //         id: 3,
  //         label: '7000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 3,
  //         },
  //       },
  //     ],
  //     quantite: 10,
  //     prix_achat: 50,
  //     prix_vente: 11,
  //     remarques: 'Pas de remarques',
  //   },
  //   {
  //     id: 9,
  //     famille: { id: 1, label: 'famille1' },
  //     sous_famille: { id: 1, label: 'soufamille1' },
  //     code_barre: '1498216428712',
  //     designation: 'Filtre huile clio 4',
  //     marque: { id: 1, label: 'marque1' },
  //     reference: 'Ref9',
  //     references: [
  //       {
  //         id: 1,
  //         label: '5000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 1,
  //         },
  //       },
  //       {
  //         id: 2,
  //         label: '60000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 2,
  //         },
  //       },
  //       {
  //         id: 3,
  //         label: '7000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 3,
  //         },
  //       },
  //     ],
  //     quantite: 10,
  //     prix_achat: 50,
  //     prix_vente: 11,
  //     remarques: 'Pas de remarques',
  //   },
  //   {
  //     id: 10,
  //     famille: { id: 1, label: 'famille1' },
  //     sous_famille: { id: 1, label: 'soufamille1' },
  //     code_barre: '1498216428712',
  //     designation: 'Filtre huile clio 4',
  //     marque: { id: 1, label: 'marque1' },
  //     reference: 'Ref10',
  //     references: [
  //       {
  //         id: 1,
  //         label: '5000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 1,
  //         },
  //       },
  //       {
  //         id: 2,
  //         label: '60000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 2,
  //         },
  //       },
  //       {
  //         id: 3,
  //         label: '7000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 3,
  //         },
  //       },
  //     ],
  //     quantite: 10,
  //     prix_achat: 50,
  //     prix_vente: 11,
  //     remarques: 'Pas de remarques',
  //   },
  //   {
  //     id: 11,
  //     famille: { id: 1, label: 'famille1' },
  //     sous_famille: { id: 1, label: 'soufamille1' },
  //     code_barre: '1498216428712',
  //     designation: 'Filtre huile clio 4',
  //     marque: { id: 1, label: 'marque1' },
  //     reference: 'Ref11',
  //     references: [
  //       {
  //         id: 1,
  //         label: '5000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 1,
  //         },
  //       },
  //       {
  //         id: 2,
  //         label: '60000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 2,
  //         },
  //       },
  //       {
  //         id: 3,
  //         label: '7000',
  //         created_at: null,
  //         updated_at: null,
  //         pivot: {
  //           article_id: 1,
  //           orireference_id: 3,
  //         },
  //       },
  //     ],
  //     quantite: 10,
  //     prix_achat: 50,
  //     prix_vente: 11,
  //     remarques: 'Pas de remarques',
  //   },
  // ];

  private fraisMoyenne: number = 0;
  private modalFournisseur: boolean = false;
  private listOfPaymentsMode: any[] = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalService: NzModalService,
    private achatsService: AchatsService,
    private stockService: StockService,
    private fournisseurService: FournisseurService,
    private notificationService: NotificationService,
  ) {
    this.createFormAchat();
    this.createFormFournisseur();
    // this.addLigneAchat();
  }

  ngOnInit(): void {
    this.getFournisseur();
    this.getPaymentsMode();
  }

  public createFormAchat() {
    this.achatForm = this.fb.group({
      id: [null],
      fournisseur_id: [null, [Validators.required]],
      payment_mode_id: [null, [Validators.required]],
      date_achat: [null, [Validators.required]],
      total_ttc: [0, [Validators.required]],
      reference_achat: [null, [Validators.required]],
      type_devise: [false, [Validators.required]],
      taux_change: [1, [Validators.required]],
      total_frais: [0, [Validators.required]],
      total_devise: [0],
      total_remise: [0],
      total_ttc_avec_remise: [0, [Validators.required]],
      price_total: [0],
      remiseAuto: [0],
      miseEnStock: [false, [Validators.required]],
      lignes_achat: this.fb.array([]),
      list_frais: this.fb.array([]),
      chequeInfo: this.fb.group({
        date: [null],
        reference: [null],
      }),
    });
  }

  private patchValues(
    achat_id: any = null,
    article_id: any = null,
    quantite: any = null,
    price_achat: any = null,
    price_devise: any = null,
    pu_frais: any = null,
    remise: any = 0,
    price_achat_avec_remise: any = null,
    articleExiste: any = false,
  ) {
    return this.fb.group({
      achat_id: [achat_id],
      article_id: [article_id, [Validators.required]],
      quantite: [quantite, [Validators.required]],
      price_achat: [price_achat, [Validators.required]],
      price_devise: [price_devise],
      pu_frais: [pu_frais],
      remise: [remise],
      price_achat_avec_remise: [price_achat_avec_remise],
      articleExiste: [articleExiste, [Validators.required]],
    });
  }

  addLigneAchat() {
    const control = <FormArray>this.achatForm.get('lignes_achat');
    control.push(this.patchValues(null, null, 0, null, null, 0, this.achatForm.value.remiseAuto, null, false));
  }

  addLigneFrais() {
    const control = <FormArray>this.achatForm.get('list_frais');
    control.push(this.patchValuesFrais(null, null, null, 0));
  }

  private patchValuesFrais(id_frais: any = null, achat_id: any = null, label: any = null, valeur: any = null) {
    return this.fb.group({
      id: [id_frais],
      achat_id: [achat_id],
      label: [label, [Validators.required]],
      valeur: [valeur, [Validators.required]],
    });
  }

  saveAchat() {
    for (const i in this.achatForm.controls) {
      this.achatForm.controls[i].markAsDirty();
      this.achatForm.controls[i].updateValueAndValidity();
    }

    if (this.achatForm.valid && this.achatForm.value.lignes_achat.length > 0) {
      if (this.achatForm.value.type_devise) {
        var price_total = parseFloat(this.achatForm.value.total_frais) + parseFloat(this.achatForm.value.total_ttc);
      } else {
        var price_total = parseFloat(this.achatForm.value.total_frais) + parseFloat(this.achatForm.value.total_ttc_avec_remise);
      }

      this.achatForm.patchValue({ price_total: price_total });
      var array: any[] = [];
      this.achatForm.value.lignes_achat.forEach((ligne: any, index: number) => {
        var foundIndex = array.findIndex((x) => x.article_id === ligne.article_id);
        if (foundIndex > -1) {
          array[foundIndex].remise =
            (array[foundIndex].remise * array[foundIndex].quantite + ligne.remise * ligne.quantite) /
            (array[foundIndex].quantite + ligne.quantite);
          array[foundIndex].price_devise =
            (array[foundIndex].price_devise * array[foundIndex].quantite + ligne.price_devise * ligne.quantite) /
            (array[foundIndex].quantite + ligne.quantite);
          array[foundIndex].price_achat =
            (array[foundIndex].price_achat * array[foundIndex].quantite + ligne.price_achat * ligne.quantite) /
            (array[foundIndex].quantite + ligne.quantite);
          array[foundIndex].price_achat_avec_remise =
            (array[foundIndex].price_achat_avec_remise * array[foundIndex].quantite + ligne.price_achat_avec_remise * ligne.quantite) /
            (array[foundIndex].quantite + ligne.quantite);
          array[foundIndex].pu_frais =
            (array[foundIndex].pu_frais * array[foundIndex].quantite + ligne.pu_frais * ligne.quantite) /
            (array[foundIndex].quantite + ligne.quantite);
          array[foundIndex].quantite = array[foundIndex].quantite + ligne.quantite;
          array[foundIndex].article_id = ligne.article_id;
        } else {
          array.push(ligne);
        }
      });
      this.achatForm.value.lignes_achat = [];
      Object.assign(this.achatForm.value.lignes_achat, array);

      this.achatsService.store(this.achatForm.value).subscribe(
        (reponse) => {
          this.notificationService.createNotification('success', 'Achat a été ajouté avec succes', null);
          this.goToList();
        },
        (error) => {},
      );
    }
  }

  onlyNumberKey(event: any) {
    return event.charCode == 8 || event.charCode == 0 ? null : event.charCode >= 48 && event.charCode <= 57;
  }

  public deleteLigneAchat(index: any) {
    var montant_achat = this.achatForm.value.lignes_achat[index].price_achat;
    var montant_achat_avec_remise = this.achatForm.value.lignes_achat[index].price_achat_avec_remise;
    var qte = this.achatForm.value.lignes_achat[index].quantite;
    const control = <FormArray>this.achatForm.get('lignes_achat');
    control.removeAt(index);
    this.achatForm.patchValue({ total_ttc: parseFloat(this.achatForm.value.total_ttc) - montant_achat * qte });
    this.achatForm.patchValue({
      total_ttc_avec_remise: parseFloat(this.achatForm.value.total_ttc_avec_remise) - montant_achat_avec_remise * qte,
    });
    this.refreshPU_frais();
    this.refreshPriceTotalDevise();
  }

  public getFournisseur() {
    this.fournisseurService.getFournisseurs().subscribe(
      (response: any) => {
        this.listOfFournisseur = response;
      },
      (error) => {},
    );
  }

  public getArticles(event: any, index: any) {
    if (event) {
      this.articleCriteria.maxResults = 1000;
      // this.articleCriteria.referenceLike = event;
      this.articleCriteria.referenceNotSpaceLike = event.replace(/[&\/\\#\s,;\-\_+()$~%.'":*?<>{}]/g, '');
      this.stockService.getStocksByCriteria(this.articleCriteria).subscribe(
        (response: any) => {
          this.listeOfArticles = response.data;
        },
        (error) => {},
      );
    } else {
      // this.listeOfArticles = [];
    }
  }

  public goToList() {
    this.router.navigate(['achats/list']);
  }

  public plusQte(index: any) {
    const valeurParam = (<FormArray>this.achatForm.get('lignes_achat')).at(index);
    valeurParam.patchValue({ quantite: valeurParam.value.quantite + 1 });
    this.refreshPriceTTC();
  }

  public minQte(index: any) {
    const valeurParam = (<FormArray>this.achatForm.get('lignes_achat')).at(index);
    if (valeurParam.value.quantite > 0) {
      valeurParam.patchValue({ quantite: valeurParam.value.quantite - 1 });
    }
    this.refreshPriceTTC();
  }

  public addFournisseur() {
    this.modalFournisseur = true;
  }

  public hideModalFournisseur() {
    this.modalFournisseur = false;
    this.fournisseurForm.reset();
  }

  public createFormFournisseur() {
    this.fournisseurForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      telephone: [null, [Validators.required]],
      fixe: [null, []],
      email: [null, [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      addresse: [null, []],
    });
  }

  public saveFournisseurs() {
    for (const i in this.fournisseurForm.controls) {
      this.fournisseurForm.controls[i].markAsDirty();
      this.fournisseurForm.controls[i].updateValueAndValidity();
    }

    if (this.fournisseurForm.valid) {
      this.fournisseurService.store(this.fournisseurForm.value).subscribe(
        (reponse: any) => {
          this.achatForm.patchValue({ fournisseur_id: reponse.id });
          this.hideModalFournisseur();
          this.notificationService.createNotification('success', 'Fournisseur a été ajouté avec succes', null);
          this.getFournisseur();
        },
        (error) => {},
      );
    }
  }

  public activeDevise(event: any) {
    if (event) {
      this.achatForm.patchValue({ taux_change: null });
    } else {
      this.achatForm.patchValue({ taux_change: 0 });
    }
  }

  public onChangeArticle(event: any, index: any) {
    const valeurParam = (<FormArray>this.achatForm.get('lignes_achat')).at(index);
    const foundArticle = this.achatForm.value.lignes_achat.find((element: any, i: any) => element.article_id == event && index != i);
    if (foundArticle) {
      valeurParam.patchValue({ articleExiste: false });
    } else {
      valeurParam.patchValue({ quantite: 0, price_achat: null, pu_frais: 0, price_devise: 0, articleExiste: false });
    }
  }

  public changePriceAchat(event: any, index: any) {
    const valeurParam = (<FormArray>this.achatForm.get('lignes_achat')).at(index);
    if (event) {
      valeurParam.patchValue({ price_achat_avec_remise: event });
      const lignes_achat = this.achatForm.value.lignes_achat;
      this.achatForm.patchValue({ total_ttc: 0 });
      this.achatForm.patchValue({ total_ttc_avec_remise: 0 });
      lignes_achat.forEach((element: any) => {
        this.achatForm.patchValue({ total_ttc: parseFloat(this.achatForm.value.total_ttc) + element.price_achat * element.quantite });
        this.achatForm.patchValue({
          total_ttc_avec_remise:
            parseFloat(this.achatForm.value.total_ttc_avec_remise) + element.price_achat_avec_remise * element.quantite,
        });
      });
      this.changeRemise(event, index);
      this.refreshPU_frais();
    } else {
      valeurParam.patchValue({ pu_frais: 0, price_achat_avec_remise: 0 });
    }
  }

  public deleteLigneFrais(index: any) {
    var montant_frais = this.achatForm.value.list_frais[index].valeur;
    const control = <FormArray>this.achatForm.get('list_frais');
    control.removeAt(index);
    this.achatForm.patchValue({ total_frais: parseFloat(this.achatForm.value.total_frais) - montant_frais });
  }

  public changeMontantFrais(event: any, index: any) {
    const list_frais = this.achatForm.value.list_frais;

    this.achatForm.patchValue({ total_frais: 0 });
    list_frais.forEach((element: any) => {
      this.achatForm.patchValue({ total_frais: parseFloat(this.achatForm.value.total_frais) + element.valeur });
    });
    this.refreshPU_frais();
  }

  public showConfirmSaveAchat(): void {
    for (const i in this.achatForm.controls) {
      this.achatForm.controls[i].markAsDirty();
      this.achatForm.controls[i].updateValueAndValidity();
    }
    if (this.achatForm.valid && this.achatForm.value.lignes_achat.length > 0) {
      if (this.achatForm.value.type_devise) {
        var price_total = parseFloat(this.achatForm.value.total_frais) + parseFloat(this.achatForm.value.total_ttc);
      } else {
        var price_total = parseFloat(this.achatForm.value.total_frais) + parseFloat(this.achatForm.value.total_ttc_avec_remise);
      }

      this.achatForm.patchValue({ price_total: price_total });
      this.modalConfirm = true;
      // this.modalService.confirm({
      //   nzTitle: 'Confirmer Votre Achat',
      //   nzContent:
      //     'Total En DH : ' +
      //     this.achatForm.value.total_ttc +
      //     ' DH <br> Total Frais : ' +
      //     this.achatForm.value.total_frais +
      //     ' DH <br> <hr> Total Achat : ' +
      //     this.achatForm.value.price_total +
      //     ' DH',
      //   nzOkText: 'Enregistrer',
      //   nzCancelText: 'Modifier les informations',
      //   nzOnOk: () => this.saveAchat(),
      // });
    }
  }

  public refreshPriceTTC() {
    const lignes_achat = this.achatForm.value.lignes_achat;
    this.achatForm.patchValue({ total_ttc: 0 });
    this.achatForm.patchValue({ total_ttc_avec_remise: 0 });
    lignes_achat.forEach((element: any) => {
      this.achatForm.patchValue({ total_ttc: parseFloat(this.achatForm.value.total_ttc) + element.price_achat * element.quantite });
      this.achatForm.patchValue({
        total_ttc_avec_remise: parseFloat(this.achatForm.value.total_ttc_avec_remise) + element.price_achat_avec_remise * element.quantite,
      });
    });
    this.refreshPU_frais();
  }

  public refreshPU_frais() {
    const lignes_achat = this.achatForm.value.lignes_achat;
    if (this.achatForm.value.type_devise) {
      var moyenneFrais = this.achatForm.value.total_frais / this.achatForm.value.total_ttc;
    } else {
      var moyenneFrais = this.achatForm.value.total_frais / this.achatForm.value.total_ttc_avec_remise;
    }

    if (lignes_achat) {
      lignes_achat.forEach((element: any, index: any) => {
        if (this.achatForm.value.type_devise) {
          var puFrais = element.price_achat + element.price_achat * moyenneFrais;
        } else {
          var puFrais = element.price_achat_avec_remise + element.price_achat_avec_remise * moyenneFrais;
        }
        (<FormArray>this.achatForm.controls['lignes_achat']).at(index).patchValue({ pu_frais: puFrais });
      });
    }
  }

  public changePriceDevise(event: any, index: any) {
    const valeurParam = (<FormArray>this.achatForm.get('lignes_achat')).at(index);
    const lignes_achat = this.achatForm.value.lignes_achat;
    if (event.target.value && this.achatForm.value.taux_change) {
      var price_achat = parseFloat(event.target.value) * parseFloat(this.achatForm.value.taux_change);
      valeurParam.patchValue({ price_achat: price_achat });
      this.changePriceAchat(event, index);
      this.refreshPriceTotalDevise();
    } else {
      valeurParam.patchValue({ price_achat: null });
    }
  }

  public refreshPriceTotalDevise() {
    const lignes_achat = this.achatForm.value.lignes_achat;
    this.achatForm.patchValue({ total_devise: 0 });
    lignes_achat.forEach((element: any) => {
      this.achatForm.patchValue({ total_devise: parseFloat(this.achatForm.value.total_devise) + element.price_devise * element.quantite });
    });
  }

  public changeTaux() {
    const lignes_achat = this.achatForm.value.lignes_achat;

    if (lignes_achat) {
      lignes_achat.forEach((element: any, index: any) => {
        var price_achat = element.price_devise * parseFloat(this.achatForm.value.taux_change);
        (<FormArray>this.achatForm.controls['lignes_achat']).at(index).patchValue({ price_achat: price_achat });
      });
      this.refreshPriceTTC();
    }
  }

  public changeRemise(event: any, index: any) {
    if (event) {
      const lignes_achat = this.achatForm.value.lignes_achat;
      lignes_achat.forEach((element: any, index: any) => {
        var price_achat = parseFloat(element.price_achat) - parseFloat(element.price_achat) * (parseFloat(element.remise) / 100);
        (<FormArray>this.achatForm.controls['lignes_achat']).at(index).patchValue({ price_achat_avec_remise: price_achat });
      });
      this.refreshPriceTTC();
    }
  }

  public applyRemiseAuto() {
    const valeurParam = <FormArray>this.achatForm.get('lignes_achat');
    valeurParam.controls.forEach((element, index) => {
      element.patchValue({ remise: this.achatForm.value.remiseAuto });
      this.changeRemise(true, index);
    });
  }
  // ________
  private modalCheque: boolean = false;

  public changeModePaiment(event: any) {
    if (event == 2 || event == 4) {
      this.modalCheque = true;
    } else {
      const chequeInfo = <FormGroup>this.achatForm.get('chequeInfo');
      chequeInfo.patchValue({ date: null, reference: null });
    }
  }

  public hideModalCheque() {
    this.modalCheque = false;
    this.achatForm.patchValue({ payment_mode_id: null });
    const chequeInfo = <FormGroup>this.achatForm.get('chequeInfo');
    chequeInfo.patchValue({ date: null, reference: null });
  }

  public getPaymentsMode() {
    this.achatsService.getPaymentsMode().subscribe(
      (response: any) => {
        this.listOfPaymentsMode = response;
      },
      (error) => {},
    );
  }

  public saveInfoCheque() {
    if (this.achatForm.value.chequeInfo.date && this.achatForm.value.chequeInfo.reference) {
      this.modalCheque = false;
    }
  }

  public saveMode(mode: HTMLInputElement) {
    const value = mode.value;
    if (this.listOfPaymentsMode.indexOf(value) === -1 && value) {
      this.achatsService.storeMode({ label: value }).subscribe(
        (response: any) => {
          this.getPaymentsMode();
          this.achatForm.patchValue({ payment_mode_id: response.id });
          mode.value = '';
          this.notificationService.createNotification('success', 'Mode de payment a été ajouté avec succes', null);
        },
        (error) => {
          // this.notificationService.createNotification('error', 'error de supprission', null)
        },
      );
    }
  }
}
