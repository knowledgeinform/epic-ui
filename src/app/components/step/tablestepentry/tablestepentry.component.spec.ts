import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablestepentryComponent } from './tablestepentry.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ContenteditableModel } from '@app/components/contenteditable-model/contenteditable-model.component';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";
import { StepTable } from '@app/interfaces/step-table';
import { StepTableRow } from '@app/interfaces/step-table-row';
import { StepTableCell } from '@app/interfaces/step-table-cell';

describe('TablestepentryComponent', () => {
  let component: TablestepentryComponent;
  let fixture: ComponentFixture<TablestepentryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        TablestepentryComponent,
        ContenteditableModel,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablestepentryComponent);
    component = fixture.componentInstance;
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
});
