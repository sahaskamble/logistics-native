import { PasswordLogin, PbLogout, ResponseType } from "@/lib/actions/auth/login";
import { getCurrentUser } from "@/lib/actions/users";
import { router } from "expo-router";
import { AuthRecord } from "pocketbase";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

type AuthCtxType = {
  isValid: boolean;
  user: AuthRecord | null;
  Login: (UsernameOrEmail: string, password: string) => Promise<void>;
  Logout: () => void;
}

const AuthCtx = createContext<AuthCtxType | undefined>(undefined);

export function useRootAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error("useRootAuth must be used within an RootAuthProvider");
  }
  return ctx;
}

export function RootAuthProvider({ children }: PropsWithChildren) {
  // States
  const [isValid, setIsValid] = useState<boolean>(false);
  const [user, setUser] = useState<AuthRecord | null>(null)

  // Check Functions
  const checkAuth = async () => {
    const { isValid, user: authRecord } = getCurrentUser();
    setIsValid(isValid);
    setUser(authRecord);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const Login = async (UsernameOrEmail: string, password: string) => {
    const response: ResponseType = await PasswordLogin(UsernameOrEmail, password);
    if (response.success) {
      const { isValid: UpdatedisValid, user: authRecord } = getCurrentUser();
      setIsValid(UpdatedisValid);
      setUser(authRecord);
      Alert.alert(
        "Login Successfull",
        `User Logged In using ${UsernameOrEmail}`,
        [
          {
            text: "Ok",
            style: "default",
            onPress: () => router.push('/(protected)/home'),
          },
        ],
        {
          cancelable: true,
          onDismiss: () => console.log("Alert Dismissed So USer Logged IN"),
        }
      )
    } else {
      setIsValid(false);
      setUser(null);
      Alert.alert(
        "Login UnSuccessfull",
        `User Login UnSuccessfull using ${UsernameOrEmail}`,
        [
          {
            text: "Ok",
            style: "default",
            onPress: () => console.log("Login UnSuccessfull"),
          },
        ],
        {
          cancelable: true,
          onDismiss: () => console.log("Alert Dismissed But User Login UnSuccessfull")
        }
      )
    }
  };

  const Logout = () => {
    const response: ResponseType = PbLogout();
    if (response.success) {
      setIsValid(false);
      setUser(null);
      console.log("Router going to pushed");
      router.push('/(auth)/login');
      console.log("Router is pushed");
    } else {
      Alert.alert(
        "Logout UnSuccessfull",
        "Faile to Logout Please restart the app",
        [
          {
            text: "Ok",
            style: "default",
          },
        ],
        {
          cancelable: false,
        }
      );
    }
  }

  const values = {
    isValid,
    user,
    Login,
    Logout,
  };

  return (
    <AuthCtx.Provider value={values}>
      {children}
    </AuthCtx.Provider>
  )
}
