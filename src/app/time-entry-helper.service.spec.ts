import { TestBed } from '@angular/core/testing';

import { TimeEntryHelperService } from './time-entry-helper.service';

describe('TimeEntryHelperService', () => {
  let service: TimeEntryHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeEntryHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
