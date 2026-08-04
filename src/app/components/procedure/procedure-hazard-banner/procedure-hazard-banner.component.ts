import { Component, OnInit, Input } from '@angular/core';
import { ProcedureDetailsDTO } from '@app/interfaces/procedure-details.dto';

@Component({
  selector: 'app-procedure-hazard-banner',
  templateUrl: './procedure-hazard-banner.component.html',
  styleUrls: ['./procedure-hazard-banner.component.css']
})
export class ProcedureHazardBannerComponent implements OnInit {

  @Input() public procedure: ProcedureDetailsDTO;

  constructor() { }

  ngOnInit() {
  }

}
