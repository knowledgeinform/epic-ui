# Table Keyboard Navigation Fix Plan

## Problem Statement

Keyboard navigation (arrow keys) is skipping columns when navigating through table cells. This was introduced when fixing tables to render the Summer Note editor for every cell on display.

## Root Cause Analysis

The issue exists in the `navigateCells()` and `getNavigateCursorToCell()` methods in `tablestepentry.component.ts`.

**Current Implementation Flaw:**

```typescript
navigateCells(event): void {
  const cell = event.target;  // ❌ PROBLEM: event.target may be nested inside Summernote!
  const curRow = Number(cell.getAttribute('row-index'));
  const curCol = Number(cell.getAttribute('col-index'));
  ...
}
```

When the Summer Note editor is rendered in a cell (when `richTextEditorEnabled && cell.summerNoteEnabled`), it creates a nested DOM structure inside the `<td>`/`<th>` element. When the user presses an arrow key:

1. `event.target` refers to the element that received the keydown event
2. This could be a nested element inside the Summer Note editor (div, span, or contenteditable element)
3. The nested element does NOT have `row-index` and `col-index` attributes
4. `getAttribute()` returns `null`, causing `Number(null)` to become `0`
5. Navigation always targets row 0, column 0, or the first matching cell it finds
6. Result: columns appear to be "skipped"

**Evidence the multiSelect() method already solved this:**

```typescript
multiSelect(event): void {
  const cell = event.target?.closest ? event.target.closest('td, th') : null;
  if (!cell) {
    return;
  }
  // ... uses the resolved cell correctly
}
```

The `multiSelect()` method correctly uses `.closest('td, th')` to resolve to the actual table cell. The same approach should be used in `navigateCells()`.

## Current Architecture Issues

The `TablestepentryComponent` (697 lines) violates several SOLID principles:

1. **Single Responsibility Principle (SRP) Violation:**
   - Handles table rendering
   - Handles keyboard navigation
   - Handles cell selection (multi-select)
   - Handles Summer Note integration
   - Handles CRUD operations (add/delete rows/columns)
   - Handles undo/redo
   - Handles server communication

2. **Open/Closed Principle (OCP) Violation:**
   - Navigation logic is tightly coupled to DOM structure
   - Difficult to extend navigation behavior without modifying the component

3. **Interface Segregation Principle (ISP) Violation:**
   - Component implements too many responsibilities through its public API

4. **Dependency Inversion Principle (DIP) Violation:**
   - High-level component depends on low-level DOM operations
   - Navigation logic directly queries DOM instead of depending on abstractions

## Proposed Solution

### Option 1: Quick Fix (Recommended for immediate release)

Apply the same pattern used in `multiSelect()` to resolve the cell element:

```typescript
navigateCells(event): void {
  // Resolve to the actual table cell, handling nested DOM from Summer Note
  const cell = event.target?.closest ? event.target.closest('td, th') : null;
  if (!cell) {
    return;
  }
  
  const curRow = Number(cell.getAttribute('row-index'));
  const curCol = Number(cell.getAttribute('col-index'));
  
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
```

**Pros:**
- Minimal change (5 lines)
- Uses proven pattern already in the codebase
- Low risk
- Quick to implement and test

**Cons:**
- Doesn't address architectural issues
- Navigation logic remains tightly coupled to component

### Option 2: Extract TableNavigator Service (Recommended SOLID approach)

**Step 1: Create a TableNavigator service**

```typescript
// table-navigator.service.ts
@Injectable({
  providedIn: 'root'
})
export class TableNavigator {
  /**
   * Resolves the actual table cell element from any nested child element.
   * Handles cases where DOM structure includes nested containers (e.g., Summer Note).
   */
  resolveCellElement(event: KeyboardEvent): HTMLTableCellElement | null {
    const target = event.target as HTMLElement;
    return target?.closest('td, th') ?? null;
  }

  /**
   * Gets cell coordinates from a table cell element.
   */
  getCellCoordinates(cell: HTMLTableCellElement): { row: number, col: number } {
    return {
      row: Number(cell.getAttribute('row-index')) || 0,
      col: Number(cell.getAttribute('col-index')) || 0
    };
  }

  /**
   * Navigates to a specific cell in the table.
   */
  navigateToCell(table: HTMLTableElement, row: number, col: number): void {
    const rows = table.getElementsByTagName('tr');
    for (const irow of rows) {
      const cells = irow.cells;
      for (const icell of cells) {
        if (icell.className.includes('table-buttons')) {
          continue;
        }
        const tempRow = Number(icell.getAttribute('row-index'));
        const tempCol = Number(icell.getAttribute('col-index'));
        if (tempRow === row && tempCol === col) {
          icell.focus();
          return;
        }
      }
    }
  }
}
```

