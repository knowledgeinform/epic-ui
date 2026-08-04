import {Component, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {RedBlackLineComment} from '@app/interfaces/comment.dto';
import {EPICWSService} from '@app/services/epic-ws.service';
import * as _ from 'lodash';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { RosterService, UserRolesPair } from '@app/services/roster.service';
import { BlackLineDto } from '@app/interfaces/black-line.dto';
import { LineEditService } from '@app/services/line-edit.service';

@Component({
  selector: 'app-line-edit-comments',
  templateUrl: './line-edit-comments.component.html',
  styleUrls: ['./line-edit-comments.component.css']
})
export class LineEditCommentsComponent implements OnInit, OnChanges {

  @Input() comment: RedBlackLineComment | BlackLineDto;
  @Input() procedureData: ProcedureDetails;
  @Input() isReadOnly: boolean = false;

  public roster: UserRolesPair[];

  constructor(
    public epicService: EPICWSService,
    private rosterService: RosterService,
    private lineEditService: LineEditService
  ) { }

  ngOnInit():void {
    this.lineEditService.lineSignatureChanged.subscribe((data)=>{// subsribe for getting the newignature 
       // Make sure we updating the same procesure and comment as the emitted one 
      if ( this.procedureData.pk== data.procedurePk && !_.isNil(this.comment) && this.comment.pk == data.signature.comment.pk) {
        if (_.isNil(this.comment.blackRedLineSignatures) ) // this commment has no signatures yet, create the new array 
          this.comment.blackRedLineSignatures = []; 
        const signature = _.find(this.comment.blackRedLineSignatures, elem=>elem.programRole.pk == data.signature.programRole.pk);
        if ( _.isNil(signature))
          this.comment.blackRedLineSignatures.push(data.signature); 
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.procedureData) {
      const programPk = this.procedureData.procedureDef.program.pk;
      this.rosterService.get(programPk, true).then(roster => this.roster = roster);
    }
  }

}
