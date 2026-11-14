'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'LKR' | 'USD' | 'EUR' | 'GBP' | 'AUD';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (priceInLKR: number) => string;
  convertPrice: (priceInLKR: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// secure fallback rates in case the API fails or is unavailable
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  LKR: 1,
  USD: 0.0033, 
  EUR: 0.0030,
  GBP: 0.0026,
  AUD: 0.0050,
};

const SYMBOLS: Record<CurrencyCode, string> = {
  LKR: 'LKR ',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>('LKR');
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize App & Fetch Live Rates
  useEffect(() => {
    setIsMounted(true);
    
    // Load saved preference
    const saved = localStorage.getItem('kcc_currency') as CurrencyCode;
    if (saved && FALLBACK_RATES[saved]) {
      setCurrency(saved);
    }

    // Fetch Live Exchange Rates
    const fetchLiveRates = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY;
        if (!apiKey) {
          console.warn("No ExchangeRate API Key found in .env.local. Using fallback rates.");
          return;
        }

        // Fetch rates with LKR as the base currency
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/LKR`);
        const data = await response.json();

        if (data.result === 'success') {
          // Safely map the live data to our supported currencies
          setRates({
            LKR: 1,
            USD: data.conversion_rates.USD || FALLBACK_RATES.USD,
            EUR: data.conversion_rates.EUR || FALLBACK_RATES.EUR,
            GBP: data.conversion_rates.GBP || FALLBACK_RATES.GBP,
            AUD: data.conversion_rates.AUD || FALLBACK_RATES.AUD,
          });
        } else {
          throw new Error("API returned failure status");
        }
      } catch (error) {
        console.error("Failed to fetch live exchange rates, sticking to safe fallbacks:", error);
      }
    };

    fetchLiveRates();
  }, []);

  const handleSetCurrency = (c: CurrencyCode) => {
    setCurrency(c);
    localStorage.setItem('kcc_currency', c);
  };

  // dynamically convert price based on selected currency
  const convertPrice = (priceInLKR: number) => {
    return priceInLKR * rates[currency];
  };

  const formatPrice = (priceInLKR: number) => {
    
    if (!isMounted) return `LKR ${priceInLKR.toLocaleString()}`;

    const converted = convertPrice(priceInLKR);
    const decimals = currency === 'LKR' ? 0 : 2;
    
    return `${SYMBOLS[currency]}${converted.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
}