**Step 2: Update the component to use the service**

```typescript
export class TablestepentryComponent {
  constructor(
    // ... existing dependencies
    private tableNavigator: TableNavigator
  ) {}

  navigateCells(event): void {
    const cell = this.tableNavigator.resolveCellElement(event);
    if (!cell) return;

    const { row, col } = this.tableNavigator.getCellCoordinates(cell);

    switch (event.key) {
      case 'ArrowRight':
        this.tableNavigator.navigateToCell(this.getInputTable(), row, col + 1);
        break;
      case 'ArrowLeft':
        this.tableNavigator.navigateToCell(this.getInputTable(), row, col - 1);
        break;
      case 'ArrowUp':
        this.tableNavigator.navigateToCell(this.getInputTable(), row - 1, col);
        break;
      case 'ArrowDown':
        this.tableNavigator.navigateToCell(this.getInputTable(), row + 1, col);
        break;
      default:
        if (event.key !== 'Shift' && event.key !== 'Ctrl') {
          this.pushCurrentTableOnStack();
        }
    }
  }
}
```

**Pros:**
- Follows SOLID principles completely
- Navigation logic is independently testable
- Easy to extend with new navigation behaviors
- Cleaner, more maintainable component
- Can be reused across different table components

**Cons:**
- More refactoring required
- Slightly higher initial development time

### Option 3: Hybrid Approach (Practical middle ground)

Apply the quick fix (Option 1) immediately to resolve the bug, then plan a phased refactor to extract navigation logic in a future sprint.

## Recommended Approach

**Short-term:** Apply **Option 1** to fix the immediate bug.

**Long-term:** Refactor to **Option 2** to improve code quality and maintainability.

## Testing Strategy

Create unit tests for keyboard navigation that:
1. Simulate arrow key events on nested elements inside cells
2. Verify correct cell navigation (row/column coordinates)
3. Test boundary conditions (edges of table)
4. Test that navigation doesn't enter "table-buttons" control cells
5. Verify behavior with and without Summer Note editor

## Additional Requirement: Tab Key Navigation for Immediate Editing

**CRITICAL:** When a user tabs into an editable cell, the cell must become **immediately editable** - not just highlighted or focused. This is a user experience requirement that was missing from the original plan.

### Tab Key Behavior Requirements

1. **Tab from a previous cell:** When tabbing into the **first editable cell**, the cell should enter edit mode immediately, allowing the user to start typing without any additional keystrokes.

2. **Tab from a previous cell:** When tabbing into a **subsequent editable cell**, the cell should enter edit mode immediately and **select all existing content** (if any), allowing the user to start typing to replace the content.

3. **Tab from a subsequent cell:** When tabbing from one editable cell to another **subsequent** editable cell, the cell should enter edit mode immediately and **select all existing content**.

4. **Shift+Tab (backward navigation):** When Shift+Tabbing into an editable cell, the same behavior as Tab should apply - enter edit mode immediately.

### Why This Is Critical

Without immediate edit mode on Tab:
- Users must click or press Enter/F2 after Tabbing to enter edit mode
- This creates a jarring, inconsistent experience
- Keyboard navigation and actual editing become two separate, disconnected workflows
- Users lose muscle memory and efficiency

### Integration with Current Architecture

The Tab key handling must be added to the `navigateCells()` method in `tablestepentry.component.ts`. Current implementation:

```typescript
navigateCells(event): void {
  const cell = event.target;  // ❌ PROBLEM: event.target may be nested inside Summernote!
  const curRow = Number(cell.getAttribute('row-index'));
  const curCol = Number(cell.getAttribute('col-index'));
  
  if (event.key === 'ArrowRight' || event.keyCode === 39) {
    // ... arrow key navigation
  } else if (event.key === 'Tab' || event.keyCode === 9) {
    // ❌ MISSING: Tab key handling is not implemented!
    // Should navigate to next/previous editable cell AND enter edit mode
  }
}
```

### Tab Key Implementation Approach

