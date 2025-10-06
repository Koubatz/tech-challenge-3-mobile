import { useThemeColor } from "@/hooks/useThemeColor";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { HomeTabContent } from "@/components/Home";
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
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Nova transação</Text>
              </TouchableOpacity>
            </Link>
          </View>
        );
      case "dashboard":
        return (
          <View style={styles.content}>
            <ContentPlaceholder
              title="Dashboard"
              description="Dashboard financeiro (análise dos graficos)"
            />
          </View>
        );
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
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
