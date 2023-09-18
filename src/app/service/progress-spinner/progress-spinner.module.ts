import { NgModule } from '@angular/core';
import { ProgressSpinnerComponent } from './progress-spinner.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
export { ProgressSpinnerComponent } from './progress-spinner.component';
@NgModule({
  imports: [
    MatProgressSpinnerModule
  ],
  declarations: [ProgressSpinnerComponent],
  exports: [ProgressSpinnerComponent]
})
export class ProgressSpinnerModule { }