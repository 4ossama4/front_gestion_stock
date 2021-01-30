import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class StockService {
  constructor(private http: HttpClient) {}

  public getStocks() {
    return this.http.get(environment.apiUrl + `/articles`);
  }

  public getStocksByCriteria(articleCriteria: any) {
    return this.http.post(environment.apiUrl + `/articlebycriteria`, articleCriteria);
  }

  public getStockById(stockId: number) {
    return this.http.get(environment.apiUrl + `/articles/${stockId}`);
  }

  public store(stock: any) {
    return this.http.post(environment.apiUrl + `/articles`, stock);
  }

  public update(stock: any) {
    return this.http.put(environment.apiUrl + `/articles/${stock.id}`, stock);
  }

  public delete(stockId: number) {
    return this.http.delete(environment.apiUrl + `/articles/` + stockId);
  }

  //____________Famille__________________
  public storeFamille(famille: any) {
    return this.http.post(environment.apiUrl + `/familles`, famille);
  }

  public getFamilles() {
    return this.http.get(environment.apiUrl + `/familles`);
  }

  public updateFamille(famille: any) {
    return this.http.put(environment.apiUrl + `/familles/${famille.id}`, famille);
  }

  public deleteFamille(id: number) {
    return this.http.delete(environment.apiUrl + `/familles/` + id);
  }

  //____________Sous Famille__________________

  public storeSousFamille(sousfamille: any) {
    return this.http.post(environment.apiUrl + `/sfamilles`, sousfamille);
  }

  public getAllSousFamilles() {
    return this.http.get(environment.apiUrl + `/sfamilles`);
  }

  public getSousFamilles(idFamille: number) {
    return this.http.get(environment.apiUrl + `/familles/${idFamille}`);
  }

  public updateSousFamille(famille: any) {
    return this.http.put(environment.apiUrl + `/sfamilles/${famille.id}`, famille);
  }

  public deleteSousFamille(id: number) {
    return this.http.delete(environment.apiUrl + `/sfamilles/` + id);
  }

  //____________Marque__________________

  public storeMarque(marque: any) {
    return this.http.post(environment.apiUrl + `/marques`, marque);
  }

  public updateMarque(marque: any) {
    return this.http.put(environment.apiUrl + `/marques/${marque.id}`, marque);
  }

  public getMarques() {
    return this.http.get(environment.apiUrl + `/marques`);
  }

  public deleteMarque(id: number) {
    return this.http.delete(environment.apiUrl + `/marques/` + id);
  }

  //____________Reference__________________

  public storeReference(ref: any) {
    return this.http.post(environment.apiUrl + `/references`, ref);
  }

  public updateReference(ref: any) {
    return this.http.put(environment.apiUrl + `/references/${ref.id}`, ref);
  }

  public getReferences() {
    return this.http.get(environment.apiUrl + `/references`);
  }

  public deleteReference(id: number) {
    return this.http.delete(environment.apiUrl + `/references/` + id);
  }

  //____________Tva__________________

  public storeTva(tva: any) {
    return this.http.post(environment.apiUrl + `/tva`, tva);
  }

  public getTvas() {
    return this.http.get(environment.apiUrl + `/tva`);
  }

  public getOutStocksByCriteria(articleCriteria: any) {
    return this.http.post(environment.apiUrl + `/out_of_stock`, articleCriteria);
  }

  public exportData(data: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    return this.http.post(environment.apiUrl + `/exportData`, data, httpOptions);
  }

  public getHistoryArticle(data: any) {
    return this.http.post(environment.apiUrl + `/article_history`, data);
  }

  public chercheRefOriginal(name: any) {
    return this.http.post(environment.apiUrl + `/likeRefOriginal`, { label: name });
  }

  //_____villes

  public getVilles() {
    return this.http.get(environment.apiUrl + `/villes`);
  }

  public storeVille(ville: any) {
    return this.http.post(environment.apiUrl + `/villes`, ville);
  }

  public deleteVille(id: number) {
    return this.http.delete(environment.apiUrl + `/villes/` + id);
  }

  public updateVille(ville: any) {
    return this.http.put(environment.apiUrl + `/villes/${ville.id}`, ville);
  }

  //mode
  public getPaymentsMode() {
    return this.http.get(environment.apiUrl + `/payments_mode`);
  }

  public storeMode(mode: any) {
    return this.http.post(environment.apiUrl + `/payments_mode`, mode);
  }

  public deleteModeP(id: number) {
    return this.http.delete(environment.apiUrl + `/payments_mode/` + id);
  }

  public updateModeP(mode: any) {
    return this.http.put(environment.apiUrl + `/payments_mode/${mode.id}`, mode);
  }

  //natures
  public getNatures() {
    return this.http.get(environment.apiUrl + `/naturedepenses`);
  }

  public storeNature(nature: any) {
    return this.http.post(environment.apiUrl + `/naturedepenses`, nature);
  }

  public deleteNature(id: number) {
    return this.http.delete(environment.apiUrl + `/naturedepenses/` + id);
  }

  public updateNature(nature: any) {
    return this.http.put(environment.apiUrl + `/naturedepenses/${nature.id}`, nature);
  }

  //mode exp
  public getModeExp() {
    return this.http.get(environment.apiUrl + `/mode_exp`);
  }

  public storeModeExp(mode: any) {
    return this.http.post(environment.apiUrl + `/mode_exp`, mode);
  }

  public deleteModeExp(id: number) {
    return this.http.delete(environment.apiUrl + `/mode_exp/` + id);
  }

  public updateModExp(mode: any) {
    return this.http.put(environment.apiUrl + `/mode_exp/${mode.id}`, mode);
  }
}
