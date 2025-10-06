import { SegmentControl } from "@/components/SegmentControl";
import {
  TransactionItem,
  TransactionItemProps,
} from "@/components/TransactionItem";
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
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TRANSACTION_ICONS: Record<
  "income" | "expense",
  keyof typeof Ionicons.glyphMap
> = {
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
  const [transactions, setTransactions] = React.useState<TransactionItemProps[]>(
    []
  );
  const [loadingTransactions, setLoadingTransactions] = React.useState(false);
  const [transactionsError, setTransactionsError] = React.useState<string | null>(
    null
  );
  const [refreshing, setRefreshing] = React.useState(false);
  const isMountedRef = React.useRef(true);

  const {
    account,
    loadingAccount,
    error: accountError,
    refreshAccount,
  } = useAccount();
  const { user, logout } = useAuth();

  const handleLogout = React.useCallback(async () => {
    await logout();
    router.replace("/");
  }, [logout]);

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

        const normalized = (response.transactions ?? []).map(
          mapTransactionEntry
        );

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
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <RNText style={styles.avatarText}>{initials}</RNText>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.greetingRow}>
              <RNText style={styles.greetingText}>Olá, {greetingName}</RNText>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color="#294FC1"
                />
                <RNText style={styles.logoutText}>Sair</RNText>
              </TouchableOpacity>
            </View>
            {accountError ? (
              <RNText style={styles.accountError}>{accountError}</RNText>
            ) : null}
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceCardContent}>
            <View style={styles.balanceHeader}>
              <RNText style={styles.balanceLabel}>Saldo</RNText>
              <TouchableOpacity onPress={toggleBalance}>
                {balanceVisible ? (
                  <Ionicons name="eye-off" size={20} color="white" />
                ) : (
                  <Ionicons name="eye" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>

            <RNText style={styles.balanceValue}>{balanceDisplay}</RNText>

            <View style={styles.balanceMetaRow}>
              <View>
                <RNText style={styles.balanceMetaLabel}>Agência</RNText>
                <RNText style={styles.balanceMetaValue}>
                  {account?.agency ?? "--"}
                </RNText>
              </View>
              <View>
                <RNText style={styles.balanceMetaLabel}>Conta</RNText>
                <RNText style={styles.balanceMetaValue}>
                  {account?.accountNumber ?? "--"}
                </RNText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <View style={styles.actionsRow}>
            <View style={styles.actionItem}>
              <View style={styles.actionButton}>
                <Ionicons name="arrow-up" size={24} color="#294FC1" />
                <RNText style={styles.actionLabel}>Transferir</RNText>
              </View>
            </View>

            <View style={styles.actionItem}>
              <View style={styles.actionButton}>
                <Ionicons name="document-text" size={24} color="#294FC1" />
                <RNText style={styles.actionLabel}>Pagar</RNText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push("/card")}
              activeOpacity={0.7}
            >
              <View style={styles.actionButton}>
                <Ionicons name="wallet" size={24} color="#294FC1" />
                <RNText style={styles.actionLabel}>Cartões</RNText>
              </View>
            </TouchableOpacity>

            <View style={styles.actionItem}>
              <View style={styles.actionButton}>
                <Ionicons name="arrow-down" size={24} color="#294FC1" />
                <RNText style={styles.actionLabel}>Sacar</RNText>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.transactionsSection}>
        <RNText style={styles.transactionsTitle}>Transações recentes</RNText>

        <SegmentControl
          options={[
            { key: "expense", label: "Despesas" },
            { key: "income", label: "Entradas" },
          ]}
          activeKey={activeTab}
          onOptionChange={(key) => setActiveTab(key as "income" | "expense")}
        />

        {transactionsError ? (
          <View style={styles.errorContainer}>
            <RNText style={styles.errorText}>{transactionsError}</RNText>
            <TouchableOpacity
              onPress={() => fetchTransactions()}
              style={styles.retryButton}
            >
              <RNText style={styles.retryText}>Tentar novamente</RNText>
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
            <View style={styles.loader}>
              <ActivityIndicator size="small" color="#294FC1" />
            </View>
          ) : null}

          {!loadingTransactions &&
          filteredTransactions.length === 0 &&
          !transactionsError ? (
            <View style={styles.transactionsEmpty}>
              <RNText style={styles.transactionsEmptyText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#294FC1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#101142",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#294FC1",
  },
  accountError: {
    fontSize: 12,
    color: "#DC2626",
  },
  balanceCard: {
    backgroundColor: "#294FC1",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  balanceCardContent: {
    gap: 12,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  balanceValue: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
  },
  balanceMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  balanceMetaLabel: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
  },
  balanceMetaValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  actionsSection: {
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  actionItem: {
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  actionButton: {
    width: 80,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#101142",
    textAlign: "center",
  },
  transactionsSection: {
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
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#101142",
  },
  errorContainer: {
    gap: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  retryButton: {
    alignSelf: "flex-start",
  },
  retryText: {
    color: "#294FC1",
    fontWeight: "600",
  },
  loader: {
    paddingVertical: 32,
  },
  transactionsEmpty: {
    paddingVertical: 32,
    alignItems: "center",
  },
  transactionsEmptyText: {
    color: "#6b7280",
    fontSize: 14,
  },
});
