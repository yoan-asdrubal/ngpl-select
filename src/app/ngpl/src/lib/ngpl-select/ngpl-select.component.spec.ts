import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NgplSelectComponent } from './ngpl-select.component';

describe('WidgetAutocompleteComponent', () => {
  let component: NgplSelectComponent;
  let fixture: ComponentFixture<NgplSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NgplSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgplSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
