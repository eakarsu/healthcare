import SwiftUI

struct RecordsView: View {
    @StateObject private var viewModel = RecordsViewModel()
    @State private var selectedCategory: RecordCategory = .all
    @State private var searchText = ""

    enum RecordCategory: String, CaseIterable {
        case all = "All"
        case labs = "Labs"
        case imaging = "Imaging"
        case visits = "Visits"
        case medications = "Medications"

        var recordTypes: [RecordType]? {
            switch self {
            case .all: return nil
            case .labs: return [.labResult]
            case .imaging: return [.imaging]
            case .visits: return [.visitNote, .diagnosis]
            case .medications: return [.prescription]
            }
        }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search and Filter
                VStack(spacing: 12) {
                    SearchBar(text: $searchText, placeholder: "Search records...")

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(RecordCategory.allCases, id: \.self) { category in
                                ChipButton(
                                    category.rawValue,
                                    isSelected: selectedCategory == category
                                ) {
                                    selectedCategory = category
                                }
                            }
                        }
                    }
                }
                .padding()

                // Content
                content
            }
            .background(Color.backgroundPrimary)
            .navigationTitle("Records")
            .refreshable {
                await viewModel.loadRecords()
            }
        }
        .task {
            await viewModel.loadRecords()
        }
    }

    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading {
            LoadingView()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else if filteredRecords.isEmpty {
            EmptyStateView(
                icon: "doc.text",
                title: "No Records Found",
                message: "Your medical records will appear here"
            )
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            ScrollView {
                LazyVStack(spacing: 16) {
                    ForEach(filteredRecords) { record in
                        RecordCard(record: record) {
                            viewModel.selectedRecord = record
                        }
                    }
                }
                .padding()
            }
        }
    }

    private var filteredRecords: [MedicalRecord] {
        var records = viewModel.records

        // Filter by category
        if let types = selectedCategory.recordTypes {
            records = records.filter { types.contains($0.recordType) }
        }

        // Filter by search
        if !searchText.isEmpty {
            records = records.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                ($0.description?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }

        return records
    }
}

// MARK: - Record Card

struct RecordCard: View {
    let record: MedicalRecord
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Icon
                Image(systemName: record.recordType.icon)
                    .font(.title2)
                    .foregroundColor(.healthPrimary)
                    .frame(width: 48, height: 48)
                    .background(
                        Circle()
                            .fill(Color.healthPrimary.opacity(0.1))
                    )

                // Content
                VStack(alignment: .leading, spacing: 4) {
                    Text(record.title)
                        .font(.titleSmall)
                        .foregroundColor(.textPrimary)
                        .lineLimit(1)

                    HStack(spacing: 8) {
                        Text(record.recordType.displayName)
                            .font(.captionMedium)
                            .foregroundColor(.textSecondary)

                        Text("•")
                            .foregroundColor(.textTertiary)

                        Text(record.formattedDate)
                            .font(.captionMedium)
                            .foregroundColor(.textTertiary)
                    }

                    if let provider = record.provider {
                        Text(provider.displayName)
                            .font(.captionMedium)
                            .foregroundColor(.textSecondary)
                    }
                }

                Spacer()

                // Chevron
                Image(systemName: "chevron.right")
                    .font(.captionLarge)
                    .foregroundColor(.textTertiary)
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.backgroundSecondary)
            )
        }
        .buttonStyle(.scale)
    }
}

// MARK: - Records View Model

@MainActor
class RecordsViewModel: ObservableObject {
    @Published var records: [MedicalRecord] = []
    @Published var medications: [Medication] = []
    @Published var allergies: [Allergy] = []
    @Published var isLoading = false
    @Published var error: Error?
    @Published var selectedRecord: MedicalRecord?

    private let apiClient = APIClient.shared

    func loadRecords() async {
        isLoading = true
        error = nil

        await withTaskGroup(of: Void.self) { group in
            group.addTask { await self.fetchRecords() }
            group.addTask { await self.fetchMedications() }
            group.addTask { await self.fetchAllergies() }
        }

        isLoading = false
    }

    private func fetchRecords() async {
        do {
            let response: PaginatedResponse<MedicalRecord> = try await apiClient.request(
                endpoint: .medicalRecords(limit: 100),
                responseType: PaginatedResponse<MedicalRecord>.self
            )
            records = response.data.sorted { $0.date > $1.date }
        } catch {
            print("Failed to load records: \(error)")
        }
    }

    private func fetchMedications() async {
        do {
            medications = try await apiClient.request(
                endpoint: .medications,
                responseType: [Medication].self
            )
        } catch {
            print("Failed to load medications: \(error)")
        }
    }

    private func fetchAllergies() async {
        do {
            allergies = try await apiClient.request(
                endpoint: .allergies,
                responseType: [Allergy].self
            )
        } catch {
            print("Failed to load allergies: \(error)")
        }
    }
}

// MARK: - Preview

#Preview {
    RecordsView()
}
