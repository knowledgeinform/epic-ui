import { UtcDatePipe } from './utc-date.pipe';
import * as moment from 'moment';

describe('UtcDatePipe', () => {

  const pipe = new UtcDatePipe();

  it('renders the stored calendar date for a UTC-midnight epoch', () => {
    // Arrange: 2026-02-05T00:00:00Z (the value the backend sends for DB date 2026-02-05)
    const instant = moment.utc(1770249600000);

    // Act
    const result = pipe.transform(instant);

    // Assert
    expect(result).toBe('February 5, 2026');
  });

  it('supports an explicit format string', () => {
    // Arrange
    const instant = moment.utc(1770249600000);

    // Act
    const result = pipe.transform(instant, 'YYYY-MM-DD');

    // Assert
    expect(result).toBe('2026-02-05');
  });

  it('returns null for null input', () => {
    // Act
    const result = pipe.transform(null);

    // Assert
    expect(result).toBeNull();
  });

  it('returns null for undefined input', () => {
    // Act
    const result = pipe.transform(undefined);

    // Assert
    expect(result).toBeNull();
  });

  it('does not mutate the input moment', () => {
    // Arrange
    const instant = moment.utc(1770249600000);

    // Act
    pipe.transform(instant);

    // Assert: the original moment's offset should be unchanged
    expect(instant.utcOffset()).toBe(0);
  });
});
