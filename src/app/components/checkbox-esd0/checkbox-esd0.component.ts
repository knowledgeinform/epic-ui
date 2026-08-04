import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-checkbox-esd0',
  templateUrl: './checkbox-esd0.component.html',
  styleUrls: ['./checkbox-esd0.component.css']
})
export class CheckboxEsd0Component {

  @Input() public prefix: String = 'Procedure is ';

  constructor() { }



}
