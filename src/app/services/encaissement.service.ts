import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class encaissementService {
  constructor(private http: HttpClient) {}

  public getEncaissements() {
    return this.http.get(environment.apiUrl + `/encaissements`);
  }

  public getEncaissementsByCriteria(encaissementbycriteria: any) {
    return this.http.post(environment.apiUrl + `/encaissementbycriteria`, encaissementbycriteria);
  }

  public getEncaissementById(EncaissementId: number) {
    return this.http.get(environment.apiUrl + `/encaissements/${EncaissementId}`);
  }

  public store(Encaissement: any) {
    return this.http.post(environment.apiUrl + `/encaissements`, Encaissement);
  }

  public update(Encaissement: any) {
    return this.http.put(environment.apiUrl + `/encaissements/${Encaissement.id}`, Encaissement);
  }

  public delete(EncaissementId: number) {
    return this.http.delete(environment.apiUrl + `/encaissements/` + EncaissementId);
  }
}
