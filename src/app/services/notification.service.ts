import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';


@Injectable()
export class NotificationService {
  constructor(private notification: NzNotificationService) { }


  createNotification(type: string, title: string, description: any): void {
    this.notification.create(
      type,
      title,
      description
    );
  }
}
