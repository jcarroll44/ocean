import UIKit
import Capacitor
import WebKit
import WidgetKit

// Existing sun/hour detents now produce real iPhone feedback. No haptics in
// the rendering loop. The weak proxy avoids retaining the view controller.
private final class WeakHapticHandler: NSObject, WKScriptMessageHandler {
    weak var owner: DayBuoyViewController?
    init(_ owner: DayBuoyViewController) { self.owner = owner }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) { owner?.receiveHaptic(message) }
}
private final class WeakMembershipHandler: NSObject, WKScriptMessageHandler {
    weak var owner: DayBuoyViewController?
    init(_ owner: DayBuoyViewController) { self.owner = owner }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) { owner?.receiveMembership(message) }
}
class DayBuoyViewController: CAPBridgeViewController {
    private let selection = UISelectionFeedbackGenerator()
    private let impact = UIImpactFeedbackGenerator(style: .soft)
    private var lastHaptic: CFTimeInterval = 0
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        webView?.configuration.userContentController.add(WeakHapticHandler(self), name: "daybuoyHaptic")
        webView?.configuration.userContentController.add(WeakMembershipHandler(self), name: "daybuoyMembership")
        selection.prepare(); impact.prepare()
    }
    fileprivate func receiveMembership(_ message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, message.frameInfo.request.url?.host == "localhost",
              let body = message.body as? [String: Any], let expires = body["expires"] as? Double,
              let base = body["apiBaseURL"] as? String, let url = URL(string: base),
              url.scheme == "https", url.user == nil, url.password == nil, url.query == nil,
              let store = UserDefaults(suiteName: "group.com.jacobcarroll.daybuoy") else { return }
        store.set(expires / 1000, forKey: "plusExpires")
        store.set(base, forKey: "apiBaseURL")
        WidgetCenter.shared.reloadTimelines(ofKind: "DayBuoyConditions")
    }
    fileprivate func receiveHaptic(_ message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame,
              message.frameInfo.request.url?.host == "localhost",
              let body = message.body as? [String: Any], let kind = body["kind"] as? String,
              CACurrentMediaTime() - lastHaptic > 0.08 else { return }
        lastHaptic = CACurrentMediaTime()
        if kind == "moment" || kind == "boundary" { impact.impactOccurred(intensity: 0.55); impact.prepare() }
        else { selection.selectionChanged(); selection.prepare() }
    }
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
