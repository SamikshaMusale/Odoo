/**
 * Currency Conversion Service Placeholder
 *
 * Hook for future currency conversion (e.g., Open Exchange Rates, Fixer.io).
 * When implemented, this will convert expenses to the company's default currency.
 */

// In-memory fallback rates (for demo purposes only)
const FALLBACK_RATES = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
};

class CurrencyService {
  /**
   * Convert amount from one currency to another
   * @param {number} amount
   * @param {string} from - Source currency code (e.g., 'USD')
   * @param {string} to   - Target currency code (e.g., 'INR')
   * @returns {Promise<object>}
   */
  async convert(amount, from, to) {
    // TODO: Replace with real API integration
    // Example providers:
    //   - Open Exchange Rates (free tier available)
    //   - Fixer.io
    //   - exchangerate-api.com

    if (from === to) {
      return { amount, from, to, convertedAmount: amount, rate: 1 };
    }

    const fromRate = FALLBACK_RATES[from];
    const toRate = FALLBACK_RATES[to];

    if (!fromRate || !toRate) {
      return {
        amount,
        from,
        to,
        convertedAmount: null,
        rate: null,
        error: `Unsupported currency: ${!fromRate ? from : to}`,
      };
    }

    // Convert via USD as base
    const amountInUSD = amount / fromRate;
    const convertedAmount = Math.round(amountInUSD * toRate * 100) / 100;
    const rate = Math.round((toRate / fromRate) * 10000) / 10000;

    return { amount, from, to, convertedAmount, rate };
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies() {
    return Object.keys(FALLBACK_RATES);
  }
}

module.exports = new CurrencyService();
