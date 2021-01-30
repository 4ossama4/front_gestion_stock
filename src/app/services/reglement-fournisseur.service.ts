import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class reglemntFournissuerService {
  constructor(private http: HttpClient) {}

  public getReglements() {
    return this.http.get(environment.apiUrl + `/freglements`);
  }

  public getReglementByCriteria(reglementbycriteria: any) {
    return this.http.post(environment.apiUrl + `/freglementsbycriteria`, reglementbycriteria);
  }

  public getReglementById(ReglementId: number) {
    return this.http.get(environment.apiUrl + `/freglements/${ReglementId}`);
  }

  public store(Reglement: any) {
    return this.http.post(environment.apiUrl + `/freglements`, Reglement);
  }

  public update(Reglement: any) {
    return this.http.put(environment.apiUrl + `/freglements/${Reglement.id}`, Reglement);
  }

  public delete(ReglementId: number) {
    return this.http.delete(environment.apiUrl + `/freglements/` + ReglementId);
  }
}
