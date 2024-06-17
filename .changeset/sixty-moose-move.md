---
"@adhese/sdk-react": patch
---

Make passing of options optional to `AdheseProvider`, this will not initialize the SDK but will create the context
provider. You can, for example, use this to dynamically import plugins first before creating the SDK. See
`apps/react-example` for an example.
