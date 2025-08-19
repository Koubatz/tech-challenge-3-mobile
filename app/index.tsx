import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { healthCheck } from '@/services/firebase';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const handleHealthCheck = async () => {
    setIsLoading(true);
    try {
      const result = await healthCheck();
      // The cloud function will return the document ID on success
      console.log('Firebase health check result:', result);
      const data = result.data as { success: boolean; docId?: string; error?: string };
      if (data.success && data.docId) {
        console.log('Firebase health check successful:', data);
        Alert.alert('Success', `Timestamp saved to Firestore with ID: ${data.docId}`);
      } else {
        console.error('Firebase health check failed:', data);
        Alert.alert('Error', `Failed to save timestamp: ${data.error || JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Firebase health check failed:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Failed to connect to Firebase backend. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Teste!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Firebase Health Check</ThemedText>
        <TouchableOpacity
          onPress={handleHealthCheck}
          style={[styles.button, { backgroundColor: Colors[colorScheme].tint }]}
          disabled={isLoading}>
          <ThemedText type="defaultSemiBold" style={{ color: Colors[colorScheme].background }}>
            {isLoading ? 'Checking...' : 'Check Firebase Backend'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
