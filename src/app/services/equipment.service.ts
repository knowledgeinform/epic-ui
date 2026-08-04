import { Injectable } from '@angular/core';
import { EPICWSService } from './epic-ws.service';
import { EquipmentDTO } from '../interfaces/equipment.dto';
import { Equipment } from '../interfaces/equipment';
import {LoggerService} from '@app/services/logger.service';
import {Run} from '@app/interfaces/Run';
import {RunDTO} from '@app/interfaces/run.dto';
import {StepDefDTO} from '@app/interfaces/step-def.dto.interface';
import {StepDef} from '@app/interfaces/step-def.interface';


@Injectable({
  providedIn: 'root'
})
export class EquipmentService {

  constructor(
    private epicWs: EPICWSService,
    private loggerService: LoggerService
  ) { }

  /**
   * Adds and/or Updates the item on the server, retrieves the server representation, and replaces the local representation with the server representation.
   */
  public updateItem(runPk: number, equipment: Equipment, stepPk?: number): Promise<Equipment> {

    // Validate input arguments
    if (isNaN(runPk)) {
      this.loggerService.error(`Cannot update item with runPk ${runPk} because runPk is not a number.`);
      return;
    }
    if (stepPk && isNaN(stepPk)) {
      this.loggerService.error(`Cannot update item with stepPk ${stepPk} because stepPk is not a number.`);
      return;
    }

    // Handle the case where `equipment` matches the Equipment interface, but is not an instance of class `Equipment`.
    const equipmentDTO: EquipmentDTO = equipment instanceof Equipment ? equipment.asDTO() : new Equipment().loadPropsFrom(equipment).asDTO();

    const queryParams: any = {};
    if (stepPk) queryParams.stepPk = stepPk;

    this.loggerService.info('Updating equipment item', equipmentDTO);
    return this.epicWs.httpPost<EquipmentDTO>(`Equipment/UpdateItem/${runPk}`, equipmentDTO, queryParams)
      .then(serverEquipment => {
        const se = new Equipment();
        se.loadFromDTO(serverEquipment);
        equipment = se;
        return se;
    });
  }

  public deleteItem(pk: number): Promise<Run> {

    // Validate input arguments
    if (isNaN(pk)) {
      this.loggerService.error(`Cannot update item with pk ${pk} because pk is not a number.`);
      return;
    }

    this.loggerService.info('Deleting equipment item with pk ' + pk);
    return this.epicWs.httpDelete<RunDTO>(`Equipment/DeleteItem/${pk}`)
      .then(returnedRun => new Run().loadFromDTO(returnedRun) );
  }

  public removeItemFromStep(equipmentPk: number, stepPk: number): Promise<StepDef> {
    this.loggerService.info('Removing equipment item with pk ' + equipmentPk + ' from step with pk ' + stepPk);
    return this.epicWs.httpPost<StepDefDTO>('Equipment/RemoveItem', null, { equipmentPk, stepPk })
      .then(serverStep => new StepDef().loadFromDTO(serverStep));
  }

  public getEquipmentForRun(runPk: number): Promise<Equipment[]> {
    this.loggerService.info('Retrieving equipment for run with pk ' + runPk);
    return this.epicWs.getRunByPk(runPk).toPromise().then( run => {
      return run.equipmentList;
    });
  }

}
