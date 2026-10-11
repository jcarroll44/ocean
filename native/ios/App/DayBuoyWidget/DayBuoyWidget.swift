import WidgetKit
import SwiftUI
import Foundation

private struct Conditions: Codable {
    let forecastAt: Date
    let fetchedAt: Date
    let temperature: Double
    let wind: Double
    let waves: Double
    let clouds: Double
    let code: Double
    var description: String {
        if code >= 95 { return "Thunderstorms" }
        if code == 45 || code == 48 { return "Fog" }
        if code >= 51 { return "Showers" }
        if clouds >= 85 { return "Overcast" }
        if clouds >= 60 { return "Mostly cloudy" }
        if clouds >= 25 { return "Partly cloudy" }
        if clouds >= 10 { return "Mostly clear" }
        return "Clear skies"
    }
}
private struct Weather: Decodable {
    struct Hourly: Decodable { let time: [Double]; let temperature_2m: [Double?]; let wind_speed_10m: [Double?]; let cloud_cover: [Double?]; let weather_code: [Double?] }
    let hourly: Hourly
    let hourly_units: [String: String]
}
private struct Marine: Decodable {
    struct Hourly: Decodable { let time: [Double]; let wave_height: [Double?] }
    let hourly: Hourly
    let hourly_units: [String: String]
}
private enum ForecastStore {
    static var cacheURL: URL { FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0].appendingPathComponent("daybuoy-widget.json") }
    static func cached() -> Conditions? {
        guard let data = try? Data(contentsOf: cacheURL), let value = try? JSONDecoder().decode(Conditions.self, from: data), (-300..<86400).contains(Date().timeIntervalSince(value.fetchedAt)) else { return nil }
        return value
    }
    static func request<T: Decodable>(_ url: String, as type: T.Type) async throws -> T {
        var request = URLRequest(url: URL(string: url)!)
        request.timeoutInterval = 10
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else { throw URLError(.badServerResponse) }
        return try JSONDecoder().decode(type, from: data)
    }
    static func fetch() async throws -> Conditions {
        async let weather = request("https://api.open-meteo.com/v1/forecast?latitude=30.274&longitude=-85.998&hourly=temperature_2m,wind_speed_10m,cloud_cover,weather_code&temperature_unit=fahrenheit&wind_speed_unit=kn&timeformat=unixtime&forecast_days=2", as: Weather.self)
        async let marine = request("https://marine-api.open-meteo.com/v1/marine?latitude=30.24&longitude=-86.0&hourly=wave_height&cell_selection=sea&timeformat=unixtime&forecast_days=2", as: Marine.self)
        let (w, m) = try await (weather, marine)
        let now = Date()
        guard w.hourly_units["time"] == "unixtime", w.hourly_units["temperature_2m"] == "°F",
              w.hourly_units["wind_speed_10m"] == "kn", w.hourly_units["cloud_cover"] == "%",
              m.hourly_units["time"] == "unixtime", m.hourly_units["wave_height"] == "m" else { throw URLError(.cannotParseResponse) }
        func sample(_ times: [Double], _ values: [Double?], categorical: Bool = false) -> Double? {
            let time = now.timeIntervalSince1970
            guard let i = times.lastIndex(where: { $0 <= time }), i + 1 < times.count,
                  i + 1 < values.count, times[i + 1] > times[i], times[i + 1] - times[i] <= 3600,
                  let a = values[i], let b = values[i + 1], a.isFinite, b.isFinite else { return nil }
            let f = (time - times[i]) / (times[i + 1] - times[i])
            guard (0...1).contains(f) else { return nil }
            return categorical ? (f < 0.5 ? a : b) : a + (b - a) * f
        }
        guard let t = sample(w.hourly.time, w.hourly.temperature_2m),
              let wind = sample(w.hourly.time, w.hourly.wind_speed_10m),
              let clouds = sample(w.hourly.time, w.hourly.cloud_cover),
              let code = sample(w.hourly.time, w.hourly.weather_code, categorical: true),
              let waves = sample(m.hourly.time, m.hourly.wave_height),
              [t, wind, clouds, code, waves].allSatisfy({ $0.isFinite }), wind >= 0, waves >= 0 else { throw URLError(.cannotParseResponse) }
        let value = Conditions(forecastAt: now, fetchedAt: now, temperature: t, wind: wind, waves: waves * 3.280839895, clouds: clouds, code: code)
        if let data = try? JSONEncoder().encode(value) { try? data.write(to: cacheURL, options: .atomic) }
        return value
    }
}
private struct BeachEntry: TimelineEntry {
    let date: Date
    let conditions: Conditions?
    let saved: Bool
}
private struct BeachProvider: TimelineProvider {
    func placeholder(in context: Context) -> BeachEntry { BeachEntry(date: Date(), conditions: nil, saved: false) }
    func getSnapshot(in context: Context, completion: @escaping (BeachEntry) -> Void) { completion(BeachEntry(date: Date(), conditions: ForecastStore.cached(), saved: true)) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<BeachEntry>) -> Void) {
        Task {
            let now = Date()
            let value: Conditions?
            let saved: Bool
            do { value = try await ForecastStore.fetch(); saved = false }
            catch { value = ForecastStore.cached(); saved = true }
            // iOS owns reload timing. Mark old values even if a reload is delayed.
            let staleAt = max(now.addingTimeInterval(60), (value?.forecastAt ?? now).addingTimeInterval(7200))
            let entries = [BeachEntry(date: now, conditions: value, saved: saved), BeachEntry(date: staleAt, conditions: value, saved: true), BeachEntry(date: now.addingTimeInterval(86400), conditions: nil, saved: true)]
            completion(Timeline(entries: entries, policy: .after(now.addingTimeInterval(1800))))
        }
    }
}
private struct BeachView: View {
    var entry: BeachEntry
    @Environment(\.widgetFamily) var family
    private let ink = Color(red: 0.09, green: 0.22, blue: 0.30)
    private func stamp(_ date: Date) -> String {
        let f = DateFormatter(); f.timeZone = TimeZone(identifier: "America/Chicago"); f.dateFormat = "MMM d, h:mm a z"; return f.string(from: date)
    }
    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack { Text("DAYBUOY").font(.system(size: 11, weight: .semibold, design: .rounded)); Spacer(); Image(systemName: "water.waves") }
            Text("Inlet Beach").font(.system(size: 12)).opacity(0.7)
            if let c = entry.conditions {
                HStack(alignment: .firstTextBaseline) {
                    Text("\(Int(c.temperature.rounded()))°").font(.system(size: family == .systemSmall ? 34 : 40, weight: .light, design: .rounded))
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(String(format: "%.1f ft", c.waves))
                        Text("\(Int(c.wind.rounded())) kt")
                    }.font(.system(size: 13, weight: .medium))
                }
                Text(c.description).font(.system(size: 12)).lineLimit(1).minimumScaleFactor(0.8)
                Text((entry.saved ? "Saved · " : "Updated · ") + stamp(c.fetchedAt)).font(.system(size: 9)).opacity(0.7).lineLimit(2)
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
            .configurationDisplayName("Inlet Beach")
            .description("Wave, wind and sky forecasts, with the last update time.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}
