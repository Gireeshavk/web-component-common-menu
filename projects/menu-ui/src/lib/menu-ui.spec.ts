import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuUi } from './menu-ui';

describe('MenuUi', () => {
  let component: MenuUi;
  let fixture: ComponentFixture<MenuUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuUi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
