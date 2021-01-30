import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../services/notification.service';
import { clientService } from '../../services/client.service';

// _____________models____________
import { articleCriteria } from '../../models/article.criteria';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { clientCriteria } from 'src/app/models/client.criteria';
import { StockService } from 'src/app/services/stock.service';
import { baseComponent } from '../base-component/base-component.component';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-referenciels',
  templateUrl: './referenciels.component.html',
  styleUrls: ['./referenciels.component.less'],
})
export class referencielsComponent extends baseComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private clientService: clientService,
    protected settings: SettingsService,
    private stockService: StockService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {
    super(settings);
  }

  ngOnInit(): void {}
}
