import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { ProcedureFavoriteComponent } from '@app/components/procedure/procedure-favorite/procedure-favorite.component';
import { MydraftsComponent } from './mydrafts.component';


describe('MydraftsComponent', () => {
  let component: MydraftsComponent;
  let fixture: ComponentFixture<MydraftsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        MydraftsComponent,
        ProcedureFavoriteComponent,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MydraftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
