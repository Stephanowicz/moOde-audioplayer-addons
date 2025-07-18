/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
*/
//---------- Styles -----------------------------------------------------------------------------

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

var syncedLyrics;
var lrclibsynced = false;
var resizeTimeout = false;
var addonsCfg;
//---------------load settings------------------------------------------
fetch('addons/Stephanowicz/config.json', {cache: "no-cache"})
    .then((response) => response.json())
    .then((json) => addonsCfg = json)
	//.then(() => console.log(addonsCfg))
	.then(() => {

		//Style Sceensaver for local display 800x480
		addonsCfg['ssStyle'] &&
		$(function () {
			let styles = `
				@media screen and (max-width:800px) and (max-height:480px) and (orientation:landscape) {

					body.cvwide #ss-metadata #ss-currentsong {
						font-size: 1.9em;
					}
					body.cvwide #ss-metadata #ss-currentartist {
						font-size: 1.7em;
					}
					body.cvwide #ss-metadata #ss-currentalbum {
						font-size: 1.4em;
						margin-bottom: 1em;
					}
					body.cvwide #ss-metadata #ss-extra-metadata {
						margin-top: 1em;
					}	

					body.cvpb #playbar-timeline {top:49%;width:25%;transform:translate(-50%, -50%);}

					#playbar-timeline {width:20%;z-index:999;position:absolute;bottom:.75em;left:41%;transform:translate(-50%);font-size:.8rem;display:flex;flex-flow:column;height:15px;display:none;}

					#playbar-time {width:100%;z-index:100;font-size:.8rem;margin-top:-14px;line-height:8px;}

					#playbar-toggles i {font-size:1.9rem;margin-top:1px;}

					#playbar-toggles .btn {padding:0;margin:0 0.45rem;height:2.1rem;width:2.7rem;border-radius:50%;}

					.mpd-volume-level {font-size:1.9rem;margin-left:0;}

					#playbar-toggles {position:absolute;display:flex;flex-wrap:wrap;right:1.7rem;top:50%;transform:translate(0, -50%);}

					#playbar-time, #playbar-total {font-size:1.7rem;}

					#playbar-countdown, #m-countdown {position:relative;float:left;left:-6rem;}

					#playbar-total, #m-total {position:relative;float:right;left:6rem;}
					
					.timeline-bg {background-color:rgb(255 255 255 / 56%);height:1px;top:50%;width:100%;position:relative;min-height:1px;margin-top:-1px;}

					
					#playbar {display:flex;align-items:center;height:3.5rem;position:absolute;bottom:0;width:100%;color:var(--adapttext);box-shadow: 0px -1px 3px rgba(0,0,0,0.1);}

				}
			`;
			appendStyle(styles);
		});
		// Fix for local ultrawide displays like 11.9inch Capacitive Touch Screen LCD, 320×1480
		addonsCfg['uwStyle'] &&
		$(function () {
			let styles = `
				/*
				// Ultra-wide screens 11.9" 1480x320
				*/
				@media screen and (max-width:1480px) and (max-height:320px) and (orientation:landscape) {
					/* Time knob */
					#countdown {
						height: 11vw;
						width: 11vw;
					}
					#countdown > div {
						height: 11vw !important;
						width: 11vw !important;
					}
					#countdown > div > canvas {
						height: 11vw !important;
						width: 11vw !important;
					}
					#countdown-display {
				        top: 44%;
						font-size: 2vw;	
    				}
				    #total {
				        top: 62%;
				        font-size: 1.25vw;
				    }
					#timeknob {
					    margin: 0;
					}

					/* Play and toggle buttons under the time knob */
					#playbtns .btn {
				        font-size: 2vw;
						padding: 1rem 2rem;
					}
					#togglebtns .btn-group {
					    font-size: 1.7em;
					    white-space: normal;
					    width: 75%;
					}
				}
			`;
			appendStyle(styles);
		});
		//-- Styles Albumart --
		addonsCfg['albumart'] &&
		$(function () {
			loadStyle("addons/Stephanowicz/albumart/albumart.css")
				.then(() => console.log("albumart.css"))
				.catch(console.error);
		});
		addonsCfg['playqueue'] &&
		$(function () {
			//Style container-playqueue override for Playlist-Status below playlist
			let styles = `
				#playback-queue #container-playqueue { 
					height:calc(100% - 2.75em - 37px);    
				}
			`;
			appendStyle(styles);
		});
		addonsCfg['lrclibsynced'] &&
		$(function () {
			//Style for synced lyrics overlay
			let styles = `
				#syncedLyrics {
					position: absolute; 
					top: 15%;
					height: 50%;
					width: 35%;
					display: none;
					overflow: hidden;
					pointer-events: none;
				}
				#ss-coverart #syncedLyrics {
					margin-left: 5em;
					width: 80vh;
				}
				#syncedLyricsContent {
					margin-top: 100vh;
					font-Size: clamp(1.3em, 1.5vw, 1.75em);
					pointer-events: none;
				}
				#syncedLyricsContent p{
					background: #050505b5;
					padding: 10px;
					margin: 0px;
					opacity: 0;
					pointer-events: none;
				}
				.fade-in-out {
				  opacity: 0;
				  pointer-events: none;
				}
				.lrclibsynced svg{
					fill: var(--adapttext);
					vertical-align: middle;
					width: calc(1.3rem + 1vmin);
				}
				#togglebtns .lrclibsynced svg{
					width: 1.9em;
				}

			`;
			appendStyle(styles);
		});
		addonsCfg['ytdl'] &&
		$(function () {
			//Youtube-Dl Symbol
			let styles = `
				.fa-youtube:before {
					content: "\f167";
				}
			`;
			appendStyle(styles);
		});
		
		if(addonsCfg['playqueue']){

		//extend function updKnobStartFrom() in playerlib.js for updating remaining playlisttime --> plStatDisp()
			var updKnobStartFrom_extended = updKnobStartFrom;

			window.updKnobStartFrom = function (startFrom, state) {
				updKnobStartFrom_extended(startFrom, state);

				if (state == 'play' || state == 'pause') {
					plStatDisp();
//					console.log("updKnobStartFrom_extended");
				}
			}
		}	
		
		//extend function renderReconnect() in playerlib.js for updating remaining playlisttime --> plStatDisp()
		if(addonsCfg['playqueue']){
			var renderReconnect_extended = renderReconnect;
			window.renderReconnect = function () {
				window.clearInterval(updatePlStatDisp)
//				console.log("renderReconnect_extended");
				renderReconnect_extended();
			}
		}	

		//----------------------------------------------------------------------------------------------
		//extend function audioInfo() in playerlib.js for multiAlbumart in Audio-Info
		if(addonsCfg['albumart']){
			var audioInfo_extended = audioInfo;

			window.audioInfo = function (cmd, path, activeTab = '') {
				audioInfo_extended(cmd, path, activeTab = '');

				if (cmd == 'track_info') {
					setTimeout(() => {
						trackinfo_albumart(path);
					}, 500);
				}
			}
		}


		//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
		//extend function renderUI() in playerlib.js for multiAlbumart, display title in Browsertitle and add albumthumb as favicon

		var renderUI_extended = renderUI;
		var updatePlStatDisp;
		var updateSyncedLyrics;

		window.renderUI = function () {
//			console.log("renderUI_extended");
			if(addonsCfg['ytdl']){
				$.getJSON('addons/Stephanowicz/commands.php?cmd=checkYoutubePlayback', function (data) {
					if (data) {
					 //   console.log(data);
						MPD.json['album'] = data['album'];
						MPD.json['artist'] = data['artist'];
						MPD.json['coverurl'] = data['coverurl'];
						MPD.json['disc'] = data['disc'];
						MPD.json['title'] = data['title'];
						if (MPD.json['state'] !== 'stop') {
							document.title = MPD.json['title'] + " - " + MPD.json['album'];
						}
						else {
							document.title = "moOde Audioplayer";
						}
						renderUI_extended();
					}
				});
			}
			if(addonsCfg['lrclibsynced']){
				if (MPD.json['file'] !== UI.currentFile){
					syncedLyrics=null;
					$.getJSON('addons/Stephanowicz/lyrics/lrcsync.php', function (data) {
						if (data) {
							syncedLyrics=data;
							
							if(typeof $("#syncedLyrics")[0] === 'undefined'){
								var tempstr = '<div id="syncedLyrics"></div>';
								$(".tab-content").append(tempstr);
//								$(".covers").append(tempstr);
//								$(".ss-coverart").append(tempstr);
							}
							else{
								$("#syncedLyrics").empty();
							}
							$("#syncedLyrics").append("<div id='syncedLyricsContent'>");
							secsLyrics = [];
							let iLength=Object.entries(syncedLyrics).length;
							for(i=0;i<iLength;i++){
//								if(Object.entries(syncedLyrics)[i][1] ===""){
//									delete syncedLyrics[Object.entries(syncedLyrics)[i][1]];
//									iLength-=1;
//								}
//								else{
									let [ss=0, mm=0, hh=0] = Object.entries(syncedLyrics)[i][0].split(':').reverse();
									secsLyrics[i] = (+hh) * 3600 + (+mm) * 60 + (+ss);							
									let p = "<p id='"+secsLyrics[i]+"'>"+
									Object.entries(syncedLyrics)[i][1] + "</p>";
									$("#syncedLyricsContent").append(p);
//								}
							}
							if(iLength > 0) {$("#syncedLyricsContent").append("<p style='height: 100px;'></p>");} //append empty <p> at end for scrolling last element to higher position
							console.log("syncedLyrics");
							lrclibsynced && $(".lrclibsynced svg").css("fill","var(--accentxts)");
						}
						else{
							if(typeof $("#syncedLyrics") !== 'undefined'){
								$("#syncedLyrics").empty();
							}
							lrclibsynced && $(".lrclibsynced svg").css("fill","#ae3c27");
						}
						$("#syncedLyrics").css("display", "none");	
						if(document.getElementById("syncedLyrics")){
					/*		setTimeout(function () {
								syncedLyricsPos();

							}, 750);	*/						
							window.clearInterval(updateSyncedLyrics)
							slLast=0;
							slLastSecs=0;
							updateSyncedLyrics = setInterval(function () {
								if (MPD.json['state'] === 'play'){
									syncLyrics();
								}
							}, 750);						
						}
					});
				}
				else{
					slLast=0;
					slLastSecs=0;					
				}
			}
			
			renderUI_extended();
			
			if(addonsCfg['playqueue'] && (MPD.json['file'] !== UI.currentFile)){ 
				window.clearInterval(updatePlStatDisp);
				updatePlStatDisp = setInterval(function () {
					if (MPD.json['state'] === 'play'){
						plStatDisp();
					}
				}, 1000);
			}

			if(addonsCfg['albumart']){
				if (MPD.json['file'] !== UI.currentFile && MPD.json['cover_art_hash'] !== UI.currentHash) {
					multiAlbumArt();;
				}
			}
			
			if(addonsCfg['browsertitle']){
				//change browsertitle
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


		//-- Add new items to loaded page
		//$(window).on("load", function () {
		$(function () {
            if(addonsCfg['pbmenue_fix']){
                setTimeout(window.onload = function(){
                    var targetNode = document.getElementById('context-menu-playback');
                    var observer = new MutationObserver(function(){
                        if(($(targetNode)).hasClass('open')){
                            var menue = $("#context-menu-playback > .dropdown-menu");
                            var offset = $(document.getElementById('context-menu-playback')).position().top;
                            menue.css("top",-offset);
                        }
                    });
                    observer.observe(targetNode, { attributes: true, childList: true });
                }, 500);
            }
			var tempstr;
			if(addonsCfg['playqueue']){
				//---div plstat below playlist-------------
				tempstr = '<div id="plstat" style="position: absolute; bottom: 0px; margin-left: 1.2em;"></div>';
				$("#container-playqueue").after(tempstr);
			}
			if(addonsCfg['albumart']){
			//-------Coverart - dots below cover in Screensaver view
				tempstr = '<div id="coverview_albumthumbs_inidcator"><i class="far fa-ellipsis-h"></i></div>' +
							'<div id="coverview_albumthumbs" style="text-align:center;"></div>';
				$("#ss-coverart-url").after(tempstr);
				//-------Coverart - dots below cover in main view
				tempstr = '<div id="albumthumbs_inidcator"><i class="far fa-ellipsis-h"></i></div>' +
						'<div id="albumthumbs"></div>';
				$("#coverart-url").after(tempstr);
			}
			//----Add folders next in context-menues
			tempstr = '<li><a href="#notarget" data-cmd="" data-addoncmd="add_folders_next"><i class="fal fa-plus-circle sx"></i> Add next</a></li>';
			$("#context-menu-folder ul li:eq(0)").after(tempstr);
			$("#context-menu-folder-item ul li:eq(0)").after(tempstr);
			//----Add folder to jumplist in folder-context-menues
//			tempstr = '<li><a href="#notarget" data-cmd="" data-addoncmd="add_jmplist"><i class="fal fa-plus-circle sx"></i> Add to jumplist</a></li>';
			$("#context-menu-folder ul li:eq(0)").after(tempstr);
//			$("#context-menu-folder-item ul li:eq(0)").after(tempstr);
			//----new items in playback-menue
			if(addonsCfg['ytdl']||addonsCfg['lyrics']||addonsCfg['eq']||addonsCfg['browse2folder']){
				tempstr = '<li class="menu-separator"></li>';
				addonsCfg['ytdl'] && (tempstr += '<li><a href="#notarget" data-cmd="" data-addoncmd="YoutubeDl"><i class="fab fa-youtube sx"></i>Youtube Audioplayback</a></li>');
				addonsCfg['browse2folder'] && (tempstr += '<li><a href="#notarget" data-cmd="" data-addoncmd="track_browse_to_folder"><i class="fal fa-folder sx"></i> Browse to folder</a></li>');
				addonsCfg['lyrics'] && (tempstr += '<li><a href="#notarget" data-cmd="" data-addoncmd="song-lyrics"><i class="fal fa-bars sx"></i> Song lyrics</a></li>');
				addonsCfg['eq'] && (tempstr += '<li><a href="#notarget" data-cmd="" data-addoncmd="ALSAgraphicEQ"><i class="fal fa-sliders fa-rotate-90 sx"></i>Graphic EQ</a></li>');
				$("#context-menu-playback ul").append(tempstr);
			}
			//---Lyrics, Browse to folder in playlist contextmenue
			if(addonsCfg['lyrics']||addonsCfg['browse2folder']){
				tempstr = "";
				addonsCfg['lyrics'] && (tempstr += '<li><a href="#notarget" data-cmd="" data-addoncmd="track_info_lyrics"><i class="fal fa-bars sx"></i> Song lyrics</a></li>');
				addonsCfg['browse2folder'] && (tempstr += '<li><a href="#notarget" data-cmd="" data-addoncmd="pl_browse_to_folder"><i class="fal fa-folder sx"></i> Browse to folder</a></li>');
				$("#context-menu-playqueue-item ul").append(tempstr);
			}
			//-- lyrics Modal --
			if(addonsCfg['lyrics']){
				tempstr = '<div id="lyrics-modal" class="modal modal-sm hide" tabindex="-1" role="dialog" aria-labelledby="lyrics-modal-label" aria-hidden="true"></div>';
				$("#shutdown").after(tempstr);
				$('#lyrics-modal').load('addons/Stephanowicz/lyrics/lyricsmodal.txt');
			}
			//-- ALSAGraphicsEQ Modal--
			if(addonsCfg['eq']){
				tempstr = '<div id="ALSAGraphicsEQ-modal" class="hide" tabindex="-1" role="dialog" aria-labelledby="ALSAGraphicsEQ-modal-label" aria-hidden="true" style="transform: translate(-50%);' +
					'border-radius: 6px;' +
					'left: 50%;' +
					'position: fixed;' +
					'z-index: 10001;' +
					'box-shadow: 0 3px 7px rgba(0,0,0,.3);"></div>';
				$("#shutdown").after(tempstr);
				$('#ALSAGraphicsEQ-modal').load('addons/Stephanowicz/alsamixer/alsamodal.txt');
			}
			//-- YoutubeDL Modal--
			if(addonsCfg['ytdl']){
				tempstr = '<div id="YoutubeDL-modal" class="hide" tabindex="-1" role="dialog" aria-labelledby="YoutubeDL-modal-label" aria-hidden="true" style="border-radius: 6px;' +
					'position: fixed;' +
					'width: 100%;' +
					'z-index: 10001;' +
					'box-shadow: 0 3px 7px rgba(0,0,0,.3);"></div>';
				$("#shutdown").after(tempstr);
				$('#YoutubeDL-modal').load('addons/Stephanowicz/youtubeDL/ytmodal.txt');
			}
			//-- Albumart Modal --
			if(addonsCfg['albumart']){
				tempstr = '<div id="albumart-modal" class="modal hide" tabindex="-1" role="dialog" aria-labelledby="trackinfo_albumart-modal-label" aria-hidden="true"></div>' +
						'<div id="trackinfo-albumart-modal" class="modal hide" tabindex="-1" role="dialog" aria-labelledby="trackinfo-albumart-modal-label" aria-hidden="true"></div>';
				$('#shutdown').after(tempstr);
			}
			//-- Config Modal --
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
			//-- move 'Random album' in playback-menu
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
				<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"> \
					<g id="Icon"> \
						<path d="M18.003,23.922l-0.001,0c-1.105,0 -2.002,0.897 -2.002,2.002c-0,1.105 0.897,2.002 2.002,2.002c1.104,-0 2.001,-0.897 2.001,-2.002l0,-7.122c0,-0 6.001,-0.75 6.001,-0.75l0.003,3.867c-1.105,-0 -2.002,0.897 -2.002,2.002c0,1.104 0.897,2.001 2.002,2.001c1.105,0 2.002,-0.897 2.002,-2.001l-0.006,-7.003c0,-0.286 -0.123,-0.559 -0.338,-0.749c-0.215,-0.19 -0.501,-0.278 -0.786,-0.242l-8,1c-0.5,0.062 -0.876,0.488 -0.876,0.992l0,6.003Z"></path> \
						<path d="M9.004,10l13.983,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-13.983,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path> \
						<path d="M9.004,13.994l13.983,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-13.983,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path> \
						<path d="M9.004,18l5.981,0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-5.981,0c-0.552,-0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path> \
						<path d="M9.004,22.006l5.981,-0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-5.981,-0c-0.552,-0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"></path>  \
					</g> \
				</svg> \
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
						(lrclibsynced&!syncedLyrics) && $(".lrclibsynced svg").css("fill","#ae3c27");
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
		});
		
	});
//	.then(() => console.log(addonsCfg));

//---------------------------------------------------------
//-- ContextMenue Click Events ---
$(document).on('click', '#addonsCfg', function(e) {
    $('#AddonsConfig').empty();
    $('#AddonsConfig').load('addons/Stephanowicz//configmodal.html');
    $('#Config-modal').modal();
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


//--------FUNCTIONS-------------------------------------------------------
//*******************SONG LYRICS************************************************
//uglify doesn't like the default values for the parameters... if your compressor complains about them, cut the default values, compress and then paste them back in the .min file!
function lyricsQuery(songtitle = MPD.json['title'], songartist = MPD.json['artist'], filepath = "") {
    $('#lyrics-form').empty();
    if (songtitle != "" && songartist != "" & !songartist.includes("Unknown artist")) {
        $('#lyrics').load('addons/Stephanowicz/lyrics/lyrics.html #lyrics-loading');
        $('#lyrics-modal').modal();
        $('#lyrics').load('addons/Stephanowicz/lyrics/lyrics.php', { 'title': songtitle, 'artist': songartist, 'file': filepath }, function () {
            $('#lyrics-form').load('addons/Stephanowicz/lyrics/lyrics.html #lyricsForm', function () {
                document.lyricsQuery["formArtist"].value = songartist;
                document.lyricsQuery["formTitle"].value = songtitle;
            });
        });
    }
    else {
        $('#lyrics').load('addons/Stephanowicz/lyrics/lyrics.html #lyrics-missingparms');
        $('#lyrics-form').load('addons/Stephanowicz/lyrics/lyrics.html #lyricsForm', function () {
            document.lyricsQuery["formArtist"].value = (songartist == "") ? "MISSING" : songartist;
            document.lyricsQuery["formTitle"].value = (songtitle == "") ? "MISSING" : songtitle;
        });
        $('#lyrics-modal').modal();
    }
}
function lyricsForm() {
    songartist = document.lyricsQuery["formArtist"].value;
    songtitle = document.lyricsQuery["formTitle"].value;
    lyricsQuery(songtitle, songartist);
}
//******************************************************************************************

//****************************ALSAgraphicEQ()***********************************************
function ALSAgraphicEQ() {

    $('#ALSAGraphicsEQ').empty();
    $('#ALSAGraphicsEQ').load('addons/Stephanowicz/alsamixer/ALSAGraphicsEQ.html');
    $('#ALSAGraphicsEQ-modal').modal();
}
//******************************************************************************************
function YoutubeDl() {
    $('#YoutubeDL').empty();
    $('#YoutubeDL').load('addons/Stephanowicz/youtubeDL/youtubeDL.html');
    $('#YoutubeDL-modal').modal();
}

//**********      multiple albumart images      ********************************
//   Albumart for track info - actual song or selected song
function trackinfo_albumart(path) {
    var xhttp;
    tInfoImgArray = new Array();
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            if (this.responseText && this.responseText != "") {
                tInfoImgArray = JSON.parse(this.responseText);
            }
            trackinfo_albumart_disp(tInfoImgArray);
        }
    };
    xhttp.open("GET", "addons/Stephanowicz/albumart/albumart.php?filepath=" + encodeURI(path), true);
    xhttp.send();
}

function trackinfo_albumart_disp(tInfoImgArray) {
    if (Array.isArray(tInfoImgArray) && tInfoImgArray.length > 0) {
        slideImgArray = tInfoImgArray;
        var iIndex = 0;
        var lines = '<li><span class="left">Albumart</span><span class="ralign"></li>';
        $('#trackinfo-albumart-modal').load('addons/Stephanowicz/albumart/trackinfoAlbumart.html', function () {
            tInfoImgArray.forEach(function (item) {
                document.getElementById('trackinfo_dots').innerHTML += '<span class="trackinfo_dot" onclick="trackinfo_nextSlideImage(' + iIndex + ')"></span>';
                lines += '<li><span class="left">' + item[2] + '<br />' + item[1] + '</span><span class="ralign"><img onClick="trackinfo_albumart_click(' + iIndex + ')" id="trackinfo_thumb" style="width:80px" src="' + item[0] + '"< /></span></li>';
                iIndex++;
            });
            document.getElementById('trackdata').innerHTML += lines;
        });
    }
}

function trackinfo_albumart_click(iIndex) {
    trackinfo_resetActiveSlideDots();
    $('#trackinfo_slider').attr('src', slideImgArray[iIndex][0]);
    trackinfo_curSlideIndex = iIndex + 1;
    document.getElementsByClassName("trackinfo_dot")[iIndex].className += " dotactive";
    $('#trackinfo-albumart-modal').modal();
}

//  Albumart for actual song - display in playerview and coverview
function multiAlbumArt() {
    $('#albumthumbs_inidcator').css('display', 'none');
    $('#coverview_albumthumbs_inidcator').css('display', 'none');
    $('#coverview_albumthumbs').empty();
    $('#coverview_albumthumbs').css({ "opacity": "0", "height": "0px" });
    $('#albumthumbs').empty();
    $('#albumthumbs').css({ "opacity": "0", "height": "0px" });
    $('#ss-coverart').unbind("mouseenter mouseleave");
    $('#albumthumb').unbind("mouseenter mouseleave");
    $('#coverart-url').css('display', '');
    if (MPD.json['file'] && MPD.json['file'].length > 4) { //&& MPD.json['file'].slice(-4) == 'flac') {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                if (this.responseText && this.responseText != "") {
                    imgArray = JSON.parse(this.responseText);
                    if (Array.isArray(imgArray) && imgArray.length > 1) {
                        var iIndex = 0;
                        $('#albumart-modal').load('addons/Stephanowicz/albumart/albumart.html', function () {
                            imgArray.forEach(function (item) {
                                document.getElementById('albumthumbs').innerHTML += '<img id="thumb' + iIndex + '" src="' + item[0] + '"</img>';
                                document.getElementById('coverview_albumthumbs').innerHTML += '<img id="coverthumb' + iIndex + '" src="' + item[0] + '"</img>';
                                document.getElementById('dots').innerHTML += '<span class="dot" onclick="nextSlideImage(' + iIndex + ')"></span>';
                                iIndex++;
                            });
                            $('#coverart-url').css('display', 'contents');
                            $('#albumthumbs_inidcator').css('display', 'block');
                            $('#albumthumbs_inidcator').on("click", albumthumbs_inidcator_click);
                            $('#coverview_albumthumbs_inidcator').css('display', 'block');
                            $('#coverview_albumthumbs_inidcator').on("click", coverview_albumthumbs_inidcator_click);
                            $('#albumthumbs').click(function (event) { i = event.target.id.slice(-1); nextCoverImage(i); });
                            $('#albumthumbs').dblclick(function (event) { resetActiveSlideDots(); i = event.target.id.slice(-1); $('#slider').attr('src', imgArray[i][0]); $('#albumart-modal').modal(); curSlideIndex = (parseInt(i) + 1); document.getElementsByClassName("dot")[i].className += " dotactive"; });
                            $('#coverview_albumthumbs').click(function (event) { event.stopPropagation(); event.preventDefault(); i = event.target.id.slice(-1); nextCoverViewImage(i); });
                            $('#coverview_albumthumbs').dblclick(function (event) { event.stopPropagation(); event.preventDefault(); resetActiveSlideDots(); i = event.target.id.slice(-1); $('#slider').attr('src', imgArray[i][0]); $('#albumart-modal').modal(); curSlideIndex = (parseInt(i) + 1); document.getElementsByClassName("dot")[i].className += " dotactive"; });
                        });
                    }
                    else if (Array.isArray(imgArray) && imgArray.length > 0) {
                        if (MPD.json['title'].indexOf('Webstreaming') !== -1) {
                            imgArray.forEach(function (item) {
                                $('#coverart-url').html('<img class="coverart" ' + 'src="' + item[0] + '" ' + 'data-adaptive-background="1" alt="Cover art not found"' + '>');
								$('#ss-coverart-url').html('<img class="coverart" ' + 'src="' + item[0] + '" ' + 'alt="Cover art not found"' + '>');
                            });
                        }
                    }
                }
            }
        };
        xhttp.open("GET", "addons/Stephanowicz/albumart/albumart.php", true);
        xhttp.send();
    }
	
}
function albumthumbs_inidcator_click() {
    if (document.getElementById('albumthumbs').clientHeight == 0) {
        $('#albumthumbs').css({ "opacity": "1", "height": "40px" });
        $('#albumthumbs img').css({ "height": "40px" });
        $('.coverart').addClass("coverart-resized");
        $('#albumthumbs_inidcator').css('height', '7px');
    }
    else {
        $('#albumthumbs').css({ "opacity": "0", "height": "0px" });
        $('#albumthumbs img').css({ "height": "0px" });
        $('.coverart').removeClass("coverart-resized");
        $('#albumthumbs_inidcator').css('height', '2px');
    }
}
function coverview_albumthumbs_inidcator_click() {
    event.stopPropagation(); event.preventDefault();
    if (document.getElementById('coverview_albumthumbs').clientHeight == 0) {
        $('#coverview_albumthumbs').css({ "opacity": "1", "height": "40px" });
        $('#coverview_albumthumbs img').css({ "height": "40px" });
        $('#ss - coverart - url img').css('width', '70vh');
        $('#coverview_albumthumbs_inidcator').css('height', '7px');
    }
    else {
        $('#coverview_albumthumbs').css({ "opacity": "0", "height": "0px" });
        $('#coverview_albumthumbs img').css({ "height": "0px" });
        $('#ss-coverart-url img').css('width', '75vh');
        $('#coverview_albumthumbs_inidcator').css('height', '0px');
    }
}
//--------------------------------------------------------------------------------------------------------------------------------------
//---------Show Playlist duration and remaining under Playlist---------------------------------------------

