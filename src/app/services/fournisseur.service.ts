import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class FournisseurService {
  constructor(private http: HttpClient) {}

  public getFournisseurs() {
    return this.http.get(environment.apiUrl + `/fournisseurs`);
  }

  public getFournisseursByCriteria(articleCriteria: any) {
    return this.http.post(environment.apiUrl + `/fournisseurbycriteria`, articleCriteria);
  }

  public getFournisseurById(fournisseurId: number) {
    return this.http.get(environment.apiUrl + `/fournisseurs/${fournisseurId}`);
  }

  public store(fournisseur: any) {
    return this.http.post(environment.apiUrl + `/fournisseurs`, fournisseur);
  }

  public update(fournisseur: any) {
    return this.http.put(environment.apiUrl + `/fournisseurs/${fournisseur.id}`, fournisseur);
  }

  public delete(fournisseurId: number) {
    return this.http.delete(environment.apiUrl + `/fournisseurs/` + fournisseurId);
  }

  public releveFournisseur(data: any) {
    return this.http.post(environment.apiUrl + `/releve_fournisseur`, data);
  }

  public imprimerReleveFournisseur(data: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    return this.http.post(environment.apiUrl + `/print_releve_fournisseur`, data, httpOptions);
  }
}
