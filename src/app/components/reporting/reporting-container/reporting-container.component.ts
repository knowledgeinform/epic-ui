import { Component, OnInit } from '@angular/core';
import {ReportTypes} from '@app/interfaces/report-types.enum';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ProgramDTO} from '@app/interfaces/program.dto';
import {Subsystem} from '@app/interfaces/subsystem.dto';
import {TestingPhase} from '@app/interfaces/testing-phase.dto';
import { ExportService } from '@app/services/export.service';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-reporting-container',
  host: { class: 'flex-row' },
  templateUrl: './reporting-container.component.html',
  styleUrls: ['./reporting-container.component.css']
})
export class ReportingContainerComponent implements OnInit {

  reportsLists: string[] = Object.keys(ReportTypes);
  selectedReport: ReportTypes = null;
  openTabs: ReportTypes[] = [];
  selectedTab: number = 0;
  public ReportTypes = ReportTypes;
  fetchIsDone: boolean = false;
  fetchingRecords:boolean = false;
  programs: ProgramDTO[] = [];
  subsystems: Subsystem[] = [];
  testingPhases: TestingPhase[] = [];
  selectedProgram: ProgramDTO = null;
  selectedSubsystem: Subsystem = null;
  selectedTestingPhase: TestingPhase = null;
  showRunApprovals: boolean = false;
  showRunNonConformance: boolean = false;
  constructor(private epicService: EPICWSService,
              private messageService: MessageService,
              private exportService: ExportService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private loggerService: LoggerService) { }

  ngOnInit() {
    this.fetchIsDone = false;
    this.fetchingRecords = false;
    this.epicService.getCreateProcedureSelections().subscribe(data => {
      this.fetchIsDone = true;
      if (data.error) {
        const description = 'Error retrieving lists of programs/subsystems/testing phases';
        this.loggerService.error(description + ': ' + data.error);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: description,
            errorMessage: data.error
          }
        });
      } else {
        this.programs = data.programs;
        this.subsystems = data.subsystems;
        this.testingPhases = data.testingPhases;
      }
    });
  }

  openTabWithSelectedReport(event): void {
    this.openTabs.push(this.selectedReport);
    this.selectedTab = this.openTabs.length - 1;
    this.showRunApprovals = false;
    this.showRunNonConformance = false;
  }

  closeReport(index: number): void {
    this.openTabs.splice(index, 1);
  }

  clearAllFilters(): void {
    this.selectedReport = null;
    this.selectedProgram = null;
    this.selectedSubsystem = null;
    this.selectedTestingPhase = null;
  }

  public exportProgram(program: ProgramDTO) {
    this.exportService.initiateProgramExport(program.pk);
  }
}
