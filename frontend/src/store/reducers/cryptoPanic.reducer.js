export const SET_CP_NEWS = 'SET_CP_NEWS'
export const SET_CP_RELEVANT_NEWS = 'SET_CP_RELEVANT_NEWS'
export const SET_CP_LOADING = 'SET_CP_LOADING'
export const SET_CP_ERROR = 'SET_CP_ERROR'

const initialState = {
    news: null,
    relevantNews: null,
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
