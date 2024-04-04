# Consent

User consent for tracking is a crucial aspect of the [GDPR](https://gdpr-info.eu/) and
[CCPA](https://oag.ca.gov/privacy/ccpa) regulations. The Adhese SDK ensures compliance with these regulations by
incorporating a mechanism to receive consent information. This information guides the type of tracking and ads that can
be displayed to the user.

There are two types of consent that the SDK can receive:

## Binary consent
Binary consent is a straightforward form of consent. It is either granted or not. When creating the Adhese instance, you
can pass the `consent` option to the `createAdhese` function:

```js{3}
const adhese = createAdhese({
  account: 'your-account-id',
  consent: true, // `false` is default
});
```

If the `consent` option is `true`, the SDK signals the ad server that the user has granted consent by setting the `tl`
parameter to `all` in the ad request. If the `consent` option is `false`, the `tl` parameter is set to `none`.

## TCF API consent
TCF API consent is a more complex form of consent. It allows for passing consent information for various vendors and
purposes. This consent format is used by the
[IAB Transparency and Consent Framework](https://iabeurope.eu/transparency-consent-framework/).

With TCF API consent, the SDK automatically detects the presence of the TCF API and listens for changes.

> [!WARNING]
> The Adhese SDK currently supports v2 of the TCF API. If you're using a different version, you need to manually pass
> consent information using the consent option or by adding the tcString to the xt parameter.

The response from the TCF API is set as the `xt` parameter in the ad request.

> [!NOTE]
> When using TCF API consent, the consent option is disregarded. Also, the tl parameter is not included in the ad
> request.

## Consent changes

When consent changes, the SDK automatically reloads all slots on the page. This ensures that the updated consent
information is passed to the ad server and the appropriate ads are displayed to the user.
