
import React, { useEffect, useRef } from 'react';

// This component integrates the PayPal Smart Subscription Button.
// It dynamically loads the PayPal SDK and renders the button.
const PayPalButton: React.FC = () => {
  // A ref to the container div allows PayPal's script to find where to render the button.
  const paypalButtonContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Prevent the script from re-injecting and the button from re-rendering if it already exists.
    if (paypalButtonContainerRef.current && paypalButtonContainerRef.current.childElementCount > 0) {
      return;
    }

    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AZs7t5CLK8rb_RKtj1X5w6ZQU9XYDT0fGQOvKTm5e2jIrHGI5j5V9QaSix7YPxF6Eg0qM89UIca95kQ0&vault=true&intent=subscription";
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.async = true;

    // This function runs only after the PayPal SDK script has fully loaded.
    script.onload = () => {
      // The `window.paypal` object is now available.
      if (window.paypal && paypalButtonContainerRef.current) {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              /* Creates the subscription */
              plan_id: 'P-6JF18348X6643263VNB3YRTY'
            });
          },
          onApprove: function(data: any, actions: any) {
            // Subscription approved. Redirect user to the app to confirm.
            // The App.tsx component will detect "?subscription=success" in the URL
            // and activate the managed mode.
            const returnUrl = `${window.location.origin}${window.location.pathname}?subscription=success`;
            window.location.href = returnUrl;
          },
          onError: function(err: any) {
            console.error("PayPal Button Error:", err);
            alert("An error occurred with your subscription. Please check the console and try again.");
          }
        }).render(paypalButtonContainerRef.current);
      }
    };

    document.body.appendChild(script);

  }, []); // The empty dependency array ensures this effect runs only once when the component mounts.

  // The div that the PayPal button will be rendered into.
  return <div ref={paypalButtonContainerRef} id="paypal-button-container-P-6JF18348X6643263VNB3YRTY"></div>;
};

// We need to declare the `paypal` object on the window type to satisfy TypeScript,
// as it is loaded from an external script.
declare global {
  interface Window {
    paypal?: any;
  }
}

export default PayPalButton;
