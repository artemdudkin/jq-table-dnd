/**
 *
 * Requires jq-min (i.e. +2k)
 *
 * @returns
 *
 *   window.setCallback = set "dnd-finished" callback function (el, oldIndex, newIndex)
 *
 *   window.initAll = reinitialize all, i.e. tables that have attributes "table-dnd-horz" or "table-dnd-vert")
 *                    (I use it after recreating all items, so it does not prevent initialization of element that was initialized before)
 *                    (also, it runs on DOMContentLoaded so you do not need to call it if you are not changing elements)
 *
 */
(function(){

  //
  // Get absolute position of element
  // https://stackoverflow.com/questions/18452332/get-real-position-of-an-html-element-in-pure-javascript
  //
  function isWindow( obj ) {
    return obj != null && obj === obj.window;
  }
  function getWindow( elem ) {
    return isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
  }
  function get_offset( elem ) {
    var docElem, win,
        box = { top: 0, left: 0 },
        doc = elem && elem.ownerDocument;

    docElem = doc.documentElement;

    if ( typeof elem.getBoundingClientRect !== typeof undefined ) {
        box = elem.getBoundingClientRect();
    }
    win = getWindow( doc );
    return {
        top: box.top + win.pageYOffset - docElem.clientTop,
        left: box.left + win.pageXOffset - docElem.clientLeft
    };
  }

  //
  // Find parent with specified tag name
  //
  function findParentTag( el, tagName) {
    tagName = tagName.toUpperCase();
    while (el.parentNode && el.tagName.toUpperCase() !== tagName) el = el.parentNode;
    return (el.tagName.toUpperCase() === tagName ? el : undefined)
  }

  //
  // Find parent that equals to one of hmtl element from specified array
  //
  function findParentFromArray( el, arr) {
    while (el.parentNode && arr.indexOf(el) === -1) el = el.parentNode;
    return el;
  }



  var dndStart;
  var dndTRPlaceHolder = $('<tr class="table-dnd-placeholder"><td style="border:2px dashed grey;"><div></div></td><tr>')[0];
  var dndTDPlaceHolder = $('<td class="table-dnd-placeholder" style="border:2px dashed grey;"><div></div></td>')[0];
  var dndContainer = $('<table class="table-dnd-container" cellSpacing="0" cellPadding="0" style="z-index:10;position:absolute; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;"><tbody class="table-dnd-tbody"></tbody></table>')[0];
  
  function initAll() {
    $('[table-dnd-horz]>tbody>tr:first-child>td, [table-dnd-vert]>tbody>tr').forEach( el => {
      init(el);
    })
  }

  function init(itm) {
      let tbl = findParentTag(itm, 'table');
      let tblDndType = tbl.hasAttribute('table-dnd-horz') ? 1 : 0; // 0=vert, 1=horz
      let tblBorderSpacing = Number.parseInt( window.getComputedStyle(tbl).getPropertyValue('border-spacing').split(' ')[0]);

      // all elements that can be moved
      let all = (tblDndType === 0 ? 
          tbl.children[0].children               // all trs
        : tbl.children[0].children[0].children); // all tds at the first tr
      all = Array.prototype.map.call( all, el => el);

      $(itm)
        .mousedown( event => {
          // only ctrl-click
          if (!event.ctrlKey) return;

          event.stopPropagation();

          let td = findParentFromArray( event.target, all);
          if (tblDndType === 0) td = td.children[0]; //should be TD

          let tdPadding = Number.parseInt( window.getComputedStyle(td).getPropertyValue('padding'));
          let tdBorderWidth = Number.parseInt( window.getComputedStyle(td).getPropertyValue('border-width'));

          let selected = (tblDndType === 0 ? td.parentNode : td); 
          let selectedIndex = (tblDndType === 0 ? selected.rowIndex : selected.cellIndex);

          let {top, left} = get_offset(selected);
          let {width:w, height:h} = selected.getBoundingClientRect();

          let tbl = findParentTag(selected, 'table');

          // set placeholder size
          var dndPlaceHolder = (tblDndType === 0 ? dndTRPlaceHolder : dndTDPlaceHolder);
          let pl = $('div', dndPlaceHolder)[0];
          pl.style.width = w-2*tdPadding-4;
          pl.style.height = h-2*tdPadding-4;

          // set container size
          dndContainer.style.top = top + tdPadding;
          dndContainer.style.left = left + tdPadding;
          dndContainer.style.width = w;

          // put placeholder on elements place, then put element at container
          selected.replaceWith( dndPlaceHolder);
          $('tbody', dndContainer)[0].appendChild(selected);
          dndContainer.setAttribute("cellpadding", tdPadding);
          $('body')[0].appendChild( dndContainer);

          dndStart = {
            mouse: {startX:event.clientX, startY:event.clientY}, // start cursor position
            el: {startX:left, startY:top, w, h}, // start element position
            all: all.filter(el => el !== itm), // all ecept placeholder
            ph : dndPlaceHolder, // placeholder
            index: selectedIndex, // start index
            type: tblDndType, // 0=vert dnd, 1=horz dnd
           }
        });
  }

  function initHandlers() {
        $('body')
        .mousemove( event => {
          if (dndStart) {
            event.stopPropagation();

            //moving container with element
            var x = dndStart.el.startX + (event.clientX - dndStart.mouse.startX);
            var y = dndStart.el.startY + (event.clientY - dndStart.mouse.startY);
            dndContainer.style.top = y;
            dndContainer.style.left = x;

            //find element with which we need to swap places (the placeholder takes its place)
            let {top:dndStart_el_y, left:dndStart_el_x} = get_offset(dndStart.ph);
            dndStart.all.forEach( (el, index) => {
              let {top, left} = get_offset(el);
              let w = el.offsetWidth;
              let h = el.offsetHeight;
              if (dndStart.type === 0) { // vert dnd
                if ( (x >= left && x <= left+w) || (x+dndStart.el.w >= left && x+dndStart.el.w <= left+w)) {
                  let {top:dndStart_el_y} = get_offset(dndStart.ph);
                  if ( dndStart_el_y < top && y + dndStart.el.h > top + h/2) { //from top to bottom
                    dndStart.ph.before(el);
                  } else if ( dndStart_el_y > top && y < top + h/2) { //from bottom to top
                    dndStart.ph.after(el);
                  }
                }
              } else { // horz dnd
                if ( (y >= top && y <= top+h) || (y+dndStart.el.h >= top && y+dndStart.el.h <= top+h)) {
                  if ( dndStart_el_x < left && x + dndStart.el.w > left + w/2) {
                    el.replaceWith( dndStart.ph);
                    dndStart.ph.before(el);
                  } else if ( dndStart_el_x > left && x < left + w/2) {
                    dndStart.ph.after(el);
                  }
                }
              }
            })
          }
        })
        .mouseup( event => {
          if (dndStart) {
            event.stopPropagation();

            var dndPlaceHolder = (dndStart.type === 0 ? dndTRPlaceHolder : dndTDPlaceHolder);
            let newIndex = (dndStart.type === 0 ? dndPlaceHolder.rowIndex : dndPlaceHolder.cellIndex);

            // get element from container and put it instead of placeholder
            let el = dndContainer.children[0].children[0];
            el.remove();
            dndPlaceHolder.replaceWith( el);
            dndContainer.remove();

            if (cb) cb(el, dndStart.index, newIndex);

            dndStart = undefined;
          }
        })
  }

  let cb;
  function setCallback( fn) {
    cb = fn;
  }

  if (typeof $ === 'undifined') {
    console.error('jq-min is not defined, cannot find $ function');
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      initHandlers();
      initAll();
    });
  }

  window.tableDnd = {
    init,
    initAll,
    setCallback,
  }
})();