/**
 * CoinGecko API Service
 * Simple service to fetch cryptocurrency prices and market data from CoinGecko API
 * Documentation: https://docs.coingecko.com/v3.0.1/reference/endpoint-overview
 */

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

export async function getCoinPrices(options = {}) {
    const {
        api_key,
        ids,
        vs_currencies = 'usd',
        include_market_cap = false,
        include_24hr_vol = false,
        include_24hr_change = false,
        include_last_updated_at = false,
        precision
    } = options;

    if (!ids) {
        throw new Error('Coin IDs are required');
    }

    // Build query parameters
    const params = new URLSearchParams();

    // Convert arrays to comma-separated strings
    const idsParam = Array.isArray(ids) ? ids.join(',') : ids;
    const vsCurrenciesParam = Array.isArray(vs_currencies) ? vs_currencies.join(',') : vs_currencies;

    params.append('ids', idsParam);
    params.append('vs_currencies', vsCurrenciesParam);

    if (include_market_cap) {
        params.append('include_market_cap', 'true');
    }

    if (include_24hr_vol) {
        params.append('include_24hr_vol', 'true');
    }

    if (include_24hr_change) {
        params.append('include_24hr_change', 'true');
    }

    if (include_last_updated_at) {
        params.append('include_last_updated_at', 'true');
    }

    if (precision) {
        params.append('precision', precision);
    }

    try {
        const url = `${COINGECKO_API_BASE_URL}/simple/price?${params.toString()}`;
        const headers = {};

        // Add API key header if provided (for free tier: x-cg-demo-api-key)
        if (api_key) {
            headers['x-cg-demo-api-key'] = api_key;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch CoinGecko prices: ${error.message}`);
    }
}

/**
 * Get coin prices by symbols (e.g., 'btc', 'eth')
 * @param {string} api_key - API key (optional)
 * @param {string|string[]} symbols - Coin symbols
 * @param {string|string[]} vs_currencies - Target currencies, default: 'usd'
 * @param {Object} options - Additional options (include_market_cap, include_24hr_vol, etc.)
 * @returns {Promise<Object>} API response with coin prices
 */
export async function getCoinPricesBySymbols(api_key, symbols, vs_currencies = 'usd', options = {}) {
    const symbolsParam = Array.isArray(symbols) ? symbols.join(',') : symbols;

    return getCoinPrices({
        api_key,
        ids: symbolsParam,
        vs_currencies,
        ...options
    });
}

/**
 * Get coin prices with full market data (market cap, volume, 24hr change)
 * @param {string} api_key - API key (optional)
 * @param {string|string[]} ids - Coin IDs
 * @param {string|string[]} vs_currencies - Target currencies, default: 'usd'
 * @returns {Promise<Object>} API response with full market data
 */
export async function getCoinPricesWithMarketData(api_key, ids, vs_currencies = 'usd') {
    return getCoinPrices({
        api_key,
        ids,
        vs_currencies,
        include_market_cap: true,
        include_24hr_vol: true,
        include_24hr_change: true,
        include_last_updated_at: true
    });
}

/**
 * Get market data for coins (prices, market cap, etc.)
 * @param {Object} options - Query options
 * @param {string} options.api_key - API key (optional)
 * @param {string} options.vs_currency - Target currency, default: 'usd'
 * @param {string|string[]} options.ids - Optional coin IDs
 * @param {string} options.order - Order of results (e.g., 'market_cap_desc')
 * @param {number} options.per_page - Results per page
 * @param {number} options.page - Page number
 * @param {boolean} options.sparkline - Include sparkline data
 * @returns {Promise<Array>} Array of coin market data
 */
export async function getCoinsMarketData(options = {}) {
    const {
        api_key,
        vs_currency = 'usd',
        ids,
        order,
        per_page,
        page,
        sparkline
    } = options;

    const params = new URLSearchParams();
    params.append('vs_currency', vs_currency);

    if (ids) {
        const idsParam = Array.isArray(ids) ? ids.join(',') : ids;
        params.append('ids', idsParam);
    }
    if (order) params.append('order', order);
    if (per_page) params.append('per_page', String(per_page));
    if (page) params.append('page', String(page));
    if (sparkline !== undefined) params.append('sparkline', String(sparkline));

    try {
        const url = `${COINGECKO_API_BASE_URL}/coins/markets?${params.toString()}`;
        const headers = {};

        if (api_key) {
            headers['x-cg-demo-api-key'] = api_key;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch CoinGecko market data: ${error.message}`);
    }
}

/**
 * Get list of all supported coins
 * @param {string} api_key - API key (optional)
 * @returns {Promise<Array>} Array of coins with id, name, and symbol
 */
export async function getCoinsList(api_key = null) {
    try {
        const url = `${COINGECKO_API_BASE_URL}/coins/list`;
        const headers = {};

        if (api_key) {
            headers['x-cg-demo-api-key'] = api_key;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch CoinGecko coins list: ${error.message}`);
    }
}

/**
 * Get supported vs currencies
 * @param {string} api_key - API key (optional)
 * @returns {Promise<Array>} Array of supported currency codes
 */
export async function getSupportedCurrencies(api_key = null) {
    try {
        const url = `${COINGECKO_API_BASE_URL}/simple/supported_vs_currencies`;
        const headers = {};

        if (api_key) {
            headers['x-cg-demo-api-key'] = api_key;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch CoinGecko supported currencies: ${error.message}`);
    }
}

/**
 * Ping API server to check status
 * @param {string} api_key - API key (optional)
 * @returns {Promise<Object>} API status response
 */
export async function ping(api_key = null) {
    try {
        const url = `${COINGECKO_API_BASE_URL}/ping`;
        const headers = {};

        if (api_key) {
            headers['x-cg-demo-api-key'] = api_key;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Failed to ping CoinGecko API: ${error.message}`);
    }
}

export const coinGeckoService = {
    getCoinPrices,
    getCoinPricesBySymbols,
    getCoinPricesWithMarketData,
    getCoinsMarketData,
    getCoinsList,
    getSupportedCurrencies,
    ping
};
