// Code based on: https://www.namekdev.net/2016/01/two-way-binding-to-contenteditable-element-in-angular-2/

import { Directive, ElementRef, Input, Output, OnChanges, EventEmitter, SimpleChanges } from "@angular/core";

@Directive({
  selector: '[contenteditableModel]',
  host: {
    '(blur)': 'onBlur()'
  }
})
export class ContenteditableModel implements OnChanges {

  @Input() contenteditableModel: any;
  @Output() contenteditableModelChange = new EventEmitter();


  constructor(private elRef: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.refreshView();
  }

  onBlur() {
    const value = this.elRef.nativeElement.innerText;
    this.contenteditableModelChange.emit(value);
  }

  private refreshView() {
    this.elRef.nativeElement.textContent = this.contenteditableModel;
  }
}
