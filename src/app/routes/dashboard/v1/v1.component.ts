import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnboardingService } from '@delon/abc/onboarding';
import { _HttpClient } from '@delon/theme';
import { VentesService } from '../../../services/vente.service';
import { yuan } from '@shared';

@Component({
  selector: 'app-dashboard-v1',
  templateUrl: './v1.component.html',
})
export class DashboardV1Component implements OnInit {
  public listeOfSearch: any[] = [
    { id: 'VILLE', label: 'Ville' },
    { id: 'CLIENT', label: 'Client' },
    { id: 'COMMERCIALE', label: 'Commerciale' },
  ];
  private dashboardForm: FormGroup = new FormGroup({});
  salesPieDataVilleClient: any[] = [];
  salesPieDataClientVente: any[] = [];
  salesPieDataCommercialVente: any[] = [];
  listeOfArticleTop: any[] = [];

  listeOfDashboard: any;
  listeOfDashboardByDate: any;
  constructor(private http: _HttpClient, private venteServices: VentesService, private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadDataDashboard();
    this.searchBydate('TODAY');
  }

  public createForm() {
    this.dashboardForm = this.fb.group({
      dateStart: [null, [Validators.required]],
      dateEnd: [null, [Validators.required]],
      date: [null],
      type: ['TODAY'],
    });
  }

  public loadDataDashboard() {
    this.venteServices.getDashboard().subscribe(
      (response: any) => {
        this.listeOfDashboard = response;
      },
      (error) => {},
    );
  }

  public loadDataDashboardByDate(date: any) {
    this.venteServices.getDashboardByDate(date).subscribe(
      (response: any) => {
        this.listeOfDashboardByDate = response;
        if (this.listeOfDashboardByDate.villes && this.listeOfDashboardByDate.villes.length > 0) {
          this.salesPieDataVilleClient = this.listeOfDashboardByDate.villes;
        }
        if (this.listeOfDashboardByDate.clients && this.listeOfDashboardByDate.clients.length > 0) {
          this.salesPieDataClientVente = this.listeOfDashboardByDate.clients;
        }
        if (this.listeOfDashboardByDate.commerciaux && this.listeOfDashboardByDate.commerciaux.length > 0) {
          this.salesPieDataCommercialVente = this.listeOfDashboardByDate.commerciaux;
        }
        if (this.listeOfDashboardByDate.top_articles && this.listeOfDashboardByDate.top_articles.length > 0) {
          this.listeOfArticleTop = this.listeOfDashboardByDate.top_articles;
        }

        this.getChart();
      },
      (error) => {},
    );
  }

  onChange(result: Date[]): void {
    if (result && result.length > 0) {
      result[0].setHours(0, 0, 0);
      result[1].setHours(23, 59, 59);
      this.dashboardForm.patchValue({ dateStart: result[0] });
      this.dashboardForm.patchValue({ dateEnd: result[1] });
      this.loadDataDashboardByDate(this.dashboardForm.value);
    } else {
      this.dashboardForm.patchValue({ dateStart: null });
      this.dashboardForm.patchValue({ dateEnd: null });
    }
    console.log(' this.dashboardForm.', this.dashboardForm.value);
  }

  searchBydate(type: string) {
    switch (type) {
      case '30J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 30);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.dashboardForm.patchValue({ dateStart: date_start });
        this.dashboardForm.patchValue({ dateEnd: date_end });
        this.dashboardForm.patchValue({ date: [date_start, date_end] });
        break;
      case '7J':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 7);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.dashboardForm.patchValue({ dateStart: date_start });
        this.dashboardForm.patchValue({ dateEnd: date_end });
        this.dashboardForm.patchValue({ date: [date_start, date_end] });
        break;
      case 'HIER':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        date_start.setDate(date_start.getDate() - 1);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.dashboardForm.patchValue({ dateStart: date_start });
        this.dashboardForm.patchValue({ dateEnd: date_end });
        this.dashboardForm.patchValue({ date: [date_start, date_end] });
        break;
      case 'TODAY':
        var date_start = new Date();
        date_start.setHours(0, 0, 0);
        var date_end = new Date();
        date_end.setHours(23, 59, 59);
        this.dashboardForm.patchValue({ dateStart: date_start });
        this.dashboardForm.patchValue({ dateEnd: date_end });
        this.dashboardForm.patchValue({ date: [date_start, date_end] });
        break;
      default:
        break;
    }
    this.loadDataDashboardByDate(this.dashboardForm.value);
  }

  handlePieValueFormat(value: string | number): string {
    return yuan(value);
  }

  salesTotalClientVille = 0;
  salesTotalClientVente = 0;
  salesTotalCommercialVente = 0;

  public getChart() {
    // this.salesPieDataVilleClient = [
    //   // {
    //   //   x: 'test1',
    //   //   y: 4544,
    //   // },
    //   // {
    //   //   x: 'test2',
    //   //   y: 3321,
    //   // },
    //   // {
    //   //   x: 'test3',
    //   //   y: 3113,
    //   // },
    //   // {
    //   //   x: 'test4',
    //   //   y: 2341,
    //   // },
    //   // {
    //   //   x: 'test5',
    //   //   y: 1231,
    //   // },
    //   // {
    //   //   x: 'test6',
    //   //   y: 1231,
    //   // },
    // ];
    // this.salesPieDataClientVente = this.salesPieDataVilleClient;
    // this.salesPieDataCommercialVente = this.salesPieDataVilleClient;
    console.log('this.salesPieDataVilleClient', this.salesPieDataVilleClient);
    if (this.salesPieDataVilleClient) {
      this.salesTotalClientVille = this.salesPieDataVilleClient.reduce((pre: number, now: { y: number }) => now.y + pre, 0);
    }
    if (this.salesPieDataClientVente) {
      this.salesTotalClientVente = this.salesPieDataClientVente.reduce((pre: number, now: { y: number }) => now.y + pre, 0);
    }
    if (this.salesPieDataCommercialVente) {
      this.salesTotalCommercialVente = this.salesPieDataCommercialVente.reduce((pre: number, now: { y: number }) => now.y + pre, 0);
    }
  }
}
