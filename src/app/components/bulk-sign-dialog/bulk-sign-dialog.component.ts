import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {SelectionModel} from "@angular/cdk/collections";
import {
  MultiSelectGroupsStepsComponent,
  SGNode
} from "@app/components/multi-select-groups-steps/multi-select-groups-steps.component";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {LineEditReportingService} from "@app/services/line-edit-reporting.service";
import {MessageService} from "@app/services/message.service";
import {LineEditService} from "@app/services/line-edit.service";
import {Users} from "@app/interfaces/users";
import {Utils} from "@app/utils";
import * as _ from "lodash";
import {BlackRedLineSignature} from "@app/interfaces/second-signature.dto";
import {LoggerService} from '@app/services/logger.service';
import {ProgramRoleDTO} from "@app/interfaces/program-role.dto";
import {RoleService} from "@app/services/role.service";
import {SignCommentComponent} from "@app/components/line-edit-comments/sign-comment/sign-comment.component";
import {RoleSelectionComponent} from "@app/components/role-selection/role-selection.component";
import {MatStepper} from "@angular/material/stepper";

@Component({
  selector: 'app-bulk-sign-dialog',
  templateUrl: './bulk-sign-dialog.component.html',
  styleUrls: ['./bulk-sign-dialog.component.css']
})
export class BulkSignDialogComponent implements OnInit {
  fetching = false;
  @Input() procedureData: ProcedureDetails;
  @Input() redBlackLineComments: boolean;
  @Input() redLines: boolean;
  @Input() public role?: ProgramRoleDTO;
  @Output() stepChange = new EventEmitter();
  checklistSelection = new SelectionModel<SGNode>(true /* multiple */);
  @ViewChild(SignCommentComponent) signCommentComponent!: SignCommentComponent;
  @ViewChild(RoleSelectionComponent) roleSelectionComponent!: RoleSelectionComponent;
  @ViewChild(MatStepper) stepper: MatStepper;
  @ViewChild(MultiSelectGroupsStepsComponent) multiSelectGroupsStepsComponent: MultiSelectGroupsStepsComponent;
  displayRoleName: String = "";
  roleSelected: boolean = false;

  constructor( public parentDialogRef: MatDialogRef<BulkSignDialogComponent>,
               @Inject(MAT_DIALOG_DATA) data:any,
               public lineEditReportingService: LineEditReportingService,
               public messageService: MessageService,
               public lineEditService: LineEditService,
               private loggerService: LoggerService,
               private changeDetectorRef: ChangeDetectorRef)
  {
    this.procedureData = data.procedureData;
    this.redLines = data.redLines;
    this.redBlackLineComments = data.redBlackLineComments;
  }
  ngOnInit(): void {}

  ngAfterViewChecked(){
    //handle role/comment selection change
    this.changeDetectorRef.detectChanges();
  }

  receiveCommentSelection($event) {
    this.checklistSelection = $event;
    if (this.checklistSelection.selected.length > 0){
      this.stepper.selected.completed = true;
    }
  }

  onCancel() {
    this.parentDialogRef.close();
  }

  lineSign() {
    if (this.signCommentComponent.formControl.value.length > 0) {
      // parse the username and pin
      const signature = this.signCommentComponent.formControl.value;
      const userInfo = new Users().loadFromDTO(this.lineEditService.parseSignatureStringForUserNameAndPin(signature));
      if (_.isNil(userInfo)) {
        this.messageService.showSnackBar('Invalid entry, could not parse the signature. Ensure that you have entered your 521 ' +
          'followed by your six digit pin.', 'CLOSE');
        this.loggerService.warn('Could not parse signature given value', signature);
        this.signCommentComponent.formControl.reset();
        return;
      }

      //loop through and get comment object
      const signatureArray: BlackRedLineSignature[] = new Array<BlackRedLineSignature>();

      this.checklistSelection.selected.forEach(node => {
        if (node.comment && this.role.pk) {
          signatureArray.push(Utils.createBlackRedLineSignature(node.comment, userInfo, this.role));
        } else if (node.comment) {
          signatureArray.push(Utils.createBlackRedLineSignature(node.comment, userInfo, null));
        }
      });

      //Send array
      this.lineEditService.saveBlackRedLineSignature(signatureArray).subscribe((data) => {
        if (_.isNil(data.errorMessage)) {
          this.loggerService.info('Successfully saved signature for line edits');
          this.messageService.showSnackBar('Line edit approval saved', 'CLOSE');
          this.lineEditReportingService.findAllLineEdits(this.procedureData);
          // announce line edit signature changes
          this.lineEditService.announceLineSignatureChanges(this.procedureData.pk, data);
          this.parentDialogRef.close();
        } else {
          this.loggerService.error('Error saving signature for line edits: ' + data.errorMessage);
          this.messageService.showSnackBar("Unable to save red/black line signature, error caused by: " + data.errorMessage, 'CLOSE', 10000);
          this.signCommentComponent.formControl.reset();
        }
      });
    };
  }

  receiveRoleSelectionSelection(event) {
    this.displayRoleName = event.name;
    this.role = event;
    this.stepper.selected.completed = true;
    this.stepper.next();
    this.stepper.selectedIndex = 1;
    this.roleSelected = true;
    this.checklistSelection.clear();

    //reload step selection component
    if (this.multiSelectGroupsStepsComponent) {
      this.multiSelectGroupsStepsComponent.role = event;
      this.multiSelectGroupsStepsComponent.loadProcedureDefinition(this.procedureData, true);
    }

  }
  resetSignature() {
    this.role = undefined;
    this.displayRoleName = "";
    this.checklistSelection.clear();
    if ( this.signCommentComponent && this.signCommentComponent.formControl)
      this.signCommentComponent.formControl.reset();
    this.roleSelectionComponent.selectedRoleName = "";
    this.stepper.reset();
  }
}
