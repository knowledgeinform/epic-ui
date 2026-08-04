import { TestBed } from '@angular/core/testing';
import { TableNavigatorService } from './table-navigator.service';

describe('TableNavigatorService', () => {
  let service: TableNavigatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableNavigatorService);
  });

  it('should resolve parent td from nested target element', () => {
    const td = document.createElement('td');
    td.setAttribute('row-index', '2');
    td.setAttribute('col-index', '3');
    const nested = document.createElement('div');
    td.appendChild(nested);

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    Object.defineProperty(event, 'target', { value: nested });

    const resolved = service.resolveCellElement(event);
    expect(resolved).toBe(td);
  });

  it('should return coordinates when cell attributes are provided', () => {
    const td = document.createElement('td');
    td.setAttribute('row-index', '1');
    td.setAttribute('col-index', '2');

    const coordinates = service.getCellCoordinates(td);
    expect(coordinates.row).toBe(1);
    expect(coordinates.col).toBe(2);
  });

  it('should return null coordinates when row-index or col-index is missing', () => {
    const td = document.createElement('td');
    td.setAttribute('row-index', '0');

    const coordinates = service.getCellCoordinates(td);
    expect(coordinates).toBeNull();
  });
});

