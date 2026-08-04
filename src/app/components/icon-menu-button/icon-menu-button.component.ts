import { Component, inject, Input, OnInit } from '@angular/core';
import { LayoutBreakpointService } from '@app/services/layout-breakpoint.service';

/**
 * Displays as an icon button when the screen is small. Displays as a full-row menu entry (with discription) otherwise.
 * Define an icon within the tags to project that within the component.
 */
@Component({
  selector: 'app-icon-menu-button',
  host: { class: 'flex-row' },
  templateUrl: './icon-menu-button.component.html',
  styleUrls: ['./icon-menu-button.component.css']
})
export class IconMenuButtonComponent {
  readonly media = inject(LayoutBreakpointService);

  @Input() description: string;
  @Input() doOnClick: () => void;
  @Input() disabled: boolean = false;
  @Input() selected: boolean = false;

}
