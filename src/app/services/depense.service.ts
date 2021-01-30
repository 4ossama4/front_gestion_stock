import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class depenseService {
  constructor(private http: HttpClient) {}

  public getDepenses() {
    return this.http.get(environment.apiUrl + `/depenses`);
  }

  public getDepensesByCriteria(depensesbycriteria: any) {
    return this.http.post(environment.apiUrl + `/depenseycriteria`, depensesbycriteria);
  }

  public getDepenseById(DepenseId: number) {
    return this.http.get(environment.apiUrl + `/depenses/${DepenseId}`);
  }

  public store(Depense: any) {
    return this.http.post(environment.apiUrl + `/depenses`, Depense);
  }

  public update(Depense: any) {
    return this.http.put(environment.apiUrl + `/depenses/${Depense.id}`, Depense);
  }

  public delete(DepenseId: number) {
    return this.http.delete(environment.apiUrl + `/depenses/` + DepenseId);
  }

  public getNatures() {
    return this.http.get(environment.apiUrl + `/naturedepenses`);
  }

  public storeNature(nature: any) {
    return this.http.post(environment.apiUrl + `/naturedepenses`, nature);
  }
}
