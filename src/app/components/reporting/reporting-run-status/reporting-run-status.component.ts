import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {EPICWSService, ErrMsg} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {MatDialog} from '@angular/material/dialog';
import {RunListReportingDTO} from '@app/interfaces/run-list-reporting-dto';
import * as _ from 'lodash';
import {ReportingCommonComponent} from '@app/components/reporting/reporting-common/reporting-common.component';
import {RunStatus} from '@app/interfaces/run-status.dto';
import { Equipment } from '@app/interfaces/equipment';
import {ApproverIsApprovedTitlePipe} from '@app/pipes/approver-is-approved-title.pipe';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-reporting-run-status',
  templateUrl: '../reporting-common/reporting-common.component.html',
  styleUrls: ['../reporting-common/reporting-common.component.css']
})
export class ReportingRunStatusComponent extends ReportingCommonComponent implements OnInit {
  
  @Output() fetchingChange: EventEmitter<boolean> = new EventEmitter();

  @Input() public set equipment(equip: Equipment) {
    this._equipment = equip;  // TODO: Verify `event.data` is `Event`, not `EventDTO`.
    this.loadData();
  }
  @Input() public set showRunApprovals(showRunApprovals: boolean) {
    this._showRunApprovals = showRunApprovals;
    if (this._showRunApprovals && this._showRunNonConformance){
      this.columnDefs = this.approvalAndNonConformanceColDefs;
    } else {
      this.columnDefs = this._showRunApprovals ? this.approvalColDefs :
                                                 this._showRunNonConformance ? this.nonConformanceDefs : this.defaultRunColDefs;
    }

    if (this.gridApi) {
      this.refreshData();
      this.gridApi.resetRowHeights();
    }
  }
  @Input() public set showRunNonConformance(showRunNonConformance: boolean) {
    this._showRunNonConformance = showRunNonConformance;
    if (this._showRunApprovals && this._showRunNonConformance){
      this.columnDefs = this.approvalAndNonConformanceColDefs;
    } else {
      this.columnDefs = this._showRunNonConformance ? this.nonConformanceDefs :
                                                      this._showRunApprovals ? this.approvalColDefs : this.defaultRunColDefs;
    }

    if (this.gridApi) {
      this.refreshData();
      this.gridApi.resetRowHeights();
    }
  }
  public RunStatus = RunStatus;
  _showRunApprovals = false;
  _showRunNonConformance = false;
  approvalColDefs = [...this.columnDefs,
    {headerName: 'Run Status', field: 'run.status', sortable: true, filter: true, resizable: true, flex: 1},
    {headerName: 'Closeout Submitter', field: 'run.closeoutSubmissionUser.displayName', sortable: true, filter: true, resizable: true, flex: 1},
    {headerName: 'Closeout Submitted Date', field: 'formattedSubmittedDate', sortable: true, filter: true, resizable: true, flex: 1},
    {headerName: 'Approval Decisions', field: 'formattedApprovers', sortable: false, filter: true, resizable: true, cellStyle: {'white-space': 'pre-line'}, autoHeight: true, flex: 1}
  ];
  nonConformanceDefs = [...this.columnDefs,
    {headerName: 'NonConformances', field: 'sumNonConformance', sortable: true, filter: true, resizable: true, flex: 1}
  ];
  approvalAndNonConformanceColDefs = [...this.columnDefs,
      {headerName: 'Run Status', field: 'run.status', sortable: true, filter: true, resizable: true, flex: 1},
      {headerName: 'Closeout Submitter', field: 'run.closeoutSubmissionUser.displayName', sortable: true, filter: true, resizable: true, flex: 1},
      {headerName: 'Closeout Submitted Date', field: 'formattedSubmittedDate', sortable: true, filter: true, resizable: true, flex: 1},
      {headerName: 'Approval Decisions', field: 'formattedApprovers', sortable: false, filter: true, resizable: true, cellStyle: {'white-space': 'pre-line'}, autoHeight: true, flex: 1},
      {headerName: 'NonConformances', field: 'sumNonConformance', sortable: true, filter: true, resizable: true, flex: 1}
  ];

  defaultRunColDefs = this.columnDefs;
  approverIsApprovedTitlePipe = new ApproverIsApprovedTitlePipe();

