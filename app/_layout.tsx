import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export default function RootLayout() {
  useFrameworkReady();
  const { user, loading } = useAuth();
  useNotifications(); // Initialize notifications

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="clarify" />
        <Stack.Screen name="waiting" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="safety" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}