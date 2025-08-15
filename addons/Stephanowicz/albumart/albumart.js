//-------Coverart - dots below cover in Screensaver view
var tempstr = '<div id="coverview_albumthumbs_inidcator"><i class="far fa-ellipsis-h"></i></div>' +
			'<div id="coverview_albumthumbs" style="text-align:center;"></div>';
$("#ss-coverart-url").after(tempstr);
//-------Coverart - dots below cover in main view
tempstr = '<div id="albumthumbs_inidcator"><i class="far fa-ellipsis-h"></i></div>' +
		'<div id="albumthumbs"></div>';
$("#coverart-url").after(tempstr);

tempstr = '<div id="albumart-modal" class="modal hide" tabindex="-1" role="dialog" aria-labelledby="trackinfo_albumart-modal-label" aria-hidden="true"></div>' +
		'<div id="trackinfo-albumart-modal" class="modal hide" tabindex="-1" role="dialog" aria-labelledby="trackinfo-albumart-modal-label" aria-hidden="true"></div>';
$('#shutdown').after(tempstr);

//extend function audioInfo() in playerlib.js for multiAlbumart in Audio-Info
var audioInfo_extended = audioInfo;

window.audioInfo = function (cmd, path, activeTab = '') {
	audioInfo_extended(cmd, path, activeTab = '');

	if (cmd == 'track_info') {
		setTimeout(() => {
			trackinfo_albumart(path);
		}, 500);
	}
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