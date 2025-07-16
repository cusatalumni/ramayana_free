
import React from 'react';

const PayPalButton: React.FC = () => {
    // IMPORTANT: Replace the placeholder values below with your actual PayPal information.
    // 1. In the `value` for the hidden input named "hosted_button_id", 
    //    replace YOUR_PAYPAL_HOSTED_BUTTON_ID with the ID from your PayPal account.
    // 2. In the `value` for the hidden input named "return",
    //    replace YOUR_APP_RETURN_URL with the full URL of your deployed application.
    //    Example: "https://ramayana-daily-post.vercel.app/?subscription=success"
    const returnUrl = "YOUR_APP_RETURN_URL/?subscription=success";
    const buttonId = "YOUR_PAYPAL_HOSTED_BUTTON_ID";

    return (
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input type="hidden" name="hosted_button_id" value={buttonId} />
            <input type="hidden" name="return" value={returnUrl} />
            <input type="hidden" name="cancel_return" value="YOUR_APP_RETURN_URL" />
            <button
                type="submit"
                className="w-full font-cinzel text-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
            >
                Subscribe with PayPal
            </button>
            <img alt="" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
        </form>
    );
};

export default PayPalButton;

