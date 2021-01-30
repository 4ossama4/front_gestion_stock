import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-base',
})
export class baseComponent implements OnInit {
  constructor(protected settings: SettingsService) {}

  ngOnInit(): void {}

  public hasPermission(permisson: string) {
    console.log('test');
    const found = this.settings._user.permissions.find((item: any) => item == permisson);
    if (found) {
      return true;
    } else {
      return false;
    }
  }
}
