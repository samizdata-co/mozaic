/**
 * The host-page script (`embed.js`). It resizes every mozaic iframe on the
 * page to the height its chart reports. Serve it as a static file and
 * include it once per page; including it twice is harmless.
 */
export const hostScript = `(function () {
	if (window.__mozaicHost) return;
	window.__mozaicHost = true;
	window.addEventListener('message', function (event) {
		var data = event.data;
		if (!data || data.type !== 'mozaic:resize' || typeof data.height !== 'number') return;
		var frames = document.getElementsByTagName('iframe');
		for (var i = 0; i < frames.length; i++) {
			if (frames[i].contentWindow === event.source) {
				frames[i].style.height = Math.ceil(data.height) + 'px';
			}
		}
	});
})();
`;
