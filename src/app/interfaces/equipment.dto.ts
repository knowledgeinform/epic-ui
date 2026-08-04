import { RunDTO } from './run.dto';
import { StepDefDTO } from './step-def.dto.interface';

export class EquipmentDTO {
  pk: number;
  name: string = '';
  serialNumber: string = '';
  propertyNumber: string = '';
  calibrationDate: number = null; // Date
  calibrationDueDate: number = null; // Date
  run?: RunDTO;
  steps?: StepDefDTO[];

  constructor() { }

}
