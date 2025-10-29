import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyMapPage } from './property-map.page';

describe('PropertyMapPage', () => {
  let component: PropertyMapPage;
  let fixture: ComponentFixture<PropertyMapPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
