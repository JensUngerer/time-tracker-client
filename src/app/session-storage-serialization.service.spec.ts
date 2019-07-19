import { TestBed } from '@angular/core/testing';

import { SessionStorageSerializationService } from './session-storage-serialization.service';

describe('SessionStorageSerializationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SessionStorageSerializationService = TestBed.get(SessionStorageSerializationService);
    expect(service).toBeTruthy();
  });
});
