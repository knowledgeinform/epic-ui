import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablestepentryComponent } from './tablestepentry.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ContenteditableModel } from '@app/components/contenteditable-model/contenteditable-model.component';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";
import { StepTable } from '@app/interfaces/step-table';
import { StepTableRow } from '@app/interfaces/step-table-row';
import { StepTableCell } from '@app/interfaces/step-table-cell';
import { StepDef } from '@app/interfaces/step-def.interface';
import { StepType } from '@app/interfaces/step-type.dto';
import { MessageService } from '@app/services/message.service';
import { RunDataEntryService } from '@app/services/run-data-entry.service';
import { RunValidationService } from '@app/services/run-validation.service';
import { TableNavigatorService } from '@app/services/table-navigator.service';
import { TablePasteParserService } from '@app/services/table-paste-parser.service';
import { of } from 'rxjs';

describe('TablestepentryComponent', () => {
  let component: TablestepentryComponent;
  let fixture: ComponentFixture<TablestepentryComponent>;
  let messageService: MessageService;
  let tableNavigator: TableNavigatorService;

  beforeEach(waitForAsync(() => {
    const mockMessageService = { showSnackBar: jasmine.createSpy('showSnackBar') };
    const mockTableNavigator = {
      resolveCellElement: jasmine.createSpy('resolveCellElement'),
      getCellCoordinates: jasmine.createSpy('getCellCoordinates'),
      findCell: jasmine.createSpy('findCell')
    };

    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        TablestepentryComponent,
        ContenteditableModel,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ],
      providers: [
        { provide: MessageService, useValue: mockMessageService },
        { provide: TableNavigatorService, useValue: mockTableNavigator },
        { provide: TablePasteParserService, useClass: TablePasteParserService },
        { provide: RunDataEntryService, useValue: {
          saveRunStepValue: jasmine.createSpy('saveRunStepValue').and.returnValue(of({
            pk: 100,
            type: 'TABLE',
            stepTableRows: []
          } as any)),
          announceRunStepDefChange: jasmine.createSpy('announceRunStepDefChange')
        }},
        { provide: RunValidationService, useValue: { validateProcedure: jasmine.createSpy('validateProcedure') } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablestepentryComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService);
    tableNavigator = TestBed.inject(TableNavigatorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the adjacent cell when keydown target is nested inside a cell', () => {
    component.tableId = 'inputTable';

    const table = document.createElement('table');
    table.id = component.tableId;
    const row = table.insertRow();

    const firstCell = row.insertCell();
    firstCell.setAttribute('row-index', '0');
    firstCell.setAttribute('col-index', '0');
    const nested = document.createElement('span');
    firstCell.appendChild(nested);

    const secondCell = row.insertCell();
    secondCell.setAttribute('row-index', '0');
    secondCell.setAttribute('col-index', '1');

    const focusSpy = spyOn(secondCell, 'focus');
    document.body.appendChild(table);

    (tableNavigator.resolveCellElement as jasmine.Spy).and.returnValue(firstCell);
    (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 0, col: 0 });
    (tableNavigator.findCell as jasmine.Spy).and.returnValue(secondCell);

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    Object.defineProperty(event, 'target', { value: nested });
    component.navigateCells(event);

    expect(focusSpy).toHaveBeenCalled();

    table.remove();
  });

  it('should tab to next editable cell and enable immediate edit mode', (done) => {
    component.readOnly = false;
    component.fillable = true;
    component.showEditingControls = false;
    component.tableId = 'inputTable';

    const tableModel = new StepTable();
    const modelRow = new StepTableRow(0);
    const editableA = new StepTableCell(0, 'A');
    editableA.editable = true;
    const nonEditable = new StepTableCell(1, 'B');
    nonEditable.editable = false;
    const editableC = new StepTableCell(2, 'C');
    editableC.editable = true;
    modelRow.stepTableCells = [editableA, nonEditable, editableC];
    tableModel.stepTableRows = [modelRow];
    component.currentTable = tableModel;

    const table = document.createElement('table');
    table.id = component.tableId;
    const row = table.insertRow();

    const cellA = row.insertCell();
    cellA.setAttribute('row-index', '0');
    cellA.setAttribute('col-index', '0');
    const nested = document.createElement('span');
    cellA.appendChild(nested);

    const cellB = row.insertCell();
    cellB.setAttribute('row-index', '0');
    cellB.setAttribute('col-index', '1');

    const cellC = row.insertCell();
    cellC.setAttribute('row-index', '0');
    cellC.setAttribute('col-index', '2');
    const editableContent = document.createElement('div');
    editableContent.className = 'note-editable';
    editableContent.textContent = 'existing';
    cellC.appendChild(editableContent);

    const focusSpy = spyOn(cellC, 'focus');
    document.body.appendChild(table);

    (tableNavigator.resolveCellElement as jasmine.Spy).and.returnValue(cellA);
    (tableNavigator.getCellCoordinates as jasmine.Spy).and.callFake(
      (cell: HTMLTableCellElement) => ({
        row: Number(cell.getAttribute('row-index')),
        col: Number(cell.getAttribute('col-index'))
      })
    );

    const preventDefault = jasmine.createSpy('preventDefault');
    const event = {
      key: 'Tab',
      keyCode: 9,
      shiftKey: false,
      target: nested,
      preventDefault
    } as unknown as KeyboardEvent;
    component.navigateCells(event);

    setTimeout(() => {
      expect(preventDefault).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      expect(component.currentTable.stepTableRows[0].stepTableCells[2].summerNoteEnabled).toBeTrue();
      table.remove();
      done();
    }, 0);
  });

  it('should navigate within the active table instance when duplicate table ids exist', () => {
    component.tableId = 'inputTable';

    const backgroundTable = document.createElement('table');
    backgroundTable.id = component.tableId;
    const backgroundRow = backgroundTable.insertRow();
    backgroundRow.insertCell().setAttribute('row-index', '0');
    const backgroundSecondCell = backgroundRow.insertCell();
    backgroundSecondCell.setAttribute('row-index', '0');
    backgroundSecondCell.setAttribute('col-index', '1');

    const activeTable = document.createElement('table');
    activeTable.id = component.tableId;
    const activeRow = activeTable.insertRow();
    const activeFirstCell = activeRow.insertCell();
    activeFirstCell.setAttribute('row-index', '0');
    activeFirstCell.setAttribute('col-index', '0');
    const nested = document.createElement('span');
    activeFirstCell.appendChild(nested);
    const activeSecondCell = activeRow.insertCell();
    activeSecondCell.setAttribute('row-index', '0');
    activeSecondCell.setAttribute('col-index', '1');

    document.body.appendChild(backgroundTable);
    document.body.appendChild(activeTable);
    (component as any).inputTableElement = { nativeElement: activeTable };

    const activeFocusSpy = spyOn(activeSecondCell, 'focus');
    const backgroundFocusSpy = spyOn(backgroundSecondCell, 'focus');

    (tableNavigator.resolveCellElement as jasmine.Spy).and.returnValue(activeFirstCell);
    (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 0, col: 0 });
    (tableNavigator.findCell as jasmine.Spy).and.returnValue(activeSecondCell);

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    Object.defineProperty(event, 'target', { value: nested });

    component.navigateCells(event);

    expect(activeFocusSpy).toHaveBeenCalled();
    expect(backgroundFocusSpy).not.toHaveBeenCalled();

    activeTable.remove();
    backgroundTable.remove();
  });

  describe('onPaste', () => {
    function createMockEvent(html: string): any {
      return {
        clipboardData: {
          getData: (type: string) => type === 'text/html' ? html : ''
        }
      };
    }

    beforeEach(() => {
      component.currentTable = {'stepTableRows': []};
    });

    it('should extract clean cell content from Excel table with styling artifacts', () => {
      component.onPaste(createMockEvent(`
        <table border=0 cellpadding=0 cellspacing=0 width=704 style='border-collapse:collapse;width:528pt'>
          <col width=64 span=11 style='width:48pt'>
          <tr><td height=19 width=64 style='height:14.4pt;width:48pt'>Name</td><td width=64 style='width:48pt'>Value</td></tr>
          <tr><td>Test</td><td align=right>42</td></tr>
        </table>
      `));

      expect(component.currentTable.stepTableRows.length).toBe(2);
      expect(component.currentTable.stepTableRows[0].stepTableCells.map(c => c.nonEditableValue)).toEqual(['Name', 'Value']);
      expect(component.currentTable.stepTableRows[1].stepTableCells.map(c => c.nonEditableValue)).toEqual(['Test', '42']);
    });

    it('should handle Excel table with colspan', () => {
      component.onPaste(createMockEvent(`
        <table>
          <tr><td colspan="3">Merged Header</td><td>Other</td></tr>
          <tr><td>A</td><td>B</td><td>C</td><td>D</td></tr>
        </table>
      `));

      // colspan="3" expands to 3 cells (1 main + 2 blank), plus "Other" cell = 4 total
      expect(component.currentTable.stepTableRows[0].stepTableCells.map(c => c.nonEditableValue)).toEqual(['Merged Header', '', '', 'Other']);
      expect(component.currentTable.stepTableRows[0].stepTableCells.map(c => c.cellIndex)).toEqual([0, 1, 2, 3]);
      expect(component.currentTable.stepTableRows[1].stepTableCells.map(c => c.nonEditableValue)).toEqual(['A', 'B', 'C', 'D']);
    });

    it('should trim whitespace and strip HTML from cell content', () => {
      component.onPaste(createMockEvent(`
        <table>
          <tr><td>   spaced   </td><td><b>bold</b> text</td></tr>
        </table>
      `));

      expect(component.currentTable.stepTableRows[0].stepTableCells.map(c => c.nonEditableValue)).toEqual(['spaced', 'bold text']);
    });

    it('should persist the header row from pasted table', () => {
      component.onPaste(createMockEvent(`
        <table>
          <tr><td>Name</td><td>Email</td><td>Role</td></tr>
          <tr><td>Alice</td><td>alice@example.com</td><td>Admin</td></tr>
        </table>
      `));

      // First row (header) should be persisted
      expect(component.currentTable.stepTableRows.length).toBe(2);
      expect(component.currentTable.stepTableRows[0].stepTableCells.map(c => c.nonEditableValue))
        .toEqual(['Name', 'Email', 'Role']);
    });

    it('should handle empty table gracefully', () => {
      component.onPaste(createMockEvent('<table></table>'));
      expect(component.currentTable.stepTableRows.length).toBe(0);
    });

    it('should handle no table in clipboard', () => {
      component.onPaste(createMockEvent('<p>Just text</p>'));
      expect(component.currentTable.stepTableRows.length).toBe(0);
    });
  });

  describe('onCellPaste — multi-cell paste into existing table', () => {
    function createMockCell(row: number, col: number): HTMLTableCellElement {
      const cell = document.createElement('td');
      cell.setAttribute('row-index', String(row));
      cell.setAttribute('col-index', String(col));
      return cell;
    }

    function setupTable(rows: number, cols: number, headerRow?: string[]) {
      const table = new StepTable();
      for (let r = 0; r < rows; r++) {
        const row = new StepTableRow(r);
        for (let c = 0; c < cols; c++) {
          row.stepTableCells.push(new StepTableCell(c, ''));
        }
        table.stepTableRows.push(row);
      }
      if (headerRow && table.stepTableRows.length > 0) {
        headerRow.forEach((val, i) => {
          if (i < table.stepTableRows[0].stepTableCells.length) {
            table.stepTableRows[0].stepTableCells[i].nonEditableValue = val;
          }
        });
      }
      component.currentTable = table;
      component.readOnly = false;
      component.fillable = false;
    }

    function createMockPasteEvent(html: string, plainText?: string, target?: HTMLElement): ClipboardEvent {
      return {
        clipboardData: {
          getData: (type: string) => {
            if (type === 'text/html') return html;
            if (type === 'text/plain') return plainText || '';
            return '';
          }
        },
        target: target || document.createElement('td'),
        preventDefault: jasmine.createSpy('preventDefault'),
        stopPropagation: jasmine.createSpy('stopPropagation')
      } as unknown as ClipboardEvent;
    }

    beforeEach(() => {
      (messageService.showSnackBar as jasmine.Spy).calls.reset();
    });

    it('should distribute multi-cell HTML paste across table cells', () => {
      setupTable(3, 2, ['Header1', 'Header2']);
      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>A</td><td>B</td></tr>
          <tr><td>C</td><td>D</td></tr>
        </table>
      `, '', cell);
      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 0 });

      component.onCellPaste(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue).toBe('A');
      expect(component.currentTable.stepTableRows[1].stepTableCells[1].nonEditableValue).toBe('B');
      expect(component.currentTable.stepTableRows[2].stepTableCells[0].nonEditableValue).toBe('C');
      expect(component.currentTable.stepTableRows[2].stepTableCells[1].nonEditableValue).toBe('D');
    });

    it('should pass through single-cell paste to Summernote', () => {
      setupTable(3, 2);
      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table>
          <tr><td>Single</td></tr>
        </table>
      `, '', cell);

      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 0 });

      component.onCellPaste(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
      // Table should be unchanged
      expect(component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue).toBe('');
    });

    it('should auto-expand rows when paste extends below current table', () => {
      setupTable(2, 3);
      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>A</td><td>B</td><td>C</td></tr>
          <tr><td>D</td><td>E</td><td>F</td></tr>
          <tr><td>G</td><td>H</td><td>I</td></tr>
        </table>
      `, '', cell);

      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 0 });

      component.onCellPaste(event);

      // Should have grown from 2 rows to 4 rows (original 2 + 2 new for paste starting at row 1)
      expect(component.currentTable.stepTableRows.length).toBe(4);
      expect(component.currentTable.stepTableRows[3].stepTableCells[0].nonEditableValue).toBe('G');
    });

    it('should block paste when columns exceed table width', () => {
      setupTable(3, 2);
      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>A</td><td>B</td><td>C</td></tr>
        </table>
      `, '', cell);

      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 0 });

      component.onCellPaste(event);

      // Should block — columns exceed table width
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(messageService.showSnackBar).toHaveBeenCalled();
      expect((messageService.showSnackBar as jasmine.Spy).calls.mostRecent().args[0]).toMatch(/Cannot paste/);
      // Table should be unchanged
      expect(component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue).toBe('');
    });

    it('should block paste when selection exceeds right edge of table', () => {
      setupTable(3, 3);
      const cell = createMockCell(1, 2); // Rightmost column
      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>A</td><td>B</td></tr>
        </table>
      `, '', cell);

      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 2 });

      component.onCellPaste(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(messageService.showSnackBar).toHaveBeenCalled();
      const snackBarCall = (messageService.showSnackBar as jasmine.Spy).calls.mostRecent().args;
      expect(snackBarCall[0]).toMatch(/Cannot paste/);
      expect(snackBarCall[1]).toBe('CLOSE');
      expect(snackBarCall[2]).toBe(5000);
      // Table should be unchanged
      expect(component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue).toBe('');
    });

    it('should allow paste when selection exactly fills remaining columns', () => {
      setupTable(3, 4);
      const cell = createMockCell(1, 2); // Column 2 of 4, 2 cols remaining
      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>X</td><td>Y</td></tr>
        </table>
      `, '', cell);

      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 2 });

      component.onCellPaste(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.currentTable.stepTableRows[1].stepTableCells[2].nonEditableValue).toBe('X');
      expect(component.currentTable.stepTableRows[1].stepTableCells[3].nonEditableValue).toBe('Y');
    });

    it('should preserve header row when pasting from row 1 onward', () => {
      setupTable(3, 2, ['Name', 'Value']);
      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>Alpha</td><td>100</td></tr>
        </table>
      `, '', cell);

      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 0 });

      component.onCellPaste(event);

      // Header row should be preserved
      expect(component.currentTable.stepTableRows[0].stepTableCells[0].nonEditableValue).toBe('Name');
      expect(component.currentTable.stepTableRows[0].stepTableCells[1].nonEditableValue).toBe('Value');
      // Pasted data in row 1
      expect(component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue).toBe('Alpha');
      expect(component.currentTable.stepTableRows[1].stepTableCells[1].nonEditableValue).toBe('100');
    });

    it('should overwrite existing cell content', () => {
      setupTable(3, 2);
      // Pre-populate some cells
      component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue = 'Existing';
      component.currentTable.stepTableRows[1].stepTableCells[1].nonEditableValue = 'Data';

      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>New</td><td>Value</td></tr>
        </table>
      `, '', cell);

      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 0 });

      component.onCellPaste(event);

      expect(component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue).toBe('New');
      expect(component.currentTable.stepTableRows[1].stepTableCells[1].nonEditableValue).toBe('Value');
    });

    it('should be no-op when readOnly is true', () => {
      setupTable(3, 2);
      component.readOnly = true;
      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table>
          <tr><td>A</td><td>B</td></tr>
        </table>
      `, '', cell);

      component.onCellPaste(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue).toBe('');
    });

    it('should be no-op when fillable is true (run mode)', () => {
      setupTable(3, 2);
      component.fillable = true;
      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table>
          <tr><td>A</td><td>B</td></tr>
        </table>
      `, '', cell);

      component.onCellPaste(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue).toBe('');
    });

    it('should paste Excel multi-row multi-column data across cells', () => {
      setupTable(4, 2);
      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>A</td><td>B</td></tr>
          <tr><td>C</td><td>D</td></tr>
          <tr><td>E</td><td>F</td></tr>
        </table>
      `, '', cell);

      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 0 });

      component.onCellPaste(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue).toBe('A');
      expect(component.currentTable.stepTableRows[1].stepTableCells[1].nonEditableValue).toBe('B');
      expect(component.currentTable.stepTableRows[2].stepTableCells[0].nonEditableValue).toBe('C');
      expect(component.currentTable.stepTableRows[2].stepTableCells[1].nonEditableValue).toBe('D');
    });

    it('should pass through Word bullet list to Summernote (not multi-cell paste)', () => {
      setupTable(3, 2);
      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table>
          <tr><td>Item 1</td></tr>
          <tr><td>Item 2</td></tr>
        </table>
      `, '', cell);

      component.onCellPaste(event);

      // Word content should NOT be distributed — pass through to Summernote
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue).toBe('');
    });

    it('should reindex rows and cells after expansion', () => {
      setupTable(2, 2);
      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>A</td><td>B</td></tr>
          <tr><td>C</td><td>D</td></tr>
        </table>
      `, '', cell);

      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 0 });

      component.onCellPaste(event);

      // Verify all rows have correct rowNumber
      for (let i = 0; i < component.currentTable.stepTableRows.length; i++) {
        expect(component.currentTable.stepTableRows[i].rowNumber).toBe(i);
      }
      // Verify all cells have correct cellIndex
      component.currentTable.stepTableRows.forEach(row => {
        row.stepTableCells.forEach((cell, idx) => {
          expect(cell.cellIndex).toBe(idx);
        });
      });
    });

    it('should push current table to undo stack before paste', () => {
      setupTable(3, 2);
      component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue = 'Before';
      const undoStackLengthBefore = component.tableUndoStack.length;

      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>After</td><td>X</td></tr>
        </table>
      `, '', cell);

      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 0 });

      component.onCellPaste(event);

      expect(component.tableUndoStack.length).toBeGreaterThan(undoStackLengthBefore);
    });

    it('should handle <th> tags in pasted table', () => {
      setupTable(3, 2);
      const cell = createMockCell(1, 0);
      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><th>Header</th><th>Data</th></tr>
        </table>
      `, '', cell);

      (tableNavigator.getCellCoordinates as jasmine.Spy).and.returnValue({ row: 1, col: 0 });

      component.onCellPaste(event);

      expect(component.currentTable.stepTableRows[1].stepTableCells[0].nonEditableValue).toBe('Header');
      expect(component.currentTable.stepTableRows[1].stepTableCells[1].nonEditableValue).toBe('Data');
    });
  });

  describe('receiveTextChange in fillable mode', () => {
    let runDataEntryService: RunDataEntryService;

    beforeEach(() => {
      runDataEntryService = TestBed.inject(RunDataEntryService);
    });

    it('should update cell.nonEditableValue immediately so the template stays in sync', () => {
      const cell = new StepTableCell(0, '');
      cell.pk = 9999;
      cell.nonEditableValue = '';
      const row = new StepTableRow(0);
      row.stepTableCells = [cell];
      const step = new StepDef();
      step.pk = 100;
      step.type = StepType.TABLE;
      step.stepTableRows = [row];
      component.fillable = true;
      component.step = step;

      component.receiveTextChange('<p>test</p>', cell);

      // Model should be updated immediately — not just after server callback
      expect(cell.nonEditableValue).toBe('<p>test</p>');
    });

    it('should call saveRunStepValue with the new value', () => {
      const cell = new StepTableCell(0, '');
      cell.pk = 9999;
      const row = new StepTableRow(0);
      row.stepTableCells = [cell];
      const step = new StepDef();
      step.pk = 100;
      step.type = StepType.TABLE;
      step.stepTableRows = [row];
      component.fillable = true;
      component.step = step;

      component.receiveTextChange('<p>queued</p>', cell);

      // saveRunStepValue should have been called (queue is drained immediately by saveDataToServer)
      expect(runDataEntryService.saveRunStepValue).toHaveBeenCalled();
    });

    it('should skip save when value has not changed', () => {
      const cell = new StepTableCell(0, '');
      cell.pk = 9999;
      cell.nonEditableValue = '<p>same</p>';
      component.fillable = true;
      const step = new StepDef();
      step.pk = 100;
      step.type = StepType.TABLE;
      step.stepTableRows = [new StepTableRow(0)];
      component.step = step;

      component.receiveTextChange('<p>same</p>', cell);

      // Should be no-op — nothing queued
      expect(component.tableCellDataQueue.length).toBe(0);
    });
  });
});

describe('TablestepentryComponent - validatePasteFit', () => {
  let component: TablestepentryComponent;
  let fixture: ComponentFixture<TablestepentryComponent>;
  let messageService: MessageService;

  beforeEach(waitForAsync(() => {
    const mockMessageService = { showSnackBar: jasmine.createSpy('showSnackBar') };
    const mockTableNavigator = {
      resolveCellElement: jasmine.createSpy('resolveCellElement'),
      getCellCoordinates: jasmine.createSpy('getCellCoordinates'),
      findCell: jasmine.createSpy('findCell')
    };

    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        TablestepentryComponent,
        ContenteditableModel,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ],
      providers: [
        { provide: MessageService, useValue: mockMessageService },
        { provide: TableNavigatorService, useValue: mockTableNavigator },
        { provide: TablePasteParserService, useClass: TablePasteParserService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablestepentryComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService);
    fixture.detectChanges();
  });

  describe('validatePasteFit', () => {
    it('should return true when paste fits within table bounds', () => {
      const result = component.validatePasteFit(0, 2, 4);
      expect(result).toBeTrue();
      expect(messageService.showSnackBar).not.toHaveBeenCalled();
    });

    it('should return true when paste exactly fills remaining columns', () => {
      const result = component.validatePasteFit(2, 2, 4);
      expect(result).toBeTrue();
      expect(messageService.showSnackBar).not.toHaveBeenCalled();
    });

    it('should return false and warn when paste exceeds right edge', () => {
      const result = component.validatePasteFit(3, 2, 4);
      expect(result).toBeFalse();
      expect(messageService.showSnackBar).toHaveBeenCalled();
      const snackBarCall = (messageService.showSnackBar as jasmine.Spy).calls.mostRecent().args;
      expect(snackBarCall[0]).toMatch(/Cannot paste/);
      expect(snackBarCall[1]).toBe('CLOSE');
      expect(snackBarCall[2]).toBe(5000);
    });
  });
});
