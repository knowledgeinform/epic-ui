import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {ImageDisplayComponentComponent} from './image-display-component.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('ImageDisplayComponentComponent', () => {
  let component: ImageDisplayComponentComponent;
  let fixture: ComponentFixture<ImageDisplayComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ImageDisplayComponentComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageDisplayComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
