import { toysService } from "../../service/toys.service";
import { ADD_TOY, IS_LOADING, REMOVE_TOY, SELECT_TOY, SET_FILTER_BY, SET_TOYS, UPDATE_TOY } from "../reducers/toy.reducer";
import { store } from "../store";

export function loadToys(filterBy = {}){    
    return toysService.query(filterBy)
    .then(toys => {
        store.dispatch({type: SET_TOYS, toys})
    })
    .catch(err => {
        console.error('toys action -> could not load toys', err);
        throw err
    })
}

export function setIsLoading(isLoading){
    return store.dispatch({type: IS_LOADING, isLoading})
}

export function setSelectedToy(toyId){
    return store.dispatch({type: SELECT_TOY, toyId})
}

export function saveToy(toy){
    const type = toy._id ? UPDATE_TOY : ADD_TOY
    return toysService.save(toy)
    .then((savedToy)=>{
        store.dispatch({type, toy})
        setSelectedToy(savedToy._id)
        return savedToy
    })
    .catch(err => {
        console.error('toy action -> could not save toy', err);
        throw err
    })
}

export function removeToy(toyId){
    return toysService.remove(toyId)
    .then(()=>{
        store.dispatch({type: REMOVE_TOY, toyId})
    }).catch(err =>{
        console.error('toy action -> could not delete toy ', err);
        throw err
    }
    )
}


export function removeReview(toy, reviewId){
    const newReviews = toy.msgs.filter((review) => review.id !== reviewId)
    const toyToSave = {...toy, msgs: newReviews}
    return saveToy(toyToSave)
    .catch((err)=>{
        console.log('toy action -> could not remove review');
        throw err
    })
}


export function setFilterBy(filterBy) {
    store.dispatch({ type: SET_FILTER_BY, filterBy })
}