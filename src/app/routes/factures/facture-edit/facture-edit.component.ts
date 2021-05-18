import { Component, OnInit } from '@angular/core';
import { baseComponent } from '../../base-component/base-component.component';
import { SettingsService } from '@delon/theme';
import { ActivatedRoute, Router } from '@angular/router';
import { FactureService } from 'src/app/services/facture.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { articleCriteria } from 'src/app/models/article.criteria';
import { StockService } from 'src/app/services/stock.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
    selector: 'app-factures-edit',
    templateUrl: './facture-edit.component.html',
    styleUrls: ['./facture-edit.component.less'],
})
export class facturesEditComponent extends baseComponent implements OnInit {
    public factureId: any;
    private factureForm: FormGroup = new FormGroup({});
    private listeOfArticles: any[] = [];
    private articleCriteria: articleCriteria = new articleCriteria();

    constructor(
        private route: ActivatedRoute,
        private factureService: FactureService,
        protected settings: SettingsService,
        private fb: FormBuilder,
        private stockService: StockService,
        private router: Router,
        private notificationService: NotificationService,

    ) {
        super(settings);
        this.createFormFacture();

    }

    ngOnInit(): void {
        this.getFacture();
    }

    public createFormFacture() {
        this.factureForm = this.fb.group({
            id: [null, [Validators.required]],
            client_id: [null, [Validators.required]],
            vente_id: [null, [Validators.required]],
            date: [new Date(), [Validators.required]],
            prix_total: [0, [Validators.required]],
            prix_vente_ht: [null],
            year_id_count: [null],
            reference: [null],
            client_name: [null],
            commercial_id: [null],
            adresse: [null],
            tva: [null],
            path: [null],
            lignes_facture: this.fb.array([]),
        });
    }

    getFacture() {
        this.factureId = this.route.snapshot.paramMap.get('id');
        this.factureService.getFactureById(this.factureId).subscribe(
            (response: any) => {
                this.factureForm.patchValue(response.data);
                const control = <FormArray>this.factureForm.get('lignes_facture');
                response.data.lignes_facture.forEach((ligne_facture: any) => {
                    this.listeOfArticles.push(ligne_facture.article)

                    control.push(
                        this.patchValues(
                            ligne_facture.facture_id,
                            ligne_facture.article_id,
                            ligne_facture.article,
                            ligne_facture.prix_vente,
                            ligne_facture.remise,
                            ligne_facture.prix_vente_avec_remise,
                            ligne_facture.total,
                            ligne_facture.total_with_remise,
                            ligne_facture.quantite_facture,
                            ligne_facture.isProvisional
                        ),
                    );
                });
            },
            (error) => { },
        );
    }

    private patchValues(
        facture_id: any,
        article_id: any,
        article: any,
        prix_vente: any,
        remise: any,
        prix_vente_avec_remise: any,
        total: any,
        total_with_remise: any,
        quantite_facture: any,
        isProvisional: any
    ) {
        return this.fb.group({
            facture_id: [facture_id],
            article_id: [article_id, [Validators.required]],
            article: [article],
            prix_vente: [prix_vente, [Validators.required]],
            remise: [remise],
            prix_vente_avec_remise: [prix_vente_avec_remise],
            total: [total],
            total_with_remise: [total_with_remise],
            quantite_facture: quantite_facture,
            isProvisional: [isProvisional]
        });
    }

    nzCompareSelectedByreference(o1: any, o2: any): boolean {
        return o1 && o2 ? o1.reference == o2.reference : o1 == o2;
    }

    isLoadingArticle: boolean = false;

