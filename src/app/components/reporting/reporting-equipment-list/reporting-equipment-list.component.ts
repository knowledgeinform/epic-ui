import { Component, OnInit } from '@angular/core';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {MatDialog} from '@angular/material/dialog';
import {ReportingCommonComponent} from '@app/components/reporting/reporting-common/reporting-common.component';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-reporting-equipment-list',
  templateUrl: '../reporting-common/reporting-common.component.html',
  styleUrls: ['../reporting-common/reporting-common.component.css']
})
export class ReportingEquipmentListComponent extends ReportingCommonComponent implements OnInit {

  columnDefs = [
    {headerName: 'Equipment Name(s)', field: 'name', sortable: true, filter: true, resizable: true, cellStyle: {'white-space': 'normal'}, autoHeight: true, flex: 1},
    {headerName: 'Serial Number', field: 'serialNumber', sortable: true, filter: true, resizable: true, cellStyle: {'white-space': 'normal'}, autoHeight: true, flex: 1},
    {headerName: 'APL Property Number', field: 'propertyNumber', sortable: true, filter: true, resizable: true, cellStyle: {'white-space': 'normal'}, autoHeight: true, flex: 1}
  ];

  constructor(epicService: EPICWSService,
              messageService: MessageService,
              dialog: MatDialog,
              loggerService: LoggerService) {
    super(epicService, messageService, dialog, loggerService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.loadData();
  }

  loadData(): void {
    this.fetchIsDone = false;
    this.showRunsForEquipmentTable = false;
    this.loggerService.info('Retrieving equipment list report');
    this.epicService.getAllEquipmentReport(this.programPk, this.subsystemPk, this.testingPhasePk).then(data => {
      super.loadData(data, 'equipment');
    });
  }

  public refreshData(): void {
    this.loadData();
  }

  public onGridReady(event): void {
    super.onGridReady(event);
    this.gridApi.sizeColumnsToFit();
  }

  public exportTableAsCsv(event): void {
    super.exportTableAsCsv(event, 'EPIC_all_equipment_list_');
  }
}
