import { fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { EquipmentEntryItemComponent } from './equipment-entry-item/equipment-entry-item.component';
import { ProcedureRunEquipmentEntryComponent } from './procedure-run-equipment-entry.component';
import { EquipmentService } from '@app/services/equipment.service';
import { OfflineService } from '@app/services/offline.service';
import { Run } from '@app/interfaces/Run';
import { Equipment } from '@app/interfaces/equipment';
import * as moment from 'moment';


describe('ProcedureRunEquipmentEntryComponent', () => {

  let component: ProcedureRunEquipmentEntryComponent;
  let fixture: any;
  let matDialogMock: any;
  let equipmentServiceMock: any;
  let offlineSubject: Subject<boolean>;
  let dialogCloseSubject: Subject<any>;

  const createDialogRef = (): MatDialogRef<any> => ({
    afterClosed: () => dialogCloseSubject
  }) as unknown as MatDialogRef<any>;

  const createMockFormControl = (value: any): { value: any; setValue: jasmine.Spy } => ({
    value,
    setValue: jasmine.createSpy('setValue')
  });

  const createRun = (pk: number): Run => {
    const run = new Run();
    run.pk = pk;
    run.name = 'Test Run';
    run.equipmentList = [];
    return run;
  };

  const createEquipment = (pk: number, name: string): Equipment => {
    const eq = new Equipment();
    eq.pk = pk;
    eq.name = name;
    eq.propertyNumber = `PROP-${pk}`;
    eq.serialNumber = `SER-${pk}`;
    eq.calibrationDate = moment.utc('2025-01-01');
    eq.calibrationDueDate = moment.utc('2026-12-31');
    eq.run = { pk } as any;
    return eq;
  };

  beforeEach(waitForAsync(() => {
    offlineSubject = new Subject<boolean>();
    equipmentServiceMock = {
      updateItem: jasmine.createSpy('updateItem').and.returnValue(Promise.resolve()),
      deleteItem: jasmine.createSpy('deleteItem').and.returnValue(Promise.resolve()),
      removeItemFromStep: jasmine.createSpy('removeItemFromStep').and.returnValue(Promise.resolve()),
      getEquipmentForRun: jasmine.createSpy('getEquipmentForRun').and.returnValue(Promise.resolve([])),
    };
    matDialogMock = {
      open: jasmine.createSpy('open').and.callFake(() => createDialogRef())
    };

    TestBed.configureTestingModule({
      imports: [AppTestingModule],
      declarations: [
        ProcedureRunEquipmentEntryComponent,
        EquipmentEntryItemComponent,
      ],
      providers: [
        UntypedFormBuilder,
        { provide: MatDialog, useValue: matDialogMock },
        { provide: EquipmentService, useValue: equipmentServiceMock },
        { provide: OfflineService, useValue: { offline: false, offlineSubject } },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    dialogCloseSubject = new Subject<any>();
    fixture = TestBed.createComponent(ProcedureRunEquipmentEntryComponent);
    component = fixture.componentInstance;
    component.run = createRun(1);
    component.readOnly = false;
    component.allowItemEdit = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('dialog cancel behavior', () => {

    it('should NOT remove an existing item when the edit dialog is cancelled', fakeAsync(() => {
      // Arrange – load an existing equipment item
      const equipment = createEquipment(10, 'Torque Wrench');
      component.equipment = [equipment];
      // Manually trigger ngOnChanges since direct property assignment doesn't
      // populate SimpleChanges (Angular only does that for template-bound inputs)
      component.ngOnChanges({ equipment: new SimpleChange(null, [equipment], true) });
      tick();

      expect(component.fa.controls.length).toBe(1);
      expect(component.fa.controls[0].value.pk).toBe(10);

      // Act – open dialog for existing item (isBlank omitted = undefined/falsy)
      // then simulate Cancel
      component.openEquipmentEntryItemDialog(component.fa.controls[0], 0);
      dialogCloseSubject.next(undefined);
      dialogCloseSubject.complete();
      tick();

      // Assert – existing item must remain
      expect(component.fa.controls.length).toBe(1);
      expect(component.fa.controls[0].value.pk).toBe(10);
    }));

    it('should remove a blank item when "Add New Entry" dialog is cancelled', fakeAsync(() => {
      // Arrange
      const initialCount = component.fa.controls.length;

      // Act – addNewEquipmentEntryItemDialog adds a blank item, opens dialog (isBlank = true),
      // then we simulate Cancel
      component.addNewEquipmentEntryItemDialog();
      tick();

      // Blank item exists before dialog closes
      expect(component.fa.controls.length).toBe(initialCount + 1);

      dialogCloseSubject.next(undefined);
      dialogCloseSubject.complete();
      tick();

      // Assert – blank item should be removed, count back to original
      expect(component.fa.controls.length).toBe(initialCount);
    }));

    it('should update the form control when the dialog is saved', waitForAsync(() => {
      // Arrange
      const equipment = createEquipment(10, 'Torque Wrench');
      component.equipment = [equipment];
      component.ngOnChanges({ equipment: new SimpleChange(null, [equipment], true) });

      fixture.whenStable().then(() => {
        expect(component.fa.controls.length).toBe(1);

        // Act – open dialog and simulate Save
        // The dialog's [mat-dialog-close] returns parentForm (an AbstractControl<FormItem>)
        const savedValue = {
          pk: 10,
          name: 'Torque Wrench (edited)',
          serialNumber: 'SER-10',
          propertyNumber: 'PROP-10',
          calibrationDate: null,
          calibrationDueDate: null,
          run: null
        };
        component.openEquipmentEntryItemDialog(component.fa.controls[0], 0);
        dialogCloseSubject.next(createMockFormControl(savedValue));
        dialogCloseSubject.complete();

        // Assert – form control should reflect saved value
        expect(component.fa.controls[0].value.name).toBe('Torque Wrench (edited)');
      });
    }));
  });
});
