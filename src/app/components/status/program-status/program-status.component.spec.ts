import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AgGridModule, AgGridAngular } from 'ag-grid-angular';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProgramStatusComponent } from './program-status.component';
import { AppTestingModule } from '@app/app-testing-module';
import { EPICWSService } from '@app/services/epic-ws.service';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { ProgramDTO } from '@app/interfaces/program.dto';
import { ProgramStatusDTO } from '@app/interfaces/program-status.dto';

describe('ProgramStatusComponent', () => {
  let component: ProgramStatusComponent;
  let fixture: ComponentFixture<ProgramStatusComponent>;
  let dialogMock: { open: jasmine.Spy };

  const testProgram = { pk: 1, code: 'TST', name: 'Test Program' } as ProgramDTO;

  const statusCounts: ProgramStatusDTO = {
    programPk: 1,
    procedureStatusCounts: { DRAFT: 3, WAITING: 1, APPROVED: 0, READY: 2 },
    runStatusCounts: { RUNNING: 2, REVIEWING: 0, CORRECTING: 0, APPROVED: 0, COMPLETED: 0, ABANDONED: 0 }
  };

  // 12:00Z timestamps stay on the same calendar date in any timezone we realistically
  // run tests in, so the formatted values are deterministic.
  const procedureRows = [
    {
      id: 'PROC-1',
      procedureDefName: 'Test Procedure',
      status: 'DRAFT',
      createdDate: '2026-01-05T12:00:00Z',
      author: { displayName: 'Jane' },
      subsystem: { name: 'THRM' }
    }
  ];

  const runRows = [
    {
      id: 'RUN-1',
      runNumber: 1,
      procedureDefName: 'Test Procedure',
      createdDate: '2026-02-01T12:00:00Z',
      author: { displayName: 'Jane' },
      subsystem: { name: 'THRM' },
      run: {
        name: 'Run One',
        status: 'RUNNING',
        user: { displayName: 'Bob' },
        testingPhase: { shortName: 'TP1' },
        closeoutSubmissionUser: { displayName: 'Cal' },
        closeoutSubmittedDate: '2026-02-10T12:00:00Z',
        closeoutCompletedDate: null
      }
    }
  ];

  beforeEach(waitForAsync(() => {
    const epicWsServiceMock = {
      getPrograms: jasmine.createSpy('getPrograms').and.returnValue(Promise.resolve([testProgram])),
      getProgramStatus: jasmine.createSpy('getProgramStatus').and.returnValue(Promise.resolve(statusCounts)),
      getProceduresByStatus: jasmine.createSpy('getProceduresByStatus').and.returnValue(Promise.resolve(procedureRows)),
      getRunsByStatus: jasmine.createSpy('getRunsByStatus').and.returnValue(Promise.resolve(runRows))
    };
    dialogMock = { open: jasmine.createSpy('open') };

    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        AgGridModule
      ],
      declarations: [
        ProgramStatusComponent
      ],
      providers: [
        { provide: EPICWSService, useValue: epicWsServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramStatusComponent);
    component = fixture.componentInstance;
  });

  // These tests are plain async (not fakeAsync): the rendered ag-grid schedules
  // recurring internal timers that fakeAsync cannot drain. A single macrotask tick
  // is enough to let the mocked service promises resolve.
  async function settle(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  // Selects a program and flushes the status-counts request, as if the user picked it in the filter.
  async function selectProgram(): Promise<void> {
    component.selectedProgram = testProgram;
    component.onProgramSelected();
    await settle();
    fixture.detectChanges();
  }

  // Finds a count button by the beginning of its label (e.g. 'DRAFT' matches 'DRAFT: 3') and clicks it.
  async function clickStatusButton(labelPrefix: string): Promise<void> {
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const button = buttons.find(b => b.textContent.trim().startsWith(labelPrefix));
    button.click();
    await settle();
    fixture.detectChanges();
  }

  it('should create', async () => {
    // Arrange
    fixture.detectChanges();

    // Act
    await settle();

    // Assert
    expect(component).toBeTruthy();
  });

  it('loads the list of programs for the program filter', async () => {
    // Arrange
    fixture.detectChanges();

    // Act
    await settle();

    // Assert
    expect(component.programs).toEqual([testProgram]);
  });

  it('renders one count button per status with the selected program\'s counts', async () => {
    // Arrange
    fixture.detectChanges();
    await settle();

    // Act
    await selectProgram();

    // Assert: buttons show the display value and the count for each status
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const buttonLabels = buttons.map(b => b.textContent.trim());
    expect(buttonLabels).toContain('DRAFT: 3');
    expect(buttonLabels).toContain('IN REVIEW: 1');
    expect(buttonLabels).toContain('RELEASED: 2');
    expect(buttonLabels).toContain('RUNNING: 2');
    expect(buttonLabels).toContain('ABANDONED: 0');
  });

  it('opens a procedure table tab when a procedure status count button is clicked', async () => {
    // Arrange
    fixture.detectChanges();
    await settle();
    await selectProgram();

    // Act
    await clickStatusButton('DRAFT');

    // Assert
    const epicWsService: any = TestBed.inject(EPICWSService);
    expect(epicWsService.getProceduresByStatus).toHaveBeenCalledWith(1, 'DRAFT');
    expect(component.openTabs.length).toBe(1);
    expect(component.openTabs[0].type).toBe('procedure');
    expect(component.openTabs[0].status).toBe('DRAFT');
    expect(component.openTabs[0].data[0].formattedDate).toBe('2026/01/05');
    expect(fixture.debugElement.query(By.directive(AgGridAngular))).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Procedures - DRAFT');
  });

  it('opens a run table tab with formatted closeout dates when a run status count button is clicked', async () => {
    // Arrange
    fixture.detectChanges();
    await settle();
    await selectProgram();

    // Act
    await clickStatusButton('RUNNING');

    // Assert
    const epicWsService: any = TestBed.inject(EPICWSService);
    expect(epicWsService.getRunsByStatus).toHaveBeenCalledWith(1, 'RUNNING');
    expect(component.openTabs.length).toBe(1);
    expect(component.openTabs[0].type).toBe('run');
    expect(component.openTabs[0].status).toBe('RUNNING');
    const row = component.openTabs[0].data[0];
    expect(row.formattedDate).toBe('2026/02/01');
    expect(row.formattedSubmittedDate).toBe('2026/02/10');
    expect(row.formattedCompletedDate).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Runs - RUNNING');
  });

  it('keeps a stable columnDefs reference across change detection (filter panel regression)', async () => {
    // Arrange: open a procedure tab so the ag-grid element is rendered
    fixture.detectChanges();
    await settle();
    await selectProgram();
    await clickStatusButton('DRAFT');

    // Act: capture the reference the grid received, then run change detection
    // again, as would happen while a user interacts with an open filter panel
    const grid = fixture.debugElement.query(By.directive(AgGridAngular)).componentInstance;
    const firstReference = grid.columnDefs;
    fixture.detectChanges();

    // Assert: the grid must receive the same array reference. If the template ever
    // binds a method call again (e.g. [columnDefs]="getProcedureColumnDefs()"), a new
    // array is created on every change-detection cycle and ag-grid performs a hard
    // column refresh that destroys the open filter panel.
    expect(grid.columnDefs).toBe(firstReference);
  });

  it('shows the error dialog when the status counts request fails', async () => {
    // Arrange
    const epicWsService: any = TestBed.inject(EPICWSService);
    epicWsService.getProgramStatus.and.returnValue(Promise.resolve({ error: 'boom' }));
    fixture.detectChanges();
    await settle();

    // Act
    await selectProgram();

    // Assert
    expect(dialogMock.open).toHaveBeenCalledWith(ErrorDialogComponent,
      jasmine.objectContaining({ data: { description: 'Error retrieving status counts', errorMessage: 'boom' } }));
  });

  it('clearAllFilters closes all tabs and deselects the program', async () => {
    // Arrange: open a tab first
    fixture.detectChanges();
    await settle();
    await selectProgram();
    await clickStatusButton('DRAFT');
    expect(component.openTabs.length).toBe(1);

    // Act
    component.clearAllFilters();
    fixture.detectChanges();

    // Assert
    expect(component.selectedProgram).toBeNull();
    expect(component.openTabs.length).toBe(0);
    expect(component.showStatusContent).toBeFalse();
  });
});
