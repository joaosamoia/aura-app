import { Redirect } from 'expo-router';
import React from 'react';
import { useApp } from '../lib/AppContext';

export default function Index() {
  const { ready, onboarded } = useApp();
  if (!ready) return null;
  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}
