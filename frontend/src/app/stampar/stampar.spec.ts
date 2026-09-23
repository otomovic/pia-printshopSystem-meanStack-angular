import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stampar } from './stampar';

describe('Stampar', () => {
  let component: Stampar;
  let fixture: ComponentFixture<Stampar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stampar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stampar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
