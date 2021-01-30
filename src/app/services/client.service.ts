import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class clientService {
  constructor(private http: HttpClient) {}

  public getClients() {
    return this.http.get(environment.apiUrl + `/clients`);
  }

  public getClientsByCriteria(clientCriteria: any) {
    return this.http.post(environment.apiUrl + `/clientbycriteria`, clientCriteria);
  }

  public getClientById(clientId: number) {
    return this.http.get(environment.apiUrl + `/clients/${clientId}`);
  }

  public store(client: any) {
    return this.http.post(environment.apiUrl + `/clients`, client);
  }

  public update(client: any) {
    return this.http.put(environment.apiUrl + `/clients/${client.id}`, client);
  }

  public delete(clientId: number) {
    return this.http.delete(environment.apiUrl + `/clients/` + clientId);
  }

  public getVilles() {
    return this.http.get(environment.apiUrl + `/villes`);
  }

  public storeVille(ville: any) {
    return this.http.post(environment.apiUrl + `/villes`, ville);
  }

  public releveClient(data: any) {
    return this.http.post(environment.apiUrl + `/releve_client`, data);
  }

  public imprimerReleveClient(data: any) {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    return this.http.post(environment.apiUrl + `/print_releve_client`, data, httpOptions);
  }
}
