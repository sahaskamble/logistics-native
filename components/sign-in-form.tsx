import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { useState } from 'react';
import { Pressable, type TextInput, View } from 'react-native';
import { Icon } from './ui/icon';
import { Eye, EyeOff } from 'lucide-react-native';
import { useRootAuth } from '@/context/RootAuthCtx';
import * as webBrowser from 'expo-web-browser';

export function SignInForm() {
  const passwordInputRef = React.useRef<TextInput>(null);
  const [UsernameOrEamil, setUsernameOrEamil] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { Login } = useRootAuth();

  function onEmailSubmit(e: any) {
    setUsernameOrEamil(e);
  }

  function onPasswordSubmit(e: any) {
    setPassword(e);
  }

  async function onSubmit() {
    await Login(UsernameOrEamil, password);
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Sign in to your Customer app</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                value={UsernameOrEamil}
                onChangeText={onEmailSubmit}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                  onPress={() => {
                    // TODO: Navigate to forgot password screen
                  }}>
                  <Text className="font-normal leading-4">Forgot your password?</Text>
                </Button>
              </View>
              <View className='relative'>
                <Input
                  ref={passwordInputRef}
                  placeholder="password"
                  id="password"
                  secureTextEntry={!showPassword}
                  returnKeyType="send"
                  value={password}
                  onChangeText={onPasswordSubmit}
                  className='pr-10'
                />
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  className='absolute right-0 top-1/2 -translate-y-1/2'
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon as={showPassword ? Eye : EyeOff} className='size-5' />
                </Button>
              </View>
            </View>
            <Button className="w-full" onPress={onSubmit}>
              <Text>Continue</Text>
            </Button>
          </View>
          <Text className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Pressable
              onPress={() => {
                webBrowser.openBrowserAsync('https://linkmylogistics.com/customer/register');
              }}>
              <Text className="text-sm underline mt-1">Sign up</Text>
            </Pressable>
          </Text>
          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="text-muted-foreground px-4 text-sm">or</Text>
            <Separator className="flex-1" />
          </View>
          <SocialConnections />
        </CardContent>
      </Card>
    </View>
  );
}
