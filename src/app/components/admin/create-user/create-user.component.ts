import { Component, ViewChild } from '@angular/core';
import { Users } from '@app/interfaces/users';
import { NgForm } from '@angular/forms';
import { ItemCreationService } from '@app/services/item-creation.service';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent {

  public user: Partial<Users> = {};
  @ViewChild('form', /* TODO: add static flag */ {}) form: NgForm;
  public status: String;

  constructor(
    private itemCreationService: ItemCreationService,
    private loggerService: LoggerService
  ) { }



  public submit() {
    this.status = 'Adding...';

    this.user.email = `${this.user.username}@jhuapl.edu`;

    this.itemCreationService.createUser(this.user as Users).then((res) => {

      // If res, success!
      if (res) {
        this.status = 'Added!';
        this.form.resetForm();
        this.loggerService.info('Added new user', this.user);
      } else {
        this.status = 'Could not be added.';
        this.loggerService.error('Could not add new user', this.user);
      }
    });
  }
}
