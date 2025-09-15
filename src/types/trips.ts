export interface Trip {
  id: string;
  title: string;
  description: string;
  detailed_description: string;
  destination: string;
  price: number;
  currency: string;
  departure_date: string;
  return_date: string;
  available_spots: number;
  total_spots: number;
  featured_image: string;
  gallery_images: string[];
  itinerary: any;
  location_lat: number;
  location_lng: number;
  pickup_locations?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  trip_id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  number_of_people: number;
  total_price: number;
  status: string;
  payment_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  replied_at?: string;
  created_at: string;
}

export interface Voucher {
  id: string;
  code: string;
  amount: number;
  currency: string;
  recipient_email?: string;
  recipient_name?: string;
  sender_name?: string;
  message?: string;
  status: string;
  used_at?: string;
  expires_at?: string;
  created_at: string;
}