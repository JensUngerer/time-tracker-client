import { TestBed } from '@angular/core/testing';

import { PostTimeEntryService } from './post-time-entry.service';

describe('PostTimeEntryService', () => {
  let service: PostTimeEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostTimeEntryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
