# jq-table-dnd
Adds drag-n-drop for table rows or cells (1.8k minified zipped). Requires jq-min (3k minified zipped).

## Usage

Just add attribute "table-dnd-vert" or "table-dnd-horz" to table tag (look at "test" folder for examples).

## API

### `window.setCallback(el, oldIndex, newIndex)`
Set "dnd-finished" callback function 
### `window.initAll()`
Reinitialize all, i.e. tables that have attributes "table-dnd-horz" or "table-dnd-vert". I use it after recreating all items, so it does not prevent initialization of element that was initialized before.

Also, it runs on DOMContentLoaded so you do not need to call it if you are not changing elements after page load.

## Demo
Try it at test/table-dnd-vert.html

![](https://github.com/artemdudkin/table-dnd/blob/main/docs/demo.gif)

## Downsides
Row leaves parent during dnd and therefor can loose style (if it was bound to css path that includes parent node)


