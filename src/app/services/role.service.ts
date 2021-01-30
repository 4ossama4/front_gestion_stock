import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class roleService {
  constructor(private http: HttpClient) {}

  public getRoles() {
    return this.http.get(environment.apiUrl + `/roles`);
  }

  public getRolesByCriteria(rolesbycriteria: any) {
    return this.http.post(environment.apiUrl + `/rolesycriteria`, rolesbycriteria);
  }

  public getRoleById(roleId: number) {
    return this.http.get(environment.apiUrl + `/roles/${roleId}`);
  }

  public getRoleById2(roleId: number) {
    return this.http.get(environment.apiUrl + `/role_by_id/${roleId}`);
  }

  public store(role: any) {
    return this.http.post(environment.apiUrl + `/roles`, role);
  }

  public update(role: any) {
    return this.http.put(environment.apiUrl + `/roles/${role.id}`, role);
  }

  public delete(roleId: number) {
    return this.http.delete(environment.apiUrl + `/roles/` + roleId);
  }

  public getPermissions() {
    return this.http.get(environment.apiUrl + `/permissionbycat`);
  }
}
