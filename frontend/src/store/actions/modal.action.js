import { SET_MODAL_DATA } from "../reducers/modal.reducer";
import { store } from "../store";

export function setModalData(modalData){
    store.dispatch({type: SET_MODAL_DATA, modalData})
}

export function onCloseModal(){
    store.dispatch({type: SET_MODAL_DATA, modalData: null})
}