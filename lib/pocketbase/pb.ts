import Pocketbase, { AsyncAuthStore } from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

import EventSource from 'react-native-sse';
(global as any).EventSource = EventSource;

const store = new AsyncAuthStore({
  save: async (serialized: string) => {
    await AsyncStorage.setItem('pb_auth', serialized);
  },
  clear: async () => {
    await AsyncStorage.removeItem('pb_auth');
  },
  initial: AsyncStorage.getItem('pb_auth'),
})

const pb = new Pocketbase("https://api.linkmylogistics.com", store);

if (pb.authStore.isValid) {
  pb.collection('users')
    .authRefresh()
    .catch(() => {
      pb.authStore.clear();
    });
}

export default pb;
