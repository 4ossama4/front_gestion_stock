import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class avoirService {
  constructor(private http: HttpClient) {}

  public getAvoirs() {
    return this.http.get(environment.apiUrl + `/avoirs`);
  }

  public getAvoirsByCriteria(avoirsbycriteria: any) {
    return this.http.post(environment.apiUrl + `/avoirsbycriteria`, avoirsbycriteria);
  }

  public getAvoirById(AvoirId: number) {
    return this.http.get(environment.apiUrl + `/avoirs/${AvoirId}`);
  }

  public store(Avoir: any) {
    return this.http.post(environment.apiUrl + `/avoirs`, Avoir);
  }

  public update(Avoir: any) {
    return this.http.put(environment.apiUrl + `/avoirs/${Avoir.id}`, Avoir);
  }

  public delete(AvoirId: number) {
    return this.http.delete(environment.apiUrl + `/avoirs/` + AvoirId);
  }

  public getReferenceAvoir(data: any) {
    return this.http.post(environment.apiUrl + `/avoir_cy_count`, { year: data });
  }

  public print(avoir: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };

    return this.http.post(environment.apiUrl + `/print_avoir`, { id: avoir.id }, httpOptions);
  }
}
