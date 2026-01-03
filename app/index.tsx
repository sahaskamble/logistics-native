import { View, Text } from 'react-native'
import React from 'react'
import { getCurrentUser } from '@/lib/actions/users'
import { Redirect } from 'expo-router';

export default function IndexPage() {
  const { isValid} = getCurrentUser();

  if (isValid) {
    return <Redirect href={'/(protected)/home'} />;
  }

  return <Redirect href={'/(auth)/login'} />;
}