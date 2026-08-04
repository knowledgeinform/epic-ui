import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ProgramDTO } from '@app/interfaces/program.dto';
import { ItemCreationService } from '@app/services/item-creation.service';
import { NgForm } from '@angular/forms';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-create-program',
  templateUrl: './create-program.component.html',
  styleUrls: ['./create-program.component.css']
})
export class CreateProgramComponent implements OnInit {

  public prog: Partial<ProgramDTO> = {};
  @ViewChild('form', {}) form: NgForm;
  public status: String;

  @Output() public onSubmit = new EventEmitter<boolean>();

  constructor(
    private itemCreationService: ItemCreationService,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
  }

  public submit() {
    this.status = 'Adding...';
    this.itemCreationService.createProgram(this.prog as ProgramDTO).then((res) => {

      // If res, success!
      if (res) {
        this.status = 'Added!';
        this.form.resetForm();
        this.loggerService.info('Added new program', this.prog);
      } else {
        this.status = 'Could not be added.';
        this.loggerService.error('Could not add new program', this.prog);
      }

      this.onSubmit.next(!!res);
    });
  }

}
