import { addExpense, EXPENSE_CATEGORIES, ExpenseCategory } from '@/services/expenses';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 80;
const MIN_AMOUNT = 0;
const MAX_AMOUNT = 10000;
const STEP = 50;

export default function AddExpenseScreen() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(100);
  const [category, setCategory] = useState<ExpenseCategory>('Ingredients');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleAmountChange = (value: number) => {
    const snappedValue = Math.round(value / STEP) * STEP;
    setAmount(Math.max(MIN_AMOUNT, Math.min(MAX_AMOUNT, snappedValue)));
  };

  const handleSliderScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newAmount = Math.round((offsetX / SLIDER_WIDTH) * MAX_AMOUNT);
    handleAmountChange(newAmount);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        alert('Please enter expense name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Please enter expense name');
      return;
    }
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    const { error } = await addExpense({
      name: name.trim(),
      amount,
      category,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (error) {
      alert('Failed to add expense. Please try again.');
      return;
    }

    router.back();
  };

  const renderAmountRuler = () => {
    const markers = [];
    const numMarkers = 21;

    for (let i = 0; i < numMarkers; i++) {
      const markerValue = (i / (numMarkers - 1)) * MAX_AMOUNT;
      const isMainMarker = i % 5 === 0;
      const isCenterMarker = i === 10;

      markers.push(
        <View key={i} style={styles.markerContainer}>
          <View
            style={[
              styles.marker,
              isMainMarker && styles.mainMarker,
              isCenterMarker && styles.centerMarker,
            ]}
          />
          {isMainMarker && (
            <Text style={styles.markerLabel}>
              ₹{Math.round(markerValue).toLocaleString('en-IN')}
            </Text>
          )}
        </View>
      );
    }

    return markers;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 ? (
          <>
            {/* Expense Name Input */}
            <View style={styles.inputSection}>
              <TextInput
                style={styles.nameInput}
                placeholder="Expense Name"
                placeholderTextColor="#C4C4C4"
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            {/* Amount Section */}
            <Text style={styles.sectionLabel}>Amount</Text>
            <View style={styles.amountCard}>
              {/* Amount Display */}
              <View style={styles.amountDisplay}>
                <Text style={styles.amountText}>₹{amount.toLocaleString('en-IN')}</Text>
              </View>

              {/* Amount Ruler */}
              <View style={styles.rulerContainer}>
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rulerContent}
                  onScroll={handleSliderScroll}
                  scrollEventThrottle={16}
                  snapToInterval={SLIDER_WIDTH / 20}
                  decelerationRate="fast"
                >
                  <View style={styles.rulerPadding} />
                  {renderAmountRuler()}
                  <View style={styles.rulerPadding} />
                </ScrollView>
                <View style={styles.centerIndicator} />
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmounts}>
                {[100, 500, 1000, 2000, 5000].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.quickAmountButton,
                      amount === val && styles.quickAmountButtonActive,
                    ]}
                    onPress={() => setAmount(val)}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        amount === val && styles.quickAmountTextActive,
                      ]}
                    >
                      ₹{val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recommendation Card */}
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationIcon}>
                <Text style={styles.recommendationEmoji}>💵</Text>
              </View>
              <Text style={styles.recommendationText}>
                ₹{amount.toLocaleString('en-IN')} selected for this expense
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Category Selection */}
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoriesGrid}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryButton,
                    { borderColor: cat.color },
                    category === cat.name && { backgroundColor: cat.color },
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat.name && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes Input */}
            <Text style={styles.sectionLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add any notes..."
              placeholderTextColor="#C4C4C4"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Name</Text>
                <Text style={styles.summaryValue}>{name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>₹{amount.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Category</Text>
                <Text style={styles.summaryValue}>{category}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Next/Submit Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleNextStep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>
              {step === 1 ? 'Next Step' : 'Add Expense'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerSpacer: {
    width: 80,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginTop: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1A1A1A',
    paddingBottom: 8,
  },
  nameInput: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000',
    fontStyle: 'italic',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
    marginBottom: 16,
  },
  amountCard: {
    backgroundColor: '#E8E0F4',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  amountDisplay: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginBottom: 24,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  rulerContainer: {
    width: '100%',
    height: 80,
    position: 'relative',
  },
  rulerContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  rulerPadding: {
    width: SLIDER_WIDTH / 2,
  },
  markerContainer: {
    alignItems: 'center',
    width: SLIDER_WIDTH / 20,
  },
  marker: {
    width: 2,
    height: 20,
    backgroundColor: '#666',
  },
  mainMarker: {
    height: 30,
    backgroundColor: '#333',
  },
  centerMarker: {
    height: 40,
    backgroundColor: '#1A1A1A',
    width: 3,
  },
  markerLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  centerIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -1.5,
    width: 3,
    height: 50,
    backgroundColor: '#1A1A1A',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  quickAmountButtonActive: {
    backgroundColor: '#1A1A1A',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  quickAmountTextActive: {
    color: '#fff',
  },
  recommendationCard: {
    backgroundColor: '#F4A7B9',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  recommendationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recommendationEmoji: {
    fontSize: 24,
  },
  recommendationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#000',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  nextButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
