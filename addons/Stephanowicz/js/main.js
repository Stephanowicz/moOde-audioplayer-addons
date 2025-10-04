/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
*/
// Styles append from string
function appendStyle(style) {
	var styleSheet = document.createElement("style");
	styleSheet.textContent = style;
	document.head.appendChild(styleSheet);
}
// Style load from file
function loadStyle(src) {
    return new Promise(function (resolve, reject) {
        let link = document.createElement('link');
        link.href = src;
        link.rel = 'stylesheet';

        link.onload = () => resolve(link);
        link.onerror = () => reject(new Error(`Style load error for ${src}`));

        document.head.append(link);
    });
}
// Script loader
//function loadScript(src) {
//		var data = $.ajax({url: 'http://httpbin.org/get', async: false}).responseText;
/*	if ($("script[src='" + src + "']").length === 0) {
		var script = document.createElement('script');
		script.type = "text/javascript";
		script.src = src;
		document.body.appendChild(script);
	}
}*/
// Script loader
function loadScript(src) {
	return new Promise(function (resolve, reject) {
		if ($("script[src='" + src + "']").length === 0) {
			var script = document.createElement('script');
			script.onload = function () {
				resolve();
			};
			script.onerror = function () {
				reject();
			};
			script.src = src;
			document.body.appendChild(script);
		} else {
			resolve();
		}
	});
}
var syncedLyrics;
var lrclibsynced = false;
var resizeTimeout = false;
var addonsCfg;
//---------------load settings------------------------------------------
(async () => {
	const apiCallPromise = await fetch('addons/Stephanowicz/config.json', {cache: "no-cache"});
	addonsCfg = await apiCallPromise.json();
//    .then((response) => response.json())
//    .then((json) => addonsCfg = json)
	//.then(() => console.log(addonsCfg))
//	.then(() => {

		//Style Sceensaver for local display 800x480
		addonsCfg['ssStyle'] && $(function () {
			loadStyle("addons/Stephanowicz/css/ssStyle.css")
				.then(() => console.log("ssStyle.css loaded"))
				.catch(console.error);
		});
		// Fix for local ultrawide displays like 11.9inch Capacitive Touch Screen LCD, 320×1480
		addonsCfg['uwStyle'] && $(function () {
			loadStyle("addons/Stephanowicz/css/uwStyle.css")
				.then(() => console.log("uwStyle.css loaded"))
				.catch(console.error);
		});
		if(addonsCfg['ytdl']) {
			//Youtube-Dl Symbol
			let styles = `
				.fa-youtube:before {
					content: "\f167";
				}
			`;
			appendStyle(styles);
			try {
				await loadScript("addons/Stephanowicz/youtubeDL/youtubeDL.js");
				console.log("youtubeDL.js loaded");
			}
			catch(error){
				  console.error(error);
			};		
		}
		//-- Styles Albumart --
		if(addonsCfg['albumart']){
			loadStyle("addons/Stephanowicz/albumart/albumart.css")
				.then(() => console.log("albumart.css loaded"))
				.catch(console.error);
			try {
				await loadScript("addons/Stephanowicz/albumart/albumart.js");
				console.log("albumart.js loaded");
			}
			catch(error){
				  console.error(error);
			};		
		}
		if(addonsCfg['playqueue']) {
			//Style container-playqueue override for Playlist-Status below playlist
			let styles = `
				#playback-queue #container-playqueue { 
					height:calc(100% - 2.75em - 37px);    
				}
			`;
			appendStyle(styles);
			try {
				await loadScript("addons/Stephanowicz/js/playqueue.js");
				console.log("playqueue.js loaded");
			}
			catch(error){
				  console.error(error);
			};		
		}
		//Style for synced lyrics overlay
		if(addonsCfg['lrclibsynced']) {
			loadStyle("addons/Stephanowicz/css/lrclibsyncedStyle.css")
				.then(() => console.log("lrclibsyncedStyle.css loaded"))
				.catch(console.error);
			try {
				await loadScript("addons/Stephanowicz/lyrics/syncedlyrics.js");
				console.log("syncedlyrics.js loaded");
			}
			catch(error){
				  console.error(error);
			};		
		}
		(addonsCfg['ytdl']||addonsCfg['lyrics']||addonsCfg['eq']||addonsCfg['browse2folder']) && $("#context-menu-playback ul").append('<li class="menu-separator"></li>');
		addonsCfg['browse2folder'] && loadScript("addons/Stephanowicz/js/browse2folder.js");
		addonsCfg['lyrics'] && loadScript("addons/Stephanowicz/lyrics/songlyrics.js");
		addonsCfg['eq'] && loadScript("addons/Stephanowicz/alsamixer/alsamixer_modal.js");
		addonsCfg['browsertitle'] && loadScript("addons/Stephanowicz/js/browsertitle.js");
		


		//-- Add new items to loaded page
		//$(window).on("load", function () {
	//	$(function () {
			var tempstr
            addonsCfg['pbmenue_fix'] && loadScript("addons/Stephanowicz/js/pbmenue_fix.js");
			//----"Add folders next" in context-menues
			tempstr = '<li><a href="#notarget" data-cmd="" data-addoncmd="add_folders_next"><i class="fal fa-plus-circle sx"></i> Add next</a></li>';
			$("#context-menu-folder ul li:eq(0)").after(tempstr);
			$("#context-menu-folder-item ul li:eq(0)").after(tempstr);
			
			//----Add folder to jumplist in folder-context-menues - not yet implemented...
//			tempstr = '<li><a href="#notarget" data-cmd="" data-addoncmd="add_jmplist"><i class="fal fa-plus-circle sx"></i> Add to jumplist</a></li>';
//			$("#context-menu-folder ul li:eq(0)").after(tempstr);
//			$("#context-menu-folder-item ul li:eq(0)").after(tempstr);

			//----Preview playback in context-menues
			tempstr = '<li><a href="#notarget" data-cmd="" data-addoncmd="preview_playback"><i class="fa-sharp fa-thin fa-ear-listen"></i> Listen sample</a></li>';
			$("#context-menu-folder-item ul li:eq(-1)").after(tempstr);
			$("#context-menu-lib-item ul li:eq(-1)").after(tempstr);
			//-- Addons-Config Modal --
			tempstr = '<div id="Config-modal" class="hide" tabindex="-1" role="dialog" aria-labelledby="Config-modal-label" aria-hidden="true" style="transform: translate(-50%);' +
				'border-radius: 6px;' +
				'left: 50%;' +
				'position: fixed;' +
				'z-index: 10001;' +
				'box-shadow: 0 3px 7px rgba(0,0,0,.3);"></div>';
			$("#shutdown").after(tempstr);
			$('#Config-modal').load('addons/Stephanowicz/configmodal.txt');
			tempstr ='<li class="context-menu menu-separator"><a id="addonsCfg" href="#notarget" data-cmd="addonscfg"><i class="fa-solid fa-sharp fa-pen sx"></i>Addons Configuration</a></li>';
			//$('.dropdown-menu li.context-menu')[0].outerHTML+=tempstr;
			$('.dropdown-menu [data-cmd="preferences"]')[0].parentNode.outerHTML+=tempstr;			
			if(!addonsCfg['btn_random']){
				tempstr = '<li><a href="#notarget" data-cmd="ralbum"><i class="ralbum"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M475.31 364.144L288 256l187.31-108.144c5.74-3.314 7.706-10.653 4.392-16.392l-4-6.928c-3.314-5.74-10.653-7.706-16.392-4.392L272 228.287V12c0-6.627-5.373-12-12-12h-8c-6.627 0-12 5.373-12 12v216.287L52.69 120.144c-5.74-3.314-13.079-1.347-16.392 4.392l-4 6.928c-3.314 5.74-1.347 13.079 4.392 16.392L224 256 36.69 364.144c-5.74 3.314-7.706 10.653-4.392 16.392l4 6.928c3.314 5.74 10.653 7.706 16.392 4.392L240 283.713V500c0 6.627 5.373 12 12 12h8c6.627 0 12-5.373 12-12V283.713l187.31 108.143c5.74 3.314 13.079 1.347 16.392-4.392l4-6.928c3.314-5.74 1.347-13.079-4.392-16.392z"></path></svg></i> Random album</a></li>';
				$("#context-menu-playback ul li:eq(2)").after(tempstr);
				//-- remove "random album" and "add to favorites" from button group
			//	$("button.ralbum").addClass("hide");
				$("button.ralbum").attr('style', 'display: none !important');
			}
			//-- move 'add to favorites' in playback-menu
			if(!addonsCfg['btn_fav']){
				tempstr = '<li><a href="#notarget" data-cmd="add_item_to_favorites"><i class="fal fa-heart sx"></i> Add To Favorites</a></li>';
				$("#context-menu-playback ul li:eq(0)").before(tempstr);
				//-- remove "add to favorites" from button group
			//	$("button.add-item-to-favorites").addClass("hide");
				$("button.add-item-to-favorites").attr('style', 'display: none !important');
			}
			//-- add "lrclib synced" to button group 
			if(addonsCfg['lrclibsynced']){
				tempstr = '<button class="btn btn-cmd btn-toggle2 lrclibsynced" data-cmd="lrclibsynced" aria-label="Synced Lyrics"> \
					<div> \
						<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"> \
							<g id="Icon"> \
								<path d="M18.003,23.922l-0.001,0c-1.105,0 -2.002,0.897 -2.002,2.002c-0,1.105 0.897,2.002 2.002,2.002c1.104,-0 2.001,-0.897 2.001,-2.002l0,-7.122c0,-0 6.001,-0.75 6.001,-0.75l0.003,3.867c-1.105,-0 -2.002,0.897 -2.002,2.002c0,1.104 0.897,2.001 2.002,2.001c1.105,0 2.002,-0.897 2.002,-2.001l-0.006,-7.003c0,-0.286 -0.123,-0.559 -0.338,-0.749c-0.215,-0.19 -0.501,-0.278 -0.786,-0.242l-8,1c-0.5,0.062 -0.876,0.488 -0.876,0.992l0,6.003Z"></path> \
								<path d="M9.004,10l13.983,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-13.983,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path> \
								<path d="M9.004,13.994l13.983,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-13.983,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path> \
								<path d="M9.004,18l5.981,0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-5.981,0c-0.552,-0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path> \
								<path d="M9.004,22.006l5.981,-0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-5.981,-0c-0.552,-0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path>  \
							</g> \
						</svg> \
						<svg id="slyricsavail" width="0.5vw" height="0.5vw" viewBox="0 0 3 3" style="display: none;"><defs id="defs265"><linearGradient id="linearGradient3029"><stop style="stop-color:#000000;stop-opacity:1;" offset="0" id="stop3025"></stop><stop style="stop-color:#000000;stop-opacity:0;" offset="1" id="stop3027"></stop></linearGradient><linearGradient id="linearGradient2975"><stop style="stop-color:#000000;stop-opacity:1;" offset="0" id="stop2973"></stop></linearGradient><radialGradient xlink:href="#linearGradient3029" id="radialGradient3031" cx="226.86385" cy="2.3167014" fx="226.86385" fy="2.3167014" r="1.0246025" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1.4963502,0,0,1.4963502,-337.93459,-1.9334326)"></radialGradient></defs><circle style="fill:#55fa36;fill-opacity:1;stroke:url(#radialGradient3031);stroke-width:0.396531;stroke-dasharray:none" id="path962" cx="1.5331675" cy="1.5331639" r="1.3348985"></circle></svg> \
					</div> \
				</button>';
				$("button.random").after(tempstr);
//				$("#togglebtns .btn.random").after(tempstr);
			}
			//-- add "repeat", "single" etc to button group 
			if(addonsCfg['btn_single']){
				tempstr = '<button class="btn btn-cmd btn-toggle2 single" data-cmd="single" aria-label="Single"><i class="fa-regular fa-sharp fa-redo"></i></button>';
				$("button.random").after(tempstr);
				$("#context-menu-playback > ul").find('[data-cmd="single"]').parent().addClass("hide")
			}
			if(addonsCfg['btn_repeat']){
				tempstr = '<button class="btn btn-cmd btn-toggle2 repeat" data-cmd="repeat" aria-label="Repeat"><i class="fa-regular fa-sharp fa-repeat"></i></button>';
				$("button.random").after(tempstr);
				$("#context-menu-playback > ul").find('[data-cmd="repeat"]').parent().addClass("hide")
			}
			if(addonsCfg['btn_save2pl']){
				tempstr = '<button class="btn btn-cmd btn-toggle2 save" data-cmd="save_queue_to_playlist" aria-label="SaveQueue"><i class="fa-regular fa-sharp fa-save"></i></button>';
				$("button.random").after(tempstr);
				$("#context-menu-playback > ul").find('[data-cmd="save_queue_to_playlist"]').parent().addClass("hide")
			}
			if(addonsCfg['btn_setFav']){
				tempstr = '<button class="btn btn-cmd btn-toggle2 setFavName" data-cmd="set_favorites_name" aria-label="SaveQueue"><i class="fa-regular fa-sharp fa-heart-circle"></i></button>';
				$("button.random").after(tempstr);
				$("#context-menu-playback > ul").find('[data-cmd="set_favorites_name"]').parent().addClass("hide")
			}
			if(addonsCfg['btn_consume']){
				tempstr = '<button class="btn btn-cmd btn-toggle2 consume" data-cmd="consume" aria-label="consume"><i class="fa-regular fa-sharp fa-arrow-down"></i></button>';
				$("button.random").after(tempstr);
				$("#context-menu-playback > ul").find('[data-cmd="consume"]').parent().addClass("hide")
			}
			if(addonsCfg['btn_clear']){
				tempstr = '<button class="btn btn-cmd btn-toggle2 clear" data-cmd="clear" aria-label="clear"><i class="fa-regular fa-sharp fa-trash"></i></button>';
				$("button.random").after(tempstr);
				$("#context-menu-playback > ul").find('[data-cmd="clear"]').parent().addClass("hide")
			}
			if(!addonsCfg['btn_coverview']){
				$("button.coverview").attr('style', 'display: none !important');
				tempstr = '<li><a href="#notarget"  class="btn-toggle2" data-cmd="coverview"><i class="fal fa-tv sx"></i> Coverview</a></li>';
				$("#context-menu-playback ul li:eq(10)").after(tempstr);
			}
			if(addonsCfg['btn_info']){
				tempstr = '<button class="btn btn-cmd btn-toggle2 info" data-cmd="track_info_playback" aria-label="track_info_playback"><i class="fa-regular fa-sharp fa-music"></i></button>';
				$("button.random").after(tempstr);
				$("#context-menu-playback > ul").find('[data-cmd="track_info_playback"]').parent().addClass("hide")
			}
//			if(addonsCfg['btn_queue']){
//				tempstr = '<button class="btn btn-cmd btn-toggle1 queue" data-cmd="playqueue_info" aria-label="playqueue_info"><i class="fa-regular fa-sharp fa-list"></i></button>';
//				$("button.random").after(tempstr);
//				$("#context-menu-playback > ul").find('[data-cmd="playqueue_info"]').parent().addClass("hide")
//			}
			if(addonsCfg['btn_last']){
				tempstr = '<button class="btn btn-cmd btn-toggle2 last" data-cmd="toggle_song" aria-label="toggle_song"><i class="fa-regular fa-sharp fa-exchange-alt"></i></button>';
				$("button.random").after(tempstr);
				$("#context-menu-playback > ul").find('[data-cmd="toggle_song"]').parent().addClass("hide")
			}
/*			$('.btn-toggle1').click(function(e) {
				var cmd = $(this).data('cmd');
				var toggleValue = $(this).hasClass('btn-primary') ? '0' : '1';
				$('.' + cmd).toggleClass('btn-primary');
				sendMpdCmd(cmd + ' ' + toggleValue);
			});
*/
/*
			if(addonsCfg['lrclibsynced']){
				window.addEventListener('resize', function() {
					// clear the timeout
					clearTimeout(resizeTimeout);
					// start timing for event "completion"
					resizeTimeout = setTimeout(function () {
						syncedLyricsPos();
					}, 250);
				});
			}
*/
			$('.btn-toggle2').click(function(e) {
				switch ($(this).data('cmd')) {
					case 'save_queue_to_playlist':
						$('#save-queue-to-playlist-modal').modal();
						break;
					case 'set_favorites_name':
						$.getJSON('command/playlist.php?cmd=get_favorites_name', function(name) {
							$('#playlist-favorites-name').val(name); // Preload existing name (if any)
							$('#set-favorites-playlist-modal').modal();
						});
						break;
					case 'toggle_song':
						sendMpdCmd('playid ' + toggleSongId);
						break;
					case 'consume':
						$('#menu-check-consume').toggle();
						var toggle = $('.consume').hasClass('btn-primary') ? '0' : '1';
						$('.consume').toggleClass('btn-primary');
						sendMpdCmd('consume ' + toggle);
						break;
					case 'repeat':
						$('#menu-check-repeat').toggle();
						var toggle = $('.repeat').hasClass('btn-primary') ? '0' : '1';
						$('.repeat').toggleClass('btn-primary');
						sendMpdCmd('repeat ' + toggle);
						break;
					case 'lrclibsynced':
						lrclibsynced = $('.lrclibsynced').hasClass('btn-primary') ? false : true;
						$('.lrclibsynced').toggleClass('btn-primary');
						lrclibsynced ? $(".lrclibsynced svg").css("fill","var(--accentxts)") : $(".lrclibsynced svg").css("fill","var(--adapttext)");
						lrclibsynced ? $("#syncedLyrics").css("display", "block") : $("#syncedLyrics").css("display", "none");
						lrclibsynced && syncedLyricsPos();
						(lrclibsynced&!syncedLyrics) && $(".lrclibsynced svg").css("fill","#ae3c27");
						(!lrclibsynced&syncedLyrics!=null) ? $("[id=slyricsavail]").css("display", "block") : $("[id=slyricsavail]").css("display", "none");
						break;
					case 'single':
						$('#menu-check-single').toggle();
						var toggle = $('.single').hasClass('btn-primary') ? '0' : '1';
						$('.single').toggleClass('btn-primary');
						sendMpdCmd('single ' + toggle);
						break;
					case 'clear':
						sendMpdCmd('clear');
						$('#playlist-save-name').val(''); // Clear saved playlist name if any
						break;
					case 'track_info_playback':
						if ($('#currentsong').html() != '') {
							var cmd = MPD.json['artist'] == 'Radio station' ? 'station_info' : 'track_info';
							audioInfo(cmd, MPD.json['file']);
						}
						break;
					case 'track_info_playqueue':
						var cmd = '';
						if ($('#pq-' + (UI.dbEntry[0] + 1) + ' .pll2').html().substr(0, 2) == '<i') { // Has icon (fa-microphone)
							cmd = 'station_info';
						} else {
							cmd = 'track_info';
						}
						$.getJSON('command/queue.php?cmd=get_playqueue_item_tag&songpos=' + UI.dbEntry[0] + '&tag=file', function(data) {
							if (data != '') {
								audioInfo(cmd, data);
							}
						});
						break;						
					case 'coverview':
						e.stopImmediatePropagation();
						screenSaver('1');
						$('.context-menu').removeClass('open');
						break;
				}
			});
			//extend function renderUI() in playerlib.js for multiAlbumart, display title in Browsertitle and add albumthumb as favicon
			var renderUI_extended = renderUI;
			var updatePlStatDisp;
			var updateSyncedLyrics;

			window.renderUI = function () {
				console.log("renderUI_extended");
				(addonsCfg['ytdl'] && (typeof youtubeDL_render === "function")) && youtubeDL_render();
				(addonsCfg['lrclibsynced'] && (typeof render_syncedLyrics === "function")) && render_syncedLyrics();
				renderUI_extended();
				(addonsCfg['playqueue'] && (typeof render_plstat === "function")) && render_plstat();
				if(addonsCfg['albumart']){
					if (MPD.json['file'] !== UI.currentFile && MPD.json['cover_art_hash'] !== UI.currentHash) {
						(typeof multiAlbumArt === "function") && multiAlbumArt();
					}
				}
				(addonsCfg['browsertitle'] && (typeof render_browsertitle === "function")) && render_browsertitle();
				if(!addonsCfg['fav']){
					//-- remove "add to favorites" from button group if it has been overwritten - yes, it's nasty :D		
					$("button.add-item-to-favorites").css("display") != "none" && $("button.add-item-to-favorites").attr('style', 'display: none !important');
				}
				if(addonsCfg['ssStyle']){
					if (SESSION.json['scnsaver_style'] == 'Gradient (Linear)') {
							$('#screen-saver #ss-style').css('background', 'linear-gradient(rgb(0 0 0 / 47%) 0%, rgba(0, 0, 0, 0.75) 40%, rgba(0, 0, 0, 0.8) 60%, rgba(0, 0, 0) 100%)');
					}
				}
			}

	//	});		
//	});
})();
//	.then(() => console.log(addonsCfg));

