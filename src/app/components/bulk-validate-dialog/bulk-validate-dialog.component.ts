import { Component, OnInit, Inject, Input, Output, EventEmitter,} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {ManualStepValidationDialogComponent} from '../manual-step-validation-dialog/manual-step-validation-dialog.component';
import { StepDef } from '@app/interfaces/step-def.interface';
import { SGNode } from '../multi-select-groups-steps/multi-select-groups-steps.component';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {MessageService} from '@app/services/message.service';
import { LineEditService } from '@app/services/line-edit.service';

@Component({
  selector: 'app-bulk-validate-dialog',
  templateUrl: './bulk-validate-dialog.component.html',
  styleUrls: ['./bulk-validate-dialog.component.css']
})
export class BulkValidateDialogComponent implements OnInit {

  fetching = false;
  @Input() procedureData: ProcedureDetails;
  @Input() redBlackLineComments: boolean;
  @Input() redLines: boolean;
  @Output() stepChange = new EventEmitter();
  checklistSelection = new SelectionModel<SGNode>(true /* multiple */);

  constructor( public blkCommentDialog: MatDialog,
               public parentDialogRef: MatDialogRef<BulkValidateDialogComponent>,
               @Inject(MAT_DIALOG_DATA) data:any,
               public lineEditReportingService: LineEditReportingService,
               public messageService: MessageService,
               public lineEditService: LineEditService)
  {
    this.procedureData = data.procedureData;
    this.redLines = data.redLines;
    this.redBlackLineComments = data.redBlackLineComments;
  }
  ngOnInit(): void {}

  receiveStepsSelection(event) {
    this.checklistSelection = event;
  }
  bulkBlacklineComment() {

    const steps: StepDef[] = [];
    this.checklistSelection.selected.forEach(sg => {
      if (!sg.isParent) {
        steps.push(sg.leaf);
      }
    });
    const blkCommentDialogRef = this.blkCommentDialog.open(ManualStepValidationDialogComponent, {
      width: '550px',
      minHeight: '220px',
      disableClose: true,
      data: {
        target: steps,
        procedureData: this.procedureData
      }
    });

    blkCommentDialogRef.afterClosed().subscribe(result => {

      // Close the parent dialog.
      this.parentDialogRef.close();
      this.lineEditService.announceBlackLineChanges(result);
      this.lineEditReportingService.findAllLineEdits(this.procedureData);
    });
  }

  onCancel() {
    this.parentDialogRef.close();
  }
}
