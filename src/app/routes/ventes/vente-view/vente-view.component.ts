import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';
import { VentesService } from '../../../services/vente.service';

// _____________models____________
import { ActivatedRoute, Router } from '@angular/router';
import { baseComponent } from '../../base-component/base-component.component';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-vente-view',
  templateUrl: './vente-view.component.html',
  styleUrls: ['./vente-view.component.less'],
})
export class venteViewComponent extends baseComponent implements OnInit {
  private venteData: any = null;
  private ROLE_UPDATE: boolean = false;

  private venteId: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    protected settings: SettingsService,
    private modalService: NzModalService,
    private ventesService: VentesService,
    private notificationService: NotificationService,
  ) {
    super(settings);
    this.ROLE_UPDATE = this.hasPermission('update_vente');
  }

  ngOnInit(): void {
    this.venteId = this.route.snapshot.paramMap.get('id');
    this.getVente();
  }

  public getVente() {
    this.ventesService.getVenteById(this.venteId).subscribe(
      (response: any) => {
        this.venteData = response.data;
      },
      (error) => {},
    );
  }

  public goToList() {
    this.router.navigate(['ventes/list']);
  }

  public gotoEdit() {
    this.router.navigate(['ventes/edit/' + this.venteId]);
  }
}
