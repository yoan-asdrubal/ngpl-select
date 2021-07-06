import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {OverlayModule} from '@angular/cdk/overlay';
import {NgplSelectComponent} from './ngpl-select/ngpl-select.component';
import {NgplCommonDirectivesModule, NgplCommonModule} from 'ngpl-common';
import { NgplItemTemplateDirective } from './ngpl-item-template.directive';
import { NgplNoItemsTemplateDirective } from './ngpl-no-items-template.directive';
import { NgplItemsNotFoundTemplateDirective } from './ngpl-items-not-found-template.directive';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {NgplFilterModule} from 'ngpl-filter';

const widgesToImport = [
  NgplSelectComponent,
];

@NgModule({
  declarations: [widgesToImport, NgplItemTemplateDirective, NgplNoItemsTemplateDirective, NgplItemsNotFoundTemplateDirective],
  exports: [widgesToImport, NgplItemTemplateDirective, NgplNoItemsTemplateDirective, NgplItemsNotFoundTemplateDirective],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    OverlayModule,
    ScrollingModule,
    NgplCommonModule,
    NgplFilterModule,
    NgplCommonDirectivesModule
  ]
})
export class NgplSelectModule {
}
