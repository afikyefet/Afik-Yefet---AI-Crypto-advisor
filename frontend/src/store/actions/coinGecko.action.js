import { coinGeckoService } from '../../service/coinGecko.service'
import {
    SET_CG_COINS_MARKET_DATA,
    SET_CG_ERROR,
    SET_CG_LOADING
} from '../reducers/coinGecko.reducer'
import { store } from '../store'

export function loadCoinsMarketData(options = {}) {
    store.dispatch({ type: SET_CG_LOADING, isLoading: true })
    store.dispatch({ type: SET_CG_ERROR, error: null })
    const { ids, vs_currencies = 'usd', sparkline = true } = options
    return coinGeckoService.getCoinsMarketData({ ids, vs_currencies, sparkline })
        .then((coinsMarketData) => {
            store.dispatch({ type: SET_CG_COINS_MARKET_DATA, coinsMarketData })
            return coinsMarketData
        })
        .catch((err) => {
            const errorMsg = err?.message || err?.response?.data?.err || 'Failed to load coins market data'
            store.dispatch({ type: SET_CG_ERROR, error: errorMsg })
            throw err
        })
        .finally(() => {
            store.dispatch({ type: SET_CG_LOADING, isLoading: false })
        })
}
