import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class DevisService {
  constructor(private http: HttpClient) {}

  public getDevis() {
    return this.http.get(environment.apiUrl + `/devis`);
  }

  public getDevisByCriteria(devisCriteria: any) {
    return this.http.post(environment.apiUrl + `/devisbycriteria`, devisCriteria);
  }

  public getDevisById(devisId: number) {
    return this.http.get(environment.apiUrl + `/devis/${devisId}`);
  }

  public store(devis: any) {
    return this.http.post(environment.apiUrl + `/devis`, devis);
  }

  public update(devis: any) {
    return this.http.put(environment.apiUrl + `/devis/${devis.id}`, devis);
  }

  public delete(devisId: number) {
    return this.http.delete(environment.apiUrl + `/devis/` + devisId);
  }

  public getReferenceDevis(data: any) {
    return this.http.post(environment.apiUrl + `/devis_cy_count`, { year: data });
  }

  public getModeExp() {
    return this.http.get(environment.apiUrl + `/mode_exp`);
  }

  public storeModeExp(mode: any) {
    return this.http.post(environment.apiUrl + `/mode_exp`, mode);
  }

  public getPaymentsMode() {
    return this.http.get(environment.apiUrl + `/payments_mode`);
  }

  public storeMode(mode: any) {
    return this.http.post(environment.apiUrl + `/payments_mode`, mode);
  }

  public print(devis: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };

    return this.http.post(environment.apiUrl + `/print_devis`, { id: devis.id }, httpOptions);
  }
}
