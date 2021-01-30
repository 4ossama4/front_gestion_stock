import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class reglemntService {
  constructor(private http: HttpClient) {}

  public getReglements() {
    return this.http.get(environment.apiUrl + `/reglements`);
  }

  public getReglementByCriteria(reglementbycriteria: any) {
    return this.http.post(environment.apiUrl + `/reglementbycriteria`, reglementbycriteria);
  }

  public getReglementById(ReglementId: number) {
    return this.http.get(environment.apiUrl + `/reglements/${ReglementId}`);
  }

  public store(Reglement: any) {
    return this.http.post(environment.apiUrl + `/reglements`, Reglement);
  }

  public update(Reglement: any) {
    return this.http.put(environment.apiUrl + `/reglements/${Reglement.id}`, Reglement);
  }

  public delete(ReglementId: number) {
    return this.http.delete(environment.apiUrl + `/reglements/` + ReglementId);
  }
}
