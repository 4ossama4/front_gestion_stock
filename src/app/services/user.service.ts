import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class usersService {
  constructor(private http: HttpClient) {}

  public getUsers() {
    return this.http.get(environment.apiUrl + `/users`);
  }

  public getUsersByCriteria(userCriteria: any) {
    return this.http.post(environment.apiUrl + `/usersbycriteria`, userCriteria);
  }

  public getUserById(userId: number) {
    return this.http.get(environment.apiUrl + `/users/${userId}`);
  }

  public store(user: any) {
    return this.http.post(environment.apiUrl + `/users`, user);
  }

  public update(user: any) {
    return this.http.put(environment.apiUrl + `/users/${user.id}`, user);
  }

  public delete(userId: number) {
    return this.http.delete(environment.apiUrl + `/users/` + userId);
  }

  public getRoles() {
    return this.http.get(environment.apiUrl + `/roles`);
  }

  public findData(data: any) {
    return this.http.post(environment.apiUrl + `/find_data`, data);
  }

  public changePassword(data: any) {
    return this.http.post(environment.apiUrl + `/change_password`, data);
  }

  public logout() {
    return this.http.post(environment.apiUrl + `/logout`, null);
  }
}
