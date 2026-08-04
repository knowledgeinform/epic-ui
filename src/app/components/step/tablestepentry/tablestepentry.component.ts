import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {MatDialog} from '@angular/material/dialog';
import {MatMenuTrigger} from '@angular/material/menu'
import {StepGroupDefDTO} from '@app/interfaces/step-group-def.dto';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import * as _ from 'lodash';
import {RunValidationService} from '@app/services/run-validation.service';
import {ConfirmationDialogComponent, ConfirmationDialogModel} from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { StepDef } from '@app/interfaces/step-def.interface';
import {LoggerService} from '@app/services/logger.service';
import {Utils} from "@app/utils";
import {StepTable} from "@app/interfaces/step-table";
import {StepTableRow} from "@app/interfaces/step-table-row";
import {StepTableCell} from "@app/interfaces/step-table-cell";
import { RunDataEntryService } from '@app/services/run-data-entry.service';
import { StepDisplayOrderPipe } from '@app/pipes/step-display-order.pipe';
import { EditType } from '@app/interfaces/edit-type.dto';
import { TableNavigatorService } from '@app/services/table-navigator.service';

class TableCellQueueObject {
  cell: StepTableCell;
  textForCell: string;

  constructor(cell: StepTableCell, text: string) {
    this.cell = cell;
    this.textForCell = text;
  }
}

