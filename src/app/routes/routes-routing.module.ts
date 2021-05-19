import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimpleGuard } from '@delon/auth';
import { environment } from '@env/environment';
// layout
import { LayoutDefaultComponent } from '../layout/default/default.component';
import { LayoutFullScreenComponent } from '../layout/fullscreen/fullscreen.component';
import { LayoutPassportComponent } from '../layout/passport/passport.component';
// single pages
import { CallbackComponent } from './callback/callback.component';
// dashboard pages
import { DashboardV1Component } from './dashboard/v1/v1.component';
import { UserLockComponent } from './passport/lock/lock.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';
import { UserRegisterComponent } from './passport/register/register.component';

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

import { outOfStockComponent } from './out-of-stock/out-of-stock.component';
import { encaissementComponent } from './encaissements/encaissements.component';
import { reglementsComponent } from './reglements/reglements.component';
import { avoirListeComponent } from './avoirs/avoirs-liste/avoirs-liste.component';
import { avoirAddComponent } from './avoirs/avoir-add/avoir-add.component';
import { avoirEditComponent } from './avoirs/avoir-edit/avoir-edit.component';
import { depensesComponent } from './depenses/depenses.component';
import { facturesListComponent } from './factures/factures-list/factures-list.component';
import { permissionsComponent } from './roles/roles-list/roles-list.component';
import { RoleAddComponent } from './roles/role-add/role-add.component';
import { RoleViewComponent } from './roles/role-view/role-view.component';
import { RoleUpdateComponent } from './roles/role-update/role-update.component';
import { usersComponent } from './users/users.component';
import { devisListComponent } from './devis/devis-list/devis-list.component';
import { devisAddComponent } from './devis/devis-add/devis-add.component';
import { reglementsFournisseurComponent } from './reglements-fournisseur/reglements-fournisseur.component';
import { devisViewComponent } from './devis/devis-view/devis-view.component';
import { devisEditComponent } from './devis/devis-edit/devis-edit.component';
import { referencielsComponent } from './referenciels/referenciels.component';
import { demandesListComponent } from './demandes/demandes-list/demandes-list.component';
import { demandesDetailsComponent } from './demandes/demandes-details/demandes-details.component';
import { configurationComponent } from './configuration/configuration.component';
import { facturesEditComponent } from './factures/facture-edit/facture-edit.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutDefaultComponent,
    canActivate: [SimpleGuard],
    canActivateChild: [SimpleGuard],
    children: [
      { path: '', redirectTo: 'stock', pathMatch: 'full' },
      { path: 'dashboard', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardV1Component },
      { path: 'stock', component: StockComponent },
      { path: 'fournisseurs', component: fournisseurComponent },
      { path: 'clients', component: clientComponent },
      { path: 'users', component: usersComponent },
      { path: 'configuration', component: configurationComponent },

      { path: 'encaissements', component: encaissementComponent },
      { path: 'reglements-fournisseurs', component: reglementsFournisseurComponent },
      { path: 'referenciels', component: referencielsComponent },

      { path: 'reglements', component: reglementsComponent },
      { path: 'depenses', component: depensesComponent },

      { path: 'commerciaux', component: commercialComponent },
      {
        path: 'achats',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: achatsListComponent },
          { path: 'add', component: achatsAddComponent },
          { path: 'view/:id', component: achatsViewComponent },
          { path: 'edit/:id', component: achatsEditComponent },
        ],
      },
      {
        path: 'ventes',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: venteListComponent },
          { path: 'add', component: venteAddComponent },
          { path: 'view/:id', component: venteViewComponent },
          { path: 'edit/:id', component: venteEditComponent },
        ],
      },
      {
        path: 'demandes',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: demandesListComponent },
          { path: 'view/:id', component: demandesDetailsComponent },
        ],
      },

      {
        path: 'devis',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: devisListComponent },
          { path: 'add', component: devisAddComponent },
          { path: 'view/:id', component: devisViewComponent },
          { path: 'edit/:id', component: devisEditComponent },
        ],
      },
      {
        path: 'factures',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: facturesListComponent },
          { path: 'edit/:id', component: facturesEditComponent },
        ],
      },
      {
        path: 'avoirs',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: avoirListeComponent },
          { path: 'add', component: avoirAddComponent },
          // { path: 'view/:id', component: avoirEditComponent },
          { path: 'edit/:id', component: avoirEditComponent },
        ],
      },
      { path: 'outofstock/list', component: outOfStockComponent },

      {
        path: 'roles',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: permissionsComponent },
          { path: 'add', component: RoleAddComponent },
          { path: 'view/:id', component: RoleViewComponent },
          { path: 'edit/:id', component: RoleUpdateComponent },
        ],
      },

      // Exception
    ],
  },
  // 全屏布局

  // passport
  {
    path: 'passport',
    component: LayoutPassportComponent,
    children: [
      {
        path: 'login',
        component: UserLoginComponent,
        data: { title: '登录', titleI18n: 'app.login.login' },
      },
      {
        path: 'register',
        component: UserRegisterComponent,
        data: { title: '注册', titleI18n: 'app.register.register' },
      },
      {
        path: 'register-result',
        component: UserRegisterResultComponent,
        data: { title: '注册结果', titleI18n: 'app.register.register' },
      },
      {
        path: 'lock',
        component: UserLockComponent,
        data: { title: '锁屏', titleI18n: 'app.lock' },
      },
    ],
  },
  // 单页不包裹Layout
  { path: 'callback/:type', component: CallbackComponent },
  { path: '**', redirectTo: 'exception/404' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
      // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
      // Pls refer to https://ng-alain.com/components/reuse-tab
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class RouteRoutingModule { }
