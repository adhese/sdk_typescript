# Devtools

The SDK offers a inline application to debug the Adhese instance. The Devtools is available whenever the SDK is in
`debug` mode.

> [!NOTE]
> Enable `debug` mode by setting the `debug` property to `true` in the `createAdhese` function or by adding
> `?adhese_debug=true` to the URL.

Whenever the `debug` mode is enabled, the Devtools is available by clicking the button `Open Adhese Devtools` in the
bottom right corner of the page.

## Features
### Inspect slots
The Devtools allows you to inspect the added slots on the page. It shows the following information:
- Slot name
- Format
- Location
- Render status
- Campaign ID
- Booking ID
- Creative ID
- Tracking ID
- Creative type
- Viewability tracked
- Impression tracked
- Element

### Logs
The Devtools logs all messages from the SDK. These logs are also available in the browser console.
