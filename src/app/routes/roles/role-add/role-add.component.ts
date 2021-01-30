import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { Role } from 'src/app/models/role.model';

@Component({
  selector: 'app-role-add',
  templateUrl: './role-add.component.html',
  styleUrls: ['./role-add.component.less'],
})
export class RoleAddComponent implements OnInit {
  private roleForm: FormGroup = new FormGroup({});
  private listeOfPermission: any[] = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private roleService: roleService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {
    this.createFormRole();
  }

  ngOnInit(): void {
    this.getPermissionsByCategory();
  }

  createFormRole() {
    this.roleForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      label: [null],
      categories: this.fb.array([]),
    });
  }

  public saveRole() {
    for (const i in this.roleForm.controls) {
      this.roleForm.controls[i].markAsDirty();
      this.roleForm.controls[i].updateValueAndValidity();
    }

    if (this.roleForm.valid) {
      const role = new Role();
      role.label = this.roleForm.value.label;
      role.name = this.roleForm.value.name;

      var liste_permissions = [] || null;
      this.roleForm.value.categories.forEach((category: any) => {
        Array.prototype.push.apply(liste_permissions, category.liste_permissions);
      });

      role.liste_permissions = liste_permissions.filter((permission: any) => permission.check == true);

      console.log('role', role);

      this.roleService.store(role).subscribe(
        (response: any) => {
          this.notificationService.createNotification('success', 'Role a été ajouté avec succes', null);
          this.gotoListe();
        },
        (error) => {},
      );
    }
  }

  public getPermissionsByCategory() {
    this.roleService.getPermissions().subscribe(
      (response: any) => {
        this.listeOfPermission = response;
        if (this.listeOfPermission) {
          this.listeOfPermission.forEach((item, index) => {
            this.addCategorie(item[0].category, item);
          });
        }
      },
      (error) => {},
    );
  }

  addCategorie(category?: any, liste_permissions: any[] = []) {
    const control = <FormArray>this.roleForm.get('categories');
    control.push(this.patchValuesCategorie(category, liste_permissions));
  }

  private patchValuesCategorie(category: any, liste_permissions: any[]) {
    return this.fb.group({
      category: [category],
      check: [false],
      liste_permissions: this.fb.array(
        liste_permissions.map((r) => this.fb.group({ id: [r.id], label: [r.label], category_id: [r.category_id], check: [false] })),
      ),
    });
  }

  public checkAllPermissionCategory(check: any, index: number, bool: any) {
    console.log('bool', bool);
    event?.preventDefault();
    // event?.stopPropagation();
    if (index) {
      const category = (<any>this.roleForm.get('categories')).at(index).controls;
      category.liste_permissions.controls.forEach((control: any) => {
        control.patchValue({ check: check ? true : false });
      });
    }
    // --this.count
  }

  public gotoListe() {
    this.router.navigate(['roles/list']);
  }
  private count = 1;
  public checkPermission(indexCat: any, index: number) {
    // if (this.count == 0) {
    //   return
    // }
    // const category = (<any>this.roleForm.get('categories')).at(indexCat);
    // var liste_checked = category.controls.liste_permissions.value.filter((permission: any) => permission.check == true);
    // if (liste_checked.length == category.controls.liste_permissions.value.length) {
    //   category.patchValue({ check: true })
    // } else {
    //   category.patchValue({ check: false })
    // }
  }
}
