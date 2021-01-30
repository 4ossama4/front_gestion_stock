import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockService } from 'src/app/services/stock.service';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../services/notification.service';

// _____________models____________
import { articleCriteria } from '../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Router } from '@angular/router';
import { FournisseurService } from 'src/app/services/fournisseur.service';

@Component({
  selector: 'app-out-of-stock',
  templateUrl: './out-of-stock.component.html',
  styleUrls: ['./out-of-stock.component.less'],
})
export class outOfStockComponent implements OnInit {
  private loading: boolean = true;

  private listOfStock: any[] = [];

  private listOfMarque: any[] = [];
  private listOfFournisseur: any[] = [];

  private from: number = 0;
  private to: number = 0;

  private findFamille: boolean = false;
  private stockSelected: any;
  private articleCriteria: articleCriteria = new articleCriteria();
  private totalArticle: number = 0;
  private maxResults: number = 10;
  private firstArticle: number = 0;

  private filterApplyList: any[] = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalService: NzModalService,
    private stockService: StockService,
    private fournisseurService: FournisseurService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.getOutStocksByCriteria();
    this.getMarques();
    this.getFournisseur();
  }

  public getOutStocksByCriteria() {
    this.loading = true;
    this.stockService.getOutStocksByCriteria(this.articleCriteria).subscribe(
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

  public getFournisseur() {
    this.fournisseurService.getFournisseurs().subscribe(
      (response: any) => {
        this.listOfFournisseur = response;
      },
      (error) => {},
    );
  }

  public sort(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    console.log('params', params);
    const currentSort = sort.find((item) => item.value !== null);
    if (params.pageIndex) {
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
      this.getOutStocksByCriteria();
    }
  }

  public currentPageDataChange(event: any) {
    console.log('event', event);
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'marqueIds':
        this.articleCriteria.marqueIds = null;
        break;
      case 'designationLike':
        this.articleCriteria.designationLike = null;
        break;
      case 'referenceLike':
        this.articleCriteria.referenceLike = null;
        break;
      case 'referencesIds':
        this.articleCriteria.referencesIds = null;
        break;

      case 'referencesLike':
        this.articleCriteria.referencesLike = null;
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
    this.getOutStocksByCriteria();
  }

  public getMarques() {
    this.stockService.getMarques().subscribe(
      (response: any) => {
        this.listOfMarque = response;
      },
      (error) => {},
    );
  }

  public searchGlobal() {
    if (this.articleCriteria.fournisseurId) {
      this.search('Fournisseur', this.articleCriteria.fournisseurId, 'orange', 'fournisseurId');
    }
    if (this.articleCriteria.marqueIds) {
      this.search('Marque', this.articleCriteria.marqueIds, 'purple', 'marqueIds');
    }
    if (this.articleCriteria.referenceLike) {
      this.search('Référence', this.articleCriteria.referenceLike, 'green', 'referenceLike');
    }
    if (this.articleCriteria.referencesLike) {
      this.search('Réf-Original', this.articleCriteria.referencesLike, 'magenta', 'referencesLike');
    }
    if (this.articleCriteria.designationLike) {
      this.search('Désignation', this.articleCriteria.designationLike, 'orange', 'designationLike');
    }
    this.articleCriteria.page = 1;
    this.firstArticle = 1;
    this.getOutStocksByCriteria();
  }

  public search(label: string, value: any, color: any, type: any) {
    const found = this.filterApplyList.find((item) => item.type == type);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList[index] = { label: label, value: value, color: color, type: type };
    } else {
      this.filterApplyList.push({ label: label, value: value, color: color, type: type });
    }

    // this.getOutStocksByCriteria();
  }

  public gotoAchat() {
    this.router.navigate(['achats/add']);
  }

  public exportData(type: string) {
    var data = { type: type, criteria: this.articleCriteria, table: 'repture_stock' };
    console.log('data', data);
    this.stockService.exportData(data).subscribe(
      (response: any) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        if (type == 'excel') {
          link.download = 'rupture.xlsx';
          link.click();
        } else {
          window.open(downloadURL);
        }
        this.notificationService.createNotification('success', 'Ruputre de stock a été exporté avec succes', null);
      },
      (error) => {},
    );
  }
}
