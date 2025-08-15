var tempstr = '<div id="lyrics-modal" class="modal modal-sm hide" tabindex="-1" role="dialog" aria-labelledby="lyrics-modal-label" aria-hidden="true"></div>';
$("#shutdown").after(tempstr);

tempstr = '<li><a href="#notarget" data-cmd="" data-addoncmd="song-lyrics"><i class="fal fa-bars sx"></i> Song lyrics</a></li>';
$("#context-menu-playback ul").append(tempstr);

tempstr = '<li><a href="#notarget" data-cmd="" data-addoncmd="track_info_lyrics"><i class="fal fa-bars sx"></i> Song lyrics</a></li>';
$("#context-menu-playqueue-item ul").append(tempstr);

//*******************SONG LYRICS************************************************
function lyricsQuery(songtitle = MPD.json['title'], songartist = MPD.json['artist'], filepath = "") {
    //$('#lyrics-form').empty();
	$('#lyrics-modal').empty();
	$('#lyrics-modal').load('addons/Stephanowicz/lyrics/lyricsmodal.txt', function() {
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
	});	
}
function lyricsForm() {
    songartist = document.lyricsQuery["formArtist"].value;
    songtitle = document.lyricsQuery["formTitle"].value;
    lyricsQuery(songtitle, songartist);
}
//******************************************************************************************