//---------------------------------------------------------
//-- ContextMenue Click Events ---
$(document).on('click', '#addonsCfg', function(e) {
    $('#AddonsConfig').empty();
    $('#AddonsConfig').load('addons/Stephanowicz//configmodal.html');
    $('#Config-modal').modal();
});

$(document).on('click', '.context-menu-lib a', function(e) {
	var path = filteredSongs[UI.dbEntry[0]].file; // File path or item num
	var img_src = $(".lib-coverart")[1];
	switch ($(this).data('addoncmd')) {
        case 'preview_playback':
			$.getJSON('command/playback.php?cmd=get_mpd_status', function (result) {
				if(result !="") {playback_preview(result, path,img_src); }
			});			
            break;
	}
});
	
$(document).on('click', '.context-menu a', function(e) {
	var path = UI.dbEntry[0]; // File path or item num

	switch ($(this).data('addoncmd')) {
        case 'song-lyrics':
            lyricsQuery();
            break;
        case 'ALSAgraphicEQ':
            ALSAgraphicEQ();
            break;
        case 'YoutubeDl':
            YoutubeDl();
            break;
        case 'track_info_lyrics':
            if ($('#pq-' + (UI.dbEntry[0] + 1) + ' .pll2').html().substr(0, 2) != '<i') { // Has icon (fa-microphone)
                $.getJSON('command/queue.php?cmd=get_playqueue_item_tag&songpos=' + UI.dbEntry[0] + '&tag=file', function (path) {
                    if (path != '') {
                        $.getJSON('command/audioinfo.php?cmd=track_info', { 'path': path }, function (data) {
                            var artist = "";
                            var title = "";
                            var file = "";
                            for (i = 0; i < Object.keys(data).length; i++) {
                                var key = Object.keys(data[i]);
                                if (typeof (data[i][key]) != 'undefined') {
                                    if (key == 'Artists') {
                                        artist = data[i][key];
                                    }
                                    if (key == 'Album artist' && artist == "") {
                                        artist = data[i][key];
                                    }
                                    else if (key == 'Title') {
                                        title = data[i][key];
                                    }
                                    else if (key == 'File path') {
                                        file = data[i][key];
                                    }
                                }
                            }
                            lyricsQuery(title, artist, file);
                        });
                    }
                });
            }
            break;
        case 'add_folders_next':
            GLOBAL.playQueueChanged = true;
            $.post('addons/Stephanowicz/commands.php?cmd=' + $(this).data('addoncmd'), { 'path': path });
            break;
        case 'preview_playback':
			var img_src = $("#db-0 .btn img")[0];
			$.getJSON('command/playback.php?cmd=get_mpd_status', function (result) {
				if(result !="") {playback_preview(result, path, img_src); }
			});			
            break;
		case 'add_jmplist':
			$.post('addons/Stephanowicz/jmplist/jmplist.php', {'path': path});
			break;
        case 'pl_browse_to_folder':
            var filepath = "";
            if ($('#pq-' + (UI.dbEntry[0] + 1) + ' .pll2').html().substr(0, 2) != '<i') { // Has icon (fa-microphone)
                $.getJSON('command/queue.php?cmd=get_playqueue_item_tag&songpos=' + UI.dbEntry[0] + '&tag=file', function (result) {
                    if (result != "") {
                        var dirDepth = 0;
                        filepath = result.slice(0, result.lastIndexOf("/"));
                        dirDepth = filepath.split("/").length - 1;
                        UI.dbPos[10] = dirDepth;
                        UI.dbEntry[3] = 'db-1';
                        $.getJSON('command/music-library.php?cmd=lsinfo', { 'path': filepath }, function (data) {
                            renderFolderView(data, filepath);
                        });
                    }
                });
                currentView = 'playback,folder';
                $('#coverart-url').click();
            }
            break;
        case 'track_browse_to_folder':
            var fp = MPD.json['file'];
            if (fp && MPD.json['artist'] != 'Radio station') {
                var dirDepth = 0;
                fp = fp.slice(0, fp.lastIndexOf("/"));
                dirDepth = fp.split("/").length - 1;
                UI.dbPos[10] = dirDepth;
                UI.dbEntry[3] = 'db-1';
                $.getJSON('command/music-library.php?cmd=lsinfo', { 'path': fp }, function (data) {
                    renderFolderView(data, fp);
                });
                currentView = 'playback,folder';
                $('#coverart-url').click();
                $.getJSON('command/music-library.php?cmd=lsinfo', { 'path': fp }, function (data) {
                    renderFolderView(data, fp);
                });
            }
            break;
    }
});

