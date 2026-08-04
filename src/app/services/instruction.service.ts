import { Injectable } from '@angular/core';
import {ProcedureInstructionDTO} from '@app/interfaces/procedure-instruction.dto';
import {EPICWSService, ErrMsg} from '@app/services/epic-ws.service';
import {ProcedureInstruction} from '@app/interfaces/procedure-instruction';
import * as _ from 'lodash';
import {LoggerService} from '@app/services/logger.service';
import {RedLine} from '@app/interfaces/red-line.dto';
import {Utils} from '@app/utils';

@Injectable({
  providedIn: 'root'
})
export class InstructionService {

  constructor(private epicWs: EPICWSService,
              private loggerService: LoggerService) { }


  saveInstructionInfoSection(newInstruction: ProcedureInstruction): Promise<ProcedureInstruction[] & ErrMsg> {
    this.loggerService.info('Saving new procedure instruction to: ' + newInstruction.procedureDetails.id);
    return this.epicWs.httpPost<ProcedureInstructionDTO[]>('Instructions/AddSection', newInstruction.asDTO())
      .then(instructionsFromServer => {
          return this.convertArrayFromDTOtoLocal(instructionsFromServer);
      });
  }

  updateInstructionInfoData(sections: ProcedureInstruction[]): Promise<ProcedureInstruction[] & ErrMsg> {
    const instructionsDTOs = _.map(sections, instruction => instruction.asDTO());
    return this.epicWs.httpPut<ProcedureInstructionDTO[]>('Instructions/UpdateInstruction', instructionsDTOs)
      .then(instructionsFromServer => {
        return this.convertArrayFromDTOtoLocal(instructionsFromServer);
      });
  }

  deleteInstructionSection(sectionId): Promise<ProcedureInstruction & ErrMsg> {
    this.loggerService.info('Deleting instruction with pk ' + sectionId);
    return this.epicWs.httpDelete<ProcedureInstructionDTO>(`Instructions/DeleteInstruction/?sectionId=${sectionId}`)
      .then(deletedInstruction => new ProcedureInstruction().loadFromDTO(deletedInstruction));
  }

  copyInstructionSection(instructionPk: number): Promise<ProcedureInstruction & ErrMsg> {
    return this.epicWs.httpPost<ProcedureInstructionDTO>(`Instructions/Copy/?instructionPk=${instructionPk}`, null)
      .then(updatedInstruction => new ProcedureInstruction().loadFromDTO(updatedInstruction));
  }

  getInstructionSections(procedureDetailsPk: number): Promise<ProcedureInstruction[] & ErrMsg> {
    return this.epicWs.httpGet<ProcedureInstructionDTO[]>(`Instructions/?procedureDetailsPk=${procedureDetailsPk}`)
      .then(instructionsFromServer => {
        return this.convertArrayFromDTOtoLocal(instructionsFromServer);
      });
  }

  cloneInstructionsToNewProcedure(instPks: number[], procedureDetailsPk: number, selectedVersionPk): Promise<ProcedureInstruction[] & ErrMsg> {
    this.loggerService.info('Cloning selected instructions to procedure with pk ' + procedureDetailsPk + ' from selected procedure with pk ' + selectedVersionPk);
    return this.epicWs.httpPost<ProcedureInstructionDTO[]>(`Instructions/Clone/?procedureDetailsPk=${procedureDetailsPk}`, instPks)
      .then(instructionsFromServer => {
        return this.convertArrayFromDTOtoLocal(instructionsFromServer);
      });
  }

  saveRedLineToProcedureInstruction(redLineData: RedLine, loggerMessage?: string): Promise<ProcedureInstruction & ErrMsg> {
    if (loggerMessage) this.loggerService.info(loggerMessage);
    return this.epicWs.httpPost<ProcedureInstructionDTO>('Redline/Instruction/', redLineData)
      .then(result => new ProcedureInstruction().loadFromDTO(result));
  }

  savedCopiedInstructionAsRedLine(redLineData: RedLine): Promise<ProcedureInstruction & ErrMsg> {
    return this.epicWs.httpPost<ProcedureInstructionDTO>('Redline/CopyInstruction', redLineData)
      .then(copiedInstruction => new ProcedureInstruction().loadFromDTO(copiedInstruction));
  }

  saveMultipleCopiedInstructionsAsRedLines(redLineData: RedLine, selectedVersionPk: number): Promise<ProcedureInstruction[] & ErrMsg> {
    this.loggerService.info('Saving cloned instructions from selected procedure with pk ' + selectedVersionPk + ' as red lines to procedure with pk ' + redLineData.procedureDetailsPk);
    return this.epicWs.httpPost<ProcedureInstructionDTO[]>('Redline/CloneInstructions', redLineData)
      .then(instructionsFromServer => {
        return this.convertArrayFromDTOtoLocal(instructionsFromServer);
      });
  }

  renumberAndUpdateProcedureInstructions(arrayOfInstructions: ProcedureInstruction[], startingIndex?: number, endingIndexInclusive?: number): Promise<ProcedureInstruction[] & ErrMsg> {
    this.loggerService.info('Updating display orders for instructions');
    arrayOfInstructions = Utils.updateDisplayOrdersForArrayItems(arrayOfInstructions, startingIndex, endingIndexInclusive);
    return this.updateInstructionInfoData(_.slice(arrayOfInstructions, startingIndex, endingIndexInclusive + 1));
  }

  private convertArrayFromDTOtoLocal(array: ProcedureInstructionDTO[]): ProcedureInstruction[] {
    return _.map(array, instruction => new ProcedureInstruction().loadFromDTO(instruction));
  }
}
