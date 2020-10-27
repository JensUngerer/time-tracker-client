import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryGroupCategoryComponent } from './query-group-category.component';

describe('QueryGroupCategoryComponent', () => {
  let component: QueryGroupCategoryComponent;
  let fixture: ComponentFixture<QueryGroupCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryGroupCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryGroupCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
