# DayBuoy Sites runtime

This retained Sites/Vinext build wraps the existing beach without migrating its UI. The root build copies its exact static outputs into public/. The Worker handles only /api/results and delegates assets to the platform. Keep the sites() integration and this Site owner-private.

Run the root build with npm run build. Install this directory with the Sites dependency helper if dependencies are missing. Never place tokens in files. Set GITHUB_RESULTS_TOKEN as a hosted Sites secret.
