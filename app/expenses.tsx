import {
  calculateCategoryStats,
  Expense,
  fetchDailyExpenses,
  fetchMonthlyExpenses,
  fetchWeeklyExpenses,
  getCategoryColor,
} from '@/services/expenses';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TimeFilter = 'Daily' | 'Weekly' | 'Monthly';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('Daily');

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    let result;

    switch (activeFilter) {
      case 'Daily':
        result = await fetchDailyExpenses();
        break;
      case 'Weekly':
        result = await fetchWeeklyExpenses();
        break;
      case 'Monthly':
        result = await fetchMonthlyExpenses();
        break;
    }

    if (result.data) {
      setExpenses(result.data);
    }
    setLoading(false);
  }, [activeFilter]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryStats = calculateCategoryStats(expenses);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getFilterLabel = () => {
    switch (activeFilter) {
      case 'Daily':
        return 'Today';
      case 'Weekly':
        return 'This Week';
      case 'Monthly':
        return 'This Month';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Hi there,</Text>
            <Text style={styles.headerTitle}>Manage Your{'\n'}Expenses For {getFilterLabel()}</Text>
          </View>
          <View style={styles.headerImageContainer}>
            <View style={styles.dollarCircle}>
              <Text style={styles.dollarSign}>₹</Text>
            </View>
          </View>
        </View>

        {/* Time Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['Daily', 'Weekly', 'Monthly'] as TimeFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                activeFilter === filter && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Amount */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Expenses</Text>
          <Text style={styles.totalAmount}>₹{totalExpenses.toLocaleString('en-IN')}</Text>
        </View>

        {/* Expenses Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-expense')}
          >
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9C7CF4" />
          </View>
        ) : categoryStats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses recorded</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first expense</Text>
          </View>
        ) : (
          /* Category Cards */
          <View style={styles.cardsContainer}>
            {categoryStats.map((stat, index) => (
              <View
                key={stat.category}
                style={[
                  styles.categoryCard,
                  { backgroundColor: stat.color },
                  index % 2 === 1 && styles.categoryCardSmall,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardPercentage}>{stat.percentage}%</Text>
                  <View style={styles.percentageCircle}>
                    <Text style={styles.percentageCircleText}>{stat.percentage}%</Text>
                  </View>
                </View>
                <Text style={styles.cardCategory}>{stat.category}</Text>
                <Text style={styles.cardAmount}>₹{stat.total.toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Expenses List */}
        {!loading && expenses.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent</Text>
            {expenses.slice(0, 5).map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View
                  style={[
                    styles.expenseIcon,
                    { backgroundColor: getCategoryColor(expense.category) },
                  ]}
                >
                  <Ionicons name="receipt-outline" size={20} color="#fff" />
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseName}>{expense.name}</Text>
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                </View>
                <View style={styles.expenseRight}>
                  <Text style={styles.expenseAmount}>₹{expense.amount.toLocaleString('en-IN')}</Text>
                  <Text style={styles.expenseDate}>{formatDate(expense.created_at)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F0',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerCard: {
    backgroundColor: '#E8E0F4',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 160,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    lineHeight: 30,
  },
  headerImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dollarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F4A7B9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  dollarSign: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 30,
    padding: 4,
    marginTop: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 26,
  },
  filterTabActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  filterTextActive: {
    color: '#000',
  },
  totalContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    minHeight: 140,
  },
  categoryCardSmall: {
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  percentageCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageCircleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  cardCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  recentSection: {
    marginTop: 24,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  expenseCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  expenseDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
});
