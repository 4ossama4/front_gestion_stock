import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SettingsService, User } from '@delon/theme';
import { baseComponent } from 'src/app/routes/base-component/base-component.component';
import { usersService } from '../../../../services/user.service';
@Component({
  selector: 'header-user',
  templateUrl: './user-header.component.html',
})
export class HeaderUserComponent extends baseComponent {
  get user(): User {
    return this.settings._user;
  }

  private ROLE_ADMIN: boolean = false;

  constructor(
    private usersService: usersService,
    protected settings: SettingsService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {
    super(settings);
    this.ROLE_ADMIN = this.hasPermission('show_admin');
  }

  logout(): void {
    this.usersService.logout().subscribe(
      (response: any) => {},
      (error) => {},
    );
    this.tokenService.clear();
    this.router.navigateByUrl(this.tokenService.login_url!);
  }

  public goToReferenciel(tabs: string) {
    this.router.navigateByUrl('referenciels?tab=' + tabs);
  }
}
