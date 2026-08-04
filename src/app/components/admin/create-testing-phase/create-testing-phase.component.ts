import { Component, OnInit, ViewChild } from '@angular/core';
import { TestingPhase } from '@app/interfaces/testing-phase.dto';
import { ItemCreationService } from '@app/services/item-creation.service';
import { NgForm } from '@angular/forms';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-create-testing-phase',
  templateUrl: './create-testing-phase.component.html',
  styleUrls: ['./create-testing-phase.component.css']
})
export class CreateTestingPhaseComponent implements OnInit {

  public testingPhase: Partial<TestingPhase> = {};
  @ViewChild('form', /* TODO: add static flag */ {}) form: NgForm;
  public status: String;

  constructor(
    private itemCreationService: ItemCreationService,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
  }

  public submit() {
    this.status = 'Adding...';

    this.itemCreationService.createTestingPhase(this.testingPhase as TestingPhase).then((res) => {

      // If res, success!
      if (res) {
        this.status = 'Added!';
        this.form.resetForm();
        this.loggerService.info('Added new testing phase', this.testingPhase);
      } else {
        this.status = 'Could not be added.';
        this.loggerService.error('Could not add testing phase', this.testingPhase);
      }
    });
  }
}
