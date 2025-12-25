import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { paymentsApi } from '@/api';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Badge,
  LoadingState,
  EmptyState,
} from '@/components/ui';
import { colors, spacing, typography, borderRadius, lightTheme } from '@/theme';
import { PatientBalance, Payment, Invoice } from '@/types';

export default function PaymentsScreen() {
  const [balance, setBalance] = useState<PatientBalance | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'invoices'>('overview');

  const fetchData = async () => {
    const [balanceRes, paymentsRes, invoicesRes] = await Promise.all([
      paymentsApi.getBalance(),
      paymentsApi.getPaymentHistory(1, 10),
      paymentsApi.getInvoices(undefined, 1, 10),
    ]);

    if (balanceRes.success && balanceRes.data) {
      setBalance(balanceRes.data);
    }
    if (paymentsRes.success && paymentsRes.data) {
      setRecentPayments(paymentsRes.data.items);
    }
    if (invoicesRes.success && invoicesRes.data) {
      setInvoices(invoicesRes.data.items);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleMakePayment = () => {
    Alert.alert(
      'Make a Payment',
      'Payment processing will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderOverview = () => (
    <View style={styles.overviewContent}>
      {/* Balance Card */}
      <Card variant="elevated" style={styles.balanceCard}>
        <CardContent style={styles.balanceContent}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(balance?.currentBalance || 0)}
          </Text>
          {balance?.currentBalance && balance.currentBalance > 0 && (
            <Button
              title="Make a Payment"
              onPress={handleMakePayment}
              size="lg"
              fullWidth
              style={styles.payButton}
            />
          )}
        </CardContent>
      </Card>

      {/* Aging Summary */}
      {balance && (balance.pastDue30 > 0 || balance.pastDue60 > 0 || balance.pastDue90 > 0) && (
        <Card variant="outlined" style={styles.agingCard}>
          <CardHeader title="Outstanding Balance" />
          <CardContent>
            <View style={styles.agingGrid}>
              {balance.pastDue30 > 0 && (
                <View style={styles.agingItem}>
                  <Text style={styles.agingLabel}>30 Days</Text>
                  <Text style={styles.agingAmount}>{formatCurrency(balance.pastDue30)}</Text>
                </View>
              )}
              {balance.pastDue60 > 0 && (
                <View style={styles.agingItem}>
                  <Text style={styles.agingLabel}>60 Days</Text>
                  <Text style={[styles.agingAmount, styles.agingWarning]}>
                    {formatCurrency(balance.pastDue60)}
                  </Text>
                </View>
              )}
              {balance.pastDue90 > 0 && (
                <View style={styles.agingItem}>
                  <Text style={styles.agingLabel}>90+ Days</Text>
                  <Text style={[styles.agingAmount, styles.agingDanger]}>
                    {formatCurrency(balance.pastDue90)}
                  </Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: colors.primary[100] }]}>
            <Ionicons name="card-outline" size={24} color={colors.primary[600]} />
          </View>
          <Text style={styles.actionTitle}>Payment Methods</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: colors.success[100] }]}>
            <Ionicons name="repeat-outline" size={24} color={colors.success[600]} />
          </View>
          <Text style={styles.actionTitle}>Setup Autopay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: colors.info[100] }]}>
            <Ionicons name="document-text-outline" size={24} color={colors.info[600]} />
          </View>
          <Text style={styles.actionTitle}>Payment Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: colors.warning[100] }]}>
            <Ionicons name="help-circle-outline" size={24} color={colors.warning[600]} />
          </View>
          <Text style={styles.actionTitle}>Billing Help</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Payments */}
      <Card variant="outlined" style={styles.sectionCard}>
        <CardHeader
          title="Recent Payments"
          action={
            <TouchableOpacity onPress={() => setActiveTab('history')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          }
        />
        <CardContent>
          {recentPayments.slice(0, 3).map((payment) => (
            <View key={payment.id} style={styles.paymentItem}>
              <View style={styles.paymentIcon}>
                <Ionicons
                  name={payment.status === 'COMPLETED' ? 'checkmark-circle' : 'time-outline'}
                  size={24}
                  color={payment.status === 'COMPLETED' ? colors.success[600] : colors.warning[600]}
                />
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                <Text style={styles.paymentDate}>
                  {format(parseISO(payment.createdAt), 'MMM d, yyyy')}
                </Text>
              </View>
              <Badge
                text={payment.status}
                variant={payment.status === 'COMPLETED' ? 'success' : 'warning'}
                size="sm"
              />
            </View>
          ))}
          {recentPayments.length === 0 && (
            <Text style={styles.emptyText}>No recent payments</Text>
          )}
        </CardContent>
      </Card>
    </View>
  );

  const renderHistory = () => (
    <View style={styles.listContent}>
      {recentPayments.map((payment) => (
        <Card key={payment.id} variant="outlined" style={styles.paymentCard}>
          <CardContent style={styles.paymentCardContent}>
            <View style={styles.paymentCardHeader}>
              <Text style={styles.paymentCardAmount}>{formatCurrency(payment.amount)}</Text>
              <Badge
                text={payment.status}
                variant={payment.status === 'COMPLETED' ? 'success' : payment.status === 'FAILED' ? 'error' : 'warning'}
                size="sm"
              />
            </View>
            <View style={styles.paymentCardDetails}>
              <Text style={styles.paymentCardDate}>
                {format(parseISO(payment.createdAt), 'MMMM d, yyyy')}
              </Text>
              <Text style={styles.paymentCardMethod}>
                {payment.paymentMethod.replace('_', ' ')}
              </Text>
            </View>
            {payment.description && (
              <Text style={styles.paymentCardDesc}>{payment.description}</Text>
            )}
          </CardContent>
        </Card>
      ))}
      {recentPayments.length === 0 && (
        <EmptyState
          icon="receipt-outline"
          title="No Payment History"
          description="Your payment history will appear here"
        />
      )}
    </View>
  );

  const renderInvoices = () => (
    <View style={styles.listContent}>
      {invoices.map((invoice) => (
        <Card key={invoice.id} variant="outlined" style={styles.invoiceCard}>
          <CardContent style={styles.invoiceCardContent}>
            <View style={styles.invoiceCardHeader}>
              <View>
                <Text style={styles.invoiceNumber}>Invoice #{invoice.invoiceNumber}</Text>
                <Text style={styles.invoiceDate}>
                  {format(parseISO(invoice.date), 'MMMM d, yyyy')}
                </Text>
              </View>
              <Badge
                text={invoice.status}
                variant={
                  invoice.status === 'PAID'
                    ? 'success'
                    : invoice.status === 'OVERDUE'
                    ? 'error'
                    : 'warning'
                }
                size="sm"
              />
            </View>
            <View style={styles.invoiceAmounts}>
              <View style={styles.invoiceAmountRow}>
                <Text style={styles.invoiceAmountLabel}>Total</Text>
                <Text style={styles.invoiceAmountValue}>{formatCurrency(invoice.totalAmount)}</Text>
              </View>
              <View style={styles.invoiceAmountRow}>
                <Text style={styles.invoiceAmountLabel}>Paid</Text>
                <Text style={styles.invoiceAmountValue}>{formatCurrency(invoice.paidAmount)}</Text>
              </View>
              <View style={styles.invoiceAmountRow}>
                <Text style={[styles.invoiceAmountLabel, styles.invoiceBalanceLabel]}>Balance Due</Text>
                <Text style={[styles.invoiceAmountValue, styles.invoiceBalanceValue]}>
                  {formatCurrency(invoice.balanceDue)}
                </Text>
              </View>
            </View>
            {invoice.balanceDue > 0 && (
              <Button
                title="Pay Now"
                variant="outline"
                size="sm"
                onPress={handleMakePayment}
                style={styles.payInvoiceButton}
              />
            )}
          </CardContent>
        </Card>
      ))}
      {invoices.length === 0 && (
        <EmptyState
          icon="document-outline"
          title="No Invoices"
          description="Your invoices will appear here"
        />
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading billing..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Billing & Payments</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['overview', 'history', 'invoices'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[600]}
          />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'invoices' && renderInvoices()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    backgroundColor: colors.white,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tab: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    marginRight: spacing[2],
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[600],
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[500],
  },
  tabTextActive: {
    color: colors.primary[600],
  },
  content: {
    flex: 1,
  },
  overviewContent: {
    padding: spacing[4],
  },
  balanceCard: {
    backgroundColor: colors.primary[600],
    marginBottom: spacing[4],
  },
  balanceContent: {
    alignItems: 'center',
    padding: spacing[6],
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[100],
    marginBottom: spacing[1],
  },
  balanceAmount: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  payButton: {
    marginTop: spacing[4],
    backgroundColor: colors.white,
  },
  agingCard: {
    marginBottom: spacing[4],
  },
  agingGrid: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  agingItem: {
    flex: 1,
    alignItems: 'center',
  },
  agingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing[1],
  },
  agingAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  agingWarning: {
    color: colors.warning[600],
  },
  agingDanger: {
    color: colors.error[600],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  actionCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    alignItems: 'center',
    ...lightTheme.shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  actionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: spacing[4],
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: spacing[3],
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentDetails: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  paymentDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  listContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  paymentCard: {
    marginBottom: 0,
  },
  paymentCardContent: {
    padding: spacing[4],
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  paymentCardAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  paymentCardDetails: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  paymentCardDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  paymentCardMethod: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  paymentCardDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing[2],
  },
  invoiceCard: {
    marginBottom: 0,
  },
  invoiceCardContent: {
    padding: spacing[4],
  },
  invoiceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  invoiceNumber: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  invoiceDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[0.5],
  },
  invoiceAmounts: {
    gap: spacing[1],
  },
  invoiceAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceAmountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  invoiceAmountValue: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  invoiceBalanceLabel: {
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
  },
  invoiceBalanceValue: {
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  payInvoiceButton: {
    marginTop: spacing[3],
  },
});
