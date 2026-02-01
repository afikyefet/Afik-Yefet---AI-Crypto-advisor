/**
 * CryptoPanic API Service
 * Simple service to fetch cryptocurrency news from CryptoPanic API
 * Documentation: https://cryptopanic.com/developers/api/
 */

const CRYPTOPANIC_API_BASE_URL = 'https://cryptopanic.com/api/developer/v2/posts/';


export async function getNews(options = {}) {
    const { auth_token, currencies, filter = 'rising', region, page, kind } = options;

    if (!auth_token) {
        throw new Error('CryptoPanic API auth_token is required');
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('auth_token', auth_token);
    params.append('public', 'true'); // Use public API

    if (currencies && currencies.length > 0) {
        params.append('currencies', currencies.join(','));
    }

    if (filter) {
        params.append('filter', filter);
    }

    if (region) {
        params.append('region', region);
    }

    if (page) {
        params.append('page', page.toString());
    }

    if (kind) {
        params.append('kind', kind);
    }

    try {
        const url = `${CRYPTOPANIC_API_BASE_URL}?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`CryptoPanic API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch CryptoPanic news: ${error.message}`);
    }
}


export async function getTrendingNews(auth_token, currencies = null) {
    return getNews({
        auth_token,
        currencies,
        filter: 'trending'
    });
}

export async function getHotNews(auth_token, currencies = null) {
    return getNews({
        auth_token,
        currencies,
        filter: 'hot'
    });
}

export const cryptoPanicService = {
    getNews,
    getTrendingNews,
    getHotNews
};
