import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';
import { roleService } from '../../../services/role.service';

// _____________models____________
import { articleCriteria } from '../../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { RoleCriteria } from 'src/app/models/role.criteria';
import { CommercialService } from 'src/app/services/commercial.service';
import { VentesService } from 'src/app/services/vente.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.less'],
})
export class permissionsComponent implements OnInit {
  private loading: boolean = true;

  private totalRole: number = 0;
  private firstRole: number = 0;
  private maxResults: number = 10;
  private isUpdate: boolean = false;
  private roleCriteria: RoleCriteria = new RoleCriteria();

  private listOfRoles: any[] = [];

  private from: number = 0;
  private to: number = 0;
  private filterApplyList: any[] = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private roleService: roleService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    // this.getRolesByCriteria();
  }

  public getRoles() {
    this.loading = true;
    this.roleService.getRoles().subscribe(
      (response: any) => {
        this.listOfRoles = response;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public deleteRole(role: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer ce role',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(role),
    });
  }

  public confirmationDelete(role: number) {
    this.roleService.delete(role).subscribe(
      (response) => {
        this.getRolesByCriteria();
        this.notificationService.createNotification('success', 'Role a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  nzCompareSelectedByID(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id == o2.id : o1 == o2;
  }

  public deleteFilter(index: any, filter: any) {
    this.resetSearch(filter.type);
  }

  public deleteAllfilter() {
    this.roleCriteria = new RoleCriteria();
    this.filterApplyList = [];
    this.getRolesByCriteria();
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'labelLike':
        this.roleCriteria.labelLike = null;
        break;
      default:
        break;
    }
    const found = this.filterApplyList.find((item) => item.type == filter);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      this.filterApplyList.splice(index, 1);
    }
    this.getRolesByCriteria();
  }

  public getRolesByCriteria() {
    this.loading = true;
    this.roleService.getRolesByCriteria(this.roleCriteria).subscribe(
      (response: any) => {
        this.listOfRoles = response.data;
        this.totalRole = response.total;
        this.from = response.from;
        this.to = response.to;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public sort(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    if (params.pageIndex) {
      this.roleCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.roleCriteria.sortField = currentSort.key;
      this.roleCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.roleCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getRolesByCriteria();
    }
  }

  public search(label: string, value: any, color: any, type: any) {
    const found = this.filterApplyList.find((item) => item.type == type);
    if (found) {
      const index = this.filterApplyList.indexOf(found);
      if (label == 'Date') {
        var date1 = new Date(value[0]).toLocaleString('fr-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        var date2 = new Date(value[1]).toLocaleString('fr-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        this.filterApplyList[index] = { label: label, value: '< ' + date1 + ' , ' + date2 + ' >', color: color, type: type };
      } else {
        this.filterApplyList[index] = { label: label, value: value, color: color, type: type };
      }
    } else {
      console.log('label', label);
      if (label == 'Date') {
        var date1 = new Date(value[0]).toLocaleString('fr-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        var date2 = new Date(value[1]).toLocaleString('fr-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

        this.filterApplyList.push({ label: label, value: '< ' + date1 + ' , ' + date2 + ' >', color: color, type: type });
      } else {
        this.filterApplyList.push({ label: label, value: value, color: color, type: type });
      }
    }
    console.log(' this.filterApplyList.', this.filterApplyList);
  }

  public searchNMode() {
    if (this.roleCriteria.labelLike) {
      this.search('Nom', this.roleCriteria.labelLike, 'purple', 'labelLike');
    }
    this.getRolesByCriteria();
  }

  addRole() {
    this.router.navigate(['roles/add']);
  }

  goToView(item: any) {
    this.router.navigate(['roles/view/' + item.id]);
  }

  editRole(item: any) {
    this.router.navigate(['roles/edit/' + item.id]);
  }
}
