import { cryptoPanicService } from '../../service/cryptoPanic.service'
import {
    SET_CP_ERROR,
    SET_CP_HOT,
    SET_CP_LOADING,
    SET_CP_NEWS,
    SET_CP_TRENDING,
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

export function loadTrendingNews(currencies = null) {
    store.dispatch({ type: SET_CP_LOADING, isLoading: true })
    store.dispatch({ type: SET_CP_ERROR, error: null })

    return cryptoPanicService.getTrendingNews(currencies)
        .then((trending) => {
            store.dispatch({ type: SET_CP_TRENDING, trending })
            return trending
        })
        .catch((err) => {
            const errorMsg = err?.message || err?.response?.data?.err || 'Failed to load trending news'
            store.dispatch({ type: SET_CP_ERROR, error: errorMsg })
            throw err
        })
        .finally(() => {
            store.dispatch({ type: SET_CP_LOADING, isLoading: false })
        })
}

export function loadHotNews(currencies = null) {
    store.dispatch({ type: SET_CP_LOADING, isLoading: true })
    store.dispatch({ type: SET_CP_ERROR, error: null })

    return cryptoPanicService.getHotNews(currencies)
        .then((hot) => {
            store.dispatch({ type: SET_CP_HOT, hot })
            return hot
        })
        .catch((err) => {
            const errorMsg = err?.message || err?.response?.data?.err || 'Failed to load hot news'
            store.dispatch({ type: SET_CP_ERROR, error: errorMsg })
            throw err
        })
        .finally(() => {
            store.dispatch({ type: SET_CP_LOADING, isLoading: false })
        })
}
