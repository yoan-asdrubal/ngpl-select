import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgplSelectTestComponent } from './ngpl-select-test.component';

describe('NgplSelectTestComponent', () => {
  let component: NgplSelectTestComponent;
  let fixture: ComponentFixture<NgplSelectTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgplSelectTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgplSelectTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