```typescript
navigateCells(event): void {
  // Resolve to the actual table cell, handling nested DOM from Summer Note
  const cell = event.target?.closest ? event.target.closest('td, th') : null;
  if (!cell) {
    return;
  }
  
  const curRow = Number(cell.getAttribute('row-index'));
  const curCol = Number(cell.getAttribute('col-index'));
  
  // Handle Tab key - navigate to next/previous editable cell AND enter edit mode
  if (event.key === 'Tab' || event.keyCode === 9) {
    event.preventDefault(); // Prevent default browser tab behavior
    
    // Calculate target cell
    const targetRow = curRow; // For now, stay in same row; extend for multi-row navigation
    const targetCol = event.shiftKey ? curCol - 1 : curCol + 1;
    
    // Find next/previous editable cell (skipping non-editable cells)
    const nextEditableCell = this.findNextEditableCell(targetRow, targetCol, !event.shiftKey);
    if (nextEditableCell) {
      nextEditableCell.focus();
      this.enterEditMode(nextEditableCell); // NEW: Enter edit mode immediately
    }
    return;
  }
  
  // Arrow key navigation (existing logic with fix)
  if (event.key === 'ArrowRight' || event.keyCode === 39) {
    this.getNavigateCursorToCell(curRow, curCol + 1);
  }
  // ... rest of arrow key handling
}

/**
 * Find the next/previous editable cell in the table.
 * @param startRow - Starting row index
 * @param startCol - Starting column index
 * @param forward - True for forward (Tab), false for backward (Shift+Tab)
 * @returns The HTML table cell element, or null if no editable cell found
 */
private findNextEditableCell(startRow: number, startCol: number, forward: boolean): HTMLTableCellElement | null {
  const inputTable = this.getInputTable();
  const rows = inputTable.getElementsByTagName('tr');
  
  // Simple row-major traversal to find next/previous editable cell
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const cells = row.cells;
    
    for (const cell of cells) {
      if (cell.className.includes('table-buttons')) {
        continue; // Skip control cells
      }
      
      const cellRow = Number(cell.getAttribute('row-index'));
      const cellCol = Number(cell.getAttribute('col-index'));
      
      // Skip non-editable cells
      const cellModel = this.getCellModel(cell);
      if (!cellModel?.editable) {
        continue;
      }
      
      // Check if this is the target cell based on direction
      if (forward) {
        if (cellRow > startRow || (cellRow === startRow && cellCol > startCol)) {
          return cell;
        }
      } else {
        if (cellRow < startRow || (cellRow === startRow && cellCol < startCol)) {
          // Track as potential candidate (we need the last one before current)
          // This requires a different traversal approach
        }
      }
    }
  }
  
  return null; // Simplified - actual implementation needs careful traversal
}

/**
 * Enter edit mode for a given table cell.
 * This is the critical addition for Tab key behavior.
 * @param cell - The HTML table cell element to enter edit mode for
 */
private enterEditMode(cell: HTMLTableCellElement): void {
  // Identify the cell's model object
  const rowIndex = Number(cell.getAttribute('row-index'));
  const colIndex = Number(cell.getAttribute('col-index'));
  const cellModel = this.currentTable.stepTableRows[rowIndex].stepTableCells[colIndex];
  
  if (!cellModel?.editable) {
    return; // Don't enter edit mode for non-editable cells
  }
  
  // Find the Summernote editor element within this cell
  const summernoteEditor = cell.querySelector('app-summernote-editor');
  if (summernoteEditor) {
    // Enable the Summernote editor for immediate editing
    cellModel.summerNoteEnabled = true;
    
    // Trigger Angular change detection to update the view
    // The Summernote editor will be rendered and ready for input
    
    // Optional: Select all existing content for replacement
    const editorElement = summernoteEditor.querySelector('.note-editable') as HTMLElement;
    if (editorElement) {
      // Use document.selection for IE or range select for modern browsers
      const range = document.createRange();
      range.selectNodeContents(editorElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }
  
  // Set focus to the editor's contenteditable area
  setTimeout(() => {
    const editableElement = cell.querySelector('.note-editable') as HTMLElement;
    if (editableElement) {
      editableElement.focus();
    }
  }, 0);
}
```

### Integration with HTML Template

The existing template structure already supports immediate edit mode through `cell.summerNoteEnabled`:

```html
<ng-container *ngIf="richTextEditorEnabled && cell.summerNoteEnabled; else viewSummernoteOnly">
  <app-summernote-editor
    [text]="cell.nonEditableValue"
    (textChange)="receiveTextChange($event, cell)"
    [disableHints]="true"
    [airMode]="true"
    [isProcedureDraft]="procedureData.editType === EditType.ORIGINAL || redliningEnabled">
  </app-summernote-editor>
</ng-container>
<ng-template #viewSummernoteOnly>
  <div [innerHTML]="cell.nonEditableValue"></div>
</ng-template>
```

When `cell.summerNoteEnabled` is set to `true`, the `app-summernote-editor` component is rendered, making the cell immediately editable.

### Tab Key vs Arrow Key Behavior - Key Differences

