import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {EditType} from '@app/interfaces/edit-type.dto';
import {Observable, Subscription} from 'rxjs';
import {RedLine} from '@app/interfaces/red-line.dto';
import {RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData} from '@app/components/red-black-line-comment-dialog/red-black-line-comment-dialog.component';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {StepCloneDialogComponent} from '@app/components/step/step-clone-dialog/step-clone-dialog.component';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {Utils} from '@app/utils';
import {CommentType} from '@app/interfaces/comment-type.dto';
import {Run} from '@app/interfaces/Run';
import * as _ from 'lodash';
import {RunValidationService} from '@app/services/run-validation.service';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {LoggerService} from '@app/services/logger.service';
import { OfflineService } from '@app/services/offline.service';

@Component({
  selector: 'app-procedurestepscontainer',
  host: { class: 'flex-row' },
  templateUrl: './procedurestepscontainer.component.html',
  styleUrls: ['./procedurestepscontainer.component.css']
})
export class ProcedurestepscontainerComponent implements OnInit, OnDestroy, AfterViewChecked {

  @Input() blackliningEnabled: boolean = false;
  @Input() public run: Run = null;  // Will be null if this is not a run.
  lockedFromEditing: boolean = false;
  @Input() set isLockedFromEditing(value: boolean) {
    this.lockedFromEditing = value;
  } // controls whether is editable
  @Input() procedureData: ProcedureDetails;
  @Input() printMode: boolean = false;
  @Output() procedureDataChange = new EventEmitter();
  @Input() sideNavOpen: boolean; // controls if the nav panel is open or not
  expandAllSidenav: boolean;
  @Input() expandAllMainContent: boolean = false;
  @Input() disableStepPerformancePlaceholders: boolean = false;
  enteredList: any; // this tracks what container the current dragged element is currently in.
  @ViewChild('stepNavPanel', {}) stepNavPanel;
  @ViewChild('scrollContainer', {}) private scrollContainer: ElementRef;
  scrollPosition = 0;
  groupDragIsDone: boolean = true;
  public EditType = EditType;
  private subscriptions: { [id: string]: Subscription } = {};

  constructor(
    public dialog: MatDialog,
    public epicService: EPICWSService,
    private snackBar: MatSnackBar,
    private messageService: MessageService,
    private redLineReportingService: LineEditReportingService,
    private runValidationService: RunValidationService,
    private offlineService: OfflineService,
    private loggerService: LoggerService
  ) {
  }

  ngOnInit() {
    this.sideNavOpen = false; // only main content should be initially shown
    this.expandAllSidenav = false;
    this.scrollPosition = 0;

    // Lock editing when offline mode engaged.
    this.subscriptions.offline = (this.offlineService.offlineSubject.subscribe( () => {
      if (this.offlineService.offline) this.lockedFromEditing = true;
    }));
  }

