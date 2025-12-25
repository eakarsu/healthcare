import SwiftUI

struct MessagesView: View {
    @StateObject private var viewModel = MessagesViewModel()
    @State private var showNewMessage = false
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search
                SearchBar(text: $searchText, placeholder: "Search messages...")
                    .padding()

                // Content
                content
            }
            .background(Color.backgroundPrimary)
            .navigationTitle("Messages")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showNewMessage = true
                    } label: {
                        Image(systemName: "square.and.pencil")
                    }
                }
            }
            .sheet(isPresented: $showNewMessage) {
                NewMessageView { recipient, subject, body in
                    Task {
                        await viewModel.sendMessage(to: recipient, subject: subject, body: body)
                    }
                }
            }
            .refreshable {
                await viewModel.loadConversations()
            }
        }
        .task {
            await viewModel.loadConversations()
        }
    }

    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading {
            LoadingView()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else if filteredConversations.isEmpty {
            EmptyStateView(
                icon: "envelope",
                title: "No Messages",
                message: "Start a conversation with your healthcare provider",
                actionTitle: "New Message"
            ) {
                showNewMessage = true
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            List {
                ForEach(filteredConversations) { conversation in
                    NavigationLink {
                        ConversationView(conversation: conversation)
                    } label: {
                        ConversationRow(conversation: conversation)
                    }
                    .listRowBackground(
                        conversation.unreadCount > 0 ? Color.healthPrimary.opacity(0.05) : Color.clear
                    )
                }
                .onDelete { indexSet in
                    // Handle delete
                }
            }
            .listStyle(.plain)
        }
    }

    private var filteredConversations: [Conversation] {
        if searchText.isEmpty {
            return viewModel.conversations
        }
        return viewModel.conversations.filter {
            $0.displayName.localizedCaseInsensitiveContains(searchText) ||
            ($0.lastMessage?.preview.localizedCaseInsensitiveContains(searchText) ?? false)
        }
    }
}

// MARK: - Conversation Row

struct ConversationRow: View {
    let conversation: Conversation

    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            if let participant = conversation.otherParticipants.first {
                AvatarView(
                    initials: participant.initials,
                    imageUrl: participant.avatarUrl,
                    size: 48
                )
            }

            // Content
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(conversation.displayName)
                        .font(.titleSmall)
                        .foregroundColor(.textPrimary)
                        .fontWeight(conversation.unreadCount > 0 ? .semibold : .regular)

                    Spacer()

                    if let lastMessage = conversation.lastMessage {
                        Text(lastMessage.formattedDate)
                            .font(.captionMedium)
                            .foregroundColor(.textTertiary)
                    }
                }

                if let lastMessage = conversation.lastMessage {
                    Text(lastMessage.preview)
                        .font(.bodySmall)
                        .foregroundColor(.textSecondary)
                        .lineLimit(2)
                }
            }

            // Badge
            if conversation.unreadCount > 0 {
                Badge(count: conversation.unreadCount)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Conversation View

struct ConversationView: View {
    let conversation: Conversation
    @StateObject private var viewModel = ConversationDetailViewModel()
    @State private var messageText = ""

    var body: some View {
        VStack(spacing: 0) {
            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(viewModel.messages) { message in
                            MessageBubble(message: message, isFromCurrentUser: isFromCurrentUser(message))
                                .id(message.id)
                        }
                    }
                    .padding()
                }
                .onChange(of: viewModel.messages.count) { _, _ in
                    if let lastMessage = viewModel.messages.last {
                        withAnimation {
                            proxy.scrollTo(lastMessage.id, anchor: .bottom)
                        }
                    }
                }
            }

            // Input
            messageInput
        }
        .navigationTitle(conversation.displayName)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadMessages(conversationId: conversation.id)
        }
    }

    private var messageInput: some View {
        HStack(spacing: 12) {
            TextField("Type a message...", text: $messageText, axis: .vertical)
                .textFieldStyle(.plain)
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 24)
                        .fill(Color.backgroundSecondary)
                )
                .lineLimit(1...5)

            Button {
                Task {
                    await sendMessage()
                }
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(messageText.isEmpty ? .textTertiary : .healthPrimary)
            }
            .disabled(messageText.isEmpty)
        }
        .padding()
        .background(Color.backgroundPrimary)
    }

    private func isFromCurrentUser(_ message: Message) -> Bool {
        // In real implementation, compare with current user ID
        message.senderId != conversation.otherParticipants.first?.id
    }

    private func sendMessage() async {
        guard !messageText.isEmpty else { return }
        let text = messageText
        messageText = ""

        if let recipient = conversation.otherParticipants.first {
            await viewModel.sendMessage(
                conversationId: conversation.id,
                recipientId: recipient.id,
                body: text
            )
        }
    }
}

// MARK: - Message Bubble

