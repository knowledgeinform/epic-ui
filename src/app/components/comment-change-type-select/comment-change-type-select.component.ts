import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ProcedureChangeTypeDTO } from '@app/interfaces/procedure-change-type.dto';
import { ProgramDTO } from '@app/interfaces/program.dto';
import { ProcedureChangeTypeService } from '@app/services/procedure-change-type.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-comment-change-type-select',
  templateUrl: './comment-change-type-select.component.html',
  styleUrls: ['./comment-change-type-select.component.css']
})
export class CommentChangeTypeSelectComponent implements OnInit {

  @Input() procedureChangeType: ProcedureChangeTypeDTO;
  @Output() procedureChangeTypeChange = new EventEmitter<ProcedureChangeTypeDTO>();
  @Input() program: ProgramDTO;
  public changeTypes: ProcedureChangeTypeDTO[];

  constructor(
  private changeTypeService: ProcedureChangeTypeService,
  ) { }

  ngOnInit() {
    this.changeTypeService.getChangeTypes(this.program.pk)
      .then(changeTypes => {
        this.changeTypes = (changeTypes || []).filter(ct => ct.isEnabled);
      });
  }

  public onSelectChange(event: MatSelectChange) {
    this.procedureChangeType = event.value;
    this.procedureChangeTypeChange.next(this.procedureChangeType);
  }

}
