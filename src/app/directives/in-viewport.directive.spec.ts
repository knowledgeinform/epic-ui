import { ElementRef } from '@angular/core';
import { InViewportDirective } from './in-viewport.directive';

describe('InViewportDirective', () => {
  it('should create an instance', () => {
    const element = document.createElement('div');
    const directive = new InViewportDirective(new ElementRef(element));

    expect(directive).toBeTruthy();
  });
});
