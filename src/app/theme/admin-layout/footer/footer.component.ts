import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

import { environment } from '@env/environment';
import { Banner } from 'app/service/ad-banner';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class FooterComponent implements AfterViewInit {
  
@Input() banner: Banner;
showAd = environment.adsense.show;
    constructor() {    }

    ngAfterViewInit() {
        setTimeout(() => {
            try {
                (window['adsbygoogle'] = window['adsbygoogle'] || []).push({
                    overlays: {bottom: true}
                });
            } catch (e) {
                console.error(e);
            }
        }, 0);
    }
  
}

