import axios from 'axios';
import {AsyncStorage} from 'react-native';
import {RATE, SERVER, GET_RECENT_POSTS, GET_TRENDING_POSTS, GET_RECENT_RECENT_POSTS} from '../../helper/constants'
import {store} from '../../store'
import * as indicatorActions from './indicatorActions';
import { Actions } from 'react-native-router-flux'

function errorHandling(text) {
    store.dispatch(indicatorActions.showSpinner(false));
    store.dispatch(indicatorActions.showToast(text))
}
const defaultError = 'Something went wrong'

export const getRecentRecentPosts = (postDate) => {    
    return dispatch => {
        let user_id = store.getState().profile.self.user_id                
        let queryString = `${user_id}/${postDate}`                
        if (postDate) {
            axios.get(SERVER+'/post/time/'+queryString).then(res => {                
                if (res.data.success) {
                    dispatch(resolveGetRecentRecentPosts(res.data.data.posts, res.data.data.sliced))
                } else {
                    defaultError(defaultError)            
                }
            }).catch(err => defaultError(defaultError))
        }
    }
}

export const getRecentPosts = (skip, postDate) => {    
    return dispatch => {                                
        user_id = store.getState().profile.self.user_id        
        let queryString = user_id
        if (postDate) {
            queryString = `${user_id}/${postDate}`
        }           
        axios.get(SERVER+'/post/'+queryString).then(res => {                                   
            if (res.data.success) {
                dispatch(resolveGetRecentPosts(res.data.data, skip))                
            } else {
                defaultError(defaultError)            
            }
        }).catch(err => defaultError(defaultError))
    }
}

export const getTrendingPosts = () => {    
    return dispatch => {        
        user_id = store.getState().profile.self.user_id                
        axios.get(SERVER+'/post/trending/'+user_id).then(res => {                        
            if (res.data.success) {                
                dispatch(resolveGetTrendingPosts(res.data.data))                
            } else {
                defaultError(defaultError)            
            }       
        }).catch(err => defaultError(defaultError))
    }
}

export const ratePost = (post_id, value) => {    
    store.dispatch(indicatorActions.showSpinner(true));
    uploadError = 'Could not rate post'

    return dispatch => {
        axios.post(SERVER+'/post/rate/'+post_id, {
            rating: value,
            user_id: user_id = store.getState().profile.self.user_id
        }).then(res => {           
            console.log('rate why?', res) 
            if (res.data.success) {                
                store.dispatch(indicatorActions.showSpinner(false));
                store.dispatch(indicatorActions.showToast(true))                                
                dispatch(resolveRating(res.data.data))
            }  else {
                errorHandling(uploadError)
            }
        }).catch(err => errorHandling(uploadError))
    }
}

export const resolveGetRecentPosts = (posts, skip) => {
    return {
        type: GET_RECENT_POSTS,
        posts: posts,
        skip
    }
}

export const resolveGetRecentRecentPosts = (posts, sliced) => {
    console.log('rrposts', posts, sliced)
    return {
        type: GET_RECENT_RECENT_POSTS,
        posts,
        sliced
    }
}

export const resolveGetTrendingPosts = (posts) => {
    return {
        type: GET_TRENDING_POSTS,
        posts: posts        
    }
}

export const resolveRating = (newPost) => {
    return {
        type: RATE,
        newPost: newPost
    }
}