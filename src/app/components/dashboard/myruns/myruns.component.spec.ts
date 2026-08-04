import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { OfflineAvailabilityIndicatorComponent } from '@app/components/offline-availability-indicator/offline-availability-indicator.component';
import { ProcedureFavoriteComponent } from '@app/components/procedure/procedure-favorite/procedure-favorite.component';
import { MyrunsComponent } from './myruns.component';


describe('MyrunsComponent', () => {
  let component: MyrunsComponent;
  let fixture: ComponentFixture<MyrunsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        MyrunsComponent,
        ProcedureFavoriteComponent,
        OfflineAvailabilityIndicatorComponent,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyrunsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
