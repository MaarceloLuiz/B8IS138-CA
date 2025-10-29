import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyCreatePage } from './property-create.page';

describe('PropertyCreatePage', () => {
  let component: PropertyCreatePage;
  let fixture: ComponentFixture<PropertyCreatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