    public getArticles(event: any, index: any) {
        this.listeOfArticles = [];

        if (event) {
            this.articleCriteria.maxResults = 20;
            this.articleCriteria.referenceNotSpaceLike = event.replace(/[&\/\\#\s,;\-\_+()$~%.'":*?<>{}]/g, '');
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
                    } this.isLoadingArticle = false;

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
        const valeurParam = (<FormArray>this.factureForm.get('lignes_facture')).at(index);
        // const foundArticle = this.factureForm.value.lignes_facture.find((element: any) => element.article_id == event.id);
        // if (foundArticle) {
        //     valeurParam.patchValue({ articleExiste: null });
        // } else {
        valeurParam.patchValue({
            article_id: event.id,
            prix_vente: event.prix_vente,
            prix_vente_avec_remise: event.prix_vente,
            quantite_facture: 0,
            remise: 0,
            total: 0,
            total_with_remise: 0,
        });
        // }
    }

    onMouseupQte(index: any) {
        const valeurParam = (<FormArray>this.factureForm.get('lignes_facture')).at(index);
        this.changePriceTotal(valeurParam);
        this.calculePriceVente();
    }

    public changePriceTotal(valeurParam: any) {
        if (valeurParam.value.article) {
            valeurParam.patchValue({
                total: valeurParam.value.prix_vente * valeurParam.value.quantite_facture,
                prix_vente_avec_remise: valeurParam.value.prix_vente - valeurParam.value.prix_vente * (valeurParam.value.remise / 100),
                total_with_remise:
                    (valeurParam.value.prix_vente - valeurParam.value.prix_vente * (valeurParam.value.remise / 100)) * valeurParam.value.quantite_facture,
            });
        }
    }

    public calculePriceVente() {
        const lignes_facture = this.factureForm.value.lignes_facture;
        this.factureForm.patchValue({ prix_total: 0, prix_vente_ht: 0 });
        lignes_facture.forEach((element: any) => {
            this.factureForm.patchValue({
                prix_total: this.factureForm.value.prix_total + element.total_with_remise,
            });
        });
        this.factureForm.patchValue({
            prix_vente_ht: parseFloat(this.factureForm.value.prix_total) / 1.2,
        });
    }

    public changePriceVente(event: any, index: any) {
        const valeurParam = (<FormArray>this.factureForm.get('lignes_facture')).at(index);
        if (event) {
            valeurParam.patchValue({
                total: event * valeurParam.value.quantite_facture,
                prix_vente_avec_remise: event - event * (valeurParam.value.remise / 100),
            });
            valeurParam.patchValue({
                total_with_remise: (event - event * (valeurParam.value.remise / 100)) * valeurParam.value.quantite_facture,
            });
            const lignes_facture = this.factureForm.value.lignes_facture;

            this.factureForm.patchValue({ prix_total: 0 });
            this.factureForm.patchValue({ prix_vente_ht: 0 });

            lignes_facture.forEach((element: any) => {
                this.factureForm.patchValue({
                    prix_total: parseFloat(this.factureForm.value.prix_total) + element.prix_vente_avec_remise * element.quantite_facture,
                });
            });
            this.factureForm.patchValue({
                prix_vente_ht: parseFloat(this.factureForm.value.prix_total) / 1.2,
            });
        }


    }

    public onMouseupRemise(index: any) {
        const valeurParam = (<FormArray>this.factureForm.get('lignes_facture')).at(index);
        this.changePriceTotal(valeurParam);
        this.calculePriceVente();
    }

    public deleteLigneVente(index: any) {
        const control = <FormArray>this.factureForm.get('lignes_facture');
        control.removeAt(index);
        this.calculePriceVente();
    }

    vente: any;
    saveFacture() {
        for (const i in this.factureForm.controls) {
            this.factureForm.controls[i].markAsDirty();
            this.factureForm.controls[i].updateValueAndValidity();
        }

        if (this.factureForm.valid && this.factureForm.value.lignes_facture.length > 0) {
            this.factureService.update(this.factureForm.value).subscribe(
                (reponse) => {
                    this.notificationService.createNotification('success', 'Facture a été modifié avec succes', null);
                    this.goToList();
                },
                (error) => { },
            );
        }
    }

    public goToList() {
        this.router.navigate(['factures/list']);
    }

    addLigneFacture(
        facture_id?: any,
        article_id?: any,
        article?: any,
        prix_vente: any = 0,
        remise: any = 0,
        prix_vente_avec_remise: any = 0,
        total: any = 0,
        total_with_remise: any = 0,
        quantite_facture: any = 0,
        isProvisional = true
    ) {
        const control = <FormArray>this.factureForm.get('lignes_facture');
        control.push(
            this.patchValues(
                facture_id,
                article_id,
                article,
                prix_vente,
                remise,
                prix_vente_avec_remise,
                total,
                total_with_remise,
                quantite_facture,
                isProvisional
            ),
        );
    }
}