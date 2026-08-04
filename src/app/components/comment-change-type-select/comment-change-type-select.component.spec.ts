import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModule } from '@app/app-material/app-material.module';
import { AppTestingModule } from '@app/app-testing-module';
import { programMock } from '@app/test/program.mock';
import { CommentChangeTypeSelectComponent } from './comment-change-type-select.component';


describe('CommentChangeTypeSelectComponent', () => {
  let component: CommentChangeTypeSelectComponent;
  let fixture: ComponentFixture<CommentChangeTypeSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        AppMaterialModule,
      ],
      declarations: [
        CommentChangeTypeSelectComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentChangeTypeSelectComponent);
    component = fixture.componentInstance;
    component.program = programMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
