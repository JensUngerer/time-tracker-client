import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsCsvFileWrittenComponent } from './is-csv-file-written.component';

describe('IsCsvFileWrittenComponent', () => {
  let component: IsCsvFileWrittenComponent;
  let fixture: ComponentFixture<IsCsvFileWrittenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IsCsvFileWrittenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IsCsvFileWrittenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
