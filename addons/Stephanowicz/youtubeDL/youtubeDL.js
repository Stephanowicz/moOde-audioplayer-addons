var tempstr = '<div id="YoutubeDL-modal" class="hide" tabindex="-1" role="dialog" aria-labelledby="YoutubeDL-modal-label" aria-hidden="true" style="border-radius: 6px;' +
	'position: fixed;' +
	'width: 100%;' +
	'z-index: 10001;' +
	'box-shadow: 0 3px 7px rgba(0,0,0,.3);"></div>';
$("#shutdown").after(tempstr);

tempstr = '<li><a href="#notarget" data-cmd="" data-addoncmd="YoutubeDl"><i class="fab fa-youtube sx"></i>Youtube Audioplayback</a></li>';
$("#context-menu-playback ul").append(tempstr);

function youtubeDL_render(){
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
function YoutubeDl() {
    //$('#YoutubeDL').empty();
    $('#YoutubeDL-modal').empty();
	$('#YoutubeDL-modal').load('addons/Stephanowicz/youtubeDL/ytmodal.txt', function() {
		$('#YoutubeDL').load('addons/Stephanowicz/youtubeDL/youtubeDL.html');
		$('#YoutubeDL-modal').modal();
	});
}