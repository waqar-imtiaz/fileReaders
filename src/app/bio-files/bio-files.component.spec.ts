import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioFilesComponent } from './bio-files.component';

describe('BioFilesComponent', () => {
  let component: BioFilesComponent;
  let fixture: ComponentFixture<BioFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BioFilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BioFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
