import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiHeaderLib } from './ui-header-lib';

describe('UiHeaderLib', () => {
  let component: UiHeaderLib;
  let fixture: ComponentFixture<UiHeaderLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiHeaderLib]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiHeaderLib);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
