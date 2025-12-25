import SwiftUI

struct PaymentsView: View {
    @StateObject private var viewModel = PaymentsViewModel()
    @State private var selectedTab: PaymentTab = .invoices

    enum PaymentTab: String, CaseIterable {
        case invoices = "Invoices"
        case history = "History"
        case methods = "Payment Methods"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Tabs
                Picker("", selection: $selectedTab) {
                    ForEach(PaymentTab.allCases, id: \.self) { tab in
                        Text(tab.rawValue).tag(tab)
                    }
                }
                .pickerStyle(.segmented)
                .padding()

                // Content
                content
            }
            .background(Color.backgroundPrimary)
            .navigationTitle("Payments")
            .refreshable {
                await viewModel.loadData()
            }
        }
        .task {
            await viewModel.loadData()
        }
    }

    @ViewBuilder
    private var content: some View {
        switch selectedTab {
        case .invoices:
            invoicesContent
        case .history:
            historyContent
        case .methods:
            paymentMethodsContent
        }
    }

    // MARK: - Invoices Content

    @ViewBuilder
    private var invoicesContent: some View {
        if viewModel.isLoadingInvoices {
            LoadingView()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else if viewModel.invoices.isEmpty {
            EmptyStateView(
                icon: "doc.text",
                title: "No Invoices",
                message: "You don't have any invoices"
            )
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            ScrollView {
                // Outstanding Balance
                if viewModel.outstandingBalance > 0 {
                    outstandingBalanceCard
                        .padding(.horizontal)
                }

                LazyVStack(spacing: 16) {
                    ForEach(viewModel.invoices) { invoice in
                        InvoiceCard(
                            invoice: invoice,
                            onTap: {
                                viewModel.selectedInvoice = invoice
                            },
                            onPay: {
                                viewModel.invoiceToPay = invoice
                            }
                        )
                    }
                }
                .padding()
            }
        }
    }

    private var outstandingBalanceCard: some View {
        CardContainer {
            VStack(spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Outstanding Balance")
                            .font(.bodyMedium)
                            .foregroundColor(.textSecondary)

                        Text(viewModel.formattedOutstandingBalance)
                            .font(.headlineMedium)
                            .foregroundColor(.textPrimary)
                    }

                    Spacer()

                    Image(systemName: "dollarsign.circle.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.warning)
                }

                PrimaryButton("Pay Now") {
                    // Handle pay all
                }
            }
        }
    }

    // MARK: - History Content

    @ViewBuilder
    private var historyContent: some View {
        if viewModel.isLoadingPayments {
            LoadingView()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else if viewModel.payments.isEmpty {
            EmptyStateView(
                icon: "clock",
                title: "No Payment History",
                message: "Your payment history will appear here"
            )
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            List {
                ForEach(viewModel.payments) { payment in
                    PaymentRow(payment: payment)
                }
            }
            .listStyle(.plain)
        }
    }

    // MARK: - Payment Methods Content

    @ViewBuilder
    private var paymentMethodsContent: some View {
        if viewModel.isLoadingMethods {
            LoadingView()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            List {
                Section {
                    ForEach(viewModel.paymentMethods) { method in
                        PaymentMethodRow(method: method) {
                            Task {
                                await viewModel.setDefaultPaymentMethod(method)
                            }
                        } onDelete: {
                            Task {
                                await viewModel.deletePaymentMethod(method)
                            }
                        }
                    }
                }

                Section {
                    Button {
                        viewModel.showAddPaymentMethod = true
                    } label: {
                        Label("Add Payment Method", systemImage: "plus.circle")
                            .foregroundColor(.healthPrimary)
                    }
                }

                // Insurance Section
                Section("Insurance") {
                    if viewModel.insurance.isEmpty {
                        Text("No insurance on file")
                            .foregroundColor(.textSecondary)
                    } else {
                        ForEach(viewModel.insurance) { ins in
                            InsuranceRow(insurance: ins)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Payment Row

struct PaymentRow: View {
    let payment: Payment

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: payment.paymentMethod.icon)
                .font(.title2)
                .foregroundColor(.healthPrimary)
                .frame(width: 44, height: 44)
                .background(
                    Circle()
                        .fill(Color.healthPrimary.opacity(0.1))
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(payment.formattedAmount)
                    .font(.titleSmall)
                    .foregroundColor(.textPrimary)

                HStack(spacing: 8) {
                    if let card = payment.cardDisplay {
                        Text(card)
                            .font(.captionMedium)
                            .foregroundColor(.textSecondary)
                    }

                    Text(payment.formattedDate)
                        .font(.captionMedium)
                        .foregroundColor(.textTertiary)
                }
            }

            Spacer()

            StatusBadge(
                text: payment.status.displayName,
                color: statusColor(for: payment.status)
            )
        }
        .padding(.vertical, 4)
    }

    private func statusColor(for status: PaymentStatus) -> Color {
        switch status {
        case .pending, .processing: return .yellow
        case .completed: return .green
        case .failed: return .red
        case .refunded, .partiallyRefunded: return .purple
        }
    }
}

// MARK: - Payment Method Row

struct PaymentMethodRow: View {
    let method: SavedPaymentMethod
    let onSetDefault: () -> Void
    let onDelete: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: method.type.icon)
                .font(.title2)
                .foregroundColor(.healthPrimary)

            VStack(alignment: .leading, spacing: 2) {
                Text(method.displayName)
                    .font(.bodyMedium)
                    .foregroundColor(.textPrimary)

                if let expiry = method.expiryDate {
                    Text("Expires \(expiry)")
                        .font(.captionMedium)
                        .foregroundColor(.textSecondary)
                }
            }

            Spacer()

            if method.isDefault {
                Text("Default")
                    .font(.captionMedium)
                    .foregroundColor(.healthPrimary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(
                        Capsule()
                            .fill(Color.healthPrimary.opacity(0.1))
                    )
            }
        }
        .swipeActions(edge: .trailing) {
            Button(role: .destructive) {
                onDelete()
            } label: {
                Label("Delete", systemImage: "trash")
            }

            if !method.isDefault {
                Button {
                    onSetDefault()
                } label: {
                    Label("Default", systemImage: "star")
                }
                .tint(.orange)
            }
        }
    }
}

// MARK: - Insurance Row

struct InsuranceRow: View {
    let insurance: Insurance

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(insurance.provider)
                    .font(.titleSmall)
                    .foregroundColor(.textPrimary)

                Spacer()

                if insurance.isPrimary {
                    Text("Primary")
                        .font(.captionMedium)
                        .foregroundColor(.healthPrimary)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                InfoRow(label: "Policy #", value: insurance.policyNumber)
                if let group = insurance.groupNumber {
                    InfoRow(label: "Group #", value: group)
                }
                InfoRow(label: "Subscriber", value: insurance.subscriberName)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Payments View Model

@MainActor
class PaymentsViewModel: ObservableObject {
    @Published var invoices: [Invoice] = []
    @Published var payments: [Payment] = []
    @Published var paymentMethods: [SavedPaymentMethod] = []
    @Published var insurance: [Insurance] = []

    @Published var isLoadingInvoices = false
    @Published var isLoadingPayments = false
    @Published var isLoadingMethods = false

    @Published var selectedInvoice: Invoice?
    @Published var invoiceToPay: Invoice?
    @Published var showAddPaymentMethod = false

    private let apiClient = APIClient.shared

    var outstandingBalance: Decimal {
        invoices
            .filter { $0.status == .pending || $0.status == .partiallyPaid }
            .reduce(0) { $0 + $1.amountDue }
    }

    var formattedOutstandingBalance: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: outstandingBalance as NSDecimalNumber) ?? "$0.00"
    }

    func loadData() async {
        await withTaskGroup(of: Void.self) { group in
            group.addTask { await self.loadInvoices() }
            group.addTask { await self.loadPayments() }
            group.addTask { await self.loadPaymentMethods() }
            group.addTask { await self.loadInsurance() }
        }
    }

    private func loadInvoices() async {
        isLoadingInvoices = true
        do {
            let response: PaginatedResponse<Invoice> = try await apiClient.request(
                endpoint: .invoices(),
                responseType: PaginatedResponse<Invoice>.self
            )
            invoices = response.data.sorted { $0.issueDate > $1.issueDate }
        } catch {
            print("Failed to load invoices: \(error)")
        }
        isLoadingInvoices = false
    }

    private func loadPayments() async {
        isLoadingPayments = true
        do {
            let response: PaginatedResponse<Payment> = try await apiClient.request(
                endpoint: .payments(),
                responseType: PaginatedResponse<Payment>.self
            )
            payments = response.data
        } catch {
            print("Failed to load payments: \(error)")
        }
        isLoadingPayments = false
    }

    private func loadPaymentMethods() async {
        isLoadingMethods = true
        do {
            paymentMethods = try await apiClient.request(
                endpoint: .paymentMethods,
                responseType: [SavedPaymentMethod].self
            )
        } catch {
            print("Failed to load payment methods: \(error)")
        }
        isLoadingMethods = false
    }

    private func loadInsurance() async {
        do {
            insurance = try await apiClient.request(
                endpoint: .insurance,
                responseType: [Insurance].self
            )
        } catch {
            print("Failed to load insurance: \(error)")
        }
    }

    func deletePaymentMethod(_ method: SavedPaymentMethod) async {
        do {
            try await apiClient.request(endpoint: .deletePaymentMethod(id: method.id))
            paymentMethods.removeAll { $0.id == method.id }
        } catch {
            print("Failed to delete payment method: \(error)")
        }
    }

    func setDefaultPaymentMethod(_ method: SavedPaymentMethod) async {
        do {
            try await apiClient.request(endpoint: .setDefaultPaymentMethod(id: method.id))
            await loadPaymentMethods()
        } catch {
            print("Failed to set default payment method: \(error)")
        }
    }
}

// MARK: - Preview

#Preview {
    PaymentsView()
}
