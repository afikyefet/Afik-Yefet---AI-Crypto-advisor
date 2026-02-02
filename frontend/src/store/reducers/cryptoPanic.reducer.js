export const SET_CP_RELEVANT_NEWS = 'SET_CP_RELEVANT_NEWS'
export const SET_CP_LOADING = 'SET_CP_LOADING'
export const SET_CP_ERROR = 'SET_CP_ERROR'

const initialState = {
    relevantNews: null,
    isLoading: false,
    error: null
}

export function cryptoPanicReducer(state = initialState, cmd = {}) {
    switch (cmd.type) {
        case SET_CP_RELEVANT_NEWS:
            return {
                ...state,
                relevantNews: cmd.relevantNews
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