struct MessageBubble: View {
    let message: Message
    let isFromCurrentUser: Bool

    var body: some View {
        HStack {
            if isFromCurrentUser { Spacer() }

            VStack(alignment: isFromCurrentUser ? .trailing : .leading, spacing: 4) {
                Text(message.body)
                    .font(.bodyMedium)
                    .foregroundColor(isFromCurrentUser ? .white : .textPrimary)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 18)
                            .fill(isFromCurrentUser ? Color.healthPrimary : Color.backgroundSecondary)
                    )

                Text(message.formattedDate)
                    .font(.captionSmall)
                    .foregroundColor(.textTertiary)
            }

            if !isFromCurrentUser { Spacer() }
        }
    }
}

// MARK: - New Message View

struct NewMessageView: View {
    @Environment(\.dismiss) private var dismiss
    let onSend: (User, String?, String) -> Void

    @StateObject private var viewModel = NewMessageViewModel()
    @State private var subject = ""
    @State private var body = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("To") {
                    if viewModel.isLoadingProviders {
                        ProgressView()
                    } else {
                        ForEach(viewModel.providers) { provider in
                            Button {
                                if let user = provider.user {
                                    viewModel.selectedRecipient = user
                                }
                            } label: {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(provider.displayName)
                                            .foregroundColor(.textPrimary)
                                        Text(provider.specialty)
                                            .font(.captionMedium)
                                            .foregroundColor(.textSecondary)
                                    }

                                    Spacer()

                                    if viewModel.selectedRecipient?.id == provider.userId {
                                        Image(systemName: "checkmark")
                                            .foregroundColor(.healthPrimary)
                                    }
                                }
                            }
                        }
                    }
                }

                Section("Subject (Optional)") {
                    TextField("Subject", text: $subject)
                }

                Section("Message") {
                    TextEditor(text: $body)
                        .frame(minHeight: 150)
                }
            }
            .navigationTitle("New Message")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Send") {
                        if let recipient = viewModel.selectedRecipient {
                            onSend(recipient, subject.isEmpty ? nil : subject, body)
                            dismiss()
                        }
                    }
                    .disabled(viewModel.selectedRecipient == nil || body.isEmpty)
                }
            }
        }
        .task {
            await viewModel.loadProviders()
        }
    }
}

// MARK: - View Models

@MainActor
class MessagesViewModel: ObservableObject {
    @Published var conversations: [Conversation] = []
    @Published var isLoading = false
    @Published var error: Error?

    private let apiClient = APIClient.shared

    func loadConversations() async {
        isLoading = true
        do {
            let response: PaginatedResponse<Conversation> = try await apiClient.request(
                endpoint: .conversations(),
                responseType: PaginatedResponse<Conversation>.self
            )
            conversations = response.data
        } catch {
            self.error = error
        }
        isLoading = false
    }

    func sendMessage(to recipient: User, subject: String?, body: String) async {
        let request = SendMessageRequest(
            recipientId: recipient.id,
            subject: subject,
            body: body,
            conversationId: nil
        )

        do {
            let _: Message = try await apiClient.request(
                endpoint: .sendMessage(request),
                responseType: Message.self
            )
            await loadConversations()
        } catch {
            print("Failed to send message: \(error)")
        }
    }
}

@MainActor
class ConversationDetailViewModel: ObservableObject {
    @Published var messages: [Message] = []
    @Published var isLoading = false

    private let apiClient = APIClient.shared

    func loadMessages(conversationId: String) async {
        isLoading = true
        do {
            let response: PaginatedResponse<Message> = try await apiClient.request(
                endpoint: .messages(conversationId: conversationId),
                responseType: PaginatedResponse<Message>.self
            )
            messages = response.data.reversed()
        } catch {
            print("Failed to load messages: \(error)")
        }
        isLoading = false
    }

    func sendMessage(conversationId: String, recipientId: String, body: String) async {
        let request = SendMessageRequest(
            recipientId: recipientId,
            subject: nil,
            body: body,
            conversationId: conversationId
        )

        do {
            let message: Message = try await apiClient.request(
                endpoint: .sendMessage(request),
                responseType: Message.self
            )
            messages.append(message)
        } catch {
            print("Failed to send message: \(error)")
        }
    }
}

@MainActor
class NewMessageViewModel: ObservableObject {
    @Published var providers: [Provider] = []
    @Published var selectedRecipient: User?
    @Published var isLoadingProviders = false

    private let apiClient = APIClient.shared

    func loadProviders() async {
        isLoadingProviders = true
        do {
            providers = try await apiClient.request(
                endpoint: .providers,
                responseType: [Provider].self
            )
        } catch {
            print("Failed to load providers: \(error)")
        }
        isLoadingProviders = false
    }
}

// MARK: - Preview

#Preview {
    MessagesView()
}
