import { BottomTabNavigator } from '@/components/BottomTabNavigator';
import { useState } from 'react';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('home');

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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <BottomTabNavigator
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tabs={tabs}
    />
  );
}
