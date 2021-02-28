import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs'
import { interval, zip } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit {
  @Input() value: number = 0;
  @Input() dateDeclaration: any;
  @Input() dureeAttent: any;

  @Input() today: string = '05/02/2020 22:15:00';

  private totalSeconds = 0
  @Output('onComplete') timerOver: EventEmitter<any> = new EventEmitter<any>();
  timerValue: any;

  constructor() {
  }
  count = 0;
  ngOnInit() {
    let isFinishdureeAttent = false;
    if (this.today && this.dateDeclaration) {
      var date = this.formatDateWithSecond(this.dateDeclaration);

      var count = 0
      interval(1000).subscribe(() => {
        this.count++;
        var today = this.formatDateWithSecond(this.today);
        var totalSecond = Math.floor((today.getTime() - date.getTime()) / 1000);

        totalSecond = totalSecond + this.count;

        if (this.dureeAttent && totalSecond >= this.dureeAttent) {
          isFinishdureeAttent = true
        } else {
          isFinishdureeAttent = false
        }

        let mins = parseInt("" + totalSecond / 60);
        let secs = totalSecond % 60;
        let hrs = parseInt("" + mins / 60);
        mins = mins % 60
        //if(secs<11) this.areTenSecsRemainings=true
        let res = {
          'hours': hrs,
          'minutes': mins,
          'seconds': secs,
          'isFinishdureeAttent': isFinishdureeAttent

        }
        this.timerValue = res;
      });
    }
  }



  public formatDateWithSecond(date: any) {

    let parts = date.split('/');

    let partHS = parts[2].split(' ');
    let heurSecond = partHS[1].split(':');
    let dateFormat = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), parseInt(heurSecond[0], 10), parseInt(heurSecond[1], 10), parseInt(heurSecond[2], 10));
    return dateFormat;

  }





}