import { Component, Input, OnInit, ViewChild, TemplateRef, ViewContainerRef, DoCheck } from '@angular/core';

import { OverlayRef } from '@angular/cdk/overlay';

import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import { OverlayService } from '../overlay/overlay.service';

@Component({
  selector: 'app-progress-spinner',
  templateUrl: './progress-spinner.component.html',
  styleUrls: ['./progress-spinner.component.scss']
})
export class ProgressSpinnerComponent {
  @Input() color?: ThemePalette;
  @Input() diameter?: number = 100;
  @Input() mode?: ProgressSpinnerMode;
  @Input() strokeWidth?: number;
  @Input() value?: number;
  @Input() backdropEnabled = true;
  @Input() positionGloballyCenter = true;
  @Input() displayProgressSpinner: boolean;

  @ViewChild('progressSpinnerRef')
  private progressSpinnerRef: TemplateRef<any>;

  private overlayRef: OverlayRef;
  constructor(private vcRef: ViewContainerRef, private overlayService: OverlayService) { }
  ngOnInit() {
    // Config for Overlay Service
  }
 
}