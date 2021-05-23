import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../services/notification.service';
import { usersService } from '../../services/user.service';

// _____________models____________
import { articleCriteria } from '../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { userCriteria } from 'src/app/models/user.criteria';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.less'],
})
export class usersComponent implements OnInit {
  private userForm: FormGroup = new FormGroup({});
  private loading: boolean = true;
  private releverForm: FormGroup = new FormGroup({});
  private userPasswordForm: FormGroup = new FormGroup({});
  private userModal: boolean = false;
  private totalUsers: number = 0;
  private firstUser: number = 0;
  private maxResults: number = 10;
  private isUpdate: boolean = false;
  private userCriteria: userCriteria = new userCriteria();

  private listOfUsers: any[] = [];
  private listOfRoles: any[] = [];
  private showPassword: boolean = false;
  private find_user_name: boolean = false;
  private userSelected: any;
  constructor(
    private fb: FormBuilder,
    private userService: usersService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {
    this.createFormUser();
    this.createFormPassUser();
  }

  ngOnInit(): void {
    this.getRoles();
    // this.getUtilisateursByCriteria();
  }

  public createFormUser() {
    this.userForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      last_name: [null, [Validators.required]],
      first_name: [null, [Validators.required]],
      telephone: [null],
      cin: [null],
      fixe: [null],
      email: [null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      addresse: [null],
      role_id: [null, [Validators.required]],
      password: [null, [Validators.required]],
      password_confirmation: [null, [Validators.required, this.confirmationValidator]],
      actif: [true],
    });
  }
  showPasswordOld = false;
  public createFormPassUser() {
    this.userPasswordForm = this.fb.group({
      id: [null],
      old_password: [null, [Validators.required]],
      password: [null, [Validators.required]],
      password_confirmation: [null, [Validators.required, this.confirmationValidatorPass]],
    });
  }

  public getUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe(
      (response: any) => {
        this.listOfUsers = response;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public deleteUser(user: number) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer cette utilisateur',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(user),
    });
  }

  public confirmationDelete(user: number) {
    this.userService.delete(user).subscribe(
      (response) => {
        this.getUtilisateursByCriteria();
        this.notificationService.createNotification('success', 'Utilisateur a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  public closeModalAdd() {
    this.userForm.reset();
    this.userModal = false;
  }

  public openModalAdd() {
    this.userModal = true;
    this.isUpdate = false;
    this.userSelected = null;
  }

  public saveUser() {
    if (this.isUpdate) {
      this.userForm.controls.password.setValidators([]);
      this.userForm.controls.password.updateValueAndValidity();
      this.userForm.controls.password_confirmation.setValidators([]);
      this.userForm.controls.password_confirmation.updateValueAndValidity();
    }
    for (const i in this.userForm.controls) {
      this.userForm.controls[i].markAsDirty();
      this.userForm.controls[i].updateValueAndValidity();
    }

    if (this.userForm.valid) {
      if (
        this.isUpdate &&
        ((this.find_user_name && this.userSelected.name.toLowerCase() == this.userForm.value.name.toLowerCase()) || !this.find_user_name)
      ) {
        this.userService.update(this.userForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Utilisateur a été modifié avec succes', null);
            this.getUtilisateursByCriteria();
          },
          (error) => { },
        );
      } else if (!this.isUpdate && !this.find_user_name) {
        this.userService.store(this.userForm.value).subscribe(
          (reponse) => {
            this.closeModalAdd();
            this.notificationService.createNotification('success', 'Utilisateur a été ajouté avec succes', null);
            this.getUtilisateursByCriteria();
          },
          (error) => { },
        );
      }
    }
  }

  public openModalUpdate(user: any) {
    this.isUpdate = true;
    this.userForm.patchValue(user);
    this.userSelected = user;
    this.userForm.patchValue({ last_name: user.nom, first_name: user.prenom });
    this.userModal = true;
  }

  public resetSearch(filter: string) {
    switch (filter) {
      case 'nameLike':
        this.userCriteria.nameLike = null;
        break;
      case 'telephoneLike':
        this.userCriteria.telephoneLike = null;
        break;
      case 'fixeLike':
        this.userCriteria.fixeLike = null;
        break;
      default:
        break;
    }
    this.getUtilisateursByCriteria();
  }

  public getUtilisateursByCriteria() {
    this.loading = true;
    this.userService.getUsersByCriteria(this.userCriteria).subscribe(
      (response: any) => {
        this.listOfUsers = response.data;
        this.totalUsers = response.total;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  public getRoles() {
    this.userService.getRoles().subscribe(
      (response: any) => {
        this.listOfRoles = response;
      },
      (error) => { },
    );
  }

  public sort(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    console.log('params', params);
    const currentSort = sort.find((item) => item.value !== null);
    if (params.pageIndex) {
      this.userCriteria.page = params.pageIndex;
    }
    if (currentSort) {
      this.userCriteria.sortField = currentSort.key;
      this.userCriteria.sortOrder = currentSort.value == 'ascend' ? 'asc' : 'desc';
    }

    if (params.pageSize) {
      this.userCriteria.maxResults = params.pageSize;
    }

    if (params.pageIndex || currentSort || params.pageSize) {
      this.getUtilisateursByCriteria();
    }
  }

  public search() {
    this.getUtilisateursByCriteria();
  }

  public findUser($event: any) {
    if ($event.target.value && $event.target.value.length > 0) {
      this.userService.findData({ type: 'username', entry: $event.target.value.replace(/\s/g, '').toLowerCase() }).subscribe(
        (response: any) => {
          console.log('dd', response);
          this.find_user_name = response.find;
        },
        (error) => { },
      );
    }
    console.log('dd', $event.target.value);
  }

  updateConfirmValidator(): void {
    Promise.resolve().then(() => this.userForm.controls.password_confirmation.updateValueAndValidity());
  }

  updateConfirmValidatorPass(): void {
    Promise.resolve().then(() => this.userPasswordForm.controls.password_confirmation.updateValueAndValidity());
  }
  modalPassword = false;
  nameUser: any;
  public openModalUpdatePassword(data: any) {
    this.modalPassword = true;
    this.nameUser = data.nom + ' ' + data.prenom;
    this.userPasswordForm.patchValue({ id: data.id });
  }

  public hideModalUpdatePassword() {
    this.modalPassword = false;
    this.userPasswordForm.reset();
    this.nameUser = null;
  }

  public changePasswor() {
    this.userService.changePassword(this.userPasswordForm.value).subscribe(
      (response: any) => {
        if (response.Message) {
          this.notificationService.createNotification('error', response.Message, null);
        } else {
          this.hideModalUpdatePassword();
          this.notificationService.createNotification('success', 'Mot de passe a été modifié avec succes', null);
        }
      },
      (error) => { },
    );
  }



  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.userForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  confirmationValidatorPass = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.userPasswordForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };
}
