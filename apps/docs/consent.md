# Consent

Consent from the user for tracking purposes is a fundamental part of the [GDPR](https://gdpr-info.eu/) and
[CCPA](https://oag.ca.gov/privacy/ccpa) regulations.

To make sure that the Adhese SDK is compliant with these regulations, we have implemented a mechanism that allows you to
pass consent information to the SDK. This information is then used to determine what kind of tracking is allowed and
what kind of ads can be shown to the user.

There are two types of consent that can be passed to the SDK:

## Binary consent
Binary consent is the simplest form of consent. It is either given or not given. When you're creating the Adhese
instance you can pass the `consent` option to the `createAdhese` function:

```js{3}
const adhese = await createAdhese({
  account: 'your-account-id',
  consent: 'all', // 'none' is default
});
```

## TCF API consent
The TCF API consent is a more complex form of consent. It allows you to pass consent information for different vendors
and purposes. This is the consent format that is used by the
[IAB Transparency and Consent Framework](https://iabeurope.eu/transparency-consent-framework/).

When using the TCF API consent you don't need to do anything. The SDK will automatically detect the presence of the TCF
API and listen to changes.

> [!NOTE]
> Currently, the Adhese SDK relies on v2 of the TCF API. If you're using another version you need to pass consent
> information manually.

## Consent changes
When consent changes, the SDK will automatically reload all slots on the page. This is done to make sure that the
consent information is passed to the ad server and that the correct ads are shown to the user.
