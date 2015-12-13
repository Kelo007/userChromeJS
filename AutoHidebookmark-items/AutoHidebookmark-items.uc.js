// ==UserScript==
// @name	AutoHidebookmark-items.uc.js
// @namespace	http://bbs.kafan.cn/forum.php?mod=redirect&goto=findpost&ptid=1817667&pid=34415770
// @include	main
// @author	Kelo
// ==/UserScript==
(function() {
	var hideDelay = 500,
		popDelay = 500;
	var _ELEMID = 'PlacesToolbarItems',
		_elem = null;
	var _popElem = null;
	var _timer = null,
		_isRunning = false;

	function addEvent(mouseover, mouseout) {
		_elem = document.getElementById(_ELEMID);
		_elem.addEventListener('mouseover', mouseover);
		_elem.addEventListener('mouseout', mouseout);
	}

	function isMenu(elem) {
		return elem.className === 'bookmark-item' &&
			elem.type === 'menu' &&
			elem.parentNode === _elem;
	}

	function isInMenu(elem, menu) {
		if (elem.localName === 'window' || !elem.parentNode) {
			return false;
		}
		if (elem.parentNode === menu) {
			return true;
		}
		else {
			return isInMenu(elem.parentNode, menu);
		}
	}

	function isItem(elem) {
		return isInMenu(elem, _popElem);
	}

	function isInContextMenu() {
		return document.getElementById('placesContext').state === 'open';
	}

	function mouseover(event) {
		var elem = event.target;
		var _isMenu = isMenu(elem),
			_isItem = isItem(elem);
		if (!_isMenu && !_isItem) {
			return;
		}
		clearTimer();
		if (_popElem == null) {
			popup(elem);
		}
		else {
			if (_isMenu && elem !== _popElem) {
				hideElement(_popElem);
				popup(elem);
			}
		}
	}

	function mouseout(event) {
		var elem = event.target;
		clearTimer();
		if (_popElem && !isInContextMenu()) {
			hide(_popElem);
		}
	}

	function hide(elem, delay) {
		_isRunning = true;
		_timer = setTimeout(function() {
			hideElement(elem);
			_popElem = null;
			_isRunning = false;
		}, delay || hideDelay);
	}

	function popup(elem, delay) {
		_isRunning = true;
		_timer = setTimeout(function() {
			popupElement(elem);
			_popElem = elem;
			_isRunning = false;
		}, delay || popDelay);
	}

	function hideElement(elem) {
		elem.open = false;
	}

	function popupElement(elem) {
		elem.open = true;
	}

	function clearTimer() {
		if (_isRunning) {
			clearTimeout(_timer);
		}
		_isRunning = false;
		_timer = null;
	}
	document.addEventListener('DOMContentLoaded', function() {
		addEvent(mouseover, mouseout);
	});
	
})();