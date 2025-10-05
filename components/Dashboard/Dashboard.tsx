import { useThemeColor } from '@/hooks/useThemeColor';
import { useTransactions } from '@/hooks/useTransactions';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function Dashboard() {
  const textColor = useThemeColor({}, 'text');
  
  const accountNumber = "000001-5";
  
  const generateLast12Months = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        shortLabel: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      });
    }
    
    return months;
  };

  const [availableMonths] = useState(() => generateLast12Months());
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedBar, setSelectedBar] = useState<string | null>(null);

  const { transactions, loading, error, refetch, processTransactionsForChart } = useTransactions(accountNumber);
  const { chartData, labels } = processTransactionsForChart(selectedMonth);

  const barAnimations = useRef<{ [key: string]: Animated.Value }>({});

  const getBarAnimation = (key: string) => {
    if (!barAnimations.current[key]) {
      barAnimations.current[key] = new Animated.Value(35);
    }
    return barAnimations.current[key];
  };

  useEffect(() => {
    if (chartData.length > 0) {
      chartData.forEach((_, index) => {
        getBarAnimation(`${index}-deposits`);
        getBarAnimation(`${index}-withdrawals`);
      });

      const timeoutId = setTimeout(() => {
        const animations = chartData.flatMap((data, index) => [
          Animated.timing(getBarAnimation(`${index}-deposits`), {
            toValue: Math.max((data.deposits / 80) + 30, 35),
            duration: 1000,
            delay: index * 200,
            useNativeDriver: false,
          }),
          Animated.timing(getBarAnimation(`${index}-withdrawals`), {
            toValue: Math.max((data.withdrawals / 80) + 30, 35),
            duration: 1000,
            delay: index * 200 + 150,
            useNativeDriver: false,
          }),
        ]);

        Animated.parallel(animations).start(() => {
        });
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [chartData, selectedMonth]);

  const scrollViewRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    const currentMonthIndex = availableMonths.findIndex(month => month.value === selectedMonth);
    if (currentMonthIndex !== -1 && scrollViewRef.current) {
      const reversedIndex = availableMonths.length - 1 - currentMonthIndex;
      const buttonWidth = 80 + 32 + 8;
      const scrollPosition = Math.max(0, (reversedIndex * buttonWidth) - 40);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
      }, 100);
    }
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          Análise mensal
        </Text>
        
        <View style={styles.monthSelectorContainer}>
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthSelector}
          >
            {availableMonths.slice().reverse().map((month) => (
              <TouchableOpacity
                key={month.value}
                style={[
                  styles.monthButton,
                  selectedMonth === month.value && styles.monthButtonActive
                ]}
                onPress={() => setSelectedMonth(month.value)}
              >
                <Text style={[
                  styles.monthButtonText,
                  { color: textColor },
                  selectedMonth === month.value && styles.monthButtonTextActive
                ]}>
                  {month.shortLabel}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </View>
      <View style={styles.chartsContainer}>

        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            Entradas e saídas
          </Text>
          <View style={styles.chartContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={textColor} />
                <Text style={[styles.loadingText, { color: textColor }]}>
                  Carregando transações...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: '#ff6b6b' }]}>
                  {error}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={refetch}
                >
                  <Text style={[styles.retryButtonText, { color: textColor }]}>
                    Tentar novamente
                  </Text>
                </TouchableOpacity>
              </View>
            ) : chartData.length > 0 ? (
              <View style={styles.chartWrapper}>
                <TouchableOpacity 
                  style={styles.tempChart}
                  activeOpacity={1}
                  onPress={() => setSelectedBar(null)}
                >
                  {chartData.map((data, index) => (
                    <View key={index} style={styles.tempBar}>
                      <Text style={[styles.tempLabel, { color: textColor }]}>
                        {labels[index]}
                      </Text>
                      
                      <View style={styles.valuesContainer}>
                        {selectedBar === `${index}-deposits` && (
                          <View>
                            <Text style={[styles.valueDisplay]}>
                              +R$ {data.deposits.toLocaleString('pt-BR')}
                            </Text>
                          </View>
                        )}
                        {selectedBar === `${index}-withdrawals` && (
                          <View>
                            <Text style={[styles.valueDisplay]}>
                              -R$ {data.withdrawals.toLocaleString('pt-BR')}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.tempBarContainer}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={(e) => {
                            e.stopPropagation();
                            const barId = `${index}-deposits`;
                            setSelectedBar(selectedBar === barId ? null : barId);
                          }}
                        >
                          <Animated.View
                            style={[
                              styles.tempBarItem, 
                              { 
                                height: getBarAnimation(`${index}-deposits`),
                                backgroundColor: selectedBar === `${index}-deposits` ? '#27a8ff' : '#5cbdff',
                              }
                            ]}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={(e) => {
                            e.stopPropagation();
                            const barId = `${index}-withdrawals`;
                            setSelectedBar(selectedBar === barId ? null : barId);
                          }}
                        >
                          <Animated.View
                            style={[
                              styles.tempBarItem, 
                              { 
                                height: getBarAnimation(`${index}-withdrawals`),
                                backgroundColor: selectedBar === `${index}-withdrawals` ? '#ff7800' : '#f6ac6a',
                              }
                            ]}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text style={[styles.placeholderText, { color: textColor }]}>
                  Nenhuma transação encontrada para este mês
                </Text>
              </View>
            )}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#27a8ff' }]} />
                <Text style={[styles.legendText, { color: textColor }]}>Entrada</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#ff7800' }]} />
                <Text style={[styles.legendText, { color: textColor }]}>Saída</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  monthSelectorContainer: {
    width: '100%',
    marginVertical: 20,
  },
  monthSelector: {
    paddingHorizontal: 10,
    gap: 8,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
    alignItems: 'center',
  },
  monthButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
  },
  monthButtonTextActive: {
    opacity: 1,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  chartsContainer: {
    gap: 15,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderStyle: 'dashed',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 14,
    opacity: 0.6,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.8,
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tempChart: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 200,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  tempBar: {
    alignItems: 'center',
    minWidth: 80,
    marginHorizontal: 8,
  },
  valuesContainer: {
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  valueDisplay: {
    fontSize: 12,
    color: '#0009',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tempLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  tempBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  tempBarItem: {
    width: 18,
    borderRadius: 3,
    minHeight: 35,
  },
});
