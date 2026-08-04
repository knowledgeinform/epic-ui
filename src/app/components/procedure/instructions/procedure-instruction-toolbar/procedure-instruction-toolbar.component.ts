import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  InstructioninfoAuthoringDialogComponent,
  InstructioninfoAuthoringDialogData
} from "@app/components/procedure/instructions/instructioninfo-authoring-dialog/instructioninfo-authoring-dialog.component";
import {ProcedureInstruction} from "@app/interfaces/procedure-instruction";
import {InstructioninfoCloningDialogComponent} from "@app/components/procedure/instructions/instructioninfo-cloning-dialog/instructioninfo-cloning-dialog.component";
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {MatDialog} from "@angular/material/dialog";
import {MessageService} from "@app/services/message.service";
import {InstructionService} from "@app/services/instruction.service";
import {LineEditReportingService} from "@app/services/line-edit-reporting.service";
import {LoggerService} from "@app/services/logger.service";
import {ErrorDialogComponent} from "@app/components/error-dialog/error-dialog.component";

@Component({
  selector: 'app-procedure-instruction-toolbar',
  templateUrl: './procedure-instruction-toolbar.component.html',
  styleUrls: ['./procedure-instruction-toolbar.component.css']
})
export class ProcedureInstructionToolbarComponent implements OnInit {
  @Input() isLockedFromEditing: boolean;
  isExpand: boolean;
  @Input() procedureData: ProcedureDetails;
  @Input() redliningEnabled: boolean = false;
  @Output() procedureDataChange = new EventEmitter();
  @Output() expandInstructionsChange = new EventEmitter();
  @Input() runPk: null;

  instructionDragIsDone: boolean = true;

  constructor(
    public dialog: MatDialog,
    private messageService: MessageService,
    public instructionService: InstructionService,
    private redLineReportingService: LineEditReportingService,
    private loggerService: LoggerService
  ) { }

  ngOnInit(): void {
    this.isExpand = true;
  }

  addSection(): void {
    this.dialog.open<InstructioninfoAuthoringDialogComponent, InstructioninfoAuthoringDialogData>(InstructioninfoAuthoringDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {procedureDetails: this.procedureData, redliningEnabled: !!this.procedureData.redliningEnabled}
    });
  }

  saveSections(sections: ProcedureInstruction[]): void {
    this.instructionService.updateInstructionInfoData(sections).then((isUpdated) => {
      this.instructionDragIsDone = true;
      if (!isUpdated.error) {
        this.loggerService.info('Instruction information was saved; ' + isUpdated);
        this.messageService.showSnackBar('Instruction Information Saved', 'CLOSE');
        this.procedureDataChange.emit(this.procedureData);
      } else {
        this.handleError('Instruction Save Failed', 'Could not save instruction sections', 'Instruction save failed due to error: ' + isUpdated.error);
      }
    });
  }

  cloneSection(): void {
    this.dialog.open(InstructioninfoCloningDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        redliningEnabled: !!this.procedureData.redliningEnabled
      }
    });
  }

  private handleError(description: string, errorMessage: string, loggerMessage?: string) {
    if (loggerMessage) this.loggerService.error(loggerMessage);
    this.dialog.open(ErrorDialogComponent, {
      data: {
        description: description,
        errorMessage: errorMessage
      }
    });
  }

  public toggleExpand() {
    // Change expand to opposite value
    this.isExpand = !this.isExpand;
    // Emit new expand value
    this.expandInstructionsChange.emit(this.isExpand);
  }

}
