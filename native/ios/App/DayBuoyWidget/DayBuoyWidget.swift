import WidgetKit
import SwiftUI
import Foundation

private let groupID = "group.com.jacobcarroll.daybuoy"
private struct Row: Codable {
    let time: Double
    let temperature: Double?
    let wind: Double?
    let swell: Double?
    let cloud: Double?
    let weatherCode: Double?
}
private struct Profile: Codable { let name: String; let zone: String }
private struct Forecast: Codable {
    let schema: Int
    let retrievedAt: Double
    let source: String
    let weatherSource: String
    let profile: Profile
    let rows: [Row]
}
private enum ForecastStore {
    static var preferences: UserDefaults? { UserDefaults(suiteName: groupID) }
    static var expires: Date { Date(timeIntervalSince1970: preferences?.double(forKey: "plusExpires") ?? 0) }
    static var active: Bool { expires > Date() }
    static var cacheURL: URL? { FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: groupID)?.appendingPathComponent("widget-forecast.json") }
    static func cached() -> Forecast? {
        guard active, let url = cacheURL, let data = try? Data(contentsOf: url),
              let value = try? JSONDecoder().decode(Forecast.self, from: data),
              (-300000..<86400000).contains(Date().timeIntervalSince1970 * 1000 - value.retrievedAt) else { return nil }
        return value
    }
    static func fetch() async throws -> Forecast {
        guard active, let base = preferences?.string(forKey: "apiBaseURL"),
              let url = URL(string: base + "/api/forecast?beach=inlet-beach"), url.scheme == "https" else { throw URLError(.userAuthenticationRequired) }
        var request = URLRequest(url: url); request.timeoutInterval = 20
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else { throw URLError(.badServerResponse) }
        let value = try JSONDecoder().decode(Forecast.self, from: data)
        guard value.schema == 3, !value.rows.isEmpty, active else { throw URLError(.cannotParseResponse) }
        // The same shared hourly server response as the app. Never provider URLs.
        if let url = cacheURL { try? data.write(to: url, options: .atomic) }
        return value
    }
}
private struct BeachEntry: TimelineEntry {
    let date: Date
    let forecast: Forecast?
    let row: Row?
    let active: Bool
    let saved: Bool
}
private struct BeachProvider: TimelineProvider {
    func placeholder(in context: Context) -> BeachEntry { BeachEntry(date: Date(), forecast: nil, row: nil, active: true, saved: false) }
    func getSnapshot(in context: Context, completion: @escaping (BeachEntry) -> Void) {
        let value = ForecastStore.cached(), now = Date()
        completion(BeachEntry(date: now, forecast: value, row: value?.rows.last(where: { $0.time <= now.timeIntervalSince1970 * 1000 }), active: ForecastStore.active, saved: true))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<BeachEntry>) -> Void) {
        Task {
            let now = Date()
            guard ForecastStore.active else {
                completion(Timeline(entries: [BeachEntry(date: now, forecast: nil, row: nil, active: false, saved: false)], policy: .after(now.addingTimeInterval(3600))))
                return
            }
            let value: Forecast?
            let saved: Bool
            do { value = try await ForecastStore.fetch(); saved = value?.source != "live" }
            catch { value = ForecastStore.cached(); saved = true }
            let row = value?.rows.last(where: { $0.time <= now.timeIntervalSince1970 * 1000 })
            var entries = [BeachEntry(date: now, forecast: value, row: row, active: true, saved: saved)]
            if let value = value {
                for r in value.rows where r.time > now.timeIntervalSince1970 * 1000 && r.time < min((now.timeIntervalSince1970 + 21600) * 1000, ForecastStore.expires.timeIntervalSince1970 * 1000) {
                    entries.append(BeachEntry(date: Date(timeIntervalSince1970: r.time / 1000), forecast: value, row: r, active: true, saved: true))
                }
            }
            // Expired members never retain unlocked content in a cached timeline.
            entries.append(BeachEntry(date: ForecastStore.expires, forecast: nil, row: nil, active: false, saved: false))
            completion(Timeline(entries: entries.sorted { $0.date < $1.date }, policy: .after(now.addingTimeInterval(3600))))
        }
    }
}
private struct BeachView: View {
    var entry: BeachEntry
    @Environment(\.widgetFamily) var family
    private let ink = Color(red: 0.09, green: 0.22, blue: 0.30)
    private func stamp(_ time: Double, zone: String) -> String {
        let f = DateFormatter(); f.timeZone = TimeZone(identifier: zone); f.dateFormat = "MMM d, h:mm a"; return f.string(from: Date(timeIntervalSince1970: time / 1000))
    }
    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack { Text("DAYBUOY+").font(.system(size: 11, weight: .semibold, design: .rounded)); Spacer(); Image(systemName: "water.waves") }
            Text(entry.forecast?.profile.name ?? "Inlet Beach").font(.system(size: 12)).opacity(0.7)
            if !entry.active {
                Text("Your beach, at a glance.").font(.system(size: 20, weight: .light, design: .rounded))
                Text("Open DayBuoy+").font(.system(size: 11))
            } else if let r = entry.row, let f = entry.forecast {
                HStack(alignment: .firstTextBaseline) {
                    Text(r.temperature.map { "\(Int($0.rounded()))°" } ?? "—").font(.system(size: family == .systemSmall ? 34 : 40, weight: .light, design: .rounded))
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(r.swell.map { String(format: "%.1f ft est.", $0) } ?? "— ft")
                        Text(r.wind.map { "\(Int($0.rounded())) kt" } ?? "— kt")
                    }.font(.system(size: 12, weight: .medium))
                }
                Text((entry.saved ? "Saved · " : "Updated · ") + stamp(f.retrievedAt, zone: f.profile.zone)).font(.system(size: 9)).opacity(0.7)
                if f.weatherSource == "Apple Weather" {
                    Link(destination: URL(string: "https://weatherkit.apple.com/legal-attribution.html")!) {
                        HStack(spacing: 2) { Image(systemName: "apple.logo"); Text("Weather · Data sources") }.font(.system(size: 9))
                    }
                } else { Text(f.weatherSource + " · Open-Meteo Marine").font(.system(size: 8)).opacity(0.7) }
            } else {
                Text("Forecast unavailable").font(.system(size: 19, weight: .medium))
                Text("Tap to open the beach").font(.system(size: 11)).opacity(0.7)
            }
        }.foregroundStyle(ink)
        .containerBackground(for: .widget) { LinearGradient(colors: [Color(red: 0.92, green: 0.96, blue: 0.96), Color(red: 0.77, green: 0.87, blue: 0.89)], startPoint: .topLeading, endPoint: .bottomTrailing) }
        .widgetURL(URL(string: "daybuoy://now"))
    }
}
@main
struct DayBuoyWidget: Widget {
    let kind = "DayBuoyConditions"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: BeachProvider()) { entry in BeachView(entry: entry) }
            .configurationDisplayName("DayBuoy+ · Inlet Beach")
            .description("Hourly wave, wind and weather forecasts. Requires DayBuoy+.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}
