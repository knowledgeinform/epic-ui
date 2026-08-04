import { Component, OnInit } from '@angular/core';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {MatDialog} from '@angular/material/dialog';
import * as _ from 'lodash';
import {ReportingCommonComponent} from '@app/components/reporting/reporting-common/reporting-common.component';
import {ProcedureStatus} from '@app/interfaces/procedure-status.dto';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-reporting-procedure-status',
  templateUrl: '../reporting-common/reporting-common.component.html',
  styleUrls: ['../reporting-common/reporting-common.component.css']
})
export class ReportingProcedureStatusComponent extends ReportingCommonComponent implements OnInit {

  public ProcedureStatus = ProcedureStatus;

  constructor(epicService: EPICWSService,
              messageService: MessageService,
              dialog: MatDialog,
              loggerService: LoggerService) {
    super(epicService, messageService, dialog, loggerService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.columnDefs.splice(3, 0, {headerName: 'Revision', field: 'procedureDefVersion', sortable: true, filter: true, resizable: true, flex: 1});
    this.columnDefs.splice(6, 0, {headerName: 'Procedure Status', field: 'status', sortable: true, filter: true, resizable: true, flex: 1});
    this.columnDefs.push({headerName: 'Number of Runs', field: 'numberOfRuns', sortable: true, filter: true, resizable: true, flex: 1});
    this.loadData();
  }

  loadData(): void {
    this.fetchIsDone = false;
    this.loggerService.info('Retrieving procedure status report');
    this.epicService.getAllProceduresReport(this.programPk, this.subsystemPk).then(data => {
      super.loadData(data, 'procedures');
      super.addFormattedDatesToRowData(false, false);
      _.map(this.rowData, row => row.status = this.ProcedureStatus[row.status]);
    });
  }

  refreshData(): void {
    this.loadData();
  }

  public onGridReady(event): void {
    super.onGridReady(event);
    this.gridApi.sizeColumnsToFit();
  }

  public exportTableAsCsv(event): void {
    const fileName = 'EPIC_procedure_status_';
    super.exportTableAsCsv(event, fileName);
  }
}
