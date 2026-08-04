import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-status-history',
  templateUrl: './status-history.component.html',
  styleUrls: ['./status-history.component.scss']
})
export class StatusHistoryComponent implements OnInit {

  displayHistory: boolean = false;
  @Input() histories: History[];

  constructor() { }

  ngOnInit() {
  }

}
