import { Injectable } from '@angular/core';
import {RedLineComment} from '@app/interfaces/comment.dto';
import * as _ from 'lodash';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {BlackLineDto} from '@app/interfaces/black-line.dto';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {StepDef} from '@app/interfaces/step-def.interface';
import {ProcedureInstruction} from '@app/interfaces/procedure-instruction';

@Injectable({
  providedIn: 'root'
})
export class LineEditReportingService {

  public procedureLevelRedLines = new LineList<RedLineComment>();
  public instructionRedLines = new LineList<ProcedureInstruction>();
  public groupRedLines = new LineList<StepGroupDef>();
  public stepRedLines = new LineList<StepDef>();
  public procedureLevelBlackLines = new LineList<BlackLineDto>();
  public stepBlackLines = new LineList<StepDef>();

  public totalRedLineCount = new LineCount();
  public procedureRedLineCount = new LineCount();
  public instructionRedLineCount = new LineCount();
  public groupRedLineCount = new LineCount();
  public stepRedLineCount = new LineCount();
  public totalBlackLineCount = new LineCount();
  public procedureBlackLineCount = new LineCount();
  public instructionBlackLineCount = new LineCount();
  public groupBlackLineCount = new LineCount();
  public stepBlackLineCount = new LineCount();

  constructor() { }

  public findAllLineEdits(procedure: ProcedureDetails): void {
    this.findInstructionLineEditsForProcedure(procedure);
    this.findGroupLineEditsForProcedure(procedure);
    this.findTopLevelLineEditsForProcedure(procedure);
    this.updateTotalRedLineCount(procedure);
    this.updateTotalBlackLineCount(procedure);
  }

  public updateTotalRedLineCount(procedure: ProcedureDetails): void {
    const fullArrayOfAllRedLines = this.getAllInstructionGroupAndStepRedLinePks(procedure);
    this.totalRedLineCount.setCount(procedure.pk, this.procedureLevelRedLines.getLines(procedure.pk).length + fullArrayOfAllRedLines.length);
  }

  public updateTotalInstructionRedLineCount(procedure: ProcedureDetails): void {
    const allInstructionRedLines = _.flatten(this.instructionRedLines.getLines(procedure.pk).map((redLine) => {
      return redLine.redLineComments.map((c) => c.pk);
    }));
    this.instructionRedLineCount.setCount(procedure.pk, allInstructionRedLines.length);
  }

  public updateTotalGroupRedLineCount(procedure: ProcedureDetails): void {
    const allGroupRedLines = _.flatten(this.groupRedLines.getLines(procedure.pk).map((redLine) => {
      return redLine.redLineComments.map((c) => c.pk);
    }));
    this.groupRedLineCount.setCount(procedure.pk, allGroupRedLines.length);
  }

  public updateTotalStepRedLineCount(procedure: ProcedureDetails): void {
    const allStepRedLines = _.flatten(this.stepRedLines.getLines(procedure.pk).map((step) => {
      return step.redLineComments.map((c) => c.pk);
    }));
    this.stepRedLineCount.setCount(procedure.pk, allStepRedLines.length);
  }

  public updateTotalBlackLineCount(procedure: ProcedureDetails): void {
    const allStepBlackLines = this.getAllNonProcedureLevelBlackLines(procedure);
    this.totalBlackLineCount.setCount(procedure.pk, this.procedureLevelBlackLines.getLines(procedure.pk).length + allStepBlackLines.length);
  }

  public updateTotalStepBlackLineCount(procedure: ProcedureDetails): void {
    this.stepBlackLineCount.setCount(procedure.pk, this.getAllNonProcedureLevelBlackLines(procedure).length);
  }

  public findTopLevelLineEditsForProcedure(procedure: ProcedureDetails): void {
    if (_.isEmpty(procedure.redLineComments) && _.isEmpty(procedure.blackLineComments)) {
      return;
    }
    const topLevelRLs = procedure.redLineComments.filter((comment) => {
      const fullArrayOfAllRedLines = this.getAllInstructionGroupAndStepRedLinePks(procedure);
      return !fullArrayOfAllRedLines.includes(comment.pk);
    });

    const topLevelBLs = procedure.blackLineComments.filter((comment) => {
      return !this.getAllNonProcedureLevelBlackLines(procedure).includes(comment.pk);
    });
    this.procedureLevelRedLines.setLines(procedure.pk, topLevelRLs);
    this.procedureLevelBlackLines.setLines(procedure.pk, topLevelBLs);
    this.procedureRedLineCount.setCount(procedure.pk, topLevelRLs ? topLevelRLs.length : 0);
    this.procedureBlackLineCount.setCount(procedure.pk, topLevelBLs ? topLevelBLs.length : 0);
    this.updateTotalRedLineCount(procedure);
    this.updateTotalBlackLineCount(procedure);
  }

  public findInstructionLineEditsForProcedure(procedure: ProcedureDetails): void {
    const redLinedInstructions = procedure.procedureInstructions.filter(i => !_.isEmpty(i.redLineComments));
    this.instructionRedLines.setLines(procedure.pk, redLinedInstructions);
    this.updateTotalInstructionRedLineCount(procedure);
    this.updateTotalRedLineCount(procedure);
  }

  public findGroupLineEditsForProcedure(procedure: ProcedureDetails): void {
    this.stepRedLines.setLines(procedure.pk, []);
    this.groupRedLines.setLines(procedure.pk, []);
    this.stepBlackLines.setLines(procedure.pk, []);
    this.findGroupsWithLineEdits(procedure.pk, procedure.stepGroupDefs, null);
    this.stepBlackLines.setLines(procedure.pk, this.getUniqueStepsWithBlackLines(this.stepBlackLines.getLines(procedure.pk)));
    this.updateTotalGroupRedLineCount(procedure);
    this.updateTotalStepRedLineCount(procedure);
    this.updateTotalStepBlackLineCount(procedure);
    this.updateTotalRedLineCount(procedure);
  }

