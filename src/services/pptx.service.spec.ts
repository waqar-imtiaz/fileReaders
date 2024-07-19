/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PptxService } from './pptx.service';

describe('Service: Pptx', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PptxService]
    });
  });

  it('should ...', inject([PptxService], (service: PptxService) => {
    expect(service).toBeTruthy();
  }));
});
