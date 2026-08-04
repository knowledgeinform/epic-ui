import { Injectable } from '@angular/core';
import {StepDefDTO} from '@app/interfaces/step-def.dto.interface';
import {ProcedureDetailsDTO} from '@app/interfaces/procedure-details.dto';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import * as _ from 'lodash';
import {RunCloseoutStickyComment} from '@app/interfaces/comment.dto';
import { ProcedureDetails } from '@app/interfaces/procedure-details';

@Injectable({
  providedIn: 'root'
})
export class RunCloseoutStickyReportingService {

  public stepsWithStickyComments: {
    [procedureId: string]: StepDefDTO[]
  } = {};

  public totalCountOfStepsWithStickyComments: {
    [procedureId: string]: number;
  } = {};

  public groupsWithStickyComments: {
    [procedureId: string]: StepGroupDef[]
  } = {};

  public totalCountOfGroupsWithStickyComments: {
    [procedureId: string]: number;
  } = {};

  public totalCountOfStickiesInProcedure: {
    [procedureId: string]: number;
  } = {};

  // TODO: Add for instructions, procedure level

  constructor() { }

  public findAllStickyComments(procedure: ProcedureDetails): void {
    this.findAllGroupsStickyComments(procedure);
    this.totalCountOfStickiesInProcedure[procedure.pk] = 0;
    this.getTotalStickyCommentCountForProcedure(procedure);
  }

  public findAllGroupsStickyComments(procedure: ProcedureDetails): void {
    this.stepsWithStickyComments[procedure.pk] = [];
    this.groupsWithStickyComments[procedure.pk] = [];
    this.totalCountOfStepsWithStickyComments[procedure.pk] = 0;
    this.totalCountOfGroupsWithStickyComments[procedure.pk] = 0;
    this.findStickiesinArrayOfGroups(procedure.pk, procedure.stepGroupDefs, null);
    this.getTotalGroupStickiesCount(procedure);
    this.getTotalStepStickiesCount(procedure);
  }

  private findStickiesinArrayOfGroups(procedurePk: number, stepGroups: StepGroupDef[], parentGroup: StepGroupDef): void {
    if (_.isEmpty(stepGroups)) {
      return;
    }
    let stepsWithStickies = [];
    stepGroups.forEach(sg => {
      if (!_.isEmpty(sg.stepDefs)) {
        stepsWithStickies = stepsWithStickies.concat(sg.stepDefs.filter((step) => !_.isEmpty(step.runCloseoutStickyComments))
          .map((step) => {
            const clonedStep = _.clone(step);
            clonedStep.stepGroupDef = sg;
            clonedStep.stepGroupDef.stepGroupDefParent = parentGroup;
            return clonedStep;
          })
        );
        this.stepsWithStickyComments[procedurePk].push(...stepsWithStickies);
        stepsWithStickies = [];
      }
      if (!_.isEmpty(sg.runCloseoutStickyComments)) {
        const clonedSG = _.clone(sg);
        clonedSG.stepGroupDefParent = parentGroup;
        this.groupsWithStickyComments[procedurePk].push(clonedSG);
      }
      if (!_.isEmpty(sg.stepGroupDefsChildren)) {
        this.findStickiesinArrayOfGroups(procedurePk, sg.stepGroupDefsChildren, sg);
      }
    });
  }

  public getTotalStickyCommentCountForProcedure(procedure: ProcedureDetails): number {
    // TODO: Change this to be more meaningful condition when this service is fully implemented
    if (!this.stepsWithStickyComments[procedure.pk]) {
      return 0;
    }
    const fullArrayOfAllStickies = this.getAllInstructionGroupAndStepStickies(procedure);
    this.totalCountOfStickiesInProcedure[procedure.pk] = fullArrayOfAllStickies.length;
  }

  public getTotalStepStickiesCount(procedure: ProcedureDetails): number {
    if (!this.stepsWithStickyComments[procedure.pk]) {
      return 0;
    }
    const allStepStickies = _.flatten(this.stepsWithStickyComments[procedure.pk].map((step) => {
      return step.runCloseoutStickyComments;
    }));
    this.totalCountOfStepsWithStickyComments[procedure.pk] = allStepStickies.length;
  }

  public getTotalGroupStickiesCount(procedure: ProcedureDetails): number {
    if (!this.groupsWithStickyComments[procedure.pk]) {
      return 0;
    }
    const allGroupStickies = _.flatten(this.groupsWithStickyComments[procedure.pk].map((group) => {
      return group.runCloseoutStickyComments;
    }));
    this.totalCountOfGroupsWithStickyComments[procedure.pk] = allGroupStickies.length;
  }

  private getAllInstructionGroupAndStepStickies(procedure: ProcedureDetails): RunCloseoutStickyComment[] {
    let fullArrayOfAllStickies = [];

    // TODO: Add for instructions;

    fullArrayOfAllStickies = _.flatten(this.groupsWithStickyComments[procedure.pk].map((group) => {
      return group.runCloseoutStickyComments;
    }));
    fullArrayOfAllStickies = fullArrayOfAllStickies.concat(_.flatten(this.stepsWithStickyComments[procedure.pk].map((step) => {
      return step.runCloseoutStickyComments;
    })));
    return fullArrayOfAllStickies;
  }
}
