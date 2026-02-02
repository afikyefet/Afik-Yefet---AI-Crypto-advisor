import { cryptoPanicService } from '../../service/cryptoPanic.service'
import {
    SET_CP_ERROR,
    SET_CP_LOADING,
    SET_CP_RELEVANT_NEWS
} from '../reducers/cryptoPanic.reducer'
import { store } from '../store'

export function loadStaticNews() {
    return cryptoPanicService.getStaticNews()
        .then((news) => {
            store.dispatch({ type: SET_CP_RELEVANT_NEWS, relevantNews: news })
            return news
        })
        .catch(() => { })
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