  ngAfterViewChecked(): void {
    if (this.scrollContainer.nativeElement.scrollTop === 0) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollPosition;
    }
  }

  onScroll(event): void {
    this.scrollPosition = event.currentTarget.scrollTop;
  }

  groupIdentity = (index: number, item: StepGroupDef) => item.pk;

  openCloneStepDialog(event): void {
    this.dialog.open(StepCloneDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        redliningEnabled: this.procedureData.redliningEnabled
      }
    });
  }

  drop(event): void {
    this.groupDragIsDone = false;
    if (this.procedureData.redliningEnabled) {
      this.saveRedLineEditsFromDragAndDropOfGroups(event);
    } else {
      moveItemInArray(this.procedureData.stepGroupDefs, event.previousIndex, event.currentIndex);

      const startingIndex = Math.min(event.previousIndex, event.currentIndex);
      const endingIndex = Math.max(event.previousIndex, event.currentIndex);
      this.procedureData.stepGroupDefs = Utils.updateDisplayOrdersForArrayItems(this.procedureData.stepGroupDefs, startingIndex, endingIndex);

      this.loggerService.info('Saving drag and drop of step group with pk ' + this.procedureData.stepGroupDefs[event.currentIndex].pk);
      this.epicService.updateStepGroupData(_.slice(this.procedureData.stepGroupDefs, startingIndex, endingIndex + 1), this.procedureData).subscribe((data) => {
        this.groupDragIsDone = true;
        if (data && !data.error) {
          data.forEach(sg => {
            this.procedureData.stepGroupDefs[sg.displayOrder - 1] = sg;
          });
          this.procedureDataChange.emit(this.procedureData);
          this.snackBar.open('Step Group Information', 'Saved!', {
            duration: 2000,
          });
          this.runValidationService.validateProcedure(this.procedureData);
        } else {
          this.loggerService.error('Could not save drag and drop for step group with pk ' + this.procedureData.stepGroupDefs[event.currentIndex].pk + ': ' + data.error);
          this.dialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error saving step group changes',
              errorMessage: data.error,
            }
          });
        }
      });
    }
  }

  saveRedLineEditsFromDragAndDropOfGroups(event: CdkDragDrop<Observable<any>>): void {
    // get a red line comment
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
        this.groupDragIsDone = true;
        return;
      } else {
        redLineCommentForEdit = data;
      }

      moveItemInArray(this.procedureData.stepGroupDefs, event.previousIndex, event.currentIndex);

      if (this.procedureData.stepGroupDefs[event.currentIndex].editType !== EditType.REDLINE_ADD &&
        this.procedureData.stepGroupDefs[event.currentIndex].editType !== EditType.REDLINE_DELETE) {
        this.procedureData.stepGroupDefs[event.currentIndex].editType = EditType.REDLINE_EDIT;
      }

      const startingIndex = Math.min(event.currentIndex, event.previousIndex);
      const endingIndex = Math.max(event.currentIndex, event.previousIndex);
      this.procedureData.stepGroupDefs = Utils.updateDisplayOrdersForArrayItems(this.procedureData.stepGroupDefs, startingIndex, endingIndex);

      const redLineData = new RedLine();
      redLineData.redLineComment = redLineCommentForEdit;
      redLineData.procedureDetailsPk = this.procedureData.pk;
      redLineData.stepGroupDef = this.procedureData.stepGroupDefs[event.currentIndex].asDTO();

      const nonRedlineGroupsToUpdate = _.filter(this.procedureData.stepGroupDefs, group => {
        return group.pk !== this.procedureData.stepGroupDefs[event.currentIndex].pk && group.displayOrder > startingIndex && group.displayOrder <= endingIndex + 1;
      });

      // we are going to save the updated step groups not as separate redlines (unneeded per EPIC-699), but as the stepGroupList on the RedLine data structure.
      redLineData.stepGroupDefList = _.map(nonRedlineGroupsToUpdate, group => group.asDTO());

      // save the changed subgroups
      this.loggerService.info('Saving red line drag and drop of step group with pk ' + this.procedureData.stepGroupDefs[event.currentIndex].pk);
      this.epicService.saveRedLineArrayToStepGroup([redLineData]).subscribe((updates) => {
        this.groupDragIsDone = true;
        if (!updates.error) {
          // already updated display orders in procedureData, so just emit the change
          updates.forEach(sg => {
            this.procedureData.stepGroupDefs = Utils.replaceStepGroupInProcedureDataWithChangedGroup(this.procedureData.stepGroupDefs, sg);
          });
          this.messageService.showSnackBar('Step group(s) updated as red line edits', 'CLOSE');
          this.redLineReportingService.findGroupLineEditsForProcedure(this.procedureData);
          this.procedureDataChange.emit(this.procedureData);
        } else {
          this.loggerService.error('Could not save red line drag and drop for step group with pk ' + this.procedureData.stepGroupDefs[event.currentIndex].pk + ': ' + data.error);
          this.dialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error saving step group red line edits due to reordering step groups',
              errorMessage: data.error,
            }
          });
        }
      });
    });
  }

  ngOnDestroy() {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }
}
