import { coinGeckoService } from '../../service/coinGecko.service'
import {
    SET_CG_COINS,
    SET_CG_COINS_MARKET_DATA,
    SET_CG_CURRENCIES,
    SET_CG_ERROR,
    SET_CG_LOADING,
    SET_CG_PRICES
} from '../reducers/coinGecko.reducer'
import { store } from '../store'

export function loadCoinsMarketData(options = {}) {
    store.dispatch({ type: SET_CG_LOADING, isLoading: true })
    store.dispatch({ type: SET_CG_ERROR, error: null })
    const { ids, vs_currencies = 'usd' } = options
    return coinGeckoService.getCoinsMarketData({ ids, vs_currencies })
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

export function loadPrices(options = {}) {
    store.dispatch({ type: SET_CG_LOADING, isLoading: true })
    store.dispatch({ type: SET_CG_ERROR, error: null })

    return coinGeckoService.getPrices(options)
        .then((prices) => {
            store.dispatch({ type: SET_CG_PRICES, prices })
            return prices
        })
        .catch((err) => {
            const errorMsg = err?.message || err?.response?.data?.err || 'Failed to load prices'
            store.dispatch({ type: SET_CG_ERROR, error: errorMsg })
            throw err
        })
        .finally(() => {
            store.dispatch({ type: SET_CG_LOADING, isLoading: false })
        })
}

export function loadCoinsList() {
    store.dispatch({ type: SET_CG_LOADING, isLoading: true })
    store.dispatch({ type: SET_CG_ERROR, error: null })

    return coinGeckoService.getCoinsList()
        .then((coinsList) => {
            store.dispatch({ type: SET_CG_COINS, coinsList })
            return coinsList
        })
        .catch((err) => {
            const errorMsg = err?.message || err?.response?.data?.err || 'Failed to load coins list'
            store.dispatch({ type: SET_CG_ERROR, error: errorMsg })
            throw err
        })
        .finally(() => {
            store.dispatch({ type: SET_CG_LOADING, isLoading: false })
        })
}

export function loadSupportedCurrencies() {
    store.dispatch({ type: SET_CG_LOADING, isLoading: true })
    store.dispatch({ type: SET_CG_ERROR, error: null })

    return coinGeckoService.getSupportedCurrencies()
        .then((currencies) => {
            store.dispatch({ type: SET_CG_CURRENCIES, currencies })
            return currencies
        })
        .catch((err) => {
            const errorMsg = err?.message || err?.response?.data?.err || 'Failed to load currencies'
            store.dispatch({ type: SET_CG_ERROR, error: errorMsg })
            throw err
        })
        .finally(() => {
            store.dispatch({ type: SET_CG_LOADING, isLoading: false })
        })
}
