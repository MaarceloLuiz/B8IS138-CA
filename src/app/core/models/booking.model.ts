/**
 * Booking model representing a property viewing reservation
*/

export interface Booking {
  id: string;
  propertyId: string;
  userId: string; // ID of the user who made the booking
  
  // contact info
  name: string;
  email: string;
  phone: string;

  viewingDate: string; // ISO date string
  viewingTime: string; // e.g., "10:00 AM"
  notes?: string; // optional additional notes
  status: 'pending' | 'confirmed' | 'cancelled';

  createdAt: string;
  updatedAt?: string;
}