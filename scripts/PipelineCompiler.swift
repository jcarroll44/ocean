// Compile-only WebKit host. No simulated browser, Metal substitute or retries.
import AppKit
import WebKit

final class Compiler: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
    var webView: WKWebView!
    var window: NSWindow!
    var finished = false
    func finish(_ text: String, _ success: Bool) {
        guard !finished else { return }; finished = true
        try? text.write(toFile: CommandLine.arguments[2], atomically: true, encoding: .utf8)
        print(success ? "PASS: all Apple WebKit WGSL modules and pipelines" : "FAIL: Apple WebKit pipeline check; see report")
        exit(success ? 0 : 1)
    }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let text = message.body as? String,
              let data = text.data(using: .utf8),
              let report = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            finish("{\"passed\":false,\"errors\":[\"Invalid compiler result\"]}", false); return
        }
        finish(text, report["passed"] as? Bool == true)
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        finish("{\"passed\":false,\"errors\":[\"Compiler page failed to load\"]}", false)
    }
    func start() {
        let config = WKWebViewConfiguration()
        config.userContentController.add(self, name: "pipelineResult")
        webView = WKWebView(frame: NSRect(x: 0, y: 0, width: 400, height: 400), configuration: config)
        webView.navigationDelegate = self
        window = NSWindow(contentRect: webView.frame, styleMask: [.titled], backing: .buffered, defer: false)
        window.contentView = webView; window.makeKeyAndOrderFront(nil)
        webView.load(URLRequest(url: URL(string: CommandLine.arguments[1])!))
        DispatchQueue.main.asyncAfter(deadline: .now() + 300) {
            self.finish("{\"passed\":false,\"errors\":[\"Apple compiler timed out\"]}", false)
        }
    }
}
guard CommandLine.arguments.count == 3 else { fatalError("Usage: PipelineCompiler URL report.json") }
let application = NSApplication.shared
application.setActivationPolicy(.accessory)
let compiler = Compiler()
compiler.start()
application.run()
