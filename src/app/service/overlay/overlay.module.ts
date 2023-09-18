import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { OverlayService } from './overlay.service';

export { AppOverlayConfig } from './overlay.service';

@NgModule({
  imports: [
    OverlayModule
  ],
  providers: [OverlayService],
})
export class AppOverlayModule { }