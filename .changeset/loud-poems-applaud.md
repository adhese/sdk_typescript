---
"@adhese/sdk": minor
---

Allow users to only pass an element ID to the containingElement option when defining a slot.

#### Before

```javascript
const slot = adhese.defineSlot({
  containingElement: 'my-element-id',
  format: 'leaderboard',
});
```

Elements would require a class of `adunit` and a matching data attribute of `data-format` to be recognized as an Adhese
slot.
```html
<div id="my-element-id" class="adunit" data-format="leaderboard"></div>
```

#### After

```javascript
const slot = adhese.defineSlot({
  containingElement: 'my-element-id',
  format: 'leaderboard',
});
```

Elements now only require a matching ID to be recognized as an Adhese slot.
```html
<div id="my-element-id"></div>
```
