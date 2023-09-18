import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent implements OnInit,OnDestroy {

  dateTime=Date.now();
  private $inActive=new Subject<boolean>();

  constructor() { }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.startClock();
  }
  startClock(){
    interval(1).subscribe(date=>{
      this.dateTime=Date.now();
    });
  }
}
