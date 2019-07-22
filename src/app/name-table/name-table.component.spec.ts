import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NameTableComponent } from './name-table.component';

describe('NameTableComponent', () => {
  let component: NameTableComponent;
  let fixture: ComponentFixture<NameTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NameTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NameTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
