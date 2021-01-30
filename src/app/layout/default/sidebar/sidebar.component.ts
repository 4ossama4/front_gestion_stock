import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsService, User } from '@delon/theme';

@Component({
  selector: 'layout-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private menus: any[] = [];
  private menusChildren: any[] = [];

  constructor(private settings: SettingsService, private httpClient: HttpClient) {
    this.getMenu();
  }

  get user(): User {
    return this.settings._user;
  }

  getMenu() {
    this.httpClient.get('assets/tmp/app-data.json').subscribe((data: any) => {
      data.menu.forEach((menu: any) => {
        if (!menu.children) {
          const found = this.settings._user.permissions.find((item: any) => item == menu.role);
          if (found || menu.role == 'noRole') {
            this.menus.push(menu);
          }
        } else {
          const array = menu.children;

          menu.children = [];
          array.forEach((children: any) => {
            const founds = this.settings._user.permissions.find((item: any) => item == children.role);
            if (founds) {
              menu.children.push(children);
            }
          });
          this.menus.push(menu);
        }
      });
    });
  }
}
