import { Component, OnInit, Input } from '@angular/core';
import { Equipment } from '@app/interfaces/equipment';

@Component({
  selector: 'app-procedure-run-print-equipment-table',
  templateUrl: './procedure-run-print-equipment-table.component.html',
  styleUrls: ['./procedure-run-print-equipment-table.component.css']
})
export class ProcedureRunPrintEquipmentTableComponent implements OnInit {

  @Input() public equipment: Equipment[];

  constructor() { }

  ngOnInit() {
  }

}
