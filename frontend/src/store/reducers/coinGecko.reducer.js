export const SET_CG_PRICES = 'SET_CG_PRICES'
export const SET_CG_COINS_MARKET_DATA = 'SET_CG_COINS_MARKET_DATA'
export const SET_CG_COINS = 'SET_CG_COINS'
export const SET_CG_CURRENCIES = 'SET_CG_CURRENCIES'
export const SET_CG_LOADING = 'SET_CG_LOADING'
export const SET_CG_ERROR = 'SET_CG_ERROR'
export const SET_CG_RELEVANT_COINS = 'SET_CG_RELEVANT_COINS'

const initialState = {
    prices: null,
    coinsMarketData: null,
    coinsList: null,
    currencies: null,
    relevantCoins: null,
    isLoading: false,
    error: null,
    lastUpdated: null
}

export function coinGeckoReducer(state = initialState, cmd = {}) {
    switch (cmd.type) {
        case SET_CG_PRICES:
            return {
                ...state,
                prices: cmd.prices,
                lastUpdated: Date.now()
            }
        case SET_CG_COINS_MARKET_DATA:
            return {
                ...state,
                coinsMarketData: cmd.coinsMarketData,
                lastUpdated: Date.now()
            }
        case SET_CG_COINS:
            return {
                ...state,
                coinsList: cmd.coinsList
            }
        case SET_CG_CURRENCIES:
            return {
                ...state,
                currencies: cmd.currencies
            }
        case SET_CG_LOADING:
            return {
                ...state,
                isLoading: cmd.isLoading
            }
        case SET_CG_ERROR:
            return {
                ...state,
                error: cmd.error
            }
        case SET_CG_RELEVANT_COINS:
            return {
                ...state,
                relevantCoins: cmd.relevantCoins
            }
        default:
            return state
    }
}
