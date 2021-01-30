import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';
import { AchatsService } from '../../../services/achat.service';

// _____________models____________
import { ActivatedRoute, Router } from '@angular/router';
import { baseComponent } from '../../base-component/base-component.component';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-achats-view',
  templateUrl: './achats-view.component.html',
  styleUrls: ['./achats-view.component.less'],
})
export class achatsViewComponent extends baseComponent implements OnInit {
  private achatData: any = null;
  private ROLE_UPDATE: boolean = false;

  private achatId: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    protected settings: SettingsService,
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private achatsService: AchatsService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.ROLE_UPDATE = this.hasPermission('update_vente');
  }

  ngOnInit(): void {
    this.achatId = this.route.snapshot.paramMap.get('id');
    this.getAchat();
  }

  public getAchat() {
    this.achatsService.getAchatById(this.achatId).subscribe(
      (response: any) => {
        this.achatData = response.data;
      },
      (error) => {},
    );
  }

  public goToList() {
    this.router.navigate(['achats/list']);
  }

  public gotoEdit() {
    this.router.navigate(['achats/edit/' + this.achatId]);
  }
}
