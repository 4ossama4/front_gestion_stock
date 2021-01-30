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
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from 'src/app/models/role.model';

@Component({
  selector: 'app-role-view',
  templateUrl: './role-view.component.html',
  styleUrls: ['./role-view.component.less'],
})
export class RoleViewComponent implements OnInit {
  private roleForm: FormGroup = new FormGroup({});
  private roleId: any;
  private role: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private roleService: roleService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    this.getRoleByid();
  }

  public gotoListe() {
    this.router.navigate(['roles/list']);
  }

  public getRoleByid() {
    this.roleService.getRoleById(this.roleId).subscribe(
      (response: any) => {
        this.role = response;
      },
      (error) => {},
    );
  }
}
