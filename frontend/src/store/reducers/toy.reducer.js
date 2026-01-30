/* eslint-disable no-case-declarations */

import { toysService } from "../../service/toys.service"


//toys
export const SET_TOYS = "SET_TOYS"
export const REMOVE_TOY = "REMOVE_TOY"
export const ADD_TOY = "ADD_TOY"
export const UPDATE_TOY = "UPDATE_TOY"
export const UNDO_TOYS = "UNDO_TOYS"
export const REDO_TOYS = "REDO_TOYS"
export const SELECT_TOY = "SELECT_TOY"

export const SET_FILTER_BY ="SET_FILTER_BY"

export const IS_LOADING = "IS_LOADING"

// shopping caret


// filter

const initialState = {
    toys: [],
    selectedToy:{},
    isLoading: false,
    filterBy: toysService.getDefaultFilter(),
    lastToys: [],
}


export function toyReducer(state = initialState, cmd = {}){
    let lastToys = [...state.toys]    
    switch(cmd.type){
        //toys
        case SET_TOYS:
            return {
                ...state,
                toys: cmd.toys
            }
        case REMOVE_TOY:
            return {
                ...state,
                toys: state.toys.filter(toy => toy._id !== cmd.toyId),
                lastToys
            }
        case ADD_TOY:
            return {
                ...state,
                toys: [...state.toys, cmd.toy],
                lastToys
            }
        case UPDATE_TOY:
            return {
                ...state,
                toys: state.toys.map(toy => toy._id === cmd.toy._id ? cmd.toy : toy),
                lastToys
            }
        case UNDO_TOYS:
            const redoToys = [...state.toys]
            return {
                ...state,
                toys: [...state.lastToys],
                redoToys,
            }
        case REDO_TOYS:
            return{
                ...state,
                toys: [...redoToys]
            }
        case SELECT_TOY:
            return {
                ...state,
                selectedToy: state.toys.find(toy => toy._id === cmd.toyId)
            }
        case IS_LOADING:
            return {
                ...state,
                isLoading: cmd.isLoading
            }
        case SET_FILTER_BY:
            return {
                ...state,
                filterBy: {...state.filterBy, ...cmd.filterBy}
            }
        default:
            return state
    }
}