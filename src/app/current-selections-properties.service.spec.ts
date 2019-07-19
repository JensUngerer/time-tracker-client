import { TestBed } from '@angular/core/testing';

import { CurrentSelectionsPropertiesService } from './current-selections-properties.service';

describe('CurrentSelectionsPropertiesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CurrentSelectionsPropertiesService = TestBed.get(CurrentSelectionsPropertiesService);
    expect(service).toBeTruthy();
  });
});
