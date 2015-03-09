# AlignMe

A JavaScript utility which automatically aligns position of HTML elements.

![AlignMe](https://stackla-ui-kit.s3.amazonaws.com/AlignMe.png)

## Usage

```html
<script src="dist/align-me.min.js"></script>
```


```js
var alignMe = new AlignMe($overlay, {
    relateTo: '.draggable',
    constrainBy: '.parent',
    skipViewport: false
});
alignMe.align();
```

* `relateTo` Selector of element which you are going to align with. This one is required.
* `constrainBy` Selector of constrait element. Default is `null`.
* `skipViewport` Whether to ignore the viewport or not. Default is `false`.
