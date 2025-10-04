import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated } from 'react-native';
import { Text, XStack } from 'tamagui';

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onHide: () => void;
  duration?: number;
}

export default function Toast({ 
  visible, 
  message, 
  type, 
  onHide, 
  duration = 3000 
}: ToastProps) {
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  const hideToast = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [onHide, opacity, translateY]);

  useEffect(() => {
    if (visible) {
      // Animação de entrada
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide após duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, hideToast, opacity, translateY]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          icon: 'checkmark-circle-outline' as const,
          iconColor: '#fff',
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          icon: 'close-circle-outline' as const,
          iconColor: '#fff',
        };
      case 'info':
        return {
          backgroundColor: '#2196F3',
          icon: 'information-circle-outline' as const,
          iconColor: '#fff',
        };
      default:
        return {
          backgroundColor: '#333',
          icon: 'information-circle-outline' as const,
          iconColor: '#fff',
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <XStack
        backgroundColor={config.backgroundColor}
        borderRadius={12}
        paddingHorizontal={16}
        paddingVertical={12}
        alignItems="center"
        space={12}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={4}
        elevation={5}
      >
        <Ionicons 
          name={config.icon} 
          size={24} 
          color={config.iconColor} 
        />
        <Text 
          color={config.iconColor} 
          fontSize={16} 
          fontWeight="500"
          flex={1}
        >
          {message}
        </Text>
      </XStack>
    </Animated.View>
  );
}