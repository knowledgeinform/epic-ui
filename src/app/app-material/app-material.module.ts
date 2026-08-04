import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTableModule} from '@angular/material/table';
import {MatTreeModule} from '@angular/material/tree';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatListModule} from '@angular/material/list';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatChipsModule} from '@angular/material/chips';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatBadgeModule} from '@angular/material/badge';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatRippleModule} from "@angular/material/core";
import {MatOptionModule} from "@angular/material/core";
import {MatStepper, MatStepperModule} from "@angular/material/stepper";


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatGridListModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule,
    MatSidenavModule,
    MatRadioModule,
    MatListModule,
    MatTabsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatProgressBarModule,
    DragDropModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatCardModule,
    MatButtonToggleModule,
    MatBadgeModule,
    MatTreeModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatRippleModule,
    MatOptionModule,
    MatStepperModule,
  ],
  providers: [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ],
  exports: [
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatGridListModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule,
    MatSidenavModule,
    MatRadioModule,
    MatListModule,
    MatTabsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatProgressBarModule,
    DragDropModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatCardModule,
    MatButtonToggleModule,
    MatBadgeModule,
    MatTreeModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatRippleModule,
    MatOptionModule,
    MatStepperModule,
  ]
})
export class AppMaterialModule {
}
