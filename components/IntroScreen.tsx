
import React, { useState } from 'react';
import PayPalButton from './PayPalButton';

interface IntroScreenProps {
  onModeSelect: (mode: 'managed' | 'free', apiKey?: string) => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onModeSelect }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleFreeStart = () => {
    if (!apiKey.trim() || !apiKey.startsWith("AIza")) {
      setError('Please enter a valid Google AI API Key.');
      return;
    }
    setError('');
    onModeSelect('free', apiKey);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold text-amber-800 tracking-wider font-cinzel">
          Welcome!
        </h1>
        <p className="mt-4 text-lg text-stone-700">
          Choose how you'd like to generate your daily Ramayana post.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Managed Version */}
          <div className="border border-amber-200 rounded-lg p-6 flex flex-col bg-amber-50/50">
            <h2 className="text-2xl font-cinzel font-bold text-amber-700">Premium Version</h2>
            <p className="mt-2 text-stone-600 flex-grow">
              A seamless, ad-free experience. Subscribe via PayPal for unlimited access using our premium API key.
            </p>
            <div className="mt-6">
                <PayPalButton />
            </div>
          < Div> Subscription Details:
Free for 10 days
Then ‪1.00 USD‬ for one month
Then ‪5.00 USD‬ for each month
(Renews until you cancel)
          </div>
           </div>

          {/* Free Version */}
          <div className="border border-stone-300 rounded-lg p-6 flex flex-col">
            <h2 className="text-2xl font-cinzel font-bold text-stone-700">Free Version</h2>
            <p className="mt-2 text-stone-600 flex-grow">
              Use your own Google AI API Key. All API usage and costs will be on your personal account.
            </p>
            <div className="mt-6">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google AI API Key"
                className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <button
                onClick={handleFreeStart}
                className="mt-4 w-full font-cinzel text-lg bg-stone-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-stone-800 transition-colors"
              >
                Save & Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;