import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { OfflineAvailabilityIndicatorComponent } from '../offline-availability-indicator/offline-availability-indicator.component';
import { ProcedureFavoriteComponent } from '../procedure/procedure-favorite/procedure-favorite.component';
import { ProceduresearchComponent } from '../procedure/proceduresearch/proceduresearch.component';
import { DashboardComponent } from './dashboard.component';
import { MyapprovalsComponent } from './myapprovals/myapprovals.component';
import { MydraftsComponent } from './mydrafts/mydrafts.component';
import { MyrunsComponent } from './myruns/myruns.component';


describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [DashboardComponent,
        MydraftsComponent,
        MyrunsComponent,
        ProceduresearchComponent,
        MyapprovalsComponent,
        ProcedureFavoriteComponent,
        OfflineAvailabilityIndicatorComponent,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
