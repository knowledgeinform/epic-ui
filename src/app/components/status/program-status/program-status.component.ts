import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { ProgramDTO } from '@app/interfaces/program.dto';
import { ProcedureStatus } from '@app/interfaces/procedure-status.dto';
import { RunStatus } from '@app/interfaces/run-status.dto';
import { EPICWSService } from '@app/services/epic-ws.service';
import { LoggerService } from '@app/services/logger.service';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProcedureListReportingDTO } from '@app/interfaces/procedure-list-reporting-dto';
import { RunListReportingDTO } from '@app/interfaces/run-list-reporting-dto';
import { ProcedureStatusCounts, RunStatusCounts, ProgramStatusDTO } from '@app/interfaces/program-status.dto';

@Component({
  selector: 'app-program-status',
  templateUrl: './program-status.component.html',
  styleUrls: ['./program-status.component.css']
})
export class ProgramStatusComponent implements OnInit {

  programs: ProgramDTO[] = [];
  selectedProgram: ProgramDTO = null;
  showStatusContent: boolean = false;
  fetchingRecords: boolean = false;
  fetchIsDone: boolean = false;

  // Status counts
  procedureStatusCounts: ProcedureStatusCounts = {} as ProcedureStatusCounts;
  runStatusCounts: RunStatusCounts = {} as RunStatusCounts;

  // Tab management for multiple tables
  openTabs: Array<{ type: 'procedure' | 'run'; status: string; data: any[] }> = [];
  selectedTab: number = 0;

  defaultColDef = {sortable: true, filter: true, resizable: true, flex: 1}

  // NOTE: column definitions must be stable references. Binding a method call
  // (e.g. [columnDefs]="getProcedureColumnDefs()") creates a new array on every
  // change-detection cycle, which forces ag-grid into a hard column refresh and
  // destroys any open filter panel ("filter box appears briefly" bug).
  procedureColumnDefs = [
    {headerName: 'Date Created', field: 'formattedDate',},
    {headerName: 'ID', field: 'id'},
    {headerName: 'Procedure Name', field: 'procedureDefName', cellStyle: {'white-space': 'normal'}, autoHeight: true, flex: 1},
    {headerName: 'Procedure Author', field: 'author.displayName'},
    {headerName: 'Status', field: 'status'},
    {headerName: 'Subsystem', field: 'subsystem.name'},
  ]

  runColumnDefs = [
    {headerName: 'Date Created', field: 'formattedDate'},
    {headerName: 'ID', field: 'id', flex: 1.5},
    {headerName: 'Run Name', field: 'run.name', cellStyle: {'white-space': 'normal'}, autoHeight: true, flex: 1},
    {headerName: 'Run Number', field: 'runNumber', flex: 0.5},
    {headerName: 'Run Status', field: 'run.status'},
    {headerName: 'Run Creator', field: 'run.user.displayName'},
    {headerName: 'Procedure Name', field: 'procedureDefName', cellStyle: {'white-space': 'normal'}, autoHeight: true, flex: 1.5},
    {headerName: 'Procedure Author', field: 'author.displayName'},
    {headerName: 'Status', field: 'run.status'},
    {headerName: 'Subsystem', field: 'subsystem.name'},
    {headerName: 'Testing Phase', field: 'run.testingPhase.shortName'},
    {headerName: 'Closeout Submitter', field: 'run.closeoutSubmissionUser.displayName'},
    {headerName: 'Closeout Submitted Date', field: 'formattedSubmittedDate'},
    {headerName: 'Closeout Completed Date', field: 'formattedCompletedDate'},
  ]

  readonly ProcedureStatus = ProcedureStatus;
  readonly RunStatus = RunStatus;

  private gridApi;

  constructor(
    private epicService: EPICWSService,
    private loggerService: LoggerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchIsDone = false;
    this.fetchingRecords = false;
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.epicService.getPrograms().then(data => {
      this.fetchIsDone = true;
      if (data['error']) {
        this.handleError('Error retrieving list of programs', data['error']);
      } else {
        this.programs = data;
      }
    });
  }

  onProgramSelected(): void {
    if (this.selectedProgram) {
      this.showStatusContent = true;
      this.loadStatusCounts();
    } else {
      this.showStatusContent = false;
      this.resetStatusView();
    }
  }

  loadStatusCounts(): void {
    this.fetchingRecords = true;
    this.epicService.getProgramStatus(this.selectedProgram.pk).then(data => {
      this.fetchingRecords = false;
      if (data['error']) {
        this.handleError('Error retrieving status counts', data['error']);
      } else {
        this.procedureStatusCounts = data.procedureStatusCounts;
        this.runStatusCounts = data.runStatusCounts;
      }
    });
  }

  resetStatusView(): void {
    this.openTabs = [];
    this.selectedTab = 0;
  }

  onProcedureStatusSelected(status: ProcedureStatus): void {
    this.fetchingRecords = true;
    this.epicService.getProceduresByStatus(this.selectedProgram.pk, status).then(data => {
      this.fetchingRecords = false;
      if (data['error']) {
        this.handleError('Error retrieving procedures', data['error']);
      } else {
        this.addFormattedDatesToRowData(data, false, false);
        this.openTableTab('procedure', status, data);
      }
    });
  }

  onRunStatusSelected(status: RunStatus): void {
    this.fetchingRecords = true;
    this.epicService.getRunsByStatus(this.selectedProgram.pk, status).then(data => {
      this.fetchingRecords = false;
      if (data['error']) {
        this.handleError('Error retrieving runs', data['error']);
      } else {
        this.addFormattedDatesToRowData(data, true, true);
        this.openTableTab('run', status, data);
      }
    });
  }

  private addFormattedDatesToRowData(rowData, submittedDate: boolean, completedDate: boolean) {
    _.map(rowData, row => {
      row.formattedDate = this.formatDate(row.createdDate);
      if (submittedDate) row.formattedSubmittedDate = row.run.closeoutSubmittedDate ? this.formatDate(row.run.closeoutSubmittedDate) : '';
      if (completedDate) row.formattedCompletedDate = row.run.closeoutCompletedDate ? this.formatDate(row.run.closeoutCompletedDate) : '';
    });
  }

  private formatDate(date): string {
    return formatDate(new Date(date), 'yyyy/MM/dd', 'en_US');
  }

  openTableTab(type: 'procedure' | 'run', status: string, data: any[]): void {
    this.openTabs.push({ type, status, data });
    this.selectedTab = this.openTabs.length - 1;
  }

  closeTab(index: number): void {
    this.openTabs.splice(index, 1);
    if (this.selectedTab >= this.openTabs.length) {
      this.selectedTab = Math.max(0, this.openTabs.length - 1);
    }
  }

  clearAllFilters(): void {
    this.selectedProgram = null;
    this.onProgramSelected();
  }

  onRowClick(event): void {
    window.open(event.data.url, '_blank');
  }

  onGridReady(event): void {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.resetRowHeights();
  }

  private handleError(description: string, error: string): void {
    this.loggerService.error(description + ': ' + error);
    this.dialog.open(ErrorDialogComponent, {
      data: {
        description: description,
        errorMessage: error
      }
    });
  }
}
