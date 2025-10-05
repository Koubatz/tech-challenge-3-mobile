import { SegmentControl } from "@/components/SegmentControl";
import { TransactionItem } from "@/components/TransactionItem";
import { getExpensesByType } from "@/constants/cardExpensive";

import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Text as RNText,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CardItem {
  id: number;
  type: string;
  brand: string;
  logo: string;
  cardNumber: string;
  fatura: string;
  melhorData: string;
  limiteDisponivel: string;
}

export default function CardsScreen() {
  const { width: screenWidth } = Dimensions.get("window");
  const [activeCardIndex, setActiveCardIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<"expense" | "income">(
    "expense"
  );

  const translateY = React.useRef(new Animated.Value(0)).current;
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const maxHeight = 320;
  const minHeight = 60;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return (
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
        Math.abs(gestureState.dy) > 10
      );
    },
    onPanResponderMove: (_, gestureState) => {
      if (!isCollapsed && gestureState.dy > 0) {
        translateY.setValue(Math.min(gestureState.dy, maxHeight - minHeight));
      } else if (isCollapsed && gestureState.dy < 0) {
        translateY.setValue(
          Math.max(maxHeight - minHeight + gestureState.dy, 0)
        );
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      const threshold = 100;
      const shouldCollapse = !isCollapsed
        ? gestureState.dy > threshold
        : gestureState.dy > -threshold;

      if (shouldCollapse && !isCollapsed) {
        // Collapse - hide content immediately
        setIsCollapsed(true);
        Animated.spring(translateY, {
          toValue: maxHeight - minHeight,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      } else if (!shouldCollapse && isCollapsed) {
        // Expand - show content immediately
        setIsCollapsed(false);
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      } else {
        // Return to original position
        Animated.spring(translateY, {
          toValue: isCollapsed ? maxHeight - minHeight : 0,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      }
    },
  });

  const cards: CardItem[] = [
    {
      id: 1,
      type: "Business debit",
      brand: "Levro",
      logo: "X",
      cardNumber: "**** **** **** 1234",
      fatura: "R$ 2.450,00",
      melhorData: "15 set",
      limiteDisponivel: "R$ 5.550,00",
    },
    {
      id: 2,
      type: "Personal debit",
      brand: "Levro",
      logo: "X",
      cardNumber: "**** **** **** 5678",
      fatura: "R$ 890,50",
      melhorData: "22 set",
      limiteDisponivel: "R$ 3.109,50",
    },
    {
      id: 3,
      type: "Credit card",
      brand: "Levro",
      logo: "X",
      cardNumber: "**** **** **** 9012",
      fatura: "R$ 0,00",
      melhorData: "17 set",
      limiteDisponivel: "R$ 750,00",
    },
  ];

  const currentCard = cards[activeCardIndex];
  const filteredExpenses = getExpensesByType(currentCard.id, activeTab);

  const renderCard = (item: CardItem, index: number) => (
    <View
      key={item.id}
      style={{
        width: screenWidth - 80,
        height: 200,
        backgroundColor: "white",
        borderRadius: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: "hidden",
        marginRight: index < cards.length - 1 ? 50 : 0,
      }}
    >
      {/* Diagonal background */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "white",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#294FC1",
          transform: [{ rotate: "45deg" }],
          width: "200%",
          height: "200%",
          marginLeft: "-50%",
          marginTop: "-50%",
        }}
      />

      {/* Card content */}
      <View style={{ padding: 20, flex: 1, justifyContent: "space-between" }}>
        {/* Top section */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <RNText style={{ fontSize: 16, fontWeight: "600", color: "#1f2937" }}>
            {item.type}
          </RNText>
          <View style={{ alignItems: "flex-end" }}>
            <RNText style={{ fontSize: 18, fontWeight: "700", color: "white" }}>
              {item.brand}
            </RNText>
            <RNText style={{ fontSize: 12, color: "white", opacity: 0.8 }}>
              {item.logo}
            </RNText>
          </View>
        </View>

        {/* Middle section - EMV chip */}
        <View style={{ alignItems: "flex-start" }}>
          <View
            style={{
              width: 40,
              height: 30,
              backgroundColor: "#9ca3af",
              borderRadius: 4,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 32,
                height: 24,
                backgroundColor: "#6b7280",
                borderRadius: 2,
              }}
            />
          </View>
        </View>

        {/* Bottom section */}
        <View style={{ alignItems: "flex-end" }}>
          <RNText style={{ fontSize: 14, color: "white", marginBottom: 8 }}>
            {item.cardNumber}
          </RNText>
          <RNText style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
            VISA
          </RNText>
        </View>
      </View>
    </View>
  );

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const cardWidth = screenWidth - 64; // 80 - 16 (padding)
    const index = Math.round(contentOffset / cardWidth);
    setActiveCardIndex(index);
  };

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
              marginTop: -80,
            }}
          >
            <RNText
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#101142",
              }}
            >
              Cartões
            </RNText>
          </View>

          {/* Cards Carousel */}
          <View style={{ gap: 12 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              pagingEnabled
              decelerationRate="fast"
            >
              {cards.map((item, index) => renderCard(item, index))}
            </ScrollView>

            {/* Pagination dots */}
            <View
              style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}
            >
              {cards.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      index === activeCardIndex ? "#294FC1" : "#d1d5db",
                  }}
                />
              ))}
            </View>
          </View>

          {/* Card Information Section */}
          <View
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
              gap: 16,
            }}
          >
            {/* Fatura aberta */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#f3f4f6",
              }}
            >
              <View>
                <RNText
                  style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}
                >
                  Fatura aberta
                </RNText>
                <RNText
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#101142",
                    marginBottom: 2,
                  }}
                >
                  {currentCard.fatura}
                </RNText>
                <RNText style={{ fontSize: 12, color: "#9ca3af" }}>
                  Melhor data de compra: {currentCard.melhorData}
                </RNText>
              </View>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <RNText style={{ fontSize: 14, color: "#294FC1" }}>
                  Acessar fatura
                </RNText>
                <Ionicons name="chevron-forward" size={16} color="#294FC1" />
              </TouchableOpacity>
            </View>

            {/* Débito automático */}
            {/* <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#f3f4f6",
              }}
            >
              <RNText style={{ fontSize: 14, color: "#374151" }}>
                Débito automático
              </RNText>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <RNText style={{ fontSize: 14, color: "#ef4444" }}>
                  Desativado
                </RNText>
                <Ionicons name="chevron-forward" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View> */}

            {/* Limite disponível */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 12,
              }}
            >
              <RNText style={{ fontSize: 14, color: "#374151" }}>
                Limite disponível
              </RNText>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <RNText
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#101142",
                  }}
                >
                  {currentCard.limiteDisponivel}
                </RNText>
                <Ionicons name="chevron-forward" size={16} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Expenses Section */}
      <Animated.View
        style={{
          gap: 16,
          backgroundColor: "#fff",
          paddingHorizontal: 16,
          paddingVertical: 24,
          paddingBottom: 50,
          borderRadius: 28,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          height: maxHeight,
          maxHeight: maxHeight,
          transform: [{ translateY }],
          overflow: "hidden",
        }}
        {...panResponder.panHandlers}
      >
        {/* Drag Handle */}
        <View
          style={{
            alignItems: "center",
            marginTop: -12,
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#d1d5db",
              borderRadius: 2,
            }}
          />
        </View>

        {!isCollapsed && (
          <RNText
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#101142",
            }}
          >
            Últimas lançamentos
          </RNText>
        )}

        {!isCollapsed && (
          <>
            {/* Segment Control */}
            <SegmentControl
              options={[{ key: "expense", label: "Despesas" }]}
              activeKey={activeTab}
              onOptionChange={(key) =>
                setActiveTab(key as "income" | "expense")
              }
            />

            {/* Expenses List */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredExpenses.map((expense: any) => (
                <TransactionItem
                  key={expense.id}
                  transaction={{
                    id: expense.id,
                    title: expense.title,
                    amount: expense.amount,
                    date: expense.date,
                    time: expense.time,
                    type: expense.type,
                    icon: expense.icon,
                    category: expense.category,
                  }}
                />
              ))}
            </ScrollView>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
