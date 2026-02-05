import pb from "@/lib/pocketbase/pb";
import * as webBrowser from "expo-web-browser";
import { RecordAuthResponse } from "pocketbase";
import { Platform } from "react-native";
import EventSource from "react-native-sse";

// @ts-ignore
global.EventSource = EventSource;

webBrowser.maybeCompleteAuthSession();

export type ResponseType = {
  success: boolean;
  output: RecordAuthResponse | RecordAuthResponse[];
}

export async function PasswordLogin(UsernameOrEmail: string, password: string) {
  try {
    const identity = UsernameOrEmail;
    const response: RecordAuthResponse = await pb.collection('users').authWithPassword(identity, password);
    return {
      success: true,
      output: response,
    };
  } catch (err) {
    console.error("Erron Login UnSuccessfull", err);
    return {
      success: false,
      output: [],
    };
  }
}

export async function GoogleLogin() {
  try {
    const response: RecordAuthResponse = await pb.collection('users').authWithOAuth2({
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
      output: [],
    }
  }
}

export function PbLogout() {
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
      output: [],
    };
  }
}
