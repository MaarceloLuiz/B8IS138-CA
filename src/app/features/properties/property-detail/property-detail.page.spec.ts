import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyDetailPage } from './property-detail.page';

describe('PropertyDetailPage', () => {
  let component: PropertyDetailPage;
  let fixture: ComponentFixture<PropertyDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
