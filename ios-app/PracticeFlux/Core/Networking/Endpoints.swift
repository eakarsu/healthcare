import Foundation

// MARK: - API Endpoints

extension Endpoint {

    // MARK: - Auth Endpoints

    static func login(email: String, password: String) -> Endpoint {
        Endpoint(
            path: "/auth/login",
            method: .post,
            body: LoginRequest(email: email, password: password),
            requiresAuth: false
        )
    }

    static func refreshToken(_ token: String) -> Endpoint {
        Endpoint(
            path: "/auth/refresh",
            method: .post,
            body: RefreshTokenRequest(refreshToken: token),
            requiresAuth: false
        )
    }

    static var logout: Endpoint {
        Endpoint(path: "/auth/logout", method: .post)
    }

    static var currentUser: Endpoint {
        Endpoint(path: "/auth/me")
    }

    static func updateProfile(_ user: User) -> Endpoint {
        Endpoint(
            path: "/auth/profile",
            method: .put,
            body: user
        )
    }

    static func changePassword(currentPassword: String, newPassword: String) -> Endpoint {
        Endpoint(
            path: "/auth/change-password",
            method: .post,
            body: ["current_password": currentPassword, "new_password": newPassword]
        )
    }

    // MARK: - Appointment Endpoints

    static func appointments(
        status: AppointmentStatus? = nil,
        startDate: Date? = nil,
        endDate: Date? = nil,
        page: Int = 1,
        limit: Int = 20
    ) -> Endpoint {
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "page", value: String(page)),
            URLQueryItem(name: "limit", value: String(limit))
        ]

        if let status = status {
            queryItems.append(URLQueryItem(name: "status", value: status.rawValue))
        }

        let formatter = ISO8601DateFormatter()
        if let startDate = startDate {
            queryItems.append(URLQueryItem(name: "start_date", value: formatter.string(from: startDate)))
        }
        if let endDate = endDate {
            queryItems.append(URLQueryItem(name: "end_date", value: formatter.string(from: endDate)))
        }

        return Endpoint(
            path: "/appointments",
            queryItems: queryItems
        )
    }

    static func appointment(id: String) -> Endpoint {
        Endpoint(path: "/appointments/\(id)")
    }

    static func createAppointment(_ request: CreateAppointmentRequest) -> Endpoint {
        Endpoint(
            path: "/appointments",
            method: .post,
            body: request
        )
    }

    static func rescheduleAppointment(id: String, request: RescheduleAppointmentRequest) -> Endpoint {
        Endpoint(
            path: "/appointments/\(id)/reschedule",
            method: .put,
            body: request
        )
    }

    static func cancelAppointment(id: String, reason: String?) -> Endpoint {
        Endpoint(
            path: "/appointments/\(id)/cancel",
            method: .post,
            body: reason.map { ["reason": $0] }
        )
    }

    static func confirmAppointment(id: String) -> Endpoint {
        Endpoint(
            path: "/appointments/\(id)/confirm",
            method: .post
        )
    }

    static var providers: Endpoint {
        Endpoint(path: "/providers")
    }

    static var locations: Endpoint {
        Endpoint(path: "/locations")
    }

    static func availableSlots(providerId: String, date: Date) -> Endpoint {
        let formatter = ISO8601DateFormatter()
        return Endpoint(
            path: "/providers/\(providerId)/availability",
            queryItems: [URLQueryItem(name: "date", value: formatter.string(from: date))]
        )
    }

    // MARK: - Medical Records Endpoints

    static func medicalRecords(
        type: RecordType? = nil,
        page: Int = 1,
        limit: Int = 20
    ) -> Endpoint {
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "page", value: String(page)),
            URLQueryItem(name: "limit", value: String(limit))
        ]

        if let type = type {
            queryItems.append(URLQueryItem(name: "type", value: type.rawValue))
        }

        return Endpoint(
            path: "/medical-records",
            queryItems: queryItems
        )
    }

    static func medicalRecord(id: String) -> Endpoint {
        Endpoint(path: "/medical-records/\(id)")
    }

    static var medications: Endpoint {
        Endpoint(path: "/medications")
    }

    static func medication(id: String) -> Endpoint {
        Endpoint(path: "/medications/\(id)")
    }

    static var allergies: Endpoint {
        Endpoint(path: "/allergies")
    }

    static var vitalSigns: Endpoint {
        Endpoint(path: "/vitals")
    }

    static func latestVitals: Endpoint {
        Endpoint(path: "/vitals/latest")
    }

    // MARK: - Messages Endpoints

    static func conversations(page: Int = 1, limit: Int = 20) -> Endpoint {
        Endpoint(
            path: "/messages/conversations",
            queryItems: [
                URLQueryItem(name: "page", value: String(page)),
                URLQueryItem(name: "limit", value: String(limit))
            ]
        )
    }

    static func conversation(id: String) -> Endpoint {
        Endpoint(path: "/messages/conversations/\(id)")
    }

    static func messages(conversationId: String, page: Int = 1, limit: Int = 50) -> Endpoint {
        Endpoint(
            path: "/messages/conversations/\(conversationId)/messages",
            queryItems: [
                URLQueryItem(name: "page", value: String(page)),
                URLQueryItem(name: "limit", value: String(limit))
            ]
        )
    }

    static func sendMessage(_ request: SendMessageRequest) -> Endpoint {
        Endpoint(
            path: "/messages",
            method: .post,
            body: request
        )
    }

    static func markAsRead(_ request: MarkAsReadRequest) -> Endpoint {
        Endpoint(
            path: "/messages/read",
            method: .post,
            body: request
        )
    }

    static var unreadCount: Endpoint {
        Endpoint(path: "/messages/unread-count")
    }

    // MARK: - Payments Endpoints

    static func invoices(
        status: InvoiceStatus? = nil,
        page: Int = 1,
        limit: Int = 20
    ) -> Endpoint {
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "page", value: String(page)),
            URLQueryItem(name: "limit", value: String(limit))
        ]

        if let status = status {
            queryItems.append(URLQueryItem(name: "status", value: status.rawValue))
        }

        return Endpoint(
            path: "/invoices",
            queryItems: queryItems
        )
    }

    static func invoice(id: String) -> Endpoint {
        Endpoint(path: "/invoices/\(id)")
    }

    static func payments(page: Int = 1, limit: Int = 20) -> Endpoint {
        Endpoint(
            path: "/payments",
            queryItems: [
                URLQueryItem(name: "page", value: String(page)),
                URLQueryItem(name: "limit", value: String(limit))
            ]
        )
    }

    static func processPayment(_ request: ProcessPaymentRequest) -> Endpoint {
        Endpoint(
            path: "/payments",
            method: .post,
            body: request
        )
    }

    static var paymentMethods: Endpoint {
        Endpoint(path: "/payment-methods")
    }

    static func deletePaymentMethod(id: String) -> Endpoint {
        Endpoint(
            path: "/payment-methods/\(id)",
            method: .delete
        )
    }

    static func setDefaultPaymentMethod(id: String) -> Endpoint {
        Endpoint(
            path: "/payment-methods/\(id)/default",
            method: .post
        )
    }

    static var insurance: Endpoint {
        Endpoint(path: "/insurance")
    }

    // MARK: - Notifications Endpoints

    static func notifications(page: Int = 1, limit: Int = 20) -> Endpoint {
        Endpoint(
            path: "/notifications",
            queryItems: [
                URLQueryItem(name: "page", value: String(page)),
                URLQueryItem(name: "limit", value: String(limit))
            ]
        )
    }

    static func markNotificationRead(id: String) -> Endpoint {
        Endpoint(
            path: "/notifications/\(id)/read",
            method: .post
        )
    }

    static var markAllNotificationsRead: Endpoint {
        Endpoint(
            path: "/notifications/read-all",
            method: .post
        )
    }

    static func registerPushToken(_ token: String) -> Endpoint {
        Endpoint(
            path: "/notifications/push-token",
            method: .post,
            body: ["token": token, "platform": "ios"]
        )
    }
}
