import { Equipment } from './equipment';
import { EquipmentDTO } from './equipment.dto';

describe('Equipment.loadFromDTO', () => {

  it('builds the UTC calendar date from an ISO date string (current wire format)', () => {
    // Arrange: the run response now sends calibration dates as "yyyy-MM-dd" strings
    const dto: EquipmentDTO = new EquipmentDTO();
    dto.pk = 10914;
    dto.name = 'Amprobe';
    dto.calibrationDate = '2026-02-05';
    dto.calibrationDueDate = '2027-02-28';

    // Act
    const equipment = new Equipment().loadFromDTO(dto);

    // Assert
    expect(equipment.calibrationDate.utc().format('YYYY-MM-DD')).toBe('2026-02-05');
    expect(equipment.calibrationDueDate.utc().format('YYYY-MM-DD')).toBe('2027-02-28');
  });

  it('still builds the same moment from epoch millis (legacy wire format, e.g. offline cache)', () => {
    // Arrange
    const dto: EquipmentDTO = new EquipmentDTO();
    dto.pk = 10914;
    dto.name = 'Amprobe';
    dto.calibrationDate = 1770249600000; // 2026-02-05T00:00:00Z
    dto.calibrationDueDate = 1803772800000; // 2027-02-28T00:00:00Z

    // Act
    const equipment = new Equipment().loadFromDTO(dto);

    // Assert
    expect(equipment.calibrationDate.utc().format('YYYY-MM-DD')).toBe('2026-02-05');
    expect(equipment.calibrationDueDate.utc().format('YYYY-MM-DD')).toBe('2027-02-28');
  });

  it('round-trips the same instant through asDTO() (write path unchanged)', () => {
    // Arrange
    const dto: EquipmentDTO = new EquipmentDTO();
    dto.pk = 10914;
    dto.name = 'Amprobe';
    dto.calibrationDate = '2026-02-05';

    // Act
    const asDto = new Equipment().loadFromDTO(dto).asDTO();

    // Assert: the update request still sends epoch millis the backend accepts
    expect(asDto.calibrationDate).toBe(1770249600000);
  });
});
