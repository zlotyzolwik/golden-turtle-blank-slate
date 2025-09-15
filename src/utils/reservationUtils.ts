import { supabase } from "@/integrations/supabase/client";

export interface ReservationData {
  tripId: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  customerPhone?: string;
  numberOfPeople?: number;
  notes?: string;
}

export interface ReservationResult {
  success: boolean;
  reservationId?: string;
  message: string;
}

/**
 * Securely create a reservation using the protected database function
 * Ensures proper user authentication and data validation
 */
export async function createReservationSecure(data: ReservationData): Promise<ReservationResult> {
  try {
    const { data: result, error } = await supabase.rpc('create_reservation_secure', {
      p_trip_id: data.tripId,
      p_customer_name: data.customerName,
      p_customer_email: data.customerEmail,
      p_total_price: data.totalPrice,
      p_customer_phone: data.customerPhone || null,
      p_number_of_people: data.numberOfPeople || 1,
      p_notes: data.notes || null
    });

    if (error) {
      console.error('Reservation creation error:', error);
      return {
        success: false,
        message: 'Wystąpił błąd podczas tworzenia rezerwacji'
      };
    }

    if (!result || result.length === 0) {
      return {
        success: false,
        message: 'Nie udało się utworzyć rezerwacji'
      };
    }

    const reservationResult = result[0];
    
    // If reservation was successfully created, send confirmation emails
    if (reservationResult.success) {
      try {
        // Get trip details for emails
        const { data: tripData } = await supabase
          .from('trips')
          .select('title, departure_date, return_date')
          .eq('id', data.tripId)
          .single();

        // Send confirmation email to customer
        const customerEmailPromise = supabase.functions.invoke('send-smtp-email', {
          body: {
            type: 'reservation',
            to: data.customerEmail,
            subject: 'Potwierdzenie rezerwacji - Złoty Żółwik',
            data: {
              customerName: data.customerName,
              customerEmail: data.customerEmail,
              tripTitle: tripData?.title || 'Wycieczka',
              tripDate: tripData?.departure_date 
                ? new Date(tripData.departure_date).toLocaleDateString('pl-PL')
                : '',
              totalPrice: data.totalPrice,
              numberOfPeople: data.numberOfPeople || 1,
              notes: data.notes,
              currency: 'PLN'
            }
          }
        });

        // Send notification to admin
        const adminEmailPromise = supabase.functions.invoke('send-smtp-email', {
          body: {
            type: 'admin_notification',
            to: 'kontakt@zloty-zolwik.pl',
            subject: 'Nowa rezerwacja wycieczki',
            data: {
              customerName: data.customerName,
              customerEmail: data.customerEmail,
              tripTitle: tripData?.title || 'Wycieczka',
              tripDate: tripData?.departure_date 
                ? new Date(tripData.departure_date).toLocaleDateString('pl-PL')
                : '',
              totalPrice: data.totalPrice,
              numberOfPeople: data.numberOfPeople || 1,
              notes: data.notes,
              currency: 'PLN'
            }
          }
        });

        // Wait for both emails (but don't let email failure break the reservation)
        const emailResults = await Promise.allSettled([customerEmailPromise, adminEmailPromise]);
        emailResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Email ${index === 0 ? 'customer' : 'admin'} failed:`, result.reason);
          }
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the reservation if emails fail
      }
    }
    
    return {
      success: reservationResult.success,
      reservationId: reservationResult.reservation_id,
      message: reservationResult.message
    };
  } catch (error) {
    console.error('Unexpected error during reservation creation:', error);
    return {
      success: false,
      message: 'Wystąpił nieoczekiwany błąd'
    };
  }
}

/**
 * Safely fetch user's own reservations
 * RLS policies ensure users can only see their own data
 */
export async function getUserReservations() {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, trips(title, destination, departure_date, return_date)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user reservations:', error);
      return { success: false, data: [], message: 'Nie udało się pobrać rezerwacji' };
    }

    return { success: true, data: data || [], message: 'Rezerwacje pobrane pomyślnie' };
  } catch (error) {
    console.error('Unexpected error fetching reservations:', error);
    return { success: false, data: [], message: 'Wystąpił nieoczekiwany błąd' };
  }
}

/**
 * Security note: This function validates that the reservation belongs to the current user
 * through RLS policies before allowing any operations
 */
export async function updateReservationStatus(
  reservationId: string, 
  status: 'pending' | 'confirmed' | 'cancelled'
) {
  try {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId);

    if (error) {
      console.error('Error updating reservation status:', error);
      return { success: false, message: 'Nie udało się zaktualizować statusu' };
    }

    return { success: true, message: 'Status został zaktualizowany' };
  } catch (error) {
    console.error('Unexpected error updating reservation:', error);
    return { success: false, message: 'Wystąpił nieoczekiwany błąd' };
  }
}