//--------Playback preview-------------------------------------------------------
var timerID_pbPrev,pbPrevData,pbPrevPLpos;
async function playback_preview(songdata,path,img_src){
	var res ={'albumartist':'','title':''};
	var img = "";
	if(typeof(img_src) != "undefined"){
		img = img_src.src;
	}
	pbPrevPLpos=songdata['playlistlength'];
	sendQueueCmd('add_item', path);
	await new Promise(r => setTimeout(r, 100));
	sendMpdCmd('play ' + (songdata['playlistlength']).toString(),false);	
	await new Promise(r => setTimeout(r, 100));
	$.ajaxSetup({
        async: false
    });
	$.getJSON('engine-mpd.php', function (result) {
		if(result !="") {
			pbPrevData = result;
			if(!result['albumartist']){
				if(result['artist']){
					pbPrevData['albumartist']=result['artist'];
				}
				else {pbPrevData['albumartist'] = "unknown";}
			}
		}
	});
	$.ajaxSetup({
        async: true
    });

	//await new Promise(r => setTimeout(r, 100));	
	tempstr = '<div id="playback-preview-modal" class="hide" tabindex="-1" role="dialog" aria-hidden="true" style="transform: translate(-50%);' + 
		'width:70%;height:33%;' +
		'border-radius: 6px;' +
		'left: 50%;' +
		'position: fixed;' +
		'z-index: 10001;' +
		'box-shadow: 0 3px 7px rgba(0,0,0,.3);">' +
			'<div class="modal-content" style="margin: 40px;">' + 
				'<div style="display: flex;"><img src="' + img + '" style="max-width:70px">' +
				'<div style="margin-left: 10px;"><p style="font-size: x-large;">' + pbPrevData['albumartist'] + '</p><p>' + pbPrevData['title'] + '</p></div></div>' +
				'<div id="pbar-timeline" ' +
					'style="display: block;width: 64%;z-index: 999;position: fixed;left: 50%;transform: translate(-50%);font-size: .8rem;display: flex;flex-flow: column;height: 16px;margin-top:30px;">' +
					'<div class="timeline-bg"></div>' +
					'<div id="playback-preview-timeline-progress" style="width: 0%;background-color: var(--trackfill);height: 3px;margin-top: -3px;position: relative;top: 50%;"><div class="inner-progress"style="width: 0%;background-color: var(--trackfill);height: 3px;margin-top: -3px;"></div></div>' +
					'<div class="timeline-thm" style="z-index:9999999">' +
						'<input aria-label="Timeline" id="playbar-preview-timetrack" type="range" min="0" max="1000" value="0" step="1" style="display: flex;width: 100%;padding: 0;margin-top: -2px;color: inherit;height: 16px;">' +
						'</div>' +
						'<div id="playbar-time">' +
						'<div id="playback-preview-playbar-countdown" style="position: relative;float: left;left: -3rem;font-size: .8rem;line-height: 15px;">00:00</div>' +
						'<span id="playbar-div">&nbsp;&nbsp;</span>' +
						'<div id="playback-preview-playbar-total" style="font-size: .8rem;position: relative;float: right;left: 3rem;line-height: 15px;">00:00</div>' +
					'</div>' +
				'</div>' +
				'<div class="modal-footer">' +
					'<button aria-label="Close" class="btn singleton" data-dismiss="modal" aria-hidden="true" style="bottom: 19px; position: fixed; transform: translate(-50%);">' + 
					'Close</button>' +
				'</div>' +
			'</div>' +
		'</div>';
	$("#shutdown").after(tempstr);
	$('#playback-preview-modal').modal();
	$('#playback-preview-modal').on('hide.bs.modal', function(){
		clearTimeout(timerID_pbPrev);
		$('#playback-preview-modal').remove();
		sendMpdCmd('seek ' + songdata['song'] + ' ' + songdata['elapsed']);
		if(songdata['state'] != 'play') {sendMpdCmd(songdata['state']);}
		sendMpdCmd('delete ' + (songdata['playlistlength']).toString());
		GLOBAL.playQueueChanged = true;
	});
	$('#playbar-preview-timetrack').bind('touchend mouseup', function(e) {
		var delta, time;
		time = parseInt(pbPrevData['duration']);
		delta = time / 1000;
		var seekto = Math.floor(($(this).val() * delta));
		if (seekto > time - 2) {seekto = time - 2;}
		sendMpdCmd('seek ' + pbPrevPLpos + ' ' + seekto);
	});
	playbackPreviewTimebar();
// Auto-close option after set time
//	await new Promise(r => setTimeout(r, 5000));
//	$('#playback-preview-modal').modal('hide');
//	$('#playback-preview-modal').remove();
}
function playbackPreviewTimebar(){
	$.getJSON('command/playback.php?cmd=get_mpd_status', function (result) {
		if(result !="") {
			if(result['time'] > 0){
				var percent = result['elapsed']/result['time'] * 100;
				//auto-close if song is finished
				if(percent > 99){$('#playback-preview-modal').modal('hide');return;}
				$('#playback-preview-timeline-progress').width(percent+'%');
				$('#playback-preview-playbar-total')[0].innerText=new Date(result['time'] * 1000).toISOString().substring(14, 19);
				$('#playback-preview-playbar-countdown')[0].innerText=new Date(result['elapsed'] * 1000).toISOString().substring(14, 19);
				$('#playbar-preview-timetrack')[0].value = percent * 10;
			}
		}
		timerID_pbPrev = setTimeout(playbackPreviewTimebar,1000);		
	});	
}
