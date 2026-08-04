import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableNavigatorService {

  /**
   * Resolve the nearest table cell for a keyboard event target.
   * Supports nested DOM structures (e.g. rich text editor wrappers).
   */
  public resolveCellElement(event: KeyboardEvent): HTMLTableCellElement | null {
    const target = event.target as HTMLElement | null;
    if (!target || !target.closest) {
      return null;
    }
    return target.closest('td, th') as HTMLTableCellElement | null;
  }

  /**
   * Read row/column coordinates from cell attributes.
   */
  public getCellCoordinates(cell: HTMLTableCellElement): { row: number, col: number } | null {
    const rowAttr = cell.getAttribute('row-index');
    const colAttr = cell.getAttribute('col-index');
    if (rowAttr === null || colAttr === null) {
      return null;
    }
    return {
      row: Number(rowAttr),
      col: Number(colAttr)
    };
  }

  /**
   * Find the matching table cell at row/column, skipping table control cells.
   */
  public findCell(table: HTMLElement, row: number, col: number): HTMLTableCellElement | null {
    const rows = table.getElementsByTagName('tr');
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const irow = rows.item(rowIndex);
      if (!irow) {
        continue;
      }
      const cells = irow.cells;
      for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
        const icell = cells.item(cellIndex);
        if (!icell) {
          continue;
        }
        if (icell.className.includes('table-buttons')) {
          continue;
        }
        const tempRow = Number(icell.getAttribute('row-index'));
        const tempCol = Number(icell.getAttribute('col-index'));
        if (tempRow === row && tempCol === col) {
          return icell;
        }
      }
    }
    return null;
  }
}
