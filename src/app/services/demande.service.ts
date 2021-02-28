import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class DemandeService {
  constructor(private http: HttpClient) { }

  public getDemandes() {
    return this.http.get(environment.apiUrl + `/demandes`);
  }

  public getDemandeById(DepenseId: number) {
    return this.http.get(environment.apiUrl + `/depenses/${DepenseId}`);
  }


  public getDemandesByCriteria(demandeCriteria: any) {
    return this.http.post(environment.apiUrl + `/facturesbycriteria`, demandeCriteria);
  }

  public demandeFileById(demande: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };

    return this.http.post(environment.apiUrl + `/getdemandeFileById`, { id: demande.id }, httpOptions);
  }

  public delete(demandeId: number) {
    return this.http.delete(environment.apiUrl + `/demandes/` + demandeId);
  }
}
