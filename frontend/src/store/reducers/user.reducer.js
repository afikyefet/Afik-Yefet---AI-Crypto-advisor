import { userService } from "../../service/user.service"

export const SET_USER ="SET_USER"
export const TOGGLE_ISSIGNUP ="TOGGLE_ISSIGNUP"

const initialState = {
    user: userService.getLoggedinUser(),
    isSignup: false
}

export function userReducer(state = initialState, cmd = {}){
    switch (cmd.type){
        case SET_USER:
            return {
                ...state,
                user: cmd.user
            }
        case TOGGLE_ISSIGNUP:
            return {
                ...state,
                isSignup: !state.isSignup
            }
        default:
            return state
    }
}
