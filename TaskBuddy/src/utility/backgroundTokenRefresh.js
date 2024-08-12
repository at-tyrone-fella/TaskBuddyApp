import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { auth } from '../../firebaseConfig';
import * as SecureStore from 'expo-secure-store';

const BACKGROUND_FETCH_TASK = 'Background-Refresh-Token';
const timeToRefreshToken = 48;

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {

  try{

    const refreshToken = await SecureStore.getItemAsync('refreshToken');

    if(refreshToken)
    {
      const userCredential = await auth.signInWithCustomToken(refreshToken);
      const newIdToken = await userCredential.user.getIdToken(true);

      await SecureStore.setItemAsync('userToken', newIdToken);
      await SecureStore.setItemAsync('refreshToken', userCredential.user.refreshToken);

      return BackgroundFetch.Result.NewData;
    }
  } catch (error) {
    console.error('Background refreshing token error:', error);
    return BackgroundFetch.Result.Failed;
    }
  });  
   
  export const  registerBackgroundFetchTask = async () => {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: timeToRefreshToken * 60, 
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  export const unregisterBackgroundFetchTask = async () => {
    return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
  };

export { BACKGROUND_FETCH_TASK };


