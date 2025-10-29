import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingListPage } from './booking-list.page';

describe('BookingListPage', () => {
  let component: BookingListPage;
  let fixture: ComponentFixture<BookingListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