var plStat = [];
function plStatDisp() {
    $.getJSON('addons/Stephanowicz/commands.php?cmd=plStatus', function (data) {
        plStat = data;
    });

    if (plStat['pltotal']) {
        if (plStat['state'] === 'stop') {
            $('#plstat').html("[" + plStat['playlistlength'] + "] [" + plStat['pltotal'] + "]");
        }
        else {
            if (SESSION.json['timecountup'] == "1" || parseInt(plStat['time']) == 0) {
                var elapsed = plStat['plelapsed'].split(':').reduce((acc, time) => (60 * acc) + +time) + $('#countdown-display')[0].textContent.split(':').reduce((acc, time) => (60 * acc) + +time);
                var elapsed_formatted = new Date(elapsed * 1000).toISOString().slice(11, 19);
                $('#plstat').html("[" + (parseInt(plStat['song']) + 1) + " / " + plStat['playlistlength'] + "] [" + elapsed_formatted + " / " + plStat['pltotal'] + "]");
            }
            else {
                var remaining = plStat['plremaining'].split(':').reduce((acc, time) => (60 * acc) + +time);
                remaining -= plStat['time'] != null ? parseInt(plStat['time']) - $('#countdown-display')[0].textContent.split(':').reduce((acc, time) => (60 * acc) + +time) : 0;
                var remaining_formatted = new Date(remaining * 1000).toISOString().slice(11, 19);
                $('#plstat').html("[" + (parseInt(plStat['song']) + 1) + " / " + plStat['playlistlength'] + "] [" + remaining_formatted + " / " + plStat['pltotal'] + "]");
            }
        }
    }
}
//--------------------------------------------------------------------------------------------------------------------------------------
//---------Show synced lyrics above album cover---------------------------------------------
var slLast = 0;
var slLastSecs = -1;
var secsLyrics = [];
var lyricsNextSecs = 0;
function syncLyrics() {
	if(($("#syncedLyrics")[0]!=null && syncedLyrics!=null && lrclibsynced)&&($("#screen-saver").css("display") == 'block'||document.getElementById("playback-panel").className.includes("active"))){
	//	if(slPosL==0){ //removed query as it is not accurate enough -> @moment position is checked every cycle
			syncedLyricsPos();
	//	}
		$("#syncedLyrics").css("display", "block");
		$.getJSON('command/playback.php?cmd=get_mpd_status', function(data) {
			var secsElapsed=data["elapsed"];
			let last = 0;
			for(i=slLast;i<secsLyrics.length;i++){
				if(secsLyrics[i] < secsElapsed){
					last = i;
					slLastSecs=secsLyrics[i];		
				}
				else{
					if((slLastSecs<=secsElapsed && slLastSecs > -1) && (i > slLast)){
						const element = document.getElementById(secsLyrics[last]);
						const prev = document.getElementById(secsLyrics[last-1]); 
						const pEl = document.getElementById("syncedLyrics");
						let posTop = element.offsetTop-pEl.offsetHeight/4;
						
						if(last < secsLyrics.length && ((last > 0 && secsLyrics[last]-secsLyrics[last-1]>1) || last == 0)){
							if(last == 0) {
								pEl.scrollTo({
									top: posTop,
									left: 0,
									behavior: "smooth",
								});
							}
							if(last > 0) { 
								if (prev.offsetHeight < slPosH / 4 || prev.offsetHeight+element.offsetHeight > pEl.offsetHeight) {
									if(element.offsetHeight > 0.8 * pEl.offsetHeight) {
										posTop = element.offsetTop;
									}
									pEl.scrollTo({
										top: posTop,
										left: 0,
										behavior: "smooth",
									});
								}
								else {
									pEl.scrollTo({
										top: prev.offsetTop,
										left: 0,
										behavior: "smooth",
									});
								}
							}
						}
						else if(last > 0 && secsLyrics[last]-secsLyrics[last-1]<1 && document.getElementById(secsLyrics[last-1]).style.opacity == 0){
							last -= 1;
							i-=1;
							slLastSecs=secsLyrics[last];
							if(last > 0 && secsLyrics[last]-secsLyrics[last-1]<1 && document.getElementById(secsLyrics[last-1]).style.opacity == 0){
								last -= 1;
								i-=1;
								slLastSecs=secsLyrics[last];
							}
							if (prev.offsetHeight < slPosH / 4 || prev.offsetHeight+element.offsetHeight > pEl.offsetHeight) {
								pEl.scrollTo({
									top: posTop,
									left: 0,
									behavior: "smooth",
								});
							}
							else {
								pEl.scrollTo({
									top: prev.offsetTop,
									left: 0,
									behavior: "smooth",
								});
							}
						}
						lyricsNextSecs = 10;	
						if(last+1 < secsLyrics.length){
							lyricsNextSecs = secsLyrics[last+1] - secsLyrics[last];
						}
						if(last > 0){
							if(Object.entries(syncedLyrics)[last-1][1] !=""){
//										document.getElementById(secsLyrics[last-1]).style.transition = "opacity 3s cubic-bezier(0.7,0.46,1,1)";
								document.getElementById(secsLyrics[last-1]).style.transition = "opacity 1s linear 2s";
								document.getElementById(secsLyrics[last-1]).style.opacity = 0;					
							}
						}
						if(Object.entries(syncedLyrics)[last][1] !=""){
							document.getElementById(secsLyrics[last]).style.transition = "opacity "+ lyricsNextSecs > 2? 2:1 + "s";
							document.getElementById(secsLyrics[last]).style.opacity = 1;
							if(lyricsNextSecs > 9){
								setTimeout(() => {
									document.getElementById(secsLyrics[last]).style.transition = "opacity 9s";
									document.getElementById(secsLyrics[last]).style.opacity = 0;
								},8000);									
							}
						}
					}
					slLast = i;		
					break;
				}
			}
		});
	}
	else{
		$("#syncedLyrics").css("display", "none");	
	}
}
var slPosW,slPosH,slPosL = 0,slPosTop;
function syncedLyricsPos() {
	if(document.getElementById("syncedLyrics")){
		let len = document.getElementsByClassName("coverart").length; //Screen-saver cover and main view cover have same class-name :/
		if( len > 0 ){
			let index = 0;
			
			if($("#screen-saver").css("display") == 'block'){
				index = 0;
				slPosL = parseInt(window.getComputedStyle($(".coverart")[index]).marginLeft); //Screen-saver cover is first element if available
			}
			else{
				index = len -1;
				if($(".coverart")[index].offsetLeft > 0){		
					slPosL = $(".coverart")[index].offsetLeft;
				}
				else{
					slPosL = $("#coverart-url")[0].offsetLeft;
				}
			}
			slPosW = document.getElementsByClassName("coverart")[index].offsetWidth;
			slPosH = document.getElementsByClassName("coverart")[index].offsetHeight;
			slPosTop = document.getElementsByClassName("coverart")[index].offsetParent.offsetTop;
			document.getElementById("syncedLyrics").style.width = slPosW + "px";
			document.getElementById("syncedLyrics").style.height = slPosW + "px";
			document.getElementById("syncedLyrics").style.top = slPosTop + "px";
//			document.getElementById("syncedLyrics").style.top = 0.2*slPosH + "px";
			document.getElementById("syncedLyrics").style.left = slPosL  + "px";
		}
	}
}