| Behavior | Arrow Keys | Tab Key |
|----------|-----------|---------|
| Navigate to cell | Focus cell, highlight it | Focus cell, **enter edit mode** |
| Cell state | Display mode (view only) | **Edit mode** (ready for input) |
| Content | Visible but not selected | **Select all existing content** |
| Next action | Press arrow again to move, or click to edit | **Start typing immediately** |
| Non-editable cells | Can navigate through | **Skip over** (only land on editable cells) |

### Revised Testing Strategy for Tab Key

Add these test scenarios:

1. **Tab into first editable cell:**
   - User tabs from previous control into the first editable cell
   - Cell enters edit mode immediately
   - No content is selected (empty cell)
   - User can type immediately

2. **Tab into cell with existing content:**
   - User tabs into an editable cell that has existing content
   - Cell enters edit mode immediately
   - **All existing content is selected**
   - User can type immediately to replace content

3. **Tab between editable cells:**
   - User tabs from one editable cell to the next
   - Second cell enters edit mode immediately
   - **All content is selected**
   - User can type immediately to replace content

4. **Shift+Tab backward navigation:**
   - User Shift+Tabs from an editable cell to the previous editable cell
   - Previous cell enters edit mode immediately
   - **All content is selected**
   - User can type immediately

5. **Skip non-editable cells:**
   - User tabs and there are non-editable cells in between
   - Navigation skips non-editable cells, lands only on editable ones
   - Target cell enters edit mode immediately

6. **Arrow keys vs Tab key consistency:**
   - After navigating with arrow keys to a cell, pressing Tab should enter edit mode
   - After tabbing into a cell, arrow keys should still work for navigation (exiting edit mode first)

## Files to Modify

1. `src/app/components/step/tablestepentry/tablestepentry.component.ts` - Fix `navigateCells()`
2. `src/app/components/step/tablestepentry/tablestepentry.component.spec.ts` - Add unit tests
3. (Future) `src/app/services/table-navigator.service.ts` - Extract navigation logic
4. (Future) Update existing tests to use the new service

## Acceptance Criteria

- [ ] Arrow key navigation moves to adjacent cells correctly
- [ ] No columns are skipped when pressing Right/Left arrow
- [ ] No rows are skipped when pressing Up/Down arrow
- [ ] Navigation works with Summer Note editor enabled
- [ ] Navigation works with Summer Note editor disabled
- [ ] **Tab key enters edit mode immediately on editable cells**
- [ ] **Tab key skips non-editable cells**
- [ ] **Tab key selects all existing content when entering edit mode**
- [ ] **Shift+Tab works for backward navigation with same edit mode behavior**
- [ ] User can start typing immediately after Tab without additional keystrokes
- [ ] Unit tests pass for all navigation scenarios
- [ ] Manual testing confirms fix works across browser types


## Additional details for issues related to the wrong table being navigated
Issue: Enter redline mode and open a step that has a table (while the table is also displayed in the background). In the step table, use the keyboard navigation. Keyboard navigation would not work and 
looks like the keyboard nav happened in the background table.


Fixes for this are mostly about scoping keyboard handling to the correct table instance, instead of querying the whole document.
Big Idea (WPF Analogy)
Before: like calling Application.Current.MainWindow.FindName(...) and accidentally getting a control from another visual tree.
After: like using the current UserControl’s named element directly (this.MyTable) and ignoring events from outside that control.
1) Template now gives the table a local reference
   In tablestepentry.component.html (line 89), the table got #inputTableElement.
   In Angular, #... is a template reference variable (similar to naming an element in XAML and then resolving it in code-behind).
2) Component grabs that specific table via @ViewChild
   In tablestepentry.component.ts (line 51), added:@ViewChild('inputTableElement') inputTableElement: ElementRef<HTMLTableElement>;

Think of this like a strongly scoped handle to the control instance that belongs to this component.
3) getInputTable() now prefers local control over global DOM search
   In tablestepentry.component.ts (line 431), changed:from global document.getElementById(this.tableId)
   to this.inputTableElement?.nativeElement first, fallback to old behavior.

This avoids “wrong table” selection when multiple elements share the same ID in different rendered contexts (your redline foreground/background case).
4) Keydown handler now rejects events not from this table
   In tablestepentry.component.ts (line 561), navigateCells(...) now does:resolve cell from event target
   get this component’s table
   if (!inputTable || !inputTable.contains(cell)) return;

WPF analogy: in a PreviewKeyDown/KeyDown handler, early-return unless this.MyTable.IsAncestorOf((DependencyObject)e.OriginalSource).
5) Added regression test for duplicate-table scenario
   In tablestepentry.component.spec.ts (line 130), new test builds two tables with same ID:one “background”
   one “active”

Verifies arrow navigation focuses only active table cell, not background one.
