/**
 * Service responsible for managing the application state and application of line edit changes.
 * i.e. how these edit changes are applied to the UI/data model.
 * This service handles operations related to enriching, applying, and merging line edit data
 * such as black lines, red lines, procedure instructions, step groups, and steps.
 * It works closely with LineEditReportingService to keep line edit reporting synchronized.
 */
import { Injectable } from '@angular/core';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { BlackLineDto } from '@app/interfaces/black-line.dto';
import { LineEditReportingService } from '@app/services/line-edit-reporting.service';
import { Utils } from '@app/utils';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class LineEditStateService {

  constructor(private lineEditReportingService: LineEditReportingService) { }

  /**
   * Enriches saved black lines with data from requested black lines.
   *
   * @param savedBlackLines - Array of black line DTOs that have been saved
   * @param requestedBlackLines - Array of black line DTOs that were requested
   * @returns An array of enriched black line DTOs with merged data from both inputs
   */
  enrichSavedBlackLines(savedBlackLines: BlackLineDto[], requestedBlackLines: BlackLineDto[]): BlackLineDto[] {
    return (savedBlackLines || []).map((savedBlackLine, index) => {
      const requestedBlackLine = requestedBlackLines?.[index];
      if (!requestedBlackLine) {
        return savedBlackLine;
      }

      const enrichedBlackLine = _.merge({}, requestedBlackLine, savedBlackLine);
      enrichedBlackLine.procedureChangeType = _.merge({}, requestedBlackLine.procedureChangeType, savedBlackLine.procedureChangeType);
      enrichedBlackLine.blackRedLineSignatures = savedBlackLine.blackRedLineSignatures ?? requestedBlackLine.blackRedLineSignatures ?? [];
      return enrichedBlackLine;
    });
  }

  /**
   * Applies saved black lines to the procedure data.
   *
   * @param procedureData - The procedure details object to apply black lines to
   * @param blackLines - Array of black line DTOs to apply
   */
  applySavedBlackLines(procedureData: ProcedureDetails, blackLines: BlackLineDto[]): void {
    if (!procedureData || _.isEmpty(blackLines)) {
      return;
    }

    blackLines.forEach(blackLine => this.applySavedBlackLine(procedureData, blackLine));
    this.rebuildLineEditReporting(procedureData);
  }

  /**
   * Applies a single saved black line to the procedure data.
   *
   * @param procedureData - The procedure details object to apply the black line to
   * @param blackLine - The black line DTO to apply
   */
  applySavedBlackLine(procedureData: ProcedureDetails, blackLine: BlackLineDto): void {
    if (!procedureData || !blackLine) {
      return;
    }

    if (!_.isNil(blackLine.stepDef?.pk)) {
      this.applyStepBlackLine(procedureData, blackLine);
      return;
    }

    if (blackLine.procedureDetails?.pk === procedureData.pk) {
      procedureData.blackLineComments = this.upsertByPk(procedureData.blackLineComments, blackLine);
    }
  }


  /**
   * Rebuilds the line edit reporting for the given procedure data.
   *
   * @param procedureData - The procedure details object to rebuild reporting for
   */
  rebuildLineEditReporting(procedureData: ProcedureDetails): void {
    if (!procedureData) {
      return;
    }

    this.lineEditReportingService.findAllLineEdits(procedureData);
  }

  /**
   * Applies a black line to a specific step within the procedure data.
   *
   * @param procedureData - The procedure details object containing the step
   * @param blackLine - The black line DTO containing the changes to apply
   */
  private applyStepBlackLine(procedureData: ProcedureDetails, blackLine: BlackLineDto): void {
    const stepToUpdate = Utils.getAllStepsInProcedureDetails(procedureData)
      .find(step => step.pk === blackLine.stepDef.pk);

    if (!stepToUpdate) {
      return;
    }

    const existingBlackLineComments = this.upsertByPk(stepToUpdate.blackLineComments, blackLine);
    const blacklineStepDef = _.omit(blackLine.stepDef, ['blackLineComments', 'redLineComments']);
    _.merge(stepToUpdate, blacklineStepDef);
    stepToUpdate.blackLineComments = existingBlackLineComments;
  }

  /**
   * Upserts an item into an array based on its primary key.
   *
   * @param items - Array of items to upsert into
   * @param item - The item to upsert
   * @returns A new array with the item upserted
   */
  private upsertByPk<T extends { pk?: number }>(items: T[] = [], item: T): T[] {
    if (!item) {
      return items || [];
    }

    if (_.isNil(item.pk)) {
      return [...(items || []), item];
    }

    return [...(items || []).filter(entry => entry?.pk !== item.pk), item];
  }
}
