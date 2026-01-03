import pb from "@/lib/pocketbase/pb";
import * as webBrowser from "expo-web-browser";
import { Platform } from "react-native";
import EventSource from "react-native-sse";

// @ts-ignore
global.EventSource = EventSource;

webBrowser.maybeCompleteAuthSession();

export async function Login(UsernameOrEmail: string, password: string) {
  try {
    const identity = UsernameOrEmail;
    const response = await pb.collection('users').authWithPassword(identity, password);
    return {
      success: true,
      output: response,
    };
  } catch (err) {
    console.error("Erron Login UnSuccessfull", err);
    return {
      success: false,
      output: err,
    };
  }
}

export async function GoogleLogin() {
  try {
    const response = await pb.collection('users').authWithOAuth2({
      provider: 'google',
      urlCallback: (url) => {
        webBrowser.openAuthSessionAsync(url, "linkmylogistics://", {
          preferEphemeralSession: true,
        }).catch(console.error);
      }
    });
    if (response.record.id) {
      Platform.OS === 'ios' && webBrowser.dismissAuthSession();
      const addUserDetails = await pb.collection('users').update(response.record.id, {
        firstname: response.meta?.rawUser?.given_name,
        lastname: response.meta?.rawUser?.family_name,
        emailVisibility: true,
        role: 'Customer',
        status: 'Pending',
      });
      return {
        success: true,
        output: addUserDetails,
      }
    }
    return {
      success: false,
      output: [],
    }
  } catch (err) {
    console.error("Error Google Login UnSuccessfull", err);
    return {
      success: false,
      output: err,
    }
  }
}

export function Logout() {
  try {
    pb.authStore.clear();
    return {
      success: true,
      output: [],
    };
  } catch (err) {
    console.error("Erron Login UnSuccessfull", err);
    return {
      success: false,
      output: err,
    };
  }
}
