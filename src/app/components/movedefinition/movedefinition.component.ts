import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EditType} from '@app/interfaces/edit-type.dto';
import {StepDisplayNamePipe} from '@app/pipes/step-display-name.pipe';
import * as _ from 'lodash';
import {ProcedureDetails} from '@app/interfaces/procedure-details';

@Component({
  selector: 'app-movedefinition',
  templateUrl: './movedefinition.component.html',
  styleUrls: ['./movedefinition.component.css']
})
export class MovedefinitionComponent implements OnInit {

  parentSelected: object;
  olderSibling: object;
  siblings: object[];
  @Input() disableForSaving = false;
  @Input() allOptions: any[];
  @Input() entityType: string;
  @Input() movingEntity: object;
  @Input() procedureData: ProcedureDetails;
  @Output() movingChange = new EventEmitter();
  newArray: object[];
  constructor() { }

  ngOnInit() {
  }

  displaySiblings(value): void {
    this.siblings = [];
    this.newArray = [];
    this.siblings.push({pk: -1, selectDisplayName: 'Make this the first ' + this.entityType + '.',
      item: {pk: -1, stepGroupDefParent: this.parentSelected}});
    if (this.entityType === 'Step Group') {
      if (value['pk'] === -1) {
        this.procedureData.stepGroupDefs.forEach(group => {
          if (group.pk !== this.movingEntity['pk']) {
            if (group.editType !== EditType.REDLINE_DELETE) {
              this.siblings.push({pk: group.pk, selectDisplayName: group.stepGroupName, item: group});
            }
            this.newArray.push(group);
          }
        });
      } else if (value.stepGroupDefsChildren === null || value.stepGroupDefsChildren === undefined ||
        value.stepGroupDefsChildren.length === 0) {
        this.newArray = [];
      } else {
        value.stepGroupDefsChildren.forEach(item => {
          if (item.pk !== this.movingEntity['pk'] && item.editType !== EditType.REDLINE_DELETE) {
            this.siblings.push({selectDisplayName: item.stepGroupName, item: item});
          }
        });
        this.newArray = value.stepGroupDefsChildren;
      }
    } else if (this.entityType === 'Step') {
      _.forEach(value.stepDefs, step => {
        if (step.pk !== this.movingEntity['pk'] && step.editType !== EditType.REDLINE_DELETE) {
          this.siblings.push({selectDisplayName: new StepDisplayNamePipe().transform(step), item: step});
        }
      });
    }
  }

  emitMovingChange(event): void {
    this.movingChange.emit({newArray: this.newArray, olderSibling: event.value, parentSelected: this.parentSelected});
  }

}
