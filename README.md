# table-dnd
Adds drag-n-drop for table rows or cells (3k minified zipped)

## API

### `window.setCallback(el, oldIndex, newIndex)`
Set "dnd-finished" callback function 
### `window.initAll()`
Reinitialize all, i.e. tables that have attributes "table-dnd-horz" or "table-dnd-vert"). I use it after recreating all items, so it does not prevent initialization of element that was initialized before.

Also, it runs on DOMContentLoaded so you do not need to call it if you are not changing elements.

## Demo
Try it at test/table-dnd-vert.html
![](https://github.com/artemdudkin/table-dnd/blob/main/docs/demo.gif)

