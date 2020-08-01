import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitOrBookComponent } from './commit-or-book.component';

describe('CommitOrBookComponent', () => {
  let component: CommitOrBookComponent;
  let fixture: ComponentFixture<CommitOrBookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommitOrBookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitOrBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
