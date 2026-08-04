import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-offline-availability-indicator',
  templateUrl: './offline-availability-indicator.component.html',
  styleUrls: ['./offline-availability-indicator.component.css']
})
export class OfflineAvailabilityIndicatorComponent implements OnInit {

  @Input() public available: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
