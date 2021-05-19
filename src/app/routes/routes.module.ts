import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { CallbackComponent } from './callback/callback.component';
// dashboard pages
import { DashboardV1Component } from './dashboard/v1/v1.component';
// single pages
import { UserLockComponent } from './passport/lock/lock.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';
import { UserRegisterComponent } from './passport/register/register.component';
import { RouteRoutingModule } from './routes-routing.module';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

//components
import { StockComponent } from './stock/stock.component';
import { fournisseurComponent } from './fournisseurs/fournisseurs.component';
import { clientComponent } from './clients/clients.component';
import { commercialComponent } from './commerciaux/commerciaux.component';

import { achatsListComponent } from './ashats/achats-list/achats-list.component';
import { achatsAddComponent } from './ashats/achats-add/achats-add.component';
import { achatsViewComponent } from './ashats/achats-view/achats-view.component';
import { achatsEditComponent } from './ashats/achats-edit/achats-edit.component';

import { venteListComponent } from './ventes/vente-list/ventes-list.component';
import { venteAddComponent } from './ventes/vente-add/vente-add.component';
import { venteViewComponent } from './ventes/vente-view/vente-view.component';
import { venteEditComponent } from './ventes/vente-edit/vente-edit.component';

import { devisListComponent } from './devis/devis-list/devis-list.component';

import { avoirAddComponent } from './avoirs/avoir-add/avoir-add.component';
import { avoirEditComponent } from './avoirs/avoir-edit/avoir-edit.component';
import { avoirListeComponent } from './avoirs/avoirs-liste/avoirs-liste.component';

import { permissionsComponent } from './roles/roles-list/roles-list.component';
import { RoleAddComponent } from './roles/role-add/role-add.component';
import { RoleViewComponent } from './roles/role-view/role-view.component';

import { outOfStockComponent } from './out-of-stock/out-of-stock.component';
import { configurationComponent } from './configuration/configuration.component';

// servies
import { NotificationService } from '../services/notification.service';
import { StockService } from '../services/stock.service';
import { FournisseurService } from '../services/fournisseur.service';
import { clientService } from '../services/client.service';
import { AchatsService } from '../services/achat.service';
import { CommercialService } from '../services/commercial.service';
import { VentesService } from '../services/vente.service';
import { NzResultModule } from 'ng-zorro-antd/result';
import { encaissementService } from '../services/encaissement.service';

// pipe ___________
import { PriceFormat } from '../pipe/price-format.pipe';
import { encaissementComponent } from './encaissements/encaissements.component';
import { reglementsComponent } from './reglements/reglements.component';
import { reglemntService } from '../services/reglement.service';
import { avoirService } from '../services/avoir.service';
import { depensesComponent } from './depenses/depenses.component';
import { depenseService } from '../services/depense.service';
import { facturesListComponent } from './factures/factures-list/factures-list.component';
import { FactureService } from '../services/facture.service';
import { roleService } from '../services/role.service';
import { RoleUpdateComponent } from './roles/role-update/role-update.component';
import { usersComponent } from './users/users.component';
import { usersService } from '../services/user.service';
import { baseComponent } from './base-component/base-component.component';
import { DevisService } from '../services/devis.service';
import { devisAddComponent } from './devis/devis-add/devis-add.component';
import { reglementsFournisseurComponent } from './reglements-fournisseur/reglements-fournisseur.component';
import { reglemntFournissuerService } from '../services/reglement-fournisseur.service';
import { devisViewComponent } from './devis/devis-view/devis-view.component';
import { devisEditComponent } from './devis/devis-edit/devis-edit.component';
import { referencielsComponent } from './referenciels/referenciels.component';
import { refListComponent } from './referenciels/ref-list/ref-list.component';
import { villesListComponent } from './referenciels/villes-list/villes-list.component';
import { marquesListComponent } from './referenciels/marques-list/marques-list.component';
import { modePaymentsListComponent } from './referenciels/mode-p-list/mode-p.component';
import { naturesListComponent } from './referenciels/natures-list/natures-list.component';
import { expeditionListComponent } from './referenciels/expedition-list/expedition-list.component';
import { famillesListComponent } from './referenciels/familles-list/familles-list.component';
import { sousFamilleListComponent } from './referenciels/sous-famille-list/sous-famille-list.component';
import { demandesListComponent } from './demandes/demandes-list/demandes-list.component';
import { DemandeService } from '../services/demande.service';
import { TimerComponent } from './demandes/timer/timer/timer.component';
import { demandesDetailsComponent } from './demandes/demandes-details/demandes-details.component';
import { facturesEditComponent } from './factures/facture-edit/facture-edit.component';

const COMPONENTS = [
  DashboardV1Component,
  // passport pages
  UserLoginComponent,
  UserRegisterComponent,
  UserRegisterResultComponent,
  // single pages
  UserLockComponent,
  CallbackComponent,
  StockComponent,
  fournisseurComponent,
  clientComponent,
  commercialComponent,

  achatsListComponent,
  achatsAddComponent,
  achatsViewComponent,
  achatsEditComponent,

  venteListComponent,
  venteAddComponent,
  venteViewComponent,
  venteEditComponent,

  outOfStockComponent,
  encaissementComponent,
  reglementsComponent,

  avoirListeComponent,
  avoirAddComponent,
  avoirEditComponent,

  devisListComponent,
  devisAddComponent,
  devisViewComponent,
  devisEditComponent,

  reglementsFournisseurComponent,

  facturesListComponent,
  permissionsComponent,
  RoleAddComponent,
  RoleViewComponent,
  RoleUpdateComponent,

  referencielsComponent,
  refListComponent,
  villesListComponent,
  marquesListComponent,
  modePaymentsListComponent,
  naturesListComponent,
  expeditionListComponent,
  famillesListComponent,
  sousFamilleListComponent,

  demandesListComponent,
  demandesDetailsComponent,
  TimerComponent,

  usersComponent,
  depensesComponent,
  configurationComponent,
  facturesEditComponent,

  baseComponent,
  PriceFormat,
];

@NgModule({
  imports: [SharedModule, RouteRoutingModule, NzTimelineModule, NzEmptyModule, NzResultModule, NzTransferModule, NzStatisticModule],
  declarations: [...COMPONENTS],
  providers: [
    NotificationService,
    StockService,
    FournisseurService,
    clientService,
    AchatsService,
    CommercialService,
    VentesService,
    encaissementService,
    reglemntService,
    avoirService,
    depenseService,
    FactureService,
    roleService,
    usersService,
    DevisService,
    DemandeService,
    reglemntFournissuerService,
  ],
})
export class RoutesModule { }