@Component({
  selector: 'app-tablestepentry',
  templateUrl: './tablestepentry.component.html',
  styleUrls: ['./tablestepentry.component.css']
})
export class TablestepentryComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChild(MatMenuTrigger, /* TODO: add static flag */ {})
  contextMenu: MatMenuTrigger;

  @ViewChild('inputTableElement')
  inputTableElement: ElementRef<HTMLTableElement>;

  contextMenuPosition = {x: '0px', y: '0px'};

  procedureId: any;

  isPasted: boolean;
  pastedContent = '';

  selectedCells = [];
  startShiftKey: any;

  currentTable: StepTable;

  displayOrder: number;

  private cellSaveDelay: number = 2000;

  @Input() procedureData: any;

  @Input() stepGroup: StepGroupDefDTO;

  @Input() step: StepDef;
  @Output() stepChange = new EventEmitter<StepDef>();
  @Output() tableIsGone = new EventEmitter();

  readOnly: boolean = true;
  @Input() set readonly(value: boolean) {
    this.readOnly = value;
    this.richTextEditorEnabled = !this.readOnly;
  }

  @Input() public fillable: boolean = false;  // Indicates whether editable cells may be filled.

  @Input() public formGroup: UntypedFormGroup;

  @Input() disableForSaving = false;

  @Input() showEditingControls: boolean = true;

  @Input() redliningEnabled: boolean = false;

  tableId: string;

  tableUndoStack: StepTable[] = [];
  tableRedoStack: StepTable[] = [];

  tableCellDataQueue: TableCellQueueObject[] = [];

  richTextEditorEnabled: boolean = true;

  EditType = EditType;

  constructor(public epicService: EPICWSService,
              private messageService: MessageService,
              private dialog: MatDialog,
              private fb: UntypedFormBuilder,
              private runValidationService: RunValidationService,
              private loggerService: LoggerService,
              private runDataEntryService: RunDataEntryService,
              private tableNavigator: TableNavigatorService
  ) {}

  ngOnInit() {
    if (this.step) {
      this.currentTable = {'stepTableRows': []};
      this.step.stepTableRows.forEach(row => {
        this.currentTable.stepTableRows.push(_.cloneDeep(row));
      });
      if (this.readOnly) {
        this.tableId = 'step_' + this.step.pk + '_table';
      } else {
        this.tableId = 'step_' + this.step.pk + '_table_input';
      }
    } else {
      this.tableId = 'inputTable';
    }

    // Create form group to manage cell input values.
    let maxLength = Utils.getMaxRichTextEditorLength();
    let cells = {};
    if (this.step && this.fillable) {
      cells = _.chain(this.step.stepTableRows)
        .map(row => row.stepTableCells)
        .flatten()
        .filter(row => (row.editable && !row.optional))
        .keyBy(cell => cell.pk)
        .mapValues(cell => {
          if (!_.isEmpty(cell.nonEditableValue)) {
            //Remove HTML tags and trim the blank spaces
            cell.nonEditableValue = cell.nonEditableValue.toString().trim();
          }
          return [cell.nonEditableValue, [Validators.maxLength(maxLength), Validators.minLength(1),  Validators.required]];
        })
        .value();
    }
    this.formGroup = this.fb.group(cells);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.step) {
      this.ngOnInit();
    }
  }

  ngAfterViewInit() {
    var elements = document.getElementsByClassName('note-modal');
    while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
    }

    var moreElements = document.getElementsByClassName('note-dropzone');
    while(moreElements.length > 0){
      moreElements[0].parentNode.removeChild(moreElements[0]);
    }
  }

  trackCellByCellContents(index, item) {
    return item;
  }

  trackRowById(index, item) {
    return item.pk;
  }

  sendTableIsGone() { // based on whether table is eixsting and table is empty

    if ( this.currentTable == null) {
      this.tableIsGone.emit(true);
    }else { // if it is empty table, treat it as the same as no table at all.
      this.tableIsGone.emit(this.currentTable.stepTableRows.length ==0 ||
        this.currentTable.stepTableRows[0].stepTableCells.length ==0 );
    }
  }
  createTable(): void {
    this.isPasted = false;
    this.pushCurrentTableOnStack();
    this.currentTable = new StepTable();

    for (let i = 0; i < 3; i++) {
      const row = new StepTableRow(i);

      for (let j = 0; j < 2; j++) {
        const cell = new StepTableCell(j, (i === 0) ? 'Column ' + (j + 1) : '');
        row.stepTableCells.push(cell);
      }
      this.currentTable.stepTableRows.push(row);
    }
    this.sendTableIsGone();
  }

  pasteTable(): void {
    this.isPasted = true;
  }

  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    let pastedData = clipboardData.getData('text/html');

    // Parse HTML using browser's DOM parser to extract clean text content
    const parser = new DOMParser();
    const doc = parser.parseFromString(pastedData, 'text/html');

    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      this.loggerService.error('Failed to parse HTML:', parserError.textContent);
      return;
    }

    // Find all table rows
    const rows = doc.querySelectorAll('tr');
    if (rows.length === 0) {
      return; // No valid table found
    }

    this.pushCurrentTableOnStack();
    this.currentTable = new StepTable();

    rows.forEach((rowElement, i) => {
      const tableRow = new StepTableRow(i);

      // Find all cells in this row (both td and th)
      const cells = rowElement.querySelectorAll('td, th');
      let cellIndex = 0;

      cells.forEach((cellElement) => {
        // Extract only the text content - strips all HTML, styles, formatting
        let cellText = cellElement.textContent || '';
        cellText = cellText.trim();

        // Handle colspan if present - Excel can insert colspans if a cell's text overflows into the next cell.
        const colspan = cellElement.getAttribute('colspan');
        const numberOfBlankCellsToCreateAfterThisOne = colspan ? parseInt(colspan, 10) - 1 : 0;

        const tableCell = new StepTableCell(cellIndex, cellText);
        tableRow.stepTableCells.push(tableCell);

        // Add blank cells for colspan
        if (numberOfBlankCellsToCreateAfterThisOne !== 0) {
          for (let k = 0; k < numberOfBlankCellsToCreateAfterThisOne; k++) {
            tableRow.stepTableCells.push(new StepTableCell(++cellIndex, ''));
          }
        }
        cellIndex++;
      });

      this.currentTable.stepTableRows.push(tableRow);
    });

    setTimeout(() => {
      this.pastedContent = '';
    }, 0);

    this.sendTableIsGone();
  }

  /*Takes a string, regular expression for html start tag, and regular end tag
  and returns the string with the all matching tags removed
   */
  cellRemoveStyle(cell, startTag, endTag): string {
    let startTagIndex = startTag[Symbol.search](cell);

    while (startTagIndex >= 0){
      let startTagContents = cell.substring((startTagIndex));
      let preTagContents = cell.substring(0,(startTagIndex));
      let postTagContents = startTagContents.substring(startTagContents.indexOf('>') + 1);
      let tagRemoved = preTagContents + postTagContents;
      let endTagIndex = tagRemoved.indexOf(endTag)
      tagRemoved = tagRemoved.substring(0, endTagIndex) + tagRemoved.substring(endTagIndex + endTag.length);
      cell = tagRemoved;
      startTagIndex = startTag[Symbol.search](tagRemoved)
    }
    return cell;
  }

  private pushCurrentTableOnStack() {
    const tableToPush = _.cloneDeep(this.currentTable);
    if (_.isEqual(tableToPush, this.tableUndoStack[this.tableUndoStack.length - 1])) {
      return;
    }
    this.tableUndoStack.push(tableToPush);
    this.tableRedoStack = [];
  }

  addRow(rowIndex): void {

    const numColumns: number = Number(this.currentTable.stepTableRows[0].stepTableCells.length);

    const cells = [];
    for (let i = 0; i < numColumns; i++) {
      cells.push(new StepTableCell(i, ''));
    }

    const row = new StepTableRow(rowIndex + 1);
    row.stepTableCells = cells;

    this.pushCurrentTableOnStack();
    this.currentTable.stepTableRows.splice(rowIndex + 1, 0, row);

    for (let i = 0; i < this.currentTable.stepTableRows.length; i++) {
      this.currentTable.stepTableRows[i].rowNumber = i;
    }

    this.sendTableIsGone();
  }

  deleteRow(rowIndex): void {
    if (rowIndex === 0) {
      this.messageService.showSnackBar('Unable to delete the title row', 'Delete');
    } else {
      this.pushCurrentTableOnStack();
      this.currentTable.stepTableRows.splice(rowIndex, 1);

      for (let i = 0; i < this.currentTable.stepTableRows.length; i++) {
        this.currentTable.stepTableRows[i].rowNumber = i;
      }
    }
    this.sendTableIsGone();
  }

  addColumn(colIndex): void {

    const numRows: number = Number(this.currentTable.stepTableRows.length);
    this.pushCurrentTableOnStack();

    for (let i = 0; i < numRows; i++) {

      const cell = new StepTableCell(colIndex, '');
      this.currentTable.stepTableRows[i].stepTableCells.splice(colIndex, 0, cell);

      for (let j = 0; j < this.currentTable.stepTableRows[i].stepTableCells.length; j++) {
        this.currentTable.stepTableRows[i].stepTableCells[j].cellIndex = j;
      }
    }

    this.sendTableIsGone();
  }

  deleteColumn(colIndex): void {
    const numRows: number = Number(this.currentTable.stepTableRows.length);

    if (colIndex >= this.currentTable.stepTableRows[0].stepTableCells.length) {
      this.messageService.showSnackBar('Unable to delete the control column', 'CLOSE');
    } else {
      this.pushCurrentTableOnStack();
      for (let i = 0; i < numRows; i++) {
        this.currentTable.stepTableRows[i].stepTableCells.splice(colIndex, 1);

        for (let j = 0; j < this.currentTable.stepTableRows[i].stepTableCells.length; j++) {
          this.currentTable.stepTableRows[i].stepTableCells[j].cellIndex = j;
        }
      }
    }
    this.sendTableIsGone();
  }

  onContextMenu(event: MouseEvent): void {
    if (!this.readOnly && !this.disableForSaving) {
      event.preventDefault();
      this.contextMenuPosition.x = event.clientX + 'px';
      this.contextMenuPosition.y = event.clientY + 'px';
      this.contextMenu.menuData = {'item': event.currentTarget};

      this.contextMenu.openMenu();
    }
  }

  setEditableRequired(cell): void {
    this.pushCurrentTableOnStack();
    const currentCell = this.getCellModel(cell);
    currentCell.editable = true;
    currentCell.optional = false;
  }

  setEditableOptional(cell): void {
    this.pushCurrentTableOnStack();
    const currentCell = this.getCellModel(cell);
    currentCell.editable = true;
    currentCell.optional = true;
  }

  setUneditable(cell): void {
    this.pushCurrentTableOnStack();
    const currentCell = this.getCellModel(cell);
    currentCell.editable = false;
    currentCell.optional = false;
  }

  multiEditable(editable: boolean, optional: boolean): void {
    let currentCell;
    if (this.selectedCells.length > 0) {
      this.pushCurrentTableOnStack();
      this.selectedCells.forEach(scell => {
        currentCell = this.getCellModel(scell);
        currentCell.editable = editable;
        currentCell.optional = optional;
        scell.classList.toggle('is-highlighted');

      });
      this.selectedCells = [];
    }
  }

  // given html element, get model object
  getCellModel(cell): any {
    return this.currentTable.stepTableRows[cell.getAttribute('row-index')].stepTableCells[cell.getAttribute('col-index')];
  }

  clearCellContents(cell): void {
    let currentCell;
    this.pushCurrentTableOnStack();
    if (this.selectedCells.length > 0) {
      this.selectedCells.forEach(scell => {
        if (scell.firstChild != null) {
          currentCell = this.getCellModel(scell);
          currentCell.nonEditableValue = '';
        }
      });
    } else {
      currentCell = this.getCellModel(cell);
      currentCell.nonEditableValue = '';
    }
    this.emptySelectedCells();
    this.clearShiftStart();
  }

  getInputTable(): any {
    return this.inputTableElement?.nativeElement || document.getElementById(this.tableId);
  }

  private getNavigateCursorToCell(row: number, col: number): void {
    const inputTable = this.getInputTable();
    if (!inputTable) {
      return;
    }
    const targetCell = this.tableNavigator.findCell(inputTable, row, col);
    if (!targetCell) {
      return;
    }
    targetCell.focus();
    this.clearShiftStart();
    this.setShiftStart(targetCell);
  }

  private getCellModelFromCoordinates(row: number, col: number): StepTableCell | null {
    const tableRow = this.currentTable?.stepTableRows?.[row];
    if (!tableRow) {
      return null;
    }
    return tableRow.stepTableCells?.[col] ?? null;
  }

  private getCellModelFromElement(cell: HTMLTableCellElement): StepTableCell | null {
    const coordinates = this.tableNavigator.getCellCoordinates(cell);
    if (!coordinates) {
      return null;
    }
    return this.getCellModelFromCoordinates(coordinates.row, coordinates.col);
  }

  private isCellEditableInCurrentMode(cellModel: StepTableCell | null): boolean {
    if (!cellModel || this.readOnly) {
      return false;
    }
    return (!this.disableForSaving && this.showEditingControls) || (cellModel.editable && this.fillable);
  }

  private getTabNavigableEditableCells(): HTMLTableCellElement[] {
    const inputTable = this.getInputTable();
    if (!inputTable) {
      return [];
    }

    const result: HTMLTableCellElement[] = [];
    const rows = inputTable.getElementsByTagName('tr');
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows.item(rowIndex);
      if (!row) {
        continue;
      }
      const cells = row.cells;
      for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
        const cell = cells.item(cellIndex);
        if (!cell || cell.className.includes('table-buttons')) {
          continue;
        }
        const model = this.getCellModelFromElement(cell);
        if (this.isCellEditableInCurrentMode(model)) {
          result.push(cell);
        }
      }
    }
    return result;
  }

  private findAdjacentEditableCell(currentCell: HTMLTableCellElement, forward: boolean): HTMLTableCellElement | null {
    const editableCells = this.getTabNavigableEditableCells();
    if (editableCells.length === 0) {
      return null;
    }

    const currentIndex = editableCells.indexOf(currentCell);
    if (currentIndex < 0) {
      return forward ? editableCells[0] : editableCells[editableCells.length - 1];
    }

    const nextIndex = forward ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= editableCells.length) {
      return null;
    }
    return editableCells[nextIndex];
  }

  private disableAllSummernoteEditors(): void {
    if (!this.currentTable?.stepTableRows) {
      return;
    }
    this.currentTable.stepTableRows.forEach(row => {
      row.stepTableCells.forEach(tableCell => {
        tableCell.summerNoteEnabled = false;
      });
    });
  }

  private selectAllEditableContent(editableElement: HTMLElement): void {
    if (!editableElement || !editableElement.textContent) {
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(editableElement);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  private activateEditingForCell(targetCell: HTMLTableCellElement): void {
    targetCell.focus();

    const targetModel = this.getCellModelFromElement(targetCell);
    if (!this.richTextEditorEnabled || !this.isCellEditableInCurrentMode(targetModel) || !targetModel) {
      return;
    }

    // deactivate all summer note editors because large tables can cause serious performance issues with a large number
    // of summer note controls rendered.
    this.disableAllSummernoteEditors();
    targetModel.summerNoteEnabled = true;

    setTimeout(() => {
      const editableElement = targetCell.querySelector('.note-editable') as HTMLElement | null;
      if (!editableElement) {
        return;
      }
      editableElement.focus();
      this.selectAllEditableContent(editableElement);
    }, 0);
  }

  navigateCells(event: KeyboardEvent): void {
    const cell = this.tableNavigator.resolveCellElement(event);
    if (!cell) {
      return;
    }
    const inputTable = this.getInputTable();
    if (!inputTable || !inputTable.contains(cell)) {
      return;
    }

    const coordinates = this.tableNavigator.getCellCoordinates(cell);
    if (!coordinates) {
      return;
    }

    const curRow = coordinates.row;
    const curCol = coordinates.col;
    const isInsideRichTextEditor = !!((event.target as HTMLElement | null)?.closest?.('.note-editable'));

    if (event.key === 'Tab' || event.keyCode === 9) {
      // Before switching cells, capture and persist the current cell value.
      // We must read the old value from the model BEFORE updating it, then read the new value from DOM.
      // This ensures:
      // 1. The model is updated for UI display (so innerHTML shows the new value when editor is disabled)
      // 2. The save is queued immediately (before Summernote's textChange event fires)
      // 3. When textChange fires, receiveTextChange sees values are equal and skips (no duplicate save)
      const currentCellModel = this.getCellModelFromElement(cell);
      if (currentCellModel && currentCellModel.summerNoteEnabled) {
        const editableElement = cell.querySelector('.note-editable') as HTMLElement | null;
        if (editableElement) {
          const oldValue = currentCellModel.nonEditableValue;
          const domValue = editableElement.innerHTML;

          // Only update and save if the value actually changed
          if (domValue !== oldValue) {
            // Update model for UI display before editor is disabled
            currentCellModel.nonEditableValue = domValue;

            // Queue the save immediately
            if (this.step && this.fillable) {
              const clonedCell = _.cloneDeep(currentCellModel);
              const newQueueObject = new TableCellQueueObject(clonedCell, domValue);
              this.tableCellDataQueue.push(newQueueObject);
              const clonedStep = _.cloneDeep(this.step);
              this.saveDataToServer(clonedStep, clonedCell, domValue, oldValue);
            }
          }
        }
      }

      const targetCell = this.findAdjacentEditableCell(cell, !event.shiftKey);
      if (targetCell) {
        event.preventDefault();
        this.activateEditingForCell(targetCell);
        this.clearShiftStart();
        this.setShiftStart(targetCell);
      }
      return;
    }

    if (isInsideRichTextEditor) {
      return;
    }

    if (event.key === 'ArrowRight' || event.keyCode === 39) {
      this.getNavigateCursorToCell(curRow, curCol + 1);
    } else if (event.key === 'ArrowLeft' || event.keyCode === 37) {
      this.getNavigateCursorToCell(curRow, curCol - 1);
    } else if (event.key === 'ArrowUp' || event.keyCode === 38) {
      this.getNavigateCursorToCell(curRow - 1, curCol);
    } else if (event.key === 'ArrowDown' || event.keyCode === 40) {
      this.getNavigateCursorToCell(curRow + 1, curCol);
    } else {
      if (event.key !== 'Shift' && event.key !== 'Ctrl') {
        this.pushCurrentTableOnStack();
      }
    }
  }

  /**
   * Temporary function used to push the current table to the stack when text is entered.
   * TODO: Within HTML, replace references to this function with the navigate cells function once navigate cells is
   * ready to use
   */
  pushTextChangeOnStack(): void {
    this.pushCurrentTableOnStack();
  }

  multiSelect(event): void {
    // Click targets can be deeply nested (e.g. spans inside innerHTML). Always resolve the actual table cell.
    const cell = event.target?.closest ? event.target.closest('td, th') : null;
    if (!cell) {
      return;
    }

    const cellRowIndex = cell.getAttribute('row-index');
    const cellColIndex = cell.getAttribute('col-index');
    if (cellRowIndex === null || cellColIndex === null) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      this.clearShiftStart();
      cell.classList.toggle('is-highlighted');
      if (this.selectedCells.includes(cell)) {
        this.selectedCells.splice(this.selectedCells.indexOf(cell), 1);
      } else {
        this.selectedCells.push(cell);
      }
    } else if (event.shiftKey && this.startShiftKey != null) {
      const startRow = Number(this.startShiftKey.getAttribute('row-index'));
      const startCol = Number(this.startShiftKey.getAttribute('col-index'));

      const endRow = Number(cell.getAttribute('row-index'));
      const endCol = Number(cell.getAttribute('col-index'));

      const inputTable = this.getInputTable();
      const inputRows = inputTable.getElementsByTagName('tr');
      for (const irow of inputRows) {
        const inputCells = irow.cells;
        for (const icell of inputCells) {
          if (!(icell.className.includes('table-buttons'))) {
            const tempRow = Number(icell.getAttribute('row-index'));
            const tempCol = Number(icell.getAttribute('col-index'));
            if (
              ((tempRow >= startRow && tempRow <= endRow) || (tempRow >= endRow && tempRow <= startRow))
              &&
              ((tempCol >= startCol && tempCol <= endCol) || (tempCol >= endCol && tempCol <= startCol))) {
              icell.classList.add('is-highlighted');
              if (!this.selectedCells.includes(icell)) {
                this.selectedCells.push(icell);
              }
            }
          }
        }
      }

      // clear the start
      this.clearShiftStart();
    } else {
      if (this.selectedCells.length > 0) {
        this.emptySelectedCells();
      }
      this.clearShiftStart();
      this.setShiftStart(cell);
    }
  }

  clearShiftStart(): void {
    if (this.startShiftKey != null) {
      this.startShiftKey.classList.remove('selectStart');
    }
    this.startShiftKey = null;

  }

  setShiftStart(cell: any): void {
    if (!this.readOnly) {
      this.startShiftKey = cell;
      this.startShiftKey.classList.add('selectStart');
    }
  }

  emptySelectedCells(): void {
    this.selectedCells.forEach(scell => {
      scell.classList.remove('is-highlighted');
    });
    this.selectedCells = [];
  }

  getCurrentTable(): any {
    return this.currentTable;
  }

  /**
   * Handle changes to the text.
   *
   * TODO: This seems to run when edit mode becomes enabled and when refresh is run; in which case it saves values to the server equal to what was just downloaded from the server.
   *
   * TODO: This gets into a loop with the Summernote editor. This gets a value, sets it in the editor; the editor detects a value is set, adn pushes an update to this. This then updates its value. Generally this loop terminates and teh state stabilizes, but the extra cycles required are inefficient. Resolution of this issue probably requires some changes to both this and Summernote, to enable bypassing the event emitting (e.g. on initialization).
   *
   * @param newText The new value of the text emitted by the event.
   * @param cell The cell being modified.
   * @returns void
   */
  public receiveTextChange(newText: string, cell: StepTableCell): void {

    // TODO: On init, newText is '', but nonEditableValue === null. Find a better way to fix this, like initializing the cell's nonEditableValue as '' on the server.
    // Hotfix for issue where Summernote initializes to '', the cell inintializes to null, so we see those are different, assume there's been a change, and push updates.
    if (cell.nonEditableValue === null) cell.nonEditableValue = '';
    // Remove HTML tags and trim the blank spaces
    if (newText === null ||
      _.isEmpty(newText.toString().replace( /(<([^>]+)>)/ig, '').trim() )) newText = '';

    const oldValue = cell.nonEditableValue;
    if (oldValue === newText)
      return;

    const clonedCell = _.cloneDeep(cell);

    // Before change, push the current table onto undo stack
    this.pushCurrentTableOnStack();


    if (this.step && this.fillable) {
      const newQueueObject = new TableCellQueueObject(clonedCell, newText);
      this.tableCellDataQueue.push(newQueueObject);

      // Clone before calling update function, just in case vals are modified by an async call.
      const clonedStep = _.cloneDeep(this.step);

      this.saveDataToServer(clonedStep, clonedCell, newText, oldValue);
    } else {
      cell.nonEditableValue = newText;
    }
  }

  private saveDataToServer(step: StepDef, cell: StepTableCell, newValue: string, oldValue: string) {

    while (this.tableCellDataQueue.length > 0) {
      const queueObject = this.tableCellDataQueue.shift();
      queueObject.cell.nonEditableValue = queueObject.textForCell;
      const cellToSave = queueObject.cell;
      this.loggerService.info('Saving table step data to the server for step with name: ' + step.stepName + ' and number ' + new StepDisplayOrderPipe().transform(step), cell.asDTO());
      this.runDataEntryService.saveRunStepValue(step, cellToSave).subscribe((data) => {
        if (data.errorMessage) {
          this.loggerService.error('Error saving a run value in the table of step with pk ' + step.pk + ': ' + data.errorMessage);
          this.messageService.showSnackBar
          ('Unable to save run value for step with name ' + step.stepName + ' caused by error: ' + data.errorMessage, 'CLOSE', 10000);
        } else {

          _.merge(this.step, data);

          let originalCell = _.chain(this.step.stepTableRows)
            .map(row => row.stepTableCells)
            .flatten()
            .filter(c => c.pk === cell.pk)
            .value()[0];

          if (originalCell.nonEditableValue !== oldValue) {
            this.tableCellDataQueue.push(new TableCellQueueObject(originalCell, originalCell.nonEditableValue))
            this.saveDataToServer(step, _.cloneDeep(originalCell), originalCell.nonEditableValue, newValue);
            return;
          } else {
            this.runDataEntryService.announceRunStepDefChange(this.step);
            this.messageService.showSnackBar('Run Value Saved', 'CLOSE');
            // Run validation
            this.runValidationService.validateProcedure(this.procedureData);

            // TODO: Investigate why sometimes fc is not defined. (Observed with some optional fields.)
            const fc = this.formGroup.get(cell.pk.toString());
            if (fc) fc.setValue(cell.nonEditableValue);
          }
        }
      });
    }
  }

  public deleteTable(): void {
    const dialogData = new ConfirmationDialogModel('Are you sure?', 'Deleting the table will remove all information in the table from this step.');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.pushCurrentTableOnStack();
        this.currentTable = null;
        this.sendTableIsGone();
      }
    });
  }

  public undoLastChange(): void {
    const previousCurrentTable = this.tableUndoStack.pop();
    this.tableRedoStack.push(_.cloneDeep(this.currentTable));
    this.currentTable = previousCurrentTable;
    this.sendTableIsGone();
  }

  public redoLastChange(): void {
    const subsequentCurrentTable = this.tableRedoStack.pop();
    this.tableUndoStack.push(_.cloneDeep(this.currentTable));
    this.currentTable = subsequentCurrentTable;

    this.sendTableIsGone();
  }

  enableRichTextEditor() {
    this.richTextEditorEnabled = true;
  }

  disableRichTextEditor() {
    this.richTextEditorEnabled = false;
  }

}
