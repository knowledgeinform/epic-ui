import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {StepgroupAuthoringDialogComponent} from "@app/components/step-group/stepgroup-authoring-dialog/stepgroup-authoring-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {Run} from "@app/interfaces/Run";
import {StepCloneDialogComponent} from "@app/components/step/step-clone-dialog/step-clone-dialog.component";

@Component({
  selector: 'app-procedure-steps-toolbar',
  templateUrl: './procedure-steps-toolbar.component.html',
  styleUrls: ['./procedure-steps-toolbar.component.css']
})
export class ProcedureStepsToolbarComponent implements OnInit {

  sideNavOpen: boolean; // controls if the nav panel is open or not
  @Input() expandAllMainContent: boolean = false;
  @Input() procedureData: ProcedureDetails;
  @Input() isLockedFromEditing: boolean; // controls whether is editable
  @Input() public run: Run = null;  // Will be null if this is not a run.
  @Input() redliningEnabled: boolean = false;
  @Output() expandStepsChange = new EventEmitter();
  @Output() openSideNavChange = new EventEmitter();

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  toggleSideNav(): void {
    this.sideNavOpen = !this.sideNavOpen;
    this.openSideNavChange.emit(this.sideNavOpen);
  }

  toggleExpandAllInMainContent(): void {
    this.expandAllMainContent = !this.expandAllMainContent;
    this.expandStepsChange.emit(this.expandAllMainContent);
  }

  // opens the add step group dialog
  addStepGroup(event, parentStepGroup): void {
    this.dialog.open(StepgroupAuthoringDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        parentStepGroup: parentStepGroup,
        redliningEnabled: this.procedureData.redliningEnabled
      }
    });
  }

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

}
