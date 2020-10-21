import { TestBed } from '@angular/core/testing';

import { BucketStorageService } from './bucket-storage.service';

describe('BucketStorageService', () => {
  let service: BucketStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BucketStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
