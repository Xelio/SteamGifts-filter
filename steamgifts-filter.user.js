// ==UserScript==
// @name           SteamGifts filter
// @namespace      http://github.com/Xelio/
// @version        1.1
// @description    SteamGifts filter
// @downloadURL    https://github.com/Xelio/SteamGifts-filter/raw/master/steamgifts-filter.user.js
// @include        http://www.steamgifts.com/*
// @match          http://www.steamgifts.com/*
// @copyright      2014, Xelio
// ==/UserScript==

/*
SteamGifts filter
Copyright (C) 2014 Xelio Cheong

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function wrapper() {

window.sgFilter = function() {};

window.sgFilter.filter = [];
// Key for localStorage
window.sgFilter.KEY_FILTER = 'sgFilter-filter';

// Toggle class 'sgFilter-hide' on entry to contorl hide or show
window.sgFilter.runFilter = function() {
  $('div.post').each(function() {
    var title = sgFilter.htmlDecode($(this).find('div.left > div.title > a').first().html());
    var isHide = sgFilter.filter.indexOf(title) !== -1;
    $(this).toggleClass('sgFilter-hide', isHide);
  });
}

window.sgFilter.addCSS = function() {
  $("<style>")
    .attr("type", "text/css")
    .html("\
      .sgFilter-hide {\
        padding: 1px 0;\
      }\
      .sgFilter-hide .left {\
        display: none;\
      }\
      .sgFilter-hide .center {\
        display: none;\
      }\
      .sgFilter-hide .right {\
        display: none;\
      }\
      .sgFilter-hide .sgFilter-unhide-link {\
        display: block;\
      }\
      .sgFilter-hide-link {\
        color: #c9cdcf;\
        padding: 0 5px;\
        cursor: pointer;\
      }\
      .sgFilter-unhide-link {\
        display: none;\
        font-size: x-small;\
        color: #999d9f;\
        cursor: pointer;\
      }\
    ")
    .appendTo("head");
}

window.sgFilter.attachEvents = function() {
  // Add link and run filter after list of game updated
  $('.content').ajaxComplete(function() {
    sgFilter.addLinks();
    sgFilter.runFilter();
  });
  
  // Event for adding filter
  $('.content').delegate('.sgFilter-hide-link', 'click.sgHide', function(e) {
    sgFilter.addFilter($(this).data('title'));
  });
  
  // Event for removing filter
  $('.content').delegate('.sgFilter-unhide-link', 'click.sgUnhide', function(e) {
    sgFilter.removeFilter($(this).data('title'));
  });
}

window.sgFilter.addLinks = function() {
  // Add 'Hide' link
  $('div.post > div.left > div.title').each(function() {
    if($(this).children('.sgFilter-hide-link').length === 0) {
      var title = $(this).children('a').first().html();
      $(this).append('<span class="sgFilter-hide-link" data-title="' + title + '">Hide</span>');
    }
  });
  
  // Add 'Unhide' link
  $('div.post').each(function() {
    if($(this).children('.sgFilter-unhide-link').length === 0) {
      var title = $(this).find('div.left > div.title > a').first().html();
      $(this).append('<div class="sgFilter-unhide-link" data-title="' + title + '">' + title + ' (Click to unhide)</div>');
    }
  });
}

// Call by 'Hide' link
window.sgFilter.addFilter = function(name) {
  var index = sgFilter.filter.indexOf(name);
  if(index === -1) {
    sgFilter.filter.push(name);
    sgFilter.storeLocal(sgFilter.KEY_FILTER, sgFilter.filter);
    sgFilter.runFilter();
  }
}

// Call by 'Unhide' link
window.sgFilter.removeFilter = function(name) {
  var index = sgFilter.filter.indexOf(name);
  if(index !== -1) {
    sgFilter.filter.splice(index, 1);
    sgFilter.storeLocal(sgFilter.KEY_FILTER, sgFilter.filter);
    sgFilter.runFilter();
  }
}

// Store data to localStorage
window.sgFilter.storeLocal = function(key, data) {
  if(typeof(data) !== 'undefined' && data !== null) {
    localStorage[key] = JSON.stringify(data);
  } else {
    localStorage.removeItem(key);
  }
}

// Local data from localStorage
window.sgFilter.loadLocal = function(key) {
  var objectJSON = localStorage[key];
  if(!objectJSON) return null;
  return JSON.parse(objectJSON);
}

// Decode html entities such as &amp; to actual character
window.sgFilter.htmlDecode = function(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

var setup = function() {
  sgFilter.filter = sgFilter.loadLocal(sgFilter.KEY_FILTER) || [];
  sgFilter.addCSS();
  sgFilter.attachEvents();
  sgFilter.addLinks();
  sgFilter.runFilter();
}

setup();

} // wrapper end

// Inject script into page
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
