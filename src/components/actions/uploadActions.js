import axios from 'axios';
import {AsyncStorage} from 'react-native';
import {SET_SELF, SERVER, UPLOAD_POST, GET_TAGS} from '../../helper/constants'
import {store} from '../../store'
import * as indicatorActions from './indicatorActions';
import * as newsfeedActions from './newsfeedActions';
import * as profileActions from './profileActions';
import { Actions } from 'react-native-router-flux'
import { RNS3 } from 'react-native-aws3';

function errorHandling(text) {
    store.dispatch(indicatorActions.showSpinner(false));
    store.dispatch(indicatorActions.showToast(text))
}

export const uploadPost = (uri, user_id, tags) => {
    store.dispatch(indicatorActions.showSpinner(true));

    const file = {        
        uri: uri,
        name: `${user_id}_${Date.now()}.png`,
        type: "image/png"
    }
    
    const options = {
        keyPrefix: "images/",
        bucket: "fash-object-storage",
        region: "us-east-1",
        accessKey: "AKIAJJ2S4KFVTSRYFSCA",
        secretKey: "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",
        successActionStatus: 201
    }
    
    const uploadError = 'Could not upload post'

    return dispatch => {                        
        RNS3.put(file, options).then(response => {
            if (response.status !== 201) {
                throw new Error("Failed to upload image to S3");
            }            
            data = {
                user_id: user_id,
                tags: tags,
                image_url: response.body.postResponse.location
            }                        
            axios.post(SERVER+'/post', data).then(res => {                
                if (res.data.success) {                                        
                    Actions.pop()                    
                    store.dispatch(newsfeedActions.getRecentPosts());
                    store.dispatch(newsfeedActions.getTrendingPosts());
                    store.dispatch(profileActions.getUserPosts());
                    store.dispatch(indicatorActions.showToast(true))                                
                    store.dispatch(indicatorActions.showSpinner(false));
                    dispatch(resolveUploadPost(true))                                
                } else {
                    errorHandling(uploadError)
                }       
            })                   
        }).catch(err => errorHandling(uploadError));
    }
}

export const resolveUploadPost = (success) => {
    return {
        type: UPLOAD_POST,
        success: success
    }
}