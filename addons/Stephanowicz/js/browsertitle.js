//change browsertitle
function render_browsertitle(){
	if (MPD.json['state'] !== 'stop') {
		document.title = MPD.json['title'] + " - " + MPD.json['album'];
	}
	else {
		document.title = "moOde Audioplayer";
	}
	//change fav-icon
	setTimeout(() => {
		if ($('.coverart')[0]) {
			$("link[rel*='icon']").each(function () { $(this).remove(); })
			var link = document.createElement('link');
			link.type = 'image/x-icon';
			link.rel = 'shortcut icon';
			link.href = $('.coverart')[0].src;
			document.getElementsByTagName('head')[0].appendChild(link);
		}
	},500);
}