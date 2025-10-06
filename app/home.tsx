import { SegmentControl } from "@/components/SegmentControl";
import { TransactionItem, TransactionItemProps } from "@/components/TransactionItem";
import { useAccount } from "@/hooks/useAccount";
import { useAuth } from "@/hooks/useAuth";
import {
  AccountStatementEntry,
  getAccountStatement,
} from "@/services/firebase";
import { formatCurrencyFromNumber } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text as RNText,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TRANSACTION_ICONS: Record<"income" | "expense", keyof typeof Ionicons.glyphMap> = {
  income: "arrow-down",
  expense: "arrow-up",
};

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  const formatted = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);

  return formatted.replace(" de ", " ").replace(/\./g, "").trim();
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const mapTransactionEntry = (
  entry: AccountStatementEntry
): TransactionItemProps => {
  const type = entry.type === "DEPOSIT" ? "income" : "expense";
  const title = type === "income" ? "Depósito recebido" : "Saque realizado";

  return {
    id: entry.id,
    title,
    amount: entry.amount,
    date: formatDate(entry.timestamp),
    time: formatTime(entry.timestamp),
    type,
    icon: TRANSACTION_ICONS[type],
    category: type,
  };
};

const extractInitials = (value?: string | null): string => {
  if (!value) {
    return "??";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "??";
  }

  if (trimmed.includes("@")) {
    const [username] = trimmed.split("@");
    return (username ?? "??").slice(0, 2).toUpperCase() || "??";
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";

  return `${first}${last}`.toUpperCase() || "??";
};

const extractFirstName = (value?: string | null): string => {
  if (!value) {
    return "Cliente";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "Cliente";
  }

  if (trimmed.includes("@")) {
    const [username] = trimmed.split("@");
    if (!username) {
      return "Cliente";
    }
    return username.charAt(0).toUpperCase() + username.slice(1);
  }

  const [firstName] = trimmed.split(/\s+/);
  if (!firstName) {
    return "Cliente";
  }

  const normalized = firstName.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export default function HomeScreen() {
  const [balanceVisible, setBalanceVisible] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"income" | "expense">(
    "expense"
  );
  const [transactions, setTransactions] = React.useState<TransactionItemProps[]>([]);
  const [loadingTransactions, setLoadingTransactions] = React.useState(false);
  const [transactionsError, setTransactionsError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const isMountedRef = React.useRef(true);

  const { account, loadingAccount, error: accountError, refreshAccount } = useAccount();
  const { user } = useAuth();

  const toggleBalance = () => setBalanceVisible((visible) => !visible);

  const fetchTransactions = React.useCallback(
    async ({ showLoader = true }: { showLoader?: boolean } = {}) => {
      if (showLoader && isMountedRef.current) {
        setLoadingTransactions(true);
      }

      if (isMountedRef.current) {
        setTransactionsError(null);
      }

      try {
        const response = await getAccountStatement({ page: 1, pageSize: 20 });

        if (!response?.success) {
          throw new Error("Não foi possível carregar o extrato da conta.");
        }

        const normalized = (response.transactions ?? []).map(mapTransactionEntry);

        if (isMountedRef.current) {
          setTransactions(normalized);
        }
      } catch (error: any) {
        if (isMountedRef.current) {
          setTransactionsError(
            error?.message ?? "Erro ao carregar as transações."
          );
        }
      } finally {
        if (showLoader && isMountedRef.current) {
          setLoadingTransactions(false);
        }
      }
    },
    []
  );

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
      refreshAccount();
    }, [fetchTransactions, refreshAccount])
  );

  const handleRefresh = React.useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    setRefreshing(true);

    try {
      await Promise.allSettled([
        refreshAccount(),
        fetchTransactions({ showLoader: false }),
      ]);
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [fetchTransactions, refreshAccount]);

  const initials = React.useMemo(() => {
    return extractInitials(
      account?.ownerName ?? user?.displayName ?? user?.email ?? undefined
    );
  }, [account?.ownerName, user?.displayName, user?.email]);

  const greetingName = React.useMemo(() => {
    return extractFirstName(
      account?.ownerName ?? user?.displayName ?? user?.email ?? undefined
    );
  }, [account?.ownerName, user?.displayName, user?.email]);

  const balanceDisplay = React.useMemo(() => {
    if (!balanceVisible) {
      return "••••••••";
    }

    if (loadingAccount && !account) {
      return "Carregando...";
    }

    if (typeof account?.balance === "number") {
      return formatCurrencyFromNumber(account.balance);
    }

    return "R$ 0,00";
  }, [account, balanceVisible, loadingAccount]);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((transaction) => transaction.type === activeTab);
  }, [transactions, activeTab]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F0F0F0", gap: 16 }}
      edges={["top", "bottom"]}
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginHorizontal: -16,
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
                  {initials}
                </RNText>
              </View>
              <View>
                <RNText
                  style={{ fontSize: 16, fontWeight: "600", color: "#101142" }}
                >
                  Olá, {greetingName}
                </RNText>
                {accountError ? (
                  <RNText
                    style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}
                  >
                    {accountError}
                  </RNText>
                ) : null}
              </View>
            </View>
          </View>

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
                {balanceDisplay}
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
                    Agência
                  </RNText>
                  <RNText
                    style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                  >
                    {account?.agency ?? "--"}
                  </RNText>
                </View>
                <View>
                  <RNText
                    style={{ color: "white", fontSize: 14, opacity: 0.8 }}
                  >
                    Conta
                  </RNText>
                  <RNText
                    style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                  >
                    {account?.accountNumber ?? "--"}
                  </RNText>
                </View>
              </View>
            </View>
          </View>

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
                onPress={() => router.push("/card")}
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
          marginBottom: -40,
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

        <SegmentControl
          options={[
            { key: "expense", label: "Despesas" },
            { key: "income", label: "Entradas" },
          ]}
          activeKey={activeTab}
          onOptionChange={(key) => setActiveTab(key as "income" | "expense")}
        />

        {transactionsError ? (
          <View style={{ gap: 8 }}>
            <RNText style={{ color: "#DC2626", fontSize: 14 }}>
              {transactionsError}
            </RNText>
            <TouchableOpacity
              onPress={() => fetchTransactions()}
              style={{ alignSelf: "flex-start" }}
            >
              <RNText style={{ color: "#294FC1", fontWeight: "600" }}>
                Tentar novamente
              </RNText>
            </TouchableOpacity>
          </View>
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#294FC1"]}
              tintColor="#294FC1"
            />
          }
        >
          {loadingTransactions && !refreshing ? (
            <View style={{ paddingVertical: 32 }}>
              <ActivityIndicator size="small" color="#294FC1" />
            </View>
          ) : null}

          {!loadingTransactions && filteredTransactions.length === 0 && !transactionsError ? (
            <View style={{ paddingVertical: 32, alignItems: "center" }}>
              <RNText style={{ color: "#6b7280", fontSize: 14 }}>
                Nenhuma transação encontrada.
              </RNText>
            </View>
          ) : null}

          {filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
