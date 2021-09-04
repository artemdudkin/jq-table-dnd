# table-dnd
Adds drag-n-drop for table rows or cells (3k minified zipped)

## API

### `window.setajax({url, data, method, headers, success, fail})`
jQuery-like ajax
### `ajax_p({url, data, method, headers})`
jQuery-like ajax (promisified)


### `window.setCallback(el, oldIndex, newIndex)`
Set "dnd-finished" callback function 
### `window.initAll()`
Reinitialize all, i.e. tables that have attributes "table-dnd-horz" or "table-dnd-vert")
(I use it after recreating all items, so it does not prevent initialization of element that was initialized before)
(also, it runs on DOMContentLoaded so you do not need to call it if you are not changing elements)