import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

//____________services________________-
import { NotificationService } from '../../../services/notification.service';

// _____________models____________

import { StockService } from 'src/app/services/stock.service';

@Component({
  selector: 'app-mode-p',
  templateUrl: './mode-p.component.html',
  styleUrls: ['./mode-p.component.less'],
})
export class modePaymentsListComponent implements OnInit {
  private refForm: FormGroup = new FormGroup({});
  private data = [];
  private initLoading: boolean = true;
  private modeEdit: boolean = false;
  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private modalService: NzModalService,
    private notificationService: NotificationService,
  ) {
    this.createForm();
    this.getPaymentsMode();
  }

  ngOnInit(): void {}

  public createForm() {
    this.refForm = this.fb.group({
      id: [null],
      label: [null, [Validators.required]],
    });
  }

  public delete(item: any) {
    this.modalService.confirm({
      nzTitle: 'Confirmation',
      nzContent: 'Voulez vous vraiment supprimer cette enregistrement',
      nzOkText: 'Supprimer',
      nzCancelText: 'Annuler',
      nzOnOk: () => this.confirmationDelete(item),
    });
  }

  public confirmationDelete(item: any) {
    this.stockService.deleteModeP(item.id).subscribe(
      (response) => {
        this.data = this.data.filter((elem) => elem !== item);
        this.notificationService.createNotification('success', 'Enregistrement a été supprimé avec succes', null);
      },
      (error) => {
        this.notificationService.createNotification('error', 'error de supprission', null);
      },
    );
  }

  public getPaymentsMode() {
    this.initLoading = true;
    this.stockService.getPaymentsMode().subscribe(
      (response: any) => {
        this.data = response;
        this.initLoading = false;
      },
      (error) => {
        this.initLoading = false;
      },
    );
  }

  // public onkeypress(event: any, value: any) {
  //   if (event.key === 'Enter') {
  //     this.chercheRefOriginal(value);
  //   }
  // }

  public submitForm() {
    for (const i in this.refForm.controls) {
      this.refForm.controls[i].markAsDirty();
      this.refForm.controls[i].updateValueAndValidity();
    }
    if (this.refForm.valid) {
      if (!this.modeEdit) {
        this.stockService.storeMode({ label: this.refForm.value.label }).subscribe(
          (response: any) => {
            this.refForm.reset();
            this.modeEdit = false;
            this.getPaymentsMode();
            this.notificationService.createNotification('success', 'Enregistrement a été ajouté avec succes', null);
          },
          (error) => {
            this.notificationService.createNotification('error', "error d'ajout", null);
          },
        );
      } else {
        this.stockService.updateModeP(this.refForm.value).subscribe(
          (response: any) => {
            this.refForm.reset();
            this.modeEdit = false;
            this.getPaymentsMode();
            this.notificationService.createNotification('success', 'Enregistrement a été modifier avec succes', null);
          },
          (error) => {
            this.notificationService.createNotification('error', 'error de modification', null);
          },
        );
      }
    }
  }

  public toEditData(item: any) {
    this.modeEdit = true;
    this.refForm.patchValue(item);
  }
}
