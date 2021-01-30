import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class FactureService {
  constructor(private http: HttpClient) {}

  public getFactures() {
    return this.http.get(environment.apiUrl + `/factures`);
  }

  public getFacturesByCriteria(factureCriteria: any) {
    return this.http.post(environment.apiUrl + `/facturesbycriteria`, factureCriteria);
  }

  public factureFileById(facture: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };

    return this.http.post(environment.apiUrl + `/getFactureFileById`, { id: facture.id }, httpOptions);
  }

  public delete(factureId: number) {
    return this.http.delete(environment.apiUrl + `/factures/` + factureId);
  }
}
