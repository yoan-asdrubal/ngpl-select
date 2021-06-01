import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NgplSelectTestComponent} from './app-test/ngpl-select-test/ngpl-select-test.component';

const routes: Routes = [
  {
    path: 'ngpl-select',
    component: NgplSelectTestComponent
  },
  {
    path: '**',
    component: NgplSelectTestComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
