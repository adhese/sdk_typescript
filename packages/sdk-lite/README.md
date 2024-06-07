# @adhese/sdk-lite
The Adhese SDK Lite is a lightweight version of the Adhese SDK. It is a smaller package that can only render a single
slot. This package is most useful for use in places like Google Tag Manager.

## Usage
To create a slot, you need to call the `createSlot` function with an object containing the account, location, and format.

The slot will be created alongside the script tag in which the function is called.

```html
<body>
  <div>
    <script src="adheseLite.js"></script>
    <script>
      AdheseLite.createSlot({
        account: 'your-account-id',
        location: 'location-name',
        format: 'format-name',
      })
    </script>
  </div>
</body>
```
