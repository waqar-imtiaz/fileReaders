import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PptxToHtmlComponent } from './pptx-to-html.component';

describe('PptxToHtmlComponent', () => {
  let component: PptxToHtmlComponent;
  let fixture: ComponentFixture<PptxToHtmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PptxToHtmlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PptxToHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
