import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MatDialog} from '@angular/material/dialog';
import {MessageService} from '@app/services/message.service';
import {OfflineService} from '@app/services/offline.service';
import * as _ from 'lodash';
import {RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData} from '@app/components/red-black-line-comment-dialog/red-black-line-comment-dialog.component';
import {RedLine} from '@app/interfaces/red-line.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {CommentType} from '@app/interfaces/comment-type.dto';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-procedure-hazard',
  templateUrl: './procedure-hazard.component.html',
  styleUrls: ['./procedure-hazard.component.css']
})
export class ProcedureHazardComponent implements OnInit, AfterViewInit {

  hazardDescription: string = '';
  hazardDescriptionTextArea: HTMLElement;
  hazardDescriptionFitContentFunc = () => {
    this.hazardDescriptionTextArea.style.height = "auto"; // adjust height when editing to fit scroll height
    this.hazardDescriptionTextArea.style.height = this.hazardDescriptionTextArea.scrollHeight + 15 + "px";
  }
  @Input() procedureData: ProcedureDetails;
  @Input() printMode: boolean = false;
  @Output() procedureDataChange = new EventEmitter();
  @Input() isLockedFromEditing: boolean;

  constructor(private epicService: EPICWSService,
              public dialog: MatDialog,
              private messageService: MessageService,
              public offlineService: OfflineService,
              public redLineReportingService: LineEditReportingService,
              private loggerService: LoggerService) {
  }

  ngOnInit() {
    this.hazardDescription = this.procedureData.hazardDescription;
  }

  ngAfterViewInit(): void {
    this.hazardDescriptionFitContent();
  }

  saveProcedureDetailsEsd0(event: boolean): void {
    const procedurePk = this.procedureData.pk;

    if (!this.procedureData.redliningEnabled) {
      this.loggerService.info('Updating the ESD0 flag for procedure with pk ' + procedurePk);
      this.epicService.updateProcedureDetailsEsd0(procedurePk, event).then((pd) => {
        // Check for error
        if (!pd) {
          // revert failed change.
          this.procedureData.esd0 = !event;

          this.messageService.showSnackBar('Procedure ESD Class 0 could not be saved! Possibly there are steps in this ' +
            'procedure marked as ESD Class 0', 'CLOSE');
          this.loggerService.error('Could not update ESD0 for procedure with pk ' + procedurePk + '; possibly there are steps flagged as ESD0 prohibiting the change');
          return;
        }
        this.procedureData.esd0 = pd.esd0;
        this.procedureDataChange.emit(this.procedureData);
        this.messageService.showSnackBar('Procedure ESD Class 0 saved', 'CLOSE');
      });
    } else {
      this.saveRedLineToHazardAndEsd0Info(event);
    }
  }

  hazardDescriptionFitContent() {
    let interval = setInterval(() => {
      this.hazardDescriptionTextArea = document.getElementById("hazardous-description-box");
      if (this.hazardDescriptionTextArea !== undefined && this.hazardDescriptionTextArea !== null) {
        this.hazardDescriptionFitContentFunc();
        this.hazardDescriptionTextArea.style.overflowY = "hidden"; // no need for vertical scrolling
        this.hazardDescriptionTextArea.style.resize = "none"; // no need for resizing button

        // listen for input event and adjust textarea accordingly
        this.hazardDescriptionTextArea.addEventListener("input", (event) => {
          this.hazardDescriptionFitContentFunc();
        });

        window.addEventListener("resize", (event) => {
          this.hazardDescriptionFitContentFunc();
        });

        clearInterval(interval);
      }
    }, 100);
  }

  saveProcedureDetailsHazard(event: boolean | MouseEvent): void {
    const procedureDetailsPk = this.procedureData.pk;

    if (!this.procedureData.hazardous) {
      this.hazardDescription = '';
    }

    if (!this.procedureData.redliningEnabled) {
      this.loggerService.info('Update procedure hazard details for procedure with pk ' + procedureDetailsPk);
      this.epicService.updateProcedureHazardDetails(procedureDetailsPk, this.procedureData.hazardous, this.hazardDescription).then((data) => {
        if (!data.error) {
          this.procedureData.hazardDescription = data.hazardDescription;
          this.procedureData.hazardous = data.hazardous;
          this.procedureDataChange.emit(this.procedureData);
          this.messageService.showSnackBar('Procedure hazard details saved', 'CLOSE');
          this.handleMissingHazardDescription();
        } else {
          this.loggerService.error('Could not save update(s) to hazard details for procedure with pk ' + procedureDetailsPk + '; possibly hazardous steps exist in procedure');
          this.messageService.showSnackBar('Change in procedure hazard information could not be saved! Possibly there are steps in this ' +
            'procedure marked as hazardous.', 'CLOSE', 5000);
          this.procedureData.hazardous = !this.procedureData.hazardous;
          this.hazardDescription = this.procedureData.hazardous ? this.procedureData.hazardDescription : '';
        }
      });
    } else {
      this.saveRedLineToHazardAndEsd0Info(null, this.procedureData.hazardous);
    }
  }

  private handleMissingHazardDescription(messageDuration: number = 2000) {
    if (this.procedureData.hazardous && _.isEmpty(this.procedureData.hazardDescription)) {
      setTimeout(() => {
        this.loggerService.warn('Missing a hazard description for procedure with pk ' + this.procedureData.pk);
        this.messageService.showSnackBar('Enter a hazard description. This procedure cannot be submitted for approval ' +
          'unless this input is completed.', 'CLOSE', 5000);
        this.hazardDescription = this.procedureData.hazardDescription;
      }, messageDuration);
    }
  }

  saveRedLineToHazardAndEsd0Info(esd0?: boolean, isHazardous?: boolean): void {
    // need a redline comment
    let redLineComment;
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
        // if the redline is cancelled, revert the UI to original values
        this.messageService.showSnackBar('Red line change cancelled by user', 'CLOSE');
        if (esd0 !== null) {
          this.procedureData.esd0 = !esd0;
        }
        if (isHazardous !== null) {
          this.procedureData.hazardous = !isHazardous;
          this.hazardDescription = this.procedureData.hazardous ? this.procedureData.hazardDescription : '';
        }
        return;
      } else {
        redLineComment = data;
      }

      const redLineData = new RedLine();
      redLineData.procedureDetailsPk = this.procedureData.pk;
      redLineData.redLineComment = redLineComment;

      // call epic service to save the redline.
      this.loggerService.info('Saving updated hazard details as red line for procedure details with pk ' + this.procedureData.pk);
      this.epicService.saveHazardInfoAsRedLine(redLineData, this.procedureData.hazardous, this.hazardDescription, this.procedureData.esd0).then((returnedData) => {
        if (!returnedData.error) {
          this.procedureData = returnedData;
          this.hazardDescription = this.procedureData.hazardDescription;
          this.redLineReportingService.findTopLevelLineEditsForProcedure(this.procedureData);
          this.procedureDataChange.emit(this.procedureData);
          this.messageService.showSnackBar('Procedure hazard details red line saved', 'CLOSE');
          this.handleMissingHazardDescription();
        } else {
          if (esd0 !== null) {
            this.procedureData.esd0 = !esd0;
          }
          if (isHazardous !== null) {
            this.procedureData.hazardous = !isHazardous;
            this.hazardDescription = this.procedureData.hazardous ? this.procedureData.hazardDescription : '';
          }
          this.loggerService.error('Could not saved updated hazard details as red line: ' + returnedData.error);
          this.messageService.showSnackBar(returnedData.error, 'CLOSE', 5000);
        }
      });
    });
  }
}
