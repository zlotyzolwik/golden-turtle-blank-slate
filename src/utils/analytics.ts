// Google Analytics tracking utilities
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// Facebook Pixel tracking
export const trackFBEvent = (eventName: string, parameters?: object) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

// Specific tracking functions
export const trackReservation = (tripId: string, tripTitle: string, value: number) => {
  trackEvent('reservation_started', 'engagement', `${tripTitle} (${tripId})`, value);
  trackFBEvent('InitiateCheckout', {
    content_name: tripTitle,
    content_ids: [tripId],
    value: value,
    currency: 'PLN'
  });
};

export const trackPayment = (tripId: string, tripTitle: string, value: number, success: boolean) => {
  if (success) {
    trackEvent('payment_completed', 'ecommerce', `${tripTitle} (${tripId})`, value);
    trackFBEvent('Purchase', {
      content_name: tripTitle,
      content_ids: [tripId],
      value: value,
      currency: 'PLN'
    });
  } else {
    trackEvent('payment_failed', 'ecommerce', `${tripTitle} (${tripId})`, value);
  }
};

export const trackTripView = (tripId: string, tripTitle: string) => {
  trackEvent('trip_viewed', 'engagement', `${tripTitle} (${tripId})`);
  trackFBEvent('ViewContent', {
    content_name: tripTitle,
    content_ids: [tripId],
    content_type: 'trip'
  });
};

export const trackNavigation = (page: string) => {
  trackEvent('page_navigation', 'navigation', page);
};