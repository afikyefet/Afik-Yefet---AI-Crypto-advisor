export const SET_CP_NEWS = 'SET_CP_NEWS'
export const SET_CP_RELEVANT_NEWS = 'SET_CP_RELEVANT_NEWS'
export const SET_CP_TRENDING = 'SET_CP_TRENDING'
export const SET_CP_HOT = 'SET_CP_HOT'
export const SET_CP_LOADING = 'SET_CP_LOADING'
export const SET_CP_ERROR = 'SET_CP_ERROR'

const initialState = {
    news: null,
    relevantNews: null,
    trending: null,
    hot: null,
    isLoading: false,
    error: null,
    lastUpdated: null
}

export function cryptoPanicReducer(state = initialState, cmd = {}) {
    switch (cmd.type) {
        case SET_CP_NEWS:
            return {
                ...state,
                news: cmd.news,
                lastUpdated: Date.now()
            }
        case SET_CP_RELEVANT_NEWS:
            return {
                ...state,
                relevantNews: cmd.relevantNews,
                lastUpdated: Date.now()
            }
        case SET_CP_TRENDING:
            return {
                ...state,
                trending: cmd.trending,
                lastUpdated: Date.now()
            }
        case SET_CP_HOT:
            return {
                ...state,
                hot: cmd.hot,
                lastUpdated: Date.now()
            }
        case SET_CP_LOADING:
            return {
                ...state,
                isLoading: cmd.isLoading
            }
        case SET_CP_ERROR:
            return {
                ...state,
                error: cmd.error
            }
        default:
            return state
    }
}
