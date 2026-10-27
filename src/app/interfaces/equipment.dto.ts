import { RunDTO } from './run.dto';
import { StepDefDTO } from './step-def.dto.interface';

export class EquipmentDTO {
  pk: number;
  name: string = '';
  serialNumber: string = '';
  propertyNumber: string = '';
  // Date on the wire: ISO calendar date string ("yyyy-MM-dd", current) or epoch millis (legacy).
  // Equipment.loadFromDTO handles both via moment.utc().
  calibrationDate: number | string = null;
  calibrationDueDate: number | string = null;
  run?: RunDTO;
  steps?: StepDefDTO[];

  constructor() { }

}
