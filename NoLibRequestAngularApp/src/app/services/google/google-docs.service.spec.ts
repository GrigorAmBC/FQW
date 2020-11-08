import { TestBed } from '@angular/core/testing';

import { GoogleDocsService } from './google-docs.service';

describe('GoogleDocsService', () => {
  let service: GoogleDocsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleDocsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
