import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class AchatsService {
  constructor(private http: HttpClient) {}

  public getAchats() {
    return this.http.get(environment.apiUrl + `/achats`);
  }

  public getAchatsByCriteria(achatCriteria: any) {
    return this.http.post(environment.apiUrl + `/achatsbycriteria`, achatCriteria);
  }

  // public getFournisseursByCriteria(articleCriteria: any) {
  //   return this.http.post(environment.apiUrl + `/fournisseurbycriteria`, articleCriteria);
  // }

  public getAchatById(achatId: number) {
    return this.http.get(environment.apiUrl + `/achats/${achatId}`);
  }

  public store(achat: any) {
    return this.http.post(environment.apiUrl + `/achats`, achat);
  }

  public update(achat: any) {
    return this.http.put(environment.apiUrl + `/achats/${achat.id}`, achat);
  }

  public print(achat: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };

    return this.http.post(environment.apiUrl + `/print_achat`, { id: achat.id }, httpOptions);
  }

  public delete(achatId: number) {
    return this.http.delete(environment.apiUrl + `/achats/` + achatId);
  }

  public getPaymentsMode() {
    return this.http.get(environment.apiUrl + `/payments_mode`);
  }
  public storeMode(mode: any) {
    return this.http.post(environment.apiUrl + `/payments_mode`, mode);
  }
}
