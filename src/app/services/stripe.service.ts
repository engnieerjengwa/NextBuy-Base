import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripePromise = loadStripe(environment.stripePublishableKey);
  private paymentElementsInitialized = new BehaviorSubject<boolean>(false);

  constructor() {}

  /**
   * Get the Stripe instance
   * @returns Promise that resolves with the Stripe instance
   */
  getStripeInstance() {
    return this.stripePromise;
  }

  /**
   * Initialize Stripe Elements with the provided client secret
   * @param clientSecret The client secret from the PaymentIntent
   * @param elementId The ID of the HTML element to mount the card element
   * @returns Promise that resolves with the Stripe Elements instance
   */
  async initializePaymentElement(clientSecret: string, elementId: string) {
    try {
      const stripe = await this.stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Create an elements instance
      const elements = stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#007bff',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
            spacingUnit: '4px',
            borderRadius: '4px',
          },
        },
      });

      // Create and mount the Payment Element
      const paymentElement = elements.create('payment');
      paymentElement.mount(`#${elementId}`);

      this.paymentElementsInitialized.next(true);

      return { stripe, elements, paymentElement };
    } catch (error) {
      console.error('Error initializing Stripe elements:', error);
      throw error;
    }
  }

  /**
   * Confirm the payment with Stripe
   * @param stripe The Stripe instance
   * @param elements The Stripe Elements instance
   * @param clientSecret The client secret from the PaymentIntent
   * @param billingDetails The billing details for the payment
   * @returns Promise that resolves with the payment result
   */
  async confirmPayment(
    stripe: any,
    elements: any,
    clientSecret: string,
    returnUrl: string,
  ) {
    try {
      if (!stripe || !elements) {
        throw new Error('Stripe or Elements not initialized');
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      });

      return result;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Check if payment elements are initialized
   * @returns BehaviorSubject that emits true when payment elements are initialized
   */
  isPaymentElementsInitialized() {
    return this.paymentElementsInitialized.asObservable();
  }
}
