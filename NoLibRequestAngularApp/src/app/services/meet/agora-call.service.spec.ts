import { TestBed } from '@angular/core/testing';

import { AgoraCallService } from './agora-call.service';

describe('AgoraCallService', () => {
  let service: AgoraCallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgoraCallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
