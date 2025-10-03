import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

import { BottomTabNavigator } from '@/components/BottomTabNavigator';
import { useAuth } from '../hooks/useAuth';

const tabs = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home-outline'
  },
  {
    id: 'statement',
    label: 'Extrato',
    icon: 'document-text-outline'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'bar-chart-outline'
  }
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('home');
  const { user, logout } = useAuth();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header com informações do usuário */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Bem-vindo!</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Navegação principal */}
      <View style={styles.content}>
        <BottomTabNavigator
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={tabs}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});
