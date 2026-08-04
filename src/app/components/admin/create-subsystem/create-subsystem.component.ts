import { Component, OnInit, ViewChild } from '@angular/core';
import { Subsystem } from '@app/interfaces/subsystem.dto';
import { ItemCreationService } from '@app/services/item-creation.service';
import { NgForm } from '@angular/forms';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-create-subsystem',
  templateUrl: './create-subsystem.component.html',
  styleUrls: ['./create-subsystem.component.css']
})
export class CreateSubsystemComponent implements OnInit {

  public subsystem: Partial<Subsystem> = {};
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

    this.itemCreationService.createSubsystem(this.subsystem as Subsystem).then((res) => {

      // If res, success!
      if (res) {
        this.status = 'Added!';
        this.form.resetForm();
        this.loggerService.info('Added new subsystem', this.subsystem);
      } else {
        this.status = 'Could not be added.';
        this.loggerService.error('Could not add new subsystem', this.subsystem);
      }

    });
  }

}
