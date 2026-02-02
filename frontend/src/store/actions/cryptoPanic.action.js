import { cryptoPanicService } from '../../service/cryptoPanic.service'
import {
    SET_CP_ERROR,
    SET_CP_LOADING,
    SET_CP_NEWS,
    SET_CP_RELEVANT_NEWS
} from '../reducers/cryptoPanic.reducer'
import { store } from '../store'

export function loadNews(options = {}) {
    store.dispatch({ type: SET_CP_LOADING, isLoading: true })
    store.dispatch({ type: SET_CP_ERROR, error: null })

    return cryptoPanicService.getNews(options)
        .then((news) => {
            store.dispatch({ type: SET_CP_NEWS, news })
            return news
        })
        .catch((err) => {
            const errorMsg = err?.message || err?.response?.data?.err || 'Failed to load news'
            store.dispatch({ type: SET_CP_ERROR, error: errorMsg })
            throw err
        })
        .finally(() => {
            store.dispatch({ type: SET_CP_LOADING, isLoading: false })
        })
}

export function loadRelevantNews(options = {}) {
    store.dispatch({ type: SET_CP_LOADING, isLoading: true })
    store.dispatch({ type: SET_CP_ERROR, error: null })

    return cryptoPanicService.getRelevantNews(options)
        .then((relevantNews) => {
            store.dispatch({ type: SET_CP_RELEVANT_NEWS, relevantNews })
            return relevantNews
        })
        .catch((err) => {
            const errorMsg = err?.message || err?.response?.data?.err || 'Failed to load relevant news'
            store.dispatch({ type: SET_CP_ERROR, error: errorMsg })
            throw err
        })
        .finally(() => {
            store.dispatch({ type: SET_CP_LOADING, isLoading: false })
        })
}

export function loadLocalNews() {
    store.dispatch({ type: SET_CP_LOADING, isLoading: true })
    store.dispatch({ type: SET_CP_ERROR, error: null })

    return cryptoPanicService.getNews({ auth_token: import.meta.env.VITE_CRYPTO_PANIC_AUTH_TOKEN })
        .then((localNews) => {
            store.dispatch({ type: SET_CP_NEWS, news: localNews })
            return localNews
        })
        .catch((err) => {
            const errorMsg = err?.message || err?.response?.data?.err || 'Failed to load news'
            store.dispatch({ type: SET_CP_ERROR, error: errorMsg })
            throw err
        })
        .finally(() => {
            store.dispatch({ type: SET_CP_LOADING, isLoading: false })
        })
}