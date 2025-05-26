/**
 * Analytics utility for tracking user interactions and conversions
 * Compatible with Google Analytics 4 (gtag) and other analytics platforms
 */

interface AnalyticsEvent {
  event_name: string;
  event_category?: string;
  event_label?: string;
  event_value?: number;
  custom_parameters?: Record<string, any>;
}

interface ConversionEvent {
  conversion_id: string;
  value?: number;
  currency?: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

class Analytics {
  private isEnabled: boolean = false;
  private debugMode: boolean = false;

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && !!window.gtag;
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  /**
   * Initialize analytics tracking
   */
  init(measurementId?: string) {
    if (typeof window === 'undefined') return;

    // Initialize Google Analytics if measurement ID is provided
    if (measurementId && !window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer?.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href
      });

      this.isEnabled = true;
    }

    if (this.debugMode) {
      console.log('Analytics initialized:', { isEnabled: this.isEnabled, measurementId });
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(eventName: string, parameters: Omit<AnalyticsEvent, 'event_name'> = {}) {
    if (!this.isEnabled) {
      if (this.debugMode) {
        console.log('Analytics Event (Debug):', { eventName, parameters });
      }
      return;
    }

    const eventData: any = {
      event_category: parameters.event_category || 'general',
      event_label: parameters.event_label || '',
      ...parameters.custom_parameters
    };

    if (parameters.event_value !== undefined) {
      eventData.value = parameters.event_value;
    }

    window.gtag?.('event', eventName, eventData);

    if (this.debugMode) {
      console.log('Analytics Event Sent:', { eventName, eventData });
    }
  }

  /**
   * Track page views
   */
  trackPageView(pagePath?: string, pageTitle?: string) {
    if (!this.isEnabled) {
      if (this.debugMode) {
        console.log('Analytics Page View (Debug):', { pagePath, pageTitle });
      }
      return;
    }

    const eventData: any = {};

    if (pagePath) {
      eventData.page_path = pagePath;
    }

    if (pageTitle) {
      eventData.page_title = pageTitle;
    }

    window.gtag?.('config', 'GA_MEASUREMENT_ID', eventData);

    if (this.debugMode) {
      console.log('Analytics Page View Sent:', eventData);
    }
  }

  /**
   * Track conversion events
   */
  trackConversion(conversionData: ConversionEvent) {
    if (!this.isEnabled) {
      if (this.debugMode) {
        console.log('Analytics Conversion (Debug):', conversionData);
      }
      return;
    }

    const eventData: any = {
      send_to: conversionData.conversion_id
    };

    if (conversionData.value !== undefined) {
      eventData.value = conversionData.value;
    }

    if (conversionData.currency) {
      eventData.currency = conversionData.currency;
    }

    window.gtag?.('event', 'conversion', eventData);

    if (this.debugMode) {
      console.log('Analytics Conversion Sent:', eventData);
    }
  }

  /**
   * Track user authentication events
   */
  trackAuth(action: 'login' | 'signup' | 'logout', method?: string) {
    this.trackEvent(action, {
      event_category: 'authentication',
      event_label: method || 'email',
      custom_parameters: {
        method: method || 'email'
      }
    });
  }

  /**
   * Track CTA button clicks
   */
  trackCTA(buttonName: string, location: string) {
    this.trackEvent('cta_click', {
      event_category: 'conversion',
      event_label: buttonName,
      custom_parameters: {
        button_name: buttonName,
        button_location: location
      }
    });
  }

  /**
   * Track form interactions
   */
  trackForm(action: 'start' | 'complete' | 'abandon', formName: string) {
    this.trackEvent(`form_${action}`, {
      event_category: 'form_interaction',
      event_label: formName,
      custom_parameters: {
        form_name: formName
      }
    });
  }

  /**
   * Track navigation events
   */
  trackNavigation(linkName: string, destination: string) {
    this.trackEvent('navigation_click', {
      event_category: 'navigation',
      event_label: linkName,
      custom_parameters: {
        link_name: linkName,
        destination: destination
      }
    });
  }

  /**
   * Track errors
   */
  trackError(errorType: string, errorMessage: string, location?: string) {
    this.trackEvent('error', {
      event_category: 'error',
      event_label: errorType,
      custom_parameters: {
        error_type: errorType,
        error_message: errorMessage,
        error_location: location || window.location.pathname
      }
    });
  }

  /**
   * Set user properties
   */
  setUserProperty(propertyName: string, value: string) {
    if (!this.isEnabled) {
      if (this.debugMode) {
        console.log('Analytics User Property (Debug):', { propertyName, value });
      }
      return;
    }

    window.gtag?.('config', 'GA_MEASUREMENT_ID', {
      custom_map: { [propertyName]: value }
    });

    if (this.debugMode) {
      console.log('Analytics User Property Set:', { propertyName, value });
    }
  }

  /**
   * Enable or disable analytics tracking
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;

    if (this.debugMode) {
      console.log('Analytics tracking:', enabled ? 'enabled' : 'disabled');
    }
  }
}

// Create and export a singleton instance
export const analytics = new Analytics();

// Export the class for testing or custom instances
export { Analytics };

// Export common tracking functions for convenience
export const trackEvent = (eventName: string, parameters?: Omit<AnalyticsEvent, 'event_name'>) =>
  analytics.trackEvent(eventName, parameters);

export const trackPageView = (pagePath?: string, pageTitle?: string) =>
  analytics.trackPageView(pagePath, pageTitle);

export const trackCTA = (buttonName: string, location: string) =>
  analytics.trackCTA(buttonName, location);

export const trackAuth = (action: 'login' | 'signup' | 'logout', method?: string) =>
  analytics.trackAuth(action, method);

export const trackForm = (action: 'start' | 'complete' | 'abandon', formName: string) =>
  analytics.trackForm(action, formName);

export const trackNavigation = (linkName: string, destination: string) =>
  analytics.trackNavigation(linkName, destination);

export const trackError = (errorType: string, errorMessage: string, location?: string) =>
  analytics.trackError(errorType, errorMessage, location);
