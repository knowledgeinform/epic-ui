import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { EquipmentEntryItemComponent } from './equipment-entry-item/equipment-entry-item.component';
import { ProcedureRunEquipmentEntryComponent } from './procedure-run-equipment-entry.component';


describe('ProcedureRunEquipmentEntryComponent', () => {
  let component: ProcedureRunEquipmentEntryComponent;
  let fixture: ComponentFixture<ProcedureRunEquipmentEntryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ProcedureRunEquipmentEntryComponent,
        EquipmentEntryItemComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureRunEquipmentEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
