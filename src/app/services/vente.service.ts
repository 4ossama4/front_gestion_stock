import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class VentesService {
  constructor(private http: HttpClient) { }

  public getVentes() {
    return this.http.get(environment.apiUrl + `/ventes`);
  }

  public getVentesByCriteria(venteCriteria: any) {
    return this.http.post(environment.apiUrl + `/ventesbycriteria`, venteCriteria);
  }

  public getVenteById(venteId: number) {
    return this.http.get(environment.apiUrl + `/ventes/${venteId}`);
  }

  public store(vente: any) {
    return this.http.post(environment.apiUrl + `/ventes`, vente);
  }

  public update(vente: any) {
    return this.http.put(environment.apiUrl + `/ventes/${vente.id}`, vente);
  }

  public delete(venteId: number) {
    return this.http.delete(environment.apiUrl + `/ventes/` + venteId);
  }

  public getPaymentsMode() {
    return this.http.get(environment.apiUrl + `/payments_mode`);
  }

  public storeMode(mode: any) {
    return this.http.post(environment.apiUrl + `/payments_mode`, mode);
  }

  public getReferenceVente(data: any) {
    return this.http.post(environment.apiUrl + `/bl_cy_count`, { year: data });
  }

  public print(vente: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };

    return this.http.post(environment.apiUrl + `/print_vente`, { id: vente.id }, httpOptions);
  }

  public getModeExp() {
    return this.http.get(environment.apiUrl + `/mode_exp`);
  }

  public storeModeExp(mode: any) {
    return this.http.post(environment.apiUrl + `/mode_exp`, mode);
  }

  public printFacture(vente: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };

    return this.http.post(environment.apiUrl + `/print_vente_facture`, { vente: vente }, httpOptions);
  }

  public bonRamassage(vente: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };

    return this.http.post(environment.apiUrl + `/print_vente_bon_ramassage`, { id: vente.id }, httpOptions);
  }

  public getVenteFactureById(venteId: number) {
    return this.http.get(environment.apiUrl + `/ventes_factures/${venteId}`);
  }

  public getFacturesByVente(venteId: number) {
    return this.http.get(environment.apiUrl + `/factureByVente/${venteId}`);
  }

  public getDashboard() {
    return this.http.get(environment.apiUrl + `/dashboard`);
  }

  public getDashboardByDate(data: any) {
    return this.http.post(environment.apiUrl + `/dashboard`, data);
  }
}
