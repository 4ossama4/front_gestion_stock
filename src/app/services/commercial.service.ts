import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class CommercialService {
  constructor(private http: HttpClient) {}

  public getCommerciaux() {
    return this.http.get(environment.apiUrl + `/commerciaux`);
  }

  public getCommerciauxByCriteria(CommerciauxCriteria: any) {
    return this.http.post(environment.apiUrl + `/commerciauxbycriteria`, CommerciauxCriteria);
  }

  public getCommercialById(CommercialId: number) {
    return this.http.get(environment.apiUrl + `/commerciaux/${CommercialId}`);
  }

  public store(Commercial: any) {
    return this.http.post(environment.apiUrl + `/commerciaux`, Commercial);
  }

  public update(Commercial: any) {
    return this.http.put(environment.apiUrl + `/commerciaux/${Commercial.id}`, Commercial);
  }

  public delete(CommercialId: number) {
    return this.http.delete(environment.apiUrl + `/commerciaux/` + CommercialId);
  }

  public getVilles() {
    return this.http.get(environment.apiUrl + `/villes`);
  }
  public storeVille(ville: any) {
    return this.http.post(environment.apiUrl + `/villes`, ville);
  }

  public releveCommercial(data: any) {
    return this.http.post(environment.apiUrl + `/releve_commercial`, data);
  }

  public imprimerReleveCommercial(data: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    return this.http.post(environment.apiUrl + `/print_releve_commercial`, data, httpOptions);

    // return this.http.post(environment.apiUrl + `/print_releve_commercial`, data);
  }
}
