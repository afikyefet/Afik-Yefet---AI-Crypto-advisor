import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    coinGeckoReducer,
    SET_CG_PRICES,
    SET_CG_COINS_MARKET_DATA,
    SET_CG_COINS,
    SET_CG_CURRENCIES,
    SET_CG_LOADING,
    SET_CG_ERROR
} from './coinGecko.reducer'

describe('CoinGecko Reducer', () => {
    const initialState = {
        prices: null,
        coinsMarketData: null,
        coinsList: null,
        currencies: null,
        isLoading: false,
        error: null,
        lastUpdated: null
    }

    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
    })

    describe('SET_CG_PRICES', () => {
        it('should set prices and update lastUpdated', () => {
            const prices = { bitcoin: { usd: 50000 }, ethereum: { usd: 3000 } }
            const action = { type: SET_CG_PRICES, prices }

            const result = coinGeckoReducer(initialState, action)

            expect(result.prices).toEqual(prices)
            expect(result.lastUpdated).toBe(Date.now())
        })

        it('should preserve other state properties', () => {
            const existingState = {
                ...initialState,
                coinsList: [{ id: 'bitcoin' }],
                isLoading: true
            }
            const action = { type: SET_CG_PRICES, prices: {} }

            const result = coinGeckoReducer(existingState, action)

            expect(result.coinsList).toEqual([{ id: 'bitcoin' }])
        })
    })

    describe('SET_CG_COINS_MARKET_DATA', () => {
        it('should set market data and update lastUpdated', () => {
            const marketData = [
                { id: 'bitcoin', current_price: 50000 },
                { id: 'ethereum', current_price: 3000 }
            ]
            const action = { type: SET_CG_COINS_MARKET_DATA, coinsMarketData: marketData }

            const result = coinGeckoReducer(initialState, action)

            expect(result.coinsMarketData).toEqual(marketData)
            expect(result.lastUpdated).toBe(Date.now())
        })
    })

    describe('SET_CG_COINS', () => {
        it('should set coins list', () => {
            const coinsList = [
                { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
                { id: 'ethereum', symbol: 'eth', name: 'Ethereum' }
            ]
            const action = { type: SET_CG_COINS, coinsList }

            const result = coinGeckoReducer(initialState, action)

            expect(result.coinsList).toEqual(coinsList)
        })

        it('should not update lastUpdated', () => {
            const action = { type: SET_CG_COINS, coinsList: [] }

            const result = coinGeckoReducer(initialState, action)

            expect(result.lastUpdated).toBeNull()
        })
    })

    describe('SET_CG_CURRENCIES', () => {
        it('should set supported currencies', () => {
            const currencies = ['usd', 'eur', 'gbp', 'jpy']
            const action = { type: SET_CG_CURRENCIES, currencies }

            const result = coinGeckoReducer(initialState, action)

            expect(result.currencies).toEqual(currencies)
        })

        it('should not update lastUpdated', () => {
            const action = { type: SET_CG_CURRENCIES, currencies: [] }

            const result = coinGeckoReducer(initialState, action)

            expect(result.lastUpdated).toBeNull()
        })
    })

    describe('SET_CG_LOADING', () => {
        it('should set loading to true', () => {
            const action = { type: SET_CG_LOADING, isLoading: true }

            const result = coinGeckoReducer(initialState, action)

            expect(result.isLoading).toBe(true)
        })

        it('should set loading to false', () => {
            const loadingState = { ...initialState, isLoading: true }
            const action = { type: SET_CG_LOADING, isLoading: false }

            const result = coinGeckoReducer(loadingState, action)

            expect(result.isLoading).toBe(false)
        })
    })

    describe('SET_CG_ERROR', () => {
        it('should set error message', () => {
            const error = 'Failed to fetch data'
            const action = { type: SET_CG_ERROR, error }

            const result = coinGeckoReducer(initialState, action)

            expect(result.error).toBe(error)
        })

        it('should clear error when set to null', () => {
            const errorState = { ...initialState, error: 'Some error' }
            const action = { type: SET_CG_ERROR, error: null }

            const result = coinGeckoReducer(errorState, action)

            expect(result.error).toBeNull()
        })
    })

    describe('default case', () => {
        it('should return current state for unknown action', () => {
            const action = { type: 'UNKNOWN_ACTION' }

            const result = coinGeckoReducer(initialState, action)

            expect(result).toEqual(initialState)
        })

        it('should return initial state when state is undefined', () => {
            const result = coinGeckoReducer(undefined, {})

            expect(result).toEqual(initialState)
        })
    })

    describe('immutability', () => {
        it('should not mutate original state', () => {
            const action = { type: SET_CG_PRICES, prices: { bitcoin: { usd: 50000 } } }

            const result = coinGeckoReducer(initialState, action)

            expect(result).not.toBe(initialState)
            expect(initialState.prices).toBeNull()
        })
    })
})
