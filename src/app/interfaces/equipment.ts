import * as _ from 'lodash';
import { EquipmentDTO } from './equipment.dto';
import { Local } from './local.class';
import { Moment } from 'moment';
import * as moment from 'moment';
import { StepDefDTO } from './step-def.dto.interface';
import {RunDTO} from '@app/interfaces/run.dto';

export class Equipment extends Local<EquipmentDTO, Equipment> {
  pk: number = null;
  name: string = '';
  propertyNumber: string = '';
  serialNumber: string = '';
  calibrationDate: Moment = null;
  calibrationDueDate: Moment = null;
  steps?: StepDefDTO[];
  run: RunDTO;

  constructor() { super(); }

  public loadFromDTO(dto: EquipmentDTO) {
    if (!dto) return this;

    this.loadPropsFrom(dto);
    if (dto.calibrationDate) this.calibrationDate = moment.utc(dto.calibrationDate);
    if (dto.calibrationDueDate) this.calibrationDueDate = moment.utc(dto.calibrationDueDate);
    if (dto.steps) this.steps = dto.steps;
    if (dto.run) this.run = dto.run;
    return this;
  }

  public asDTO(): EquipmentDTO {
    const fromThis: Partial<EquipmentDTO> = _.pick(this, ['pk', 'name', 'serialNumber', 'propertyNumber', 'steps']);
    const overrides: Partial<EquipmentDTO> = {
      calibrationDate: this.calibrationDate ? this.calibrationDate.utc().toDate().getTime() : null,
      calibrationDueDate: this.calibrationDueDate ? this.calibrationDueDate.utc().toDate().getTime() : null,
    };
    const eq: EquipmentDTO = _.assign(new EquipmentDTO(), fromThis, overrides);
    return eq;
  }

}
