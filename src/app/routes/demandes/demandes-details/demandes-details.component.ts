import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
// import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { environment } from '../../../../environments/environment';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';

// _____________models____________
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DemandeService } from 'src/app/services/demande.service';
import { demandeCriteria } from 'src/app/models/demande.criteria';
import { clientService } from 'src/app/services/client.service';
import { NzDatePickerComponent, NzRangePickerComponent } from 'ng-zorro-antd/date-picker';
import { CommercialService } from 'src/app/services/commercial.service';
import { StockService } from 'src/app/services/stock.service';
import { SettingsService } from '@delon/theme';
import { baseComponent } from '../../base-component/base-component.component';

@Component({
  selector: 'app-demandes-details',
  templateUrl: './demandes-details.component.html',
  styleUrls: ['./demandes-details.component.less'],
})
export class demandesDetailsComponent extends baseComponent implements OnInit {
  private demande: any = null;
  private loading: boolean = true;
  private demandeId: any;
  private ROLE_DELETE: boolean = false;
  private listOfEtat = [{ id: 1, label: 'En attent' }, { id: 2, label: 'En cours' }, { id: 3, label: 'Accepté' }, { id: 4, label: 'Réfuser' }, { id: 5, label: 'Livré' }]
  constructor(
    private fb: FormBuilder,
    private router: Router,
    protected settings: SettingsService,
    private stockService: StockService,
    private demandeService: DemandeService,
    private modalService: NzModalService,
    private route: ActivatedRoute,
    private clientServices: clientService,
    private commercialService: CommercialService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.ROLE_DELETE = this.hasPermission('delete_facture');
  }

  ngOnInit(): void {
    this.demandeId = this.route.snapshot.paramMap.get('id');
    this.getDemandeById(this.demandeId);

  }


  public getDemandeById(demandeId: number) {
    this.loading = true;
    this.demandeService.getDemandeById(demandeId).subscribe(
      (response: any) => {
        this.demande = response.data;
        this.demande =
        {
          id: 1,
          client: { name: 'Ossama Attalib', telephone: '06 36 45 32 30', addresse: 'Rabat ' },
          date_demande: '12/02/2020 17:00',
          created_at: '05/02/2020 17:00:00',
          etat: { id: 1, label: 'En attent', color: 'orange' },
          montant: 1700.56,
          lignes_demande: [
            {
              article: {
                id: 1,
                designation: "Filtre B.V. Golf 5-6-7-Tiguan",
                marque: { id: 3, label: "Ajsparts" },
                prix_vente: 190,
                quantite: 15,
                reference: "FSF-AU-012",
                sous_famille: { id: 9, label: "Filtre b.v", famille: { id: 4, label: "transmission" } }
              },
              prix_demande: 190,
              quantite: 2,
            },
            {
              article: {
                id: 2,
                designation: "Support cardan Touareg",
                marque: { id: 3, label: "Ajsparts" },
                prix_vente: 190,
                quantite: 15,
                reference: "FSF-AU-012",
                sous_famille: { id: 9, label: "Filtre b.v", famille: { id: 4, label: "transmission" } }
              },
              prix_demande: 1200.33,
              quantite: 1,
            },
            {
              article: {
                id: 3,
                designation: "Support cardan Q5 3.0 TDI",
                marque: { id: 3, label: "Ajsparts" },
                prix_vente: 190,
                quantite: 15,
                reference: "FSF-AU-012",
                sous_famille: { id: 9, label: "Filtre b.v", famille: { id: 4, label: "transmission" } }
              },
              prix_demande: 250.55,
              quantite: 3,
            }
          ]
        }
      },
      (error) => {
        this.loading = false;
      },
    );
  }




}
