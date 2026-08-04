import {Component, Input, OnInit} from '@angular/core';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {MatDialog} from '@angular/material/dialog';
import {formatDate} from '@angular/common';
import * as _ from 'lodash';
import {Subsystem} from '@app/interfaces/subsystem.dto';
import {TestingPhase} from '@app/interfaces/testing-phase.dto';
import {ProgramDTO} from '@app/interfaces/program.dto';
import { Equipment } from '@app/interfaces/equipment';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-reporting-common',
  templateUrl: './reporting-common.component.html',
  styleUrls: ['./reporting-common.component.css']
})
export class ReportingCommonComponent implements OnInit {

  columnDefs = [
    {headerName: 'Date Created', field: 'formattedDate', sortable: true, filter: true, resizable: true, flex: 1},
    {headerName: 'ID', field: 'id', sortable: true, filter: true, resizable: true, flex: 1},
    {headerName: 'Procedure Name', field: 'procedureDefName', sortable: true, filter: true, resizable: true, cellStyle: {'white-space': 'normal'}, autoHeight: true, flex: 1},
    {headerName: 'Procedure Author', field: 'author.displayName', sortable: true, filter: true, resizable: true, flex: 1},
    {headerName: 'Program', field: 'program.code', sortable: true, filter: true, resizable: true, flex: 1},
    {headerName: 'Subsystem', field: 'subsystem.shortName', sortable: true, filter: true, resizable: true, flex: 1},
  ];
  rowData: any[] = [];
  fetchIsDone: boolean = false;
  gridColumnApi;
  gridApi;
  defaultPageSize: number = 10;
  _equipment: Equipment = null;
  @Input() program: ProgramDTO = null;
  @Input() subsystem: Subsystem = null;
  @Input() testingPhase: TestingPhase = null;
  @Input() isEquipmentReport: boolean = false;
  @Input() isRunsForEquipmentReport: boolean = false;
  programPk: number;
  subsystemPk: number;
  testingPhasePk: number;
  showRunsForEquipmentTable: boolean = false;
  selectedEquipment: Equipment = null;

  constructor(public epicService: EPICWSService,
              public messageService: MessageService,
              public dialog: MatDialog,
              public loggerService: LoggerService
              ) { }

  ngOnInit() {
    this.programPk = this.program ? this.program.pk : null;
    this.subsystemPk = this.subsystem ? this.subsystem.pk : null;
    this.testingPhasePk = this.testingPhase ? this.testingPhase.pk : null;
  }

  loadData(data: any, type: string): void {
    this.fetchIsDone = true;
    if (data.error) {
      this.handleError(data.error);
      return;
    }
    this.rowData = data;
    if (_.isEmpty(this.rowData)) {
      this.messageService.showSnackBar('No ' + type + ' found', 'CLOSE');
      return;
    }
  }

  addFormattedDatesToRowData(submittedDate: boolean, completedDate: boolean) {
    _.map(this.rowData, row => {
      row.formattedDate = this.formatDate(false, row.createdDate);
      if (submittedDate) row.formattedSubmittedDate = row.run.closeoutSubmittedDate ? this.formatDate(false, row.run.closeoutSubmittedDate) : '';
      if (completedDate) row.formattedCompletedDate = row.run.closeoutCompletedDate ? this.formatDate(false, row.run.closeoutCompletedDate) : '';
    });
  }

  private formatDate(isCsv: boolean, date?): string {
    let dateToFormat = new Date();
    if (date) dateToFormat = new Date(date);
    if (isCsv) {
      return formatDate(dateToFormat, 'yyyy_MM_dd_HH_mm', 'en_US');
    }
    return formatDate(dateToFormat, 'yyyy/MM/dd', 'en_US');
  }

  handleError(message: string): void {
    this.loggerService.error('Could not retrieve a report: ' + message);
    this.dialog.open(ErrorDialogComponent, {
      data: {
        description: 'Error retrieving report',
        errorMessage: message
      }
    });
  }

  refreshData(): void {}

  onReportRowClick(event): void {
    if (!this.isEquipmentReport) {
      window.open(event.data.url, '_blank');
    } else {
      this.showRunsForEquipmentTable = true;
      this.selectedEquipment = event.data;  // TODO: Verify `event.data` is `Event`, not `EventDTO`.
    }
  }

  public onGridReady(event): void {
    this.gridColumnApi = event.columnApi;
    this.gridApi = event.api;

    this.gridApi.paginationSetPageSize(this.defaultPageSize);
    this.gridApi.resetRowHeights();
  }

  public changePageSize(newSize): void {
    this.gridApi.paginationSetPageSize(newSize.value);
  }

  public exportTableAsCsv(event, fileName: string): void {
    this.gridApi.exportDataAsCsv({fileName: fileName + this.formatDate(true) + '.csv'});
  }

  public clearAllFilters(): void {
    this.gridApi.setFilterModel(null);
  }
}
