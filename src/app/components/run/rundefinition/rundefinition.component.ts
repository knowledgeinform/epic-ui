import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {EPICWSService} from '@app/services/epic-ws.service';
import {Observable} from 'rxjs';
import {MessageService} from '@app/services/message.service';
import * as _ from 'lodash';
import {LoggerService} from '@app/services/logger.service';
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {ProcedureStatus} from "@app/interfaces/procedure-status.dto";

@Component({
  selector: 'app-rundefinition',
  templateUrl: './rundefinition.component.html',
  styleUrls: ['./rundefinition.component.css']
})
export class RundefinitionComponent implements OnInit {

  runNumber: number;
  procedureData: object;
  selectionLoadComplete = false;
  data: any;
  runNameInput: boolean;
  isValidRunName: boolean;
  willBeLocked: boolean = false;
  @Input() disableForSaving = false;
  @Input() error: any;
  @Input() selectedProcedureDetails: ProcedureDetails;
  @Output() runDef: EventEmitter<any> = new EventEmitter();
  form = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    testingPhase: ['', Validators.required]
  });
  constructor(private formBuilder: UntypedFormBuilder,
              public epicService: EPICWSService,
              public messageService: MessageService,
              private loggerService: LoggerService) { }

  ngOnInit() {
    this.data = new Observable();
    // FIXME: Make a new service call to get phase selections
    this.runNameInput = true;
    this.loggerService.info('Retrieving program/subsystem/testing phase options');
    this.epicService.getCreateProcedureSelections().subscribe((data) => {
      this.selectionLoadComplete = true;
      if (data.error) {
        this.loggerService.error('Could not retrieve program/subsystem/testing phase options');
        this.error = data.error;
      }
      this.data = data;
      if (this.selectedProcedureDetails.status.valueOf() !== 'READY') {
        // if here, the procedure details status was not READY
        // we should never actually be here, because we should only get to this component if the user has previously
        // selected an acceptable pdv, but this is here to error check just in case.

        // emit an error message
        this.runDef.emit({'error': 'The version of the selected procedure details is not READY status'});
      } else {
        if (!_.isNil(this.selectedProcedureDetails.redlinedVersion)
          && this.selectedProcedureDetails.redlinedVersion.length > 0) {
          // if here, a redlined run already exists for this procedure version.
          this.loggerService.warn('Will not be able to create red lines on new run for procedure revision with pk ' +
            this.selectedProcedureDetails.pk + '; redlined version=' + this.selectedProcedureDetails.redlinedVersion);
          this.willBeLocked = true;
        }
        if (!_.isNil(this.selectedProcedureDetails.procedureDetailRuns) &&
          this.selectedProcedureDetails.procedureDetailRuns.length === 0) {
          this.runNumber = 1;
        } else {
          this.runNumber = this.selectedProcedureDetails.procedureDetailRuns.length + 1;
        }
      }
    });


  }

  onSubmit() {
    if (this.form.valid) {
      if (this.form.get('name').value !== null && this.form.get('name').value !== undefined &&
        this.form.get('name').value.length > 0) {
        if (!this.isValidRunName) {
          this.runDef.emit({'runInfo': undefined});
          return;
        }
      }
      const runDefObject = {'runInfo': this.form, 'procedureDetails': this.selectedProcedureDetails, 'runNumber': this.runNumber};
      this.runDef.emit(runDefObject);
    }
  }

  checkUniqueRunName(): void {
    const runNameToCheck = this.form.get('name').value;

    if (_.isEmpty(runNameToCheck)) {
      this.isValidRunName = undefined;
      this.runDef.emit({'runInfo': undefined});
      return;
    }

    this.runNameInput = false;
    this.runDef.emit({'runInfo': undefined});
    this.loggerService.info('Checking for unique run name given name ' + runNameToCheck);
    this.epicService.checkForUniqueRunName(encodeURIComponent(runNameToCheck)).subscribe((data) => {
      // Check if the error message exists to determine if an error was returned
      if (data.errorMessage !== undefined) {
        this.isValidRunName = false;
        this.loggerService.error('Unable to check proposed run name ' + runNameToCheck);
        this.messageService.showSnackBar('Unable to check uniqueness of proposed run name: \"' + runNameToCheck  + '\" caused by error: ' + data.errorMessage, 'CLOSE', 10000);
        this.form.get('name').reset();
      } else {
        // if no error message, check if the boolean returned was true or false
        if (data) {
          // name is unique, can proceed
          this.isValidRunName = true;
        } else if (!data) {
          this.isValidRunName = false;
          this.loggerService.error('Run name unique check returned not true for proposed run name ' + runNameToCheck, data);
          this.messageService.showSnackBar('Run with this name already exists - use a different name.', 'CLOSE');
          this.form.get('name').reset();
        }
      }
      this.runNameInput = true;
      this.onSubmit();
    });

  }
}
