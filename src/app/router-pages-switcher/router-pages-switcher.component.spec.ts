import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterPagesSwitcherComponent } from './router-pages-switcher.component';

describe('RouterPagesSwitcherComponent', () => {
  let component: RouterPagesSwitcherComponent;
  let fixture: ComponentFixture<RouterPagesSwitcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouterPagesSwitcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouterPagesSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
