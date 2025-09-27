import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text as RNText,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TransactionItem } from "@/components/TransactionItem";
import { SegmentControl } from "@/components/SegmentControl";

export default function DashboardScreen() {
  const [balanceVisible, setBalanceVisible] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"income" | "expense">(
    "expense"
  );

  const toggleBalance = () => setBalanceVisible(!balanceVisible);

  const transactions: TransactionItem[] = [
    {
      id: 1,
      title: "Restaurant",
      amount: 124.2,
      date: "Mai 5th",
      time: "14:28:00",
      type: "expense",
      icon: "restaurant",
      category: "food",
    },
    {
      id: 2,
      title: "Public Transport",
      amount: 5.0,
      date: "May 3th",
      time: "22:56:00",
      type: "expense",
      icon: "bus",
      category: "transport",
    },
    {
      id: 3,
      title: "Utilities",
      amount: 213.0,
      date: "May 2th",
      time: "08:02:00",
      type: "expense",
      icon: "document-text",
      category: "bills",
    },
    {
      id: 4,
      title: "Salary",
      amount: 5000.0,
      date: "May 1th",
      time: "09:00:00",
      type: "income",
      icon: "card",
      category: "salary",
    },
    {
      id: 5,
      title: "Freelance",
      amount: 1200.0,
      date: "Apr 30th",
      time: "16:30:00",
      type: "income",
      icon: "laptop",
      category: "work",
    },
    {
      id: 6,
      title: "Investment Return",
      amount: 450.75,
      date: "Apr 28th",
      time: "12:15:00",
      type: "income",
      icon: "trending-up",
      category: "investment",
    },
    {
      id: 7,
      title: "Groceries",
      amount: 120.0,
      date: "Apr 27th",
      time: "10:30:00",
      type: "expense",
      icon: "cart",
      category: "food",
    },
    {
      id: 8,
      title: "Entertainment",
      amount: 120.0,
      date: "Apr 26th",
      time: "09:15:00",
      type: "expense",
      icon: "tv",
      category: "entertainment",
    },
    {
      id: 9,
      title: "Transport",
      amount: 120.0,
      date: "Apr 25th",
      time: "08:00:00",
      type: "expense",
      icon: "bus",
      category: "transport",
    },
  ];

  const filteredTransactions = transactions.filter((t) => t.type === activeTab);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F0F0F0", gap: 16 }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <View
        style={{
          flex: 1,
          backgroundColor: "#F0F0F0",
          justifyContent: "space-between",
        }}
      >
        <View style={{ padding: 16, gap: 16 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginHorizontal: -16,
              marginTop: -16,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#294FC1",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <RNText style={{ color: "white", fontWeight: "bold" }}>
                  JS
                </RNText>
              </View>
              <View>
                <RNText
                  style={{ fontSize: 16, fontWeight: "600", color: "#101142" }}
                >
                  Olá, João da Silva
                </RNText>
              </View>
            </View>
          </View>

          {/* Balance Card */}
          <View
            style={{
              backgroundColor: "#294FC1",
              padding: 16,
              borderRadius: 16,
              elevation: 2,
            }}
          >
            <View style={{ gap: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <RNText
                  style={{ color: "white", fontSize: 20, fontWeight: "700" }}
                >
                  Saldo
                </RNText>
                <TouchableOpacity onPress={toggleBalance}>
                  {balanceVisible ? (
                    <Ionicons name="eye-off" size={20} color="white" />
                  ) : (
                    <Ionicons name="eye" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>

              <RNText
                style={{ color: "white", fontSize: 32, fontWeight: "800" }}
              >
                {balanceVisible ? "R$ 15.456.789" : "••••••••"}
              </RNText>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <View>
                  <RNText
                    style={{ color: "white", fontSize: 14, opacity: 0.8 }}
                  >
                    Fatura atual
                  </RNText>
                  <RNText
                    style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                  >
                    R$ 16.456.789
                  </RNText>
                </View>
                <View>
                  <RNText
                    style={{ color: "white", fontSize: 14, opacity: 0.8 }}
                  >
                    Limite disponível
                  </RNText>
                  <RNText
                    style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                  >
                    R$ 2.000.000
                  </RNText>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                justifyContent: "space-between",
                marginTop: 5,
              }}
            >
              <View style={{ alignItems: "center", gap: 20, flex: 1 }}>
                <View
                  style={{
                    width: 80,
                    height: 70,
                    borderRadius: 12,
                    gap: 4,
                    backgroundColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="arrow-up" size={24} color="#294FC1" />
                  <RNText
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: "#101142",
                      textAlign: "center",
                    }}
                  >
                    Transferir
                  </RNText>
                </View>
              </View>

              <View style={{ alignItems: "center", gap: 12, flex: 1 }}>
                <View
                  style={{
                    width: 80,
                    height: 70,
                    borderRadius: 12,
                    backgroundColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Ionicons name="document-text" size={24} color="#294FC1" />
                  <RNText
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: "#101142",
                      textAlign: "center",
                    }}
                  >
                    Pagar
                  </RNText>
                </View>
              </View>

              <TouchableOpacity
                style={{ alignItems: "center", gap: 12, flex: 1 }}
                onPress={() => router.push("/cards")}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 80,
                    height: 70,
                    borderRadius: 12,
                    backgroundColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Ionicons name="wallet" size={24} color="#294FC1" />
                  <RNText
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: "#101142",
                      textAlign: "center",
                    }}
                  >
                    Cartões
                  </RNText>
                </View>
              </TouchableOpacity>

              <View style={{ alignItems: "center", gap: 12, flex: 1 }}>
                <View
                  style={{
                    width: 80,
                    height: 70,
                    borderRadius: 12,
                    backgroundColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Ionicons name="arrow-down" size={24} color="#294FC1" />
                  <RNText
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: "#101142",
                      textAlign: "center",
                    }}
                  >
                    Sacar
                  </RNText>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          gap: 16,
          backgroundColor: "#fff",
          paddingHorizontal: 16,
          paddingVertical: 24,
          paddingBottom: 50,
          borderRadius: 28,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          height: 430,
          maxHeight: 430,
        }}
      >
        <RNText
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#101142",
          }}
        >
          Transações recentes
        </RNText>

        {/* Segment Control */}
        <SegmentControl
          options={[
            { key: "expense", label: "Despesas" },
            { key: "income", label: "Entradas" },
          ]}
          activeKey={activeTab}
          onOptionChange={(key) => setActiveTab(key as "income" | "expense")}
        />

        {/* Transactions List */}
        <ScrollView>
          {filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
