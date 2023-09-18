import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportmodelComponent } from './reportmodel.component';

describe('ReportmodelComponent', () => {
  let component: ReportmodelComponent;
  let fixture: ComponentFixture<ReportmodelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportmodelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportmodelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
