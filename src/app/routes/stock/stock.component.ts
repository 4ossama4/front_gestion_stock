import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockService } from 'src/app/services/stock.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

//____________services________________-
import { NotificationService } from '../../services/notification.service';

// _____________models____________
import { articleCriteria } from '../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { baseComponent } from '../base-component/base-component.component';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.less'],
})
export class StockComponent extends baseComponent implements OnInit {
  private visibleRefOR = false;
  private visibleMarque = false;
  private stockModal: boolean = false;
  private isUpdate: boolean = false;

  private stockForm: FormGroup = new FormGroup({});
  private loading: boolean = true;

  private historyModal: boolean = false;
  private listOfTva: any[] = [{ id: 1, label: '20%' }];
  private listOfReference: any[] = [];
  private listOfMarque: any[] = [];
  private listOfFamille: any[] = [];
  private listOfSousFamille: any[] = [];

  private listOfStock: any[] = [];

  private findFamille: boolean = false;
  private stockSelected: any;
  private articleCriteria: articleCriteria = new articleCriteria();
  private totalArticle: number = 0;
  private maxResults: number = 10;
  private firstArticle: number = 1;

  private from: number = 0;
  private to: number = 0;

  private filterApplyList: any[] = [];

  private ROLE_ADD: boolean = false;
  private ROLE_UPDATE: boolean = false;
  private ROLE_DELETE: boolean = false;
  private ROLE_HISTORY: boolean = false;

  constructor(
    private fb: FormBuilder,
    protected settings: SettingsService,
    private modalService: NzModalService,
    private stockService: StockService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.createFormStock();
    this.createFormHistory();

    this.ROLE_ADD = this.hasPermission('add_stock');
    this.ROLE_UPDATE = this.hasPermission('update_stock');
    this.ROLE_DELETE = this.hasPermission('delete_stock');
    this.ROLE_HISTORY = this.hasPermission('history_stock');
  }

  ngOnInit(): void {
    this.getStocksByCriteria();
    this.getFamilles();
    // this.getReference();
    this.chercheRefOriginal(' ');
    this.getTva();
    this.getMarques();
  }

  public closeModalAdd() {
    this.stockForm.reset({
      quantite_add: 0,
      prix_achat_new: 0,
      quantite_min: 0,
    });
    this.stockModal = false;
  }

  public openModalAdd() {
    this.listOfSousFamille = [];

    this.stockForm.reset({
      quantite_add: 0,
      prix_achat_new: 0,
      quantite_min: 0,
    });
    this.stockSelected = null;
    this.isUpdate = false;
    this.stockModal = true;
  }

  public openModalUpdate(stock: any) {
    this.isUpdate = true;
    console.log('stock', stock);
    if (stock.references) {
      stock.references.forEach((element: any) => {
        var foundIndex = this.listOfReference.findIndex((x) => x.id === element.id);
        if (foundIndex == -1) {
          this.listOfReference.push(element);
        }
      });
    }

    this.stockSelected = stock;
    this.stockForm.patchValue(stock);
    if (stock.references) {
      var arrayRefs: any[] = [];
      stock.references.forEach((ref: any) => {
        arrayRefs.push(ref.id);
      });
      this.stockForm.patchValue({ original_refs: arrayRefs });
    }
    this.stockForm.patchValue({
      famille: stock.sous_famille.famille ? stock.sous_famille.famille.id : null,
      sous_famille: stock.sous_famille ? stock.sous_famille.id : null,
      marque: stock.marque ? stock.marque.id : null,
      prix_achat_new: stock.prix_achat,
    });
    console.log('stock', this.stockForm.value);
    this.stockModal = true;
  }

  public createFormStock() {
    this.stockForm = this.fb.group({
      id: [null],
      famille: [null, [Validators.required]],
      sous_famille: [null, [Validators.required]],
      code_barre: [null],
      designation: [null],
      marque: [null, [Validators.required]],
      reference: [null, [Validators.required]],
      original_refs: [null, [Validators.required]],
      quantite: [null],
      quantite_add: [0],
      prix_achat: [null],
      prix_achat_new: [0],
      prix_vente: [null],
      remarques: [null],
      rayon: [null, []],
      quantite_min: [0],
    });
  }

