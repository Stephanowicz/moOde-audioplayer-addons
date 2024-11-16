<?php
/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
*/

require_once __DIR__ . '/../../inc/common.php';
require_once __DIR__ . '/../../inc/mpd.php';
require_once __DIR__ . '/../../inc/music-library.php';
require_once __DIR__ . '/../../inc/session.php';
require_once __DIR__ . '/../../inc/sql.php';

$sock = getMpdSock();
phpSession('open_ro');

chkVariables($_GET);
chkVariables($_POST, array('path'));

// Turn off auto-shuffle and consume mode before Queue is updated
$queueCmds = array(
    'add_folders_next'
);
if ($_SESSION['ashuffle'] == '1' && in_array($_GET['cmd'], $queueCmds)) {
    turnOffAutoShuffle($sock);
}

switch ($_GET['cmd']) {
	case 'add_folders_next':
		workerLog('add_folders_next');
		$status = getMpdStatus($sock);
		$plLengthOld=$status['playlistlength'];
		workerLog('queue.php: $plLengthOld: ' . $plLengthOld);
		sendMpdCmd($sock, 'add "' . html_entity_decode($_POST['path']) . '"');
		$resp = readMpdResp($sock);
		workerLog('queue.php: $resp: ' . print_r($resp));
		$status = getMpdStatus($sock);
		$plLengthNew=$status['playlistlength'];
		workerLog('queue.php: $plLengthNew: ' . $plLengthNew);
		$cmds = 'move ' . $plLengthOld . ':' . $plLengthNew . ' ' . ($status['song'] + 1);
		workerLog('queue.php: $cmds: ' . $cmds);
		sendMpdCmd($sock, $cmds);
		break;

	case 'plStatus':
	//	$status = getMpdStatus($sock);
	//----------------------------------------------------------------------------------------

		sendMpdCmd($sock, 'status');
		$resp = readMpdResp($sock);
		$formattedStatus=formatMpdStatus($resp);
		if(is_null($formattedStatus['songid'])){
			$pltime = shell_exec("mpc --format '%time%' playlist | awk -F ':' 'BEGIN{t=0} {t+=$1*60+$2} END{print strftime(\"%H:%M:%S\", t, 1)}'");
			$songpos = $formattedStatus['playlistlength'];
			$pltime = $pltotal = preg_replace("/\n|\r/", "", $pltime);
			$plremaining = $plelapsed = "00:00:00";
		}
		else{
			$pl=shell_exec("mpc --format '%time%' playlist | awk -F ':' 'BEGIN{t=0;t1=0} {t+=$1*60+$2;if (NR >= ".(intval($formattedStatus['song']) + 1).") {t1+=$1*60+$2}} END{print t1 \" \" t}'");
			$pl=preg_replace("/\n|\r/", "", $pl);
			$plarr = explode(" ",$pl);
			$pltime = gmdate("H:i:s", intval($plarr[1]) - intval($plarr[0]) + intval($formattedStatus['elapsed']))." / ".gmdate("H:i:s", $plarr[1]);
			$pltotal = gmdate("H:i:s", $plarr[1]);
			$plelapsed = gmdate("H:i:s", intval($plarr[1]) - intval($plarr[0]));
			$plremaining = gmdate("H:i:s", $plarr[0]);
			$songpos = (intval($formattedStatus['song']) + 1)." / ".$formattedStatus['playlistlength'];
		}
		$plstat = "[".$songpos."]  [".$pltime."]";
		$formattedStatus['plstat'] = $plstat;

		$formattedStatus['pltotal'] = $pltotal;
		$formattedStatus['plremaining'] = $plremaining;
		$formattedStatus['plelapsed'] = $plelapsed;
		echo json_encode($formattedStatus);
		break;
	
	case 'checkYoutubePlayback':
		//-----Webstreaming source von youtube-dl----------------------------------------------------
		$song = getCurrentSong($sock);
		//$current = arr();
		if ((substr($song['file'], 0, 4) == 'http') && (preg_match("/(google|youtube)/i", $song['file']))) {
			$current['artist'] = isset($song['Artist']) ? $song['Artist'] : '';
			if (!isset($song['Title']) || trim($song['Title']) == '') {
				$current['title'] = 'Webstreaming source';
			}
			else {
				$current['title'] = $song['Title'];
			}
			$current['album'] = isset($song['Album']) ? htmlspecialchars($song['Album']) : (isset($song['Name']) ? $song['Name'] : 'Unknown album');
		//			$current['album'] = isset($song['Album']) ? htmlspecialchars($song['Album']) : 'Unknown album';
			$current['disc'] = isset($song['Disc']) ? $song['Disc'] : 'Disc tag missing';
			$current['coverurl'] = '';
        //    workerLog(print_r($song, true));
			echo json_encode($current);
		}
		else {echo "";}
		break;

    default:
		echo 'Unknown command';
		break;
}

// Close MPD socket
if (isset($sock) && $sock !== false) {
	closeMpdSock($sock);
}

// Turn off auto-shuffle and consume mode
function turnOffAutoShuffle($sock) {
    phpSession('open');
	phpSession('write', 'ashuffle', '0');
    phpSession('close');

	sysCmd('killall -s 9 ashuffle > /dev/null');

	sendMpdCmd($sock, 'consume 0');
	$resp = readMpdResp($sock);
}
