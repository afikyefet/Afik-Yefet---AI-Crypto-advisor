export const SET_CG_COINS_MARKET_DATA = 'SET_CG_COINS_MARKET_DATA'
export const SET_CG_LOADING = 'SET_CG_LOADING'
export const SET_CG_ERROR = 'SET_CG_ERROR'
export const SET_CG_RELEVANT_COINS = 'SET_CG_RELEVANT_COINS'

const initialState = {
    coinsMarketData: null,
    relevantCoins: null,
    isLoading: false,
    error: null
}

export function coinGeckoReducer(state = initialState, cmd = {}) {
    switch (cmd.type) {
        case SET_CG_COINS_MARKET_DATA:
            return {
                ...state,
                coinsMarketData: cmd.coinsMarketData
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