  public saveStock() {
    for (const i in this.stockForm.controls) {
      this.stockForm.controls[i].markAsDirty();
      this.stockForm.controls[i].updateValueAndValidity();
    }
    console.log('this.stockForm', this.stockForm.value);
    if (this.stockForm.valid) {
      if (this.isUpdate) {
        this.stockService.update(this.stockForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Stock a été modifié avec succes', null);
            this.getStocksByCriteria();
          },
          (error) => {},
        );
      } else {
        this.stockService.store(this.stockForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Stock a été ajouté avec succes', null);
            this.getStocksByCriteria();
          },
          (error) => {},
        );
      }
    }
  }

  public loadStockList() {
    this.loading = true;
    this.stockService.getStocks().subscribe(
      (response: any) => {
        this.listOfStock = response;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public deleteStock(stock: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer ce fichier',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(stock),
    });
  }

  public confirmationDelete(stock: number) {
    this.stockService.delete(stock).subscribe(
      (response) => {
        this.getStocksByCriteria();
        this.notificationService.createNotification('success', 'Stock a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  //_________Famille_____

  public saveFamille(famille: HTMLInputElement) {
    const value = famille.value;
    if (this.listOfFamille.indexOf(value) === -1 && value) {
      this.stockService.storeFamille({ label: value }).subscribe(
        (response: any) => {
          this.getFamilles();
          this.stockForm.patchValue({ famille: response.id });
          famille.value = '';
          this.notificationService.createNotification('success', 'Famille a été ajouté avec succes', null);
        },
        (error) => {
          // this.notificationService.createNotification('error', 'error de supprission', null)
        },
      );
    }
  }

  public savSousFamille(sousfamille: HTMLInputElement) {
    const value = sousfamille.value;
    if (this.listOfSousFamille.indexOf(value) === -1 && value) {
      this.stockService.storeSousFamille({ label: value, famille_id: this.stockForm.value.famille }).subscribe(
        (response: any) => {
          this.getSousFamille(response.famille_id);
          this.stockForm.patchValue({ sous_famille: response.id });
          sousfamille.value = '';
          this.notificationService.createNotification('success', 'sous Famille a été ajouté avec succes', null);
        },
        (error) => {
          // this.notificationService.createNotification('error', 'error de supprission', null)
        },
      );
    }
  }

  public getFamilles() {
    this.stockService.getFamilles().subscribe(
      (response: any) => {
        this.listOfFamille = response;
      },
      (error) => {},
    );
  }

  //___________Sous Famille______

  public getSousFamille(idFamille: number) {
    if (idFamille) {
      this.articleCriteria.sous_familleId = null;
      this.stockForm.patchValue({ sous_famille: null });
      if (idFamille && typeof idFamille == 'number') {
        this.stockService.getSousFamilles(idFamille).subscribe(
          (response: any) => {
            this.listOfSousFamille = response;
          },
          (error) => {},
        );
      }
    } else {
      this.resetSearch('familleId');
    }
  }

  //___________Marque____________

  public getMarques() {
    this.stockService.getMarques().subscribe(
      (response: any) => {
        this.listOfMarque = response;
      },
      (error) => {},
    );
  }

  public saveMarque(marque: HTMLInputElement) {
    const value = marque.value;
    if (this.listOfMarque.indexOf(value) === -1 && value) {
      this.stockService.storeMarque({ label: value }).subscribe(
        (response: any) => {
          this.getMarques();
          this.stockForm.patchValue({ marque: response.id });
          marque.value = '';
          this.notificationService.createNotification('success', 'Marque a été ajouté avec succes', null);
        },
        (error) => {},
      );
    }
  }

  //_________Tva____________

  public getTva() {
    this.stockService.getTvas().subscribe(
      (response: any) => {
        this.listOfTva = response;
      },
      (error) => {},
    );
  }

  public saveTva(tva: HTMLInputElement) {
    const value = tva.value;
    if (this.listOfTva.indexOf(value) === -1 && value) {
      this.stockService.storeTva({ label: value, valeur: value }).subscribe(
        (response: any) => {
          this.getTva();
          // this.stockForm.patchValue({ m: response.id })
          this.notificationService.createNotification('success', 'Tva a été ajouté avec succes', null);
        },
        (error) => {},
      );
    }
  }

  //_________reference_________

  public getReference() {
    this.stockService.getReferences().subscribe(
      (response: any) => {
        this.listOfReference = response;
      },
      (error) => {},
    );
  }

  public saveReference(ref: HTMLInputElement) {
    const value = ref.value;
    if (this.listOfReference.indexOf(value) === -1 && value) {
      this.stockService.storeReference({ label: value }).subscribe(
        (response: any) => {
          this.getReference();
          ref.value = '';
          this.notificationService.createNotification('success', 'Reference a été ajouté avec succes', null);
        },
        (error) => {},
      );
    }
  }

  public chercheRefOriginal(event: any) {
    console.log('event', event);
    if (event) {
      this.stockService.chercheRefOriginal(event).subscribe(
        (response: any) => {
          this.listOfReference = response;
        },
        (error) => {},
      );
    }
  }

  nzCompareSelectedByName(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.name === o2.name : o1 === o2;
  }

  nzCompareSelectedByID(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id == o2.id : o1 == o2;
  }

  public changeQuantit(event: any) {
    if (event.target.value) {
      this.stockForm.patchValue({
        quantite: parseInt(event.target.value) + (this.stockSelected.quantite ? parseInt(this.stockSelected.quantite) : 0),
      });
    } else {
      this.stockForm.patchValue({ quantite: this.stockSelected.quantite ? parseInt(this.stockSelected.quantite) : 0 });
    }
    this.calculAveragePrice();
  }

  public calculAveragePrice() {
    if (parseInt(this.stockForm.value.prix_achat_new) > 0 && parseInt(this.stockForm.value.quantite_add) > 0) {
      var avg =
        (this.stockSelected.quantite ? parseInt(this.stockSelected.quantite) : 0) *
          (this.stockSelected.prix_achat ? parseInt(this.stockSelected.prix_achat) : 0) +
        parseInt(this.stockForm.value.quantite_add) * parseInt(this.stockForm.value.prix_achat_new);
      this.stockForm.patchValue({
        prix_achat:
          avg / ((this.stockSelected.quantite ? parseInt(this.stockSelected.quantite) : 0) + parseInt(this.stockForm.value.quantite_add)),
      });
    } else {
      this.stockForm.patchValue({ prix_achat: this.stockSelected.prix_achat ? this.stockSelected.prix_achat : null });
    }
  }

  public viewHistory(article: any) {
    this.createFormHistory();
    this.isSpinning = true;
    this.listHistoryOfarticle = [];
    this.historyForm.patchValue({ id: article.id });
    var dateStart = new Date();
    dateStart.setDate(1);
    var lastDayOfMonth = new Date(dateStart.getFullYear(), dateStart.getMonth() + 1, 0);
    var dateend = new Date();
    dateend.setDate(lastDayOfMonth.getDate());

    this.historyForm.patchValue({ dateStart: dateStart });
    this.historyForm.patchValue({ dateEnd: dateend });
    this.historyForm.patchValue({ date: [dateStart, dateend] });

    this.loadHistoryArticle();
    this.historyModal = true;
  }

  public search(label: string, value: any, color: any, type: any, name?: string) {
    const found = this.filterApplyList.find((item) => item.type == type);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList[index] = { label: label, value: value, color: color, type: type, name: name };
    } else {
      this.filterApplyList.push({ label: label, value: value, color: color, type: type, name: name });
    }

    // this.getStocksByCriteria();
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'marqueIds':
        this.articleCriteria.marqueIds = null;
        break;
      case 'designationLike':
        this.articleCriteria.designationLike = null;
        break;
      case 'refOrgAndreferenceLike':
        this.articleCriteria.refOrgAndreferenceLike = null;
        this.articleCriteria.referenceNotSpaceLike = null;
        break;
      case 'referencesIds':
        this.articleCriteria.referencesIds = null;
        break;

      case 'referencesLike':
        this.articleCriteria.referencesLike = null;
        break;

      case 'familleId':
        this.articleCriteria.familleId = null;
        this.articleCriteria.famille = null;
        break;
      case 'sous_familleId':
        this.articleCriteria.sous_familleId = null;
        this.articleCriteria.sous_famille = null;
        break;

      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.articleCriteria.page = 1;
    this.firstArticle = 1;
    this.getStocksByCriteria();
  }

  public getStocksByCriteria() {
    this.loading = true;

    this.stockService.getStocksByCriteria(this.articleCriteria).subscribe(
      (response: any) => {
        this.listOfStock = response.data;
        this.totalArticle = response.total;
        this.from = response.from;
        this.to = response.to;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public sort(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;

    const currentSort = sort.find((item) => item.value !== null);
    if (params.pageIndex) {
      console.log('params', params.pageIndex);
      this.articleCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.articleCriteria.sortField = currentSort.key;
      this.articleCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.articleCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getStocksByCriteria();
    }
  }

  public currentPageDataChange(event: any) {
    console.log('event', event);
  }

  public deleteFilter(index: any, filter: any) {
    this.resetSearch(filter.type);
    // this.filterApplyList.splice(index, 1);
  }

  public deleteAllfilter() {
    this.articleCriteria = new articleCriteria();
    this.filterApplyList = [];
    this.getStocksByCriteria();
  }

  public searchGlobal() {
    if (this.articleCriteria.famille) {
      this.articleCriteria.familleId = this.articleCriteria.famille.id;
      this.search('Famille', this.articleCriteria.familleId, 'orange', 'familleId', this.articleCriteria.famille.label);
    }

    if (this.articleCriteria.sous_famille) {
      this.articleCriteria.sous_familleId = this.articleCriteria.sous_famille.id;
      this.search('Sous Famille', this.articleCriteria.sous_familleId, 'orange', 'sous_familleId', this.articleCriteria.sous_famille.label);
    }

    if (this.articleCriteria.marqueIds) {
      this.search('Marque', this.articleCriteria.marqueIds, 'purple', 'marqueIds');
    }

    if (this.articleCriteria.referencesLike) {
      this.search('Réf-Original', this.articleCriteria.referencesLike, 'magenta', 'referencesLike');
    }

    if (this.articleCriteria.refOrgAndreferenceLike) {
      this.articleCriteria.referenceNotSpaceLike = this.articleCriteria.refOrgAndreferenceLike.replace(
        /[&\/\\#\s,;\-\_+()$~%.'":*?<>{}]/g,
        '',
      );
      // this.articleCriteria.referenceNotSpaceLike = this.articleCriteria.refOrgAndreferenceLike.replace(/\s/g, '');
      this.search('Référence/Réf Original', this.articleCriteria.refOrgAndreferenceLike, 'green', 'refOrgAndreferenceLike');
    }

    if (this.articleCriteria.designationLike) {
      this.search('Désignation', this.articleCriteria.designationLike, 'orange', 'designationLike');
    }
    this.articleCriteria.page = 1;
    this.firstArticle = 1;
    this.getStocksByCriteria();
  }

  public exportData(type: string) {
    var data = { type: type, criteria: this.articleCriteria, table: 'articles' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        if (type == 'excel') {
          link.download = 'stocks.xlsx';
          link.click();
        } else {
          window.open(downloadURL);
        }
        this.notificationService.createNotification('success', 'Stocks a été exporté avec succes', null);
      },
      (error) => {},
    );
  }

  public printData(type: string) {
    var data = { type: type, criteria: this.articleCriteria, table: 'articles' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;

        //window.open(downloadURL);
        this.printPDFS(downloadURL);
        this.notificationService.createNotification('success', 'Stocks a été imprimer avec succes', null);
      },
      (error) => {},
    );
  }

  async printPDFS(pdfsToMerge: any) {
    /* Array of pdf urls */

    const pdfDoc = await PDFDocument.create();

    // Embed the Times Roman font
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Add a blank page to the document
    const page = pdfDoc.addPage();

    // Get the width and height of the page
    const { width, height } = page.getSize();

    // Draw a string of text toward the top of the page
    const fontSize = 30;
    page.drawText('Creating PDFs in JavaScript is awesome!', {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0.53, 0.71),
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
  }

  onKey(event: any) {
    // without type info
    console.log('event', event);
    if (event.code == 'Enter') {
      this.searchGlobal();
    }
  }

  public hideModalHistory() {
    this.historyModal = false;
    this.listHistoryOfarticle = [];
    this.produitSelected = null;
  }

  private historyForm: FormGroup = new FormGroup({});

  public createFormHistory() {
    this.historyForm = this.fb.group({
      id: [null, [Validators.required]],
      dateStart: [null, [Validators.required]],
      dateEnd: [null, [Validators.required]],
      date: [null],
      isAvoir: [true],
      isVente: [true],
      isAchat: [true],
    });
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      result[0].setHours(0, 0, 0);
      result[1].setHours(23, 59, 59);
      this.historyForm.patchValue({ dateStart: result[0] });
      this.historyForm.patchValue({ dateEnd: result[1] });
      this.loadHistoryArticle();
    } else {
      this.historyForm.patchValue({ dateStart: null });
      this.historyForm.patchValue({ dateEnd: null });
      this.loadHistoryArticle();
    }
  }

  searchHistory(type: string) {
    switch (type) {
      case 'vente':
        this.historyForm.patchValue({ isVente: !this.historyForm.value.isVente });
        break;
      case 'achat':
        this.historyForm.patchValue({ isAchat: !this.historyForm.value.isAchat });
        break;
      case 'avoir':
        this.historyForm.patchValue({ isAvoir: !this.historyForm.value.isAvoir });
        break;
      default:
        break;
    }
    this.loadHistoryArticle();
  }
  private listHistoryOfarticle: any[] = [];
  private produitSelected: any;
  private isSpinning: boolean = false;
  public loadHistoryArticle() {
    this.isSpinning = true;
    this.stockService.getHistoryArticle(this.historyForm.value).subscribe(
      (response: any) => {
        this.produitSelected = response.article;
        console.log('this.produitSelected', this.produitSelected);
        if (response.data) {
          this.listHistoryOfarticle = response.data;
        } else {
          this.listHistoryOfarticle = [];
        }
        this.isSpinning = false;
        console.log('this.listHistoryOfarticle', this.listHistoryOfarticle);
      },
      (error) => {
        this.isSpinning = false;
      },
    );
  }
}