  constructor(epicService: EPICWSService,
              messageService: MessageService,
              dialog: MatDialog,
              loggerService: LoggerService) {
    super(epicService, messageService, dialog, loggerService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.columnDefs.splice(2, 0, {headerName: 'Run Name', field: 'run.name', sortable: true, filter: true, resizable: true, cellStyle: {'white-space': 'normal'}, autoHeight: true, flex: 1},
      {headerName: 'Run Number', field: 'runNumber', sortable: true, filter: true, resizable: true, flex: 1},
      {headerName: 'Run Status', field: 'run.status', sortable: true, filter: true, resizable: true, flex: 1},
      {headerName: 'Run Creator', field: 'run.user.displayName', sortable: true, filter: true, resizable: true, flex: 1}
    );
    this.columnDefs.push(
      {headerName: 'Testing Phase', field: 'run.testingPhase.shortName', sortable: true, filter: true, resizable: true, flex: 1},
      {headerName: 'Closeout Submitter', field: 'run.closeoutSubmissionUser.displayName', sortable: true, filter: true, resizable: true, flex: 1},
      {headerName: 'Closeout Submitted Date', field: 'formattedSubmittedDate', sortable: true, filter: true, resizable: true, flex: 1},
      {headerName: 'Closeout Completed Date', field: 'formattedCompletedDate', sortable: true, filter: true, resizable: true, flex: 1},
    );
    this.defaultRunColDefs = this.columnDefs;
    if (!this._equipment) {
      this.loadData();
    }
  }

  loadData(): void {
    this.fetchIsDone = false;
    this.fetchingChange.emit(true);
    if (this._equipment) {
      this.loadRunsForEquipment();
    } else {
      this.loadAllRuns();
    }
  }

  private loadRunsForEquipment(): void {
    // there is a chance that either the property number or serial number string contains multiple values,
    // but at least one of the two must have a single value. So if one of them has more than one value (as separated
    // by a comma), then set that variable to an empty string instead, because the other will have just one value.
    const propertyNumber = this._equipment.propertyNumber.split(', ').length === 1 ? this._equipment.propertyNumber : '';
    const serialNumber = this._equipment.serialNumber.split(', ').length === 1 ? this._equipment.serialNumber : '';
    this.loggerService.info('Retrieving runs for equipment report');
    this.epicService.getRunsForEquipment(propertyNumber, serialNumber).then(data => {
      this.handleServerResponse(data);
    });
  }

  private loadAllRuns(): void {
    this.loggerService.info('Retrieving run status report');
    this.epicService.getAllRunsReport(this.programPk, this.subsystemPk, this.testingPhasePk, this._showRunNonConformance).then(data => {
        this.handleServerResponse(data);
    });
  }

  private handleServerResponse(data) {
    if (data.errorMessage) {
      this.loggerService.error('Cannot display run status report ' + data.errorMessage);
      this.messageService.showSnackBar('Error cannot show run status report : ' + data.errorMessage, 'CLOSE')
    } else {
      super.loadData(data, 'runs');
      this.fetchingChange.emit(false);
      super.addFormattedDatesToRowData(true, true);
      _.map(this.rowData, row => row.run.status = this.RunStatus[row.run.status]);
      this.addRunApprovalsToRowData();
    }
  }

  public refreshData(): void {
    this.loadData();
  }

  public exportTableAsCsv(event): void {
    let fileName;
    if (this._equipment) {
      fileName = 'EPIC_runs_for_equipment_' + this._equipment.name.split(', ')[0].trim().replace(' ', '_').toUpperCase() + '_';
    } else {
      fileName = 'EPIC_run_status_';
    }
    super.exportTableAsCsv(event, fileName);
  }

  private addRunApprovalsToRowData() {
    _.map(this.rowData, row => {
      const runApprovals = row.run.runApprovals;
      let approverString = '';
      _.forEach(runApprovals, approval => {
        if (approverString !== '') {
          approverString = approverString + '\n';
        }
        approverString = approverString + approval.users.displayName + ': ' + this.approverIsApprovedTitlePipe.transform(approval);
      });
      return row.formattedApprovers = approverString;
    });
  }


}
