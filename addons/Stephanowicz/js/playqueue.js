//---div plstat below playlist-------------
var tempstr = '<div id="plstat" style="position: absolute; bottom: 0px; margin-left: 1.2em;"></div>';
$("#container-playqueue").after(tempstr);

//extend function updKnobStartFrom() & renderReconnect() in playerlib.js for updating remaining playlisttime --> plStatDisp()
var updKnobStartFrom_extended = updKnobStartFrom;
var renderReconnect_extended = renderReconnect;
window.updKnobStartFrom = function (startFrom, state) {
	updKnobStartFrom_extended(startFrom, state);

	if (state == 'play' || state == 'pause') {
		plStatDisp();
//					console.log("updKnobStartFrom_extended");
	}
}
window.renderReconnect = function () {
	window.clearInterval(updatePlStatDisp)
//				console.log("renderReconnect_extended");
	renderReconnect_extended();
}

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

function render_plstat() {
	if(MPD.json['file'] !== UI.currentFile){ 
		window.clearInterval(window.updatePlStatDisp);
		window.updatePlStatDisp = setInterval(function () {
			if (MPD.json['state'] === 'play'){
				plStatDisp();
			}
		}, 1000);
	}
}