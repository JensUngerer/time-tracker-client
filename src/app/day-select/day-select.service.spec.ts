import { TestBed } from '@angular/core/testing';

import { DaySelectService } from './day-select.service';

describe('DaySelectService', () => {
  let service: DaySelectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DaySelectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
