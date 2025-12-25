import Foundation

extension Date {

    // MARK: - Formatting

    var iso8601String: String {
        ISO8601DateFormatter().string(from: self)
    }

    func formatted(as format: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = format
        return formatter.string(from: self)
    }

    var shortDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter.string(from: self)
    }

    var mediumDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: self)
    }

    var longDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        return formatter.string(from: self)
    }

    var shortTime: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: self)
    }

    var relativeString: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }

    // MARK: - Comparisons

    var isToday: Bool {
        Calendar.current.isDateInToday(self)
    }

    var isTomorrow: Bool {
        Calendar.current.isDateInTomorrow(self)
    }

    var isYesterday: Bool {
        Calendar.current.isDateInYesterday(self)
    }

    var isThisWeek: Bool {
        Calendar.current.isDate(self, equalTo: Date(), toGranularity: .weekOfYear)
    }

    var isThisMonth: Bool {
        Calendar.current.isDate(self, equalTo: Date(), toGranularity: .month)
    }

    var isThisYear: Bool {
        Calendar.current.isDate(self, equalTo: Date(), toGranularity: .year)
    }

    var isPast: Bool {
        self < Date()
    }

    var isFuture: Bool {
        self > Date()
    }

    // MARK: - Components

    var year: Int {
        Calendar.current.component(.year, from: self)
    }

    var month: Int {
        Calendar.current.component(.month, from: self)
    }

    var day: Int {
        Calendar.current.component(.day, from: self)
    }

    var hour: Int {
        Calendar.current.component(.hour, from: self)
    }

    var minute: Int {
        Calendar.current.component(.minute, from: self)
    }

    var weekday: Int {
        Calendar.current.component(.weekday, from: self)
    }

    // MARK: - Modifications

    func adding(_ component: Calendar.Component, value: Int) -> Date {
        Calendar.current.date(byAdding: component, value: value, to: self) ?? self
    }

    var startOfDay: Date {
        Calendar.current.startOfDay(for: self)
    }

    var endOfDay: Date {
        var components = DateComponents()
        components.day = 1
        components.second = -1
        return Calendar.current.date(byAdding: components, to: startOfDay) ?? self
    }

    var startOfWeek: Date {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: self)
        return calendar.date(from: components) ?? self
    }

    var startOfMonth: Date {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.year, .month], from: self)
        return calendar.date(from: components) ?? self
    }

    // MARK: - Age Calculation

    func age() -> Int {
        Calendar.current.dateComponents([.year], from: self, to: Date()).year ?? 0
    }
}

// MARK: - Date Interval

extension Date {
    func timeInterval(to date: Date) -> TimeInterval {
        date.timeIntervalSince(self)
    }

    func minutes(to date: Date) -> Int {
        Int(timeInterval(to: date) / 60)
    }

    func hours(to date: Date) -> Int {
        Int(timeInterval(to: date) / 3600)
    }

    func days(to date: Date) -> Int {
        Int(timeInterval(to: date) / 86400)
    }
}
