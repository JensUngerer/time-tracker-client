import { TestBed } from '@angular/core/testing';

import { GroupCategoryService } from './group-category.service';

describe('GroupCategoryService', () => {
  let service: GroupCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
