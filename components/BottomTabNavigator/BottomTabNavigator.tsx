import { useThemeColor } from "@/hooks/useThemeColor";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "tamagui";

import { HomeTabContent } from "@/components/Home";
import { Dashboard } from '../Dashboard';
import { TabBar } from "./TabBar";
import type { BottomTabNavigatorProps, TabItem } from "./types";

export function BottomTabNavigator({
  activeTab,
  onTabChange,
  tabs,
}: BottomTabNavigatorProps) {
  const backgroundColor = useThemeColor({}, "background");

  const tabsWithState: TabItem[] = tabs.map((tab) => ({
    ...tab,
    isActive: tab.id === activeTab,
    onPress: () => onTabChange(tab.id),
  }));

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTabContent />;

      case "statement":
        return (
          <View style={styles.content}>
            <ContentPlaceholder
              title="Extrato"
              description="Extrato de transações"
            />
            <Link href="/new-transaction" asChild>
              <Button>Nova transação</Button>
            </Link>
          </View>
        );
      case 'dashboard':
        return <Dashboard />;
      default:
        return (
          <View style={styles.content}>
            <ContentPlaceholder title="Erro" description="Tab não encontrada" />
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.contentContainer}>{renderContent()}</View>
      <TabBar tabs={tabsWithState} activeTab={activeTab} />
    </View>
  );
}

//TODO: Remover quando for implementado as telas
function ContentPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.placeholder}>
      <Text style={[styles.placeholderTitle, { color: textColor }]}>
        {title}
      </Text>
      <Text style={[styles.placeholderDescription, { color: textColor }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholder: {
    alignItems: "center",
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  placeholderDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 20,
  },
});
