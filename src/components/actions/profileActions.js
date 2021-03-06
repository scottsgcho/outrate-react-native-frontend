import axios from 'axios';
import {AsyncStorage} from 'react-native';
import {SERVER, SET_SELF,SET_MY_POSTS, UPDATE_SELF, UPDATE_MY_POSTS} from '../../helper/constants'
import {store} from '../../store'
import * as indicatorActions from './indicatorActions';
import { Actions } from 'react-native-router-flux'

function errorHandling(text) {
    store.dispatch(indicatorActions.showSpinner(false));
    store.dispatch(indicatorActions.showToast(text))
}

export const getUser = (user_id) => {     
    return dispatch => {      
        if (user_id == undefined) {
            user_id = store.getState().profile.self.user_id   
        }        
        console.log(user_id)
        axios.get(SERVER+'/user/'+user_id)
        .then((res) => {
            console.log('get user', res)
            if (res.data.success) {                           
                dispatch(resolveGetUser(res.data.data))
            }
        })
    }
}

export const getUserPosts = (skip, postDate) => {     
    return dispatch => {                
        let user_id = store.getState().profile.self.user_id
        let queryString = user_id
        if (postDate) {
            queryString = `${user_id}/${postDate}`
        } else {
            let t = new Date().toISOString();
            queryString = `${user_id}/${t}`
        }                        
        axios.get(SERVER+'/post/user/'+queryString)        
        .then((res) => { 
            console.log('POSTS QUERY ',queryString)
            if (res.data.success) {
                console.log('posts',res.data)
                console.log('skiip', skip)                                                
                console.log('resdata', res.data.data)                                         
                dispatch(resolveGetMyPosts(res.data.data, skip))                
            }
        })                  
    }
}

export const followUser = (to_follow) => {
    store.dispatch(indicatorActions.showSpinner(true));
    const followError = 'Could not follow user'

    return dispatch => {        
        let user_id = store.getState().profile.self.user_id
        axios.post(SERVER+'/user/follow/'+user_id, {to_follow})
        .then((res) => {
            if (res.data.success) {                
                store.dispatch(getUser())
                store.dispatch(indicatorActions.showSpinner(false));
                store.dispatch(indicatorActions.showToast(true))
            } else {
                errorHandling(followError)
            }
        }).catch(err => errorHandling(followError))
    }
}

export const unfollowUser = (to_unfollow) => {
    store.dispatch(indicatorActions.showSpinner(true));
    unfollowError = 'Could not unfollow user'

    return dispatch => {        
        let user_id = store.getState().profile.self.user_id
        axios.post(SERVER+'/user/unfollow/'+user_id, {to_unfollow})
        .then((res) => {
            if (res.data.success) {    
                store.dispatch(getUser())                            
                store.dispatch(indicatorActions.showSpinner(false));
                store.dispatch(indicatorActions.showToast(true))
            } else {
                errorHandling(unfollowError)
            }     
        }).catch(err => errorHandling(unfollowError))
    }
}

export const updateUser = (info) => {
    store.dispatch(indicatorActions.showSpinner(true));
    const userUpdateError = 'Could not update user'
    return dispatch => {                
        let user_id = store.getState().profile.self.user_id
        console.log('update user', user_id)
        axios.put(SERVER+'/user/update/'+user_id, info)
        .then((res) => {
            console.log('update user', res)
            if (res.data.success) {                   
                store.dispatch(indicatorActions.showSpinner(false)); 
                store.dispatch(indicatorActions.showToast(true))
                dispatch(resolveUpdateUser(res.data.data))
            } else {
                errorHandling(userUpdateError)
            }        
        }).catch(err => errorHandling(userUpdateError))
    }
}

export const updatePost = (post_id, user_id, tags) => {
    store.dispatch(indicatorActions.showSpinner(true));
    const postUpdateError = 'Could not update post'

    return dispatch => {                
        console.log('update data', post_id, user_id, tags)
        axios.put(SERVER+'/post/update/'+post_id, {user_id, tags})
        .then((res) => {
            console.log('update post', res)
            if (res.data.success) {                         
                store.dispatch(indicatorActions.showSpinner(false));
                store.dispatch(indicatorActions.showToast(true))
                store.dispatch(resolveUpdatePost(res.data.data))
            } else {
                errorHandling(postUpdateError)
            }   
        }).catch(err => errorHandling(postUpdateError))
    }
}

export const resolveGetMyPosts = (posts, skip) => {
    return {
        type: SET_MY_POSTS,
        posts,
        skip
    }
}

export const resolveGetUser = (user) => {
    return {
        type: SET_SELF,
        self: user
    }
}

export const resolveUpdateUser = (user) => {
    return {
        type: UPDATE_SELF,
        self: user
    }
}

export const resolveUpdatePost = (post) => {
    return {
        type: UPDATE_MY_POSTS,
        post
    }
}
