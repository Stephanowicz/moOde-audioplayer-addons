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

var addonsCfg;
//---------------load settings------------------------------------------
fetch('addons/Stephanowicz/config.json')
    .then((response) => response.json())
    .then((json) => addonsCfg = json)
	//.then(() => console.log(addonsCfg))
	.then(() => {

			//Style Sceensaver wide
		addonsCfg['ssStyle'] &&
		$(function () {
			let styles = `
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
				}
			}

		//extend function updKnobAndTimeTrack() in playerlib.js for updating remaining playlisttime --> plStatDisp()
			var updKnobAndTimeTrack_extended = updKnobAndTimeTrack;
			var updatePlStatDisp;
			window.updKnobAndTimeTrack = function () {
				window.clearInterval(updatePlStatDisp)
				updKnobAndTimeTrack_extended();
				if (MPD.json['state'] === 'play') {
					window.clearInterval(updatePlStatDisp)
					updatePlStatDisp = setInterval(function () {
						plStatDisp();
					}, 1000);
				}
			}
			
		//extend function renderReconnect() in playerlib.js for updating remaining playlisttime --> plStatDisp()
			var renderReconnect_extended = renderReconnect;
			window.renderReconnect = function () {
				window.clearInterval(updatePlStatDisp)
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

		window.renderUI = function () {
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
			
			renderUI_extended();

			if(addonsCfg['albumart']){
				if (MPD.json['file'] !== UI.currentFile && MPD.json['cover_art_hash'] !== UI.currentHash) {
					multiAlbumArt();;
				}
				//chnage browsertitle
				if (MPD.json['state'] !== 'stop') {
					document.title = MPD.json['title'] + " - " + MPD.json['album'];
				}
				else {
					document.title = "moOde Audioplayer";
				}
			}
			
			if(addonsCfg['browsertitle']){
				//chnage browsertitle
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
		}


		//-- Add new items to loaded page
		//$(window).on("load", function () {
		$(function () {
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
			//-- move 'Random album' in playback-menu
			if(!addonsCfg['random']){
				tempstr = '<li><a href="#notarget" data-cmd="ralbum"><i class="ralbum"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M475.31 364.144L288 256l187.31-108.144c5.74-3.314 7.706-10.653 4.392-16.392l-4-6.928c-3.314-5.74-10.653-7.706-16.392-4.392L272 228.287V12c0-6.627-5.373-12-12-12h-8c-6.627 0-12 5.373-12 12v216.287L52.69 120.144c-5.74-3.314-13.079-1.347-16.392 4.392l-4 6.928c-3.314 5.74-1.347 13.079 4.392 16.392L224 256 36.69 364.144c-5.74 3.314-7.706 10.653-4.392 16.392l4 6.928c3.314 5.74 10.653 7.706 16.392 4.392L240 283.713V500c0 6.627 5.373 12 12 12h8c6.627 0 12-5.373 12-12V283.713l187.31 108.143c5.74 3.314 13.079 1.347 16.392-4.392l4-6.928c3.314-5.74 1.347-13.079-4.392-16.392z"></path></svg></i> Random album</a></li>';
				$("#context-menu-playback ul li:eq(2)").after(tempstr);
				//-- remove "random album" and "add to favorites" from button group
				$("button.ralbum").addClass("hide");
				$("button.ralbum").attr('style', 'display: none !important');
			}
			//-- move 'add to favorites' in playback-menu
			if(!addonsCfg['fav']){
				tempstr = '<li><a href="#notarget" data-cmd="add_item_to_favorites"><i class="fal fa-heart sx"></i> Add To Favorites</a></li>';
				$("#context-menu-playback ul li:eq(0)").before(tempstr);
				//-- remove "add to favorites" from button group
				$("button.add-item-to-favorites").addClass("hide");
				$("button.add-item-to-favorites").attr('style', 'display: none !important');
			}
			//-- add "repeat", "single" to button group 
			if(addonsCfg['single']){
				tempstr = '<button class="btn btn-cmd btn-toggle1 single" data-cmd="single" aria-label="Single"><i class="fa-regular fa-sharp fa-redo"></i></button>';
				$("button.random").after(tempstr);
				$("#context-menu-playback > ul").find('[data-cmd="single"]').parent().addClass("hide")
			}
			if(addonsCfg['repeat']){
				tempstr = '<button class="btn btn-cmd btn-toggle1 repeat" data-cmd="repeat" aria-label="Repeat"><i class="fa-regular fa-sharp fa-repeat"></i></button>';
				$("button.random").after(tempstr);
				$("#context-menu-playback > ul").find('[data-cmd="repeat"]').parent().addClass("hide")
			}
			$('.btn-toggle1').click(function(e) {
				var cmd = $(this).data('cmd');
				var toggleValue = $(this).hasClass('btn-primary') ? '0' : '1';
				$('.' + cmd).toggleClass('btn-primary');
				sendMpdCmd(cmd + ' ' + toggleValue);
			});
		});
		
	});
//	.then(() => console.log(addonsCfg));

//---------------------------------------------------------
//-- ContextMenue Click Events ---
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
                            for (i = 0; i < data.length; i++) {
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
