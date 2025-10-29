import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyListPage } from './property-list.page';

describe('PropertyListPage', () => {
  let component: PropertyListPage;
  let fixture: ComponentFixture<PropertyListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
