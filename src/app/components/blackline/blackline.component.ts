import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EPICWSService} from '@app/services/epic-ws.service';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MessageService} from '@app/services/message.service';
import {BlackLineDto, BlackLineEntityType} from '@app/interfaces/black-line.dto';
import {CommentType} from '@app/interfaces/comment-type.dto';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { StepDef } from '@app/interfaces/step-def.interface';
import {LoggerService} from '@app/services/logger.service';
import { ProcedureChangeTypeDTO } from '@app/interfaces/procedure-change-type.dto';
import { LineEditService } from '@app/services/line-edit.service';
import { LineEditStateService } from '@app/services/line-edit-state.service';

@Component({
  selector: 'app-blackline',
  templateUrl: './blackline.component.html',
  styleUrls: ['./blackline.component.css']
})
export class BlacklineComponent implements OnInit {

  @Input() isReadOnly: boolean = false;
  @Input() step: StepDef;
  @Input() procedureData: ProcedureDetails;
  @Input() enableAddBlackLine: boolean = false;
  @Output() stepChange = new EventEmitter();
  @Output() procedureDataChange = new EventEmitter();
  blackLineForm: UntypedFormGroup;
  fetchIsDone: boolean = true;
  dataObject: any;
  public changeType: ProcedureChangeTypeDTO;

  constructor(
    public epicService: EPICWSService,
    private fb: UntypedFormBuilder,
    public messageService: MessageService,
    private loggerService: LoggerService,
    public lineEditService: LineEditService,
    private lineEditStateService: LineEditStateService
  ) {
  }

  ngOnInit() {
    this.blackLineForm = this.fb.group({
      commentText: ['', [Validators.maxLength(2048), Validators.required]],
      changeType: [null, [Validators.required]],
    });

    // TODO: Expand on this to add for other data object types (step group def, instruction)
    if (this.step) {
      this.dataObject = this.step;
    } else if (this.procedureData) {
      this.dataObject = this.procedureData;
    }
  }

  clearBlackLine() {
    this.blackLineForm.reset();
  }

  submitBlackLine() {
    if (this.blackLineForm.valid && this.changeType) {
      this.fetchIsDone = false;
      // create the black line object and set the fields.
      const blackLine: BlackLineDto = {
        commentText: this.blackLineForm.get('commentText').value,
        commentType: CommentType.BLACK_LINE_COMMENT,
        procedureChangeType: this.changeType,
        stepDef: this.step ? this.step.asDTO() : null,
        procedureDetails: (!this.step && this.procedureData) ? this.procedureData.asDTO() : null,
        blackRedLineSignatures: null,
        commentTimestamp: null,
        pk: null,
        procedureInstruction: null,
        stepGroupDef: null,
        users: null,
      };
      const entityType = blackLine.procedureDetails ? BlackLineEntityType.PROCEDURE_DETAILS : BlackLineEntityType.STEP;

      // call the service to save
      this.epicService.saveNewBlackLines([blackLine], entityType, false).subscribe((data) => {
        this.fetchIsDone = true;
        if (!data || data.errorMessage) {
          const msg: string = data ? data.errorMessage : "Unknown error.";
          this.loggerService.error('Error saving a blackline: ' + msg);
          this.messageService.showSnackBar('Could not save a black line:' + data.errorMessage, 'CLOSE');
        } else {
          const enrichedBlackLines = this.lineEditStateService.enrichSavedBlackLines(data, [blackLine]);
          this.lineEditService.announceBlackLineChanges(enrichedBlackLines);

          this.clearBlackLine();
          this.messageService.showSnackBar('Black Line Saved', 'CLOSE');
          this.loggerService.info('Saved a black line comment', enrichedBlackLines);
        }
      });
    }
  }

  onSelectChange(event: ProcedureChangeTypeDTO) {
    this.blackLineForm.get("changeType").setValue(event);
  }
}