  private findGroupsWithLineEdits(procedurePk: number, stepGroups: StepGroupDef[], parentGroup: StepGroupDef): void {
    if (_.isEmpty(stepGroups)) {
      return;
    }
    let stepsWithRedLines = [];
    let stepsWithBlackLines = [];
    stepGroups.forEach(sg => {
      if (!_.isEmpty(sg.stepDefs)) {
        stepsWithRedLines = stepsWithRedLines.concat(sg.stepDefs.filter((step) => !_.isEmpty(step.redLineComments))
          .map((step) => {
            const clonedStep = _.clone(step);
            clonedStep.stepGroupDef = sg;
            clonedStep.stepGroupDef.stepGroupDefParent = parentGroup;
            return clonedStep;
          })
        );
        stepsWithRedLines.forEach(step => this.stepRedLines.getLines(procedurePk).push(step));
        stepsWithRedLines = [];

        stepsWithBlackLines = stepsWithBlackLines.concat(sg.stepDefs.filter((step) => !_.isEmpty(step.blackLineComments))
          .map((step) => {
            const clonedStep = _.clone(step);
            clonedStep.stepGroupDef = sg;
            clonedStep.stepGroupDef.stepGroupDefParent = parentGroup;
            return clonedStep;
          })
        );
        stepsWithBlackLines.forEach(step => this.stepBlackLines.getLines(procedurePk).push(step));
        stepsWithBlackLines = [];
      }
      sg.stepGroupDefParent = parentGroup;
      if (!_.isEmpty(sg.redLineComments)) {
        this.groupRedLines.getLines(procedurePk).push(sg);
      }
      if (!_.isEmpty(sg.stepGroupDefsChildren)) {
        this.findGroupsWithLineEdits(procedurePk, sg.stepGroupDefsChildren, sg);
      }
    });
  }

  public findStepLineEditsForProcedure(procedure: ProcedureDetails): void {
    this.stepRedLines.setLines(procedure.pk, []);
    this.groupRedLines.setLines(procedure.pk, []);
    this.stepBlackLines.setLines(procedure.pk, []);
    this.findGroupsWithLineEdits(procedure.pk, procedure.stepGroupDefs, null);
    this.stepBlackLines.setLines(procedure.pk, this.getUniqueStepsWithBlackLines(this.stepBlackLines.getLines(procedure.pk)));
    this.updateTotalStepRedLineCount(procedure);
    this.updateTotalStepBlackLineCount(procedure);
    this.updateTotalRedLineCount(procedure);
    this.updateTotalStepBlackLineCount(procedure);
  }

  private getAllInstructionGroupAndStepRedLinePks(procedure: ProcedureDetails): number[] {
    let fullArrayOfAllRedLines = _.flatten(this.instructionRedLines.getLines(procedure.pk).map((redLine) => {
      return redLine.redLineComments.map((c) => c.pk);
    }));
    fullArrayOfAllRedLines = fullArrayOfAllRedLines.concat(_.flatten(this.groupRedLines.getLines(procedure.pk).map((redLine) => {
      return redLine.redLineComments.map((c) => c.pk);
    })));
    fullArrayOfAllRedLines = fullArrayOfAllRedLines.concat(_.flatten(this.stepRedLines.getLines(procedure.pk).map((redLine) => {
      return redLine.redLineComments.map((c) => c.pk);
    })));
    return fullArrayOfAllRedLines;
  }


  private getAllNonProcedureLevelBlackLines(procedure: ProcedureDetails): number[] {
    // TODO: When black lines for groups and instructions are implemented, add here
    const arrayOfNonProcedureLevelBlackLinePks = _.flatten(this.stepBlackLines.getLines(procedure.pk).map((step) => {
      return step.blackLineComments.map((c) => c.pk);
    }));
    return arrayOfNonProcedureLevelBlackLinePks;
  }

  private getUniqueStepsWithBlackLines(steps: StepDef[]): StepDef[] {
    return _.uniqBy(steps, step => {
      const blackLinePks = (step?.blackLineComments || [])
        .map(comment => comment?.pk)
        .filter(pk => !_.isNil(pk))
        .sort((a, b) => a - b)
        .join(',');

      if (blackLinePks.length > 0) {
        return `blacklines:${blackLinePks}|displayOrder:${step?.displayOrder}|group:${step?.stepGroupDef?.pk}`;
      }

      if (!_.isNil(step?.pk)) {
        return `pk:${step.pk}`;
      }

      return `blacklines:${blackLinePks}|displayOrder:${step?.displayOrder}|group:${step?.stepGroupDef?.pk}`;
    });
  }
}

export class LineList<T> {

  private lines: {
    [procedurePk: string]: T[],
  } = {};

  public getLines(procedurePk: number): T[] {
    if (_.isNil(this.lines[procedurePk])) this.setLines(procedurePk, []);
    return this.lines[procedurePk];
  }

  public setLines(procedurePk: number, lines: T[]): void {
    this.lines[procedurePk] = lines;
  }
}

class LineCount {
  private counts: {
    [procedurePk: string]: number,
  } = {};

  public getCount(procedurePk: number): number {
    return _.get(this.counts, procedurePk, 0);
  }

  public setCount(procedurePk: number, newVal: number) {
    this.counts[procedurePk] = newVal;
  }
}
