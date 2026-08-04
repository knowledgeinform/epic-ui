import {AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {MessageService} from '@app/services/message.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {EditType} from '@app/interfaces/edit-type.dto';
import {RedLine} from '@app/interfaces/red-line.dto';
import {
  RedBlackLineCommentDialogComponent,
  RedBlackLineCommentDialogData
} from '@app/components/red-black-line-comment-dialog/red-black-line-comment-dialog.component';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {CommentType} from '@app/interfaces/comment-type.dto';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';
import {
  InstructioninfoAuthoringDialogComponent,
  InstructioninfoAuthoringDialogData
} from '@app/components/procedure/instructions/instructioninfo-authoring-dialog/instructioninfo-authoring-dialog.component';
import {ProcedureInstruction} from '@app/interfaces/procedure-instruction';
import {InstructioninfoCloningDialogComponent} from '@app/components/procedure/instructions/instructioninfo-cloning-dialog/instructioninfo-cloning-dialog.component';
import {InstructionService} from '@app/services/instruction.service';
import {Utils} from '@app/utils';

@Component({
  selector: 'app-procedure-instruction-info-container',
  templateUrl: './procedure-instruction-info-container.component.html',
  styleUrls: ['./procedure-instruction-info-container.component.css']
})
export class ProcedureInstructionInfoContainerComponent implements OnInit, AfterViewChecked {

  @Input() isLockedFromEditing: boolean;
  @Input() isExpand: boolean;
  @Input() procedureData: ProcedureDetails;
  @Input() redliningEnabled: boolean = false;
  @Input() printMode: boolean;
  @Output() procedureDataChange = new EventEmitter();
  @Input() runPk: null;

  @ViewChild('scrollContainer', /* TODO: add static flag */ {}) private scrollContainer: ElementRef;

  scrollPosition = 0;
  instructionDragIsDone: boolean = true;

  constructor(public dialog: MatDialog,
              private messageService: MessageService,
              public instructionService: InstructionService,
              private redLineReportingService: LineEditReportingService,
              private loggerService: LoggerService) {
  }

  ngOnInit() {
    this.scrollPosition = 0;
  }

  ngAfterViewChecked(): void {
    this.scrollContainer.nativeElement.scrollTop = this.scrollPosition;
  }

  onScroll(event): void {
    this.scrollPosition = event.currentTarget.scrollTop;
  }

  // TODO: This should maybe be a pipe?
  get disableDragging(): boolean {
    if (this.runPk && !this.redliningEnabled) {
      return true;
    } else {
      if (this.runPk && this.redliningEnabled) {
        return false;
      } else {
        return this.isLockedFromEditing;
      }
    }
  }

  drop(event: CdkDragDrop<Observable<any>>) {
    this.instructionDragIsDone = false;
    if (this.procedureData.redliningEnabled) {
      this.saveRedLineEditsFromDragAndDrop(event);
    } else {
      this.loggerService.info('Performing drag and drop of instruction from index ' + event.previousIndex + ' to index ' + event.currentIndex);
      moveItemInArray(this.procedureData.procedureInstructions, event.previousIndex, event.currentIndex);

      this.instructionService.renumberAndUpdateProcedureInstructions(this.procedureData.procedureInstructions, Math.min(event.previousIndex, event.currentIndex), Math.max(event.previousIndex, event.currentIndex))
        .then(updatedInstructions => {
          if (!updatedInstructions.error) {
            this.procedureData.procedureInstructions = Utils.updateArrayWithNewElementsBasedOnPK(this.procedureData.procedureInstructions, updatedInstructions);
            this.instructionDragIsDone = true;
            this.messageService.showSnackBar('Instruction display orders updated', 'CLOSE');
          } else {
            this.handleError('Error updating instructions', updatedInstructions.error, 'Could not update instructions after a drag and drop');
          }
        });
    }
  }

  saveRedLineEditsFromDragAndDrop(event: CdkDragDrop<Observable<any>>) {
    // get a red line comment
    const redLineData = new RedLine();
    redLineData.procedureDetailsPk = this.procedureData.pk;
    let redLineCommentForEdit;

    const dialogRef = this.dialog.open<RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData>(RedBlackLineCommentDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        commentType: CommentType.RED_LINE_COMMENT,
        procedureDetails: this.procedureData.asDTO(),
      }
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data === null) {
        this.messageService.showSnackBar('Red Line Change Cancelled by User', 'CLOSE');
        return;
      } else {
        redLineCommentForEdit = data;
      }
      this.loggerService.info('Saving red line drag and drop of instruction from index ' + event.previousIndex + ' to index ' + event.currentIndex);
      redLineData.redLineComment = redLineCommentForEdit;
      const startingIndex = event.previousIndex;
      // get the instruction at the starting index; this is the instruction being redlined.
      const instructionBeingRedlined = this.procedureData.procedureInstructions[startingIndex];
      if (instructionBeingRedlined.editType !== EditType.REDLINE_ADD && instructionBeingRedlined.editType !== EditType.REDLINE_DELETE) {
        instructionBeingRedlined.editType = EditType.REDLINE_EDIT;
      }
      redLineData.procedureInstruction = instructionBeingRedlined.asDTO();

      // save this instruction
      this.instructionService.saveRedLineToProcedureInstruction(redLineData, 'Saving redlined instruction moved via drag and drop; pk: ' + instructionBeingRedlined.pk).then(movedInstruction => {
        this.instructionDragIsDone = true;
        if (!movedInstruction.error) {
          // move the redlined instruction to the new place in the array
          this.procedureData.procedureInstructions[startingIndex] = movedInstruction;
          moveItemInArray(this.procedureData.procedureInstructions, event.previousIndex, event.currentIndex);

          // now need to update all the display orders for the reordered instructions.
          const startingIndexForReorderedInstructions = Math.min(event.previousIndex, event.currentIndex);
          const endingIndexForReorderedInstructions = Math.max(event.previousIndex, event.currentIndex);

          // FIXME: Ideally the instruction reordering would be part of same transaction as saving the redlined instruction.
          this.instructionService.renumberAndUpdateProcedureInstructions(this.procedureData.procedureInstructions, startingIndexForReorderedInstructions, endingIndexForReorderedInstructions)
            .then(reorderedInstructions => {
              if (!reorderedInstructions.error) {
                this.procedureData.procedureInstructions = Utils.updateArrayWithNewElementsBasedOnPK(this.procedureData.procedureInstructions, reorderedInstructions);
                this.messageService.showSnackBar('Instruction display orders updated', 'CLOSE');
                this.redLineReportingService.findInstructionLineEditsForProcedure(this.procedureData);
                this.procedureDataChange.emit(this.procedureData);
              } else {
                this.handleError('Instruction reordering failed', 'Failed to update display orders of procedure instructions', 'Could not update display orders for procedure instructions: ' + reorderedInstructions.error);
              }
            });
        } else {
          this.handleError('Failed to save edit as red line for procedure instruction', movedInstruction.error, 'Failed to save the new location of a dragged instruction as a red line: ' + movedInstruction.error);
        }
      });
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
}
