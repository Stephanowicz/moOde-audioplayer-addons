<?php
/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
*/
	clearstatcache();
	switch ($_GET['cmd']) {
	case 'cfgCheck':
		$cfgCheck = array(
			"cfg" => false, 
			"ytdl" => false, 
			"ytdl_perm" => false, 
			"getid3" => false,
			"getid3_ex" => false,
			"xml" => false,
			"curl" => false,
//			"dom" => false,
			"token" => false,
			"token_perm" => false,
			"geniustoken" => '',
			"geniuslyrics" => false,
			"lrcliblyrics" => false,
			"bookmarks" => false,
		);
		$cfg = dirname(__FILE__).'/config.json';
		$json = file_get_contents($cfg); 
		if ($json !== false) {
			if(is_writable($cfg)) {		
				$cfgCheck["cfg"] = true;
			}
		}
		if(file_exists("/usr/local/bin/youtube-dl")){
			$cfgCheck["ytdl"] = true;
			if(is_executable("/usr/local/bin/youtube-dl")){
				$cfgCheck["ytdl_perm"] = true;
			}			
		}
		if(is_dir("/var/lib/mpd/playlists/bookmarks")){
			$cfgCheck["bookmarks"] = true;
		}
		if(file_exists("/var/www/inc/getid3/getid3.php")){
			$cfgCheck["getid3"] = true;
			if(is_executable(dirname("/var/www/inc/getid3/getid3.php"))){
				$cfgCheck["getid3_ex"] = true;
			}
		}
		$found=true;
		$loaded_extensions = get_loaded_extensions();
		if(in_array("curl",$loaded_extensions)){		
			$cfgCheck["curl"] = true;
			$cfgCheck["lrcliblyrics"] = true;
		}
		else {$found=false;}
		if(in_array("xml",$loaded_extensions)){		
			$cfgCheck["xml"] = true;
		}		
		else {$found=false;}
//		if(in_array("dom",$loaded_extensions)){		
//			$cfgCheck["dom"] = true;
//		}		
//		else {$found=false;}
		$ClientAccessToken = "";
		$fp = @fopen(dirname(__FILE__) . "/lyrics/clientaccesstoken.txt", "r");
		if ($fp) {
			$ClientAccessToken = fgets($fp);
			fclose($fp);
		}
		if($ClientAccessToken != ""){
			$cfgCheck["token"] = true;
			$cfgCheck["geniustoken"] = $ClientAccessToken;
		}		
		else {$found=false;}
		if($found){
			$cfgCheck["geniuslyrics"] = true;
		}		
		$cfg = dirname(__FILE__).'/lyrics/clientaccesstoken.txt';
		if(is_writable($cfg)) {		
			$cfgCheck["token_perm"] = true;
		}
		$arrCfg=[];
		$arrCfg[]=$cfgCheck;
		$arrCfg[]=json_decode($json);
		echo json_encode($arrCfg);
		break;
	case 'setCfg':
		if(isset($_GET['jArr'])){
			$jArr=json_decode($_GET['jArr']);
			$jStr=json_encode($jArr, JSON_PRETTY_PRINT);
			$fp = @fopen(dirname(__FILE__).'/config.json', "w");
			if ($fp) {
#				fwrite($fp,$_GET['jArr']);
				fwrite($fp,$jStr);
				fclose($fp);
				echo "true";
			}
			else{
				echo "error";
			}
		}
		else{
			echo "false";
		}
		break;

	case 'setToken':
		if(isset($_GET['geniustoken'])){
			$fp = @fopen(dirname(__FILE__) . "/lyrics/clientaccesstoken.txt", "w");
			if ($fp) {
				fwrite($fp,$_GET['geniustoken']);
				fclose($fp);
				echo "true";
			}
			else{
				echo "error";
			}
		}
		else{
			echo "false";
		}
		break;
	case 'fixIt':
		switch ($_GET['fix']) {
			case 'cfg':
				$command = 'sudo chmod 666 /var/www/addons/Stephanowicz/config.json 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
				$error_output = [];
				$exit_code = -1;
				exec($command, $error_output, $exit_code);
				if ($exit_code === 0) {echo "true";} 
				else {echo implode("\n", $error_output);}
				break;
			case 'ytdlp':
				$loaded_extensions = get_loaded_extensions();
				if(in_array("curl",$loaded_extensions)){
					$command = 'sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/youtube-dl 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
					$error_output = [];
					$exit_code = -1;
					exec($command, $error_output, $exit_code);
					if ($exit_code === 0) {
						$command = 'sudo chmod 755 /usr/local/bin/youtube-dl 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
						exec($command, $error_output, $exit_code);
						if ($exit_code === 0) {echo "true";}
						else {echo implode("\n", $error_output);}
					} 
					else {echo implode("\n", $error_output);}
				}
				else {echo "CURL needs to be installed!";}
				break;
			case 'ytdlp_perm':
				$command = 'sudo chmod 755 /usr/local/bin/youtube-dl 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
				exec($command, $error_output, $exit_code);
				if ($exit_code === 0) {echo "true";}
				else {echo implode("\n", $error_output);}
				break;
			case 'getID3':
				$command = 'sudo wget -O ~/getid3.zip https://github.com/JamesHeinrich/getID3/archive/master.zip 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
				$error_output = [];
				$exit_code = -1;
				exec($command, $error_output, $exit_code);
				if ($exit_code === 0) {
					$command = 'sudo 7z e ~/getid3.zip -aoa -o/var/www/inc/getid3/ getID3-master/getid3/*.php 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
					exec($command, $error_output, $exit_code);
					if ($exit_code === 0) {
						$command = 'sudo chmod -R 755 /var/www/inc/getid3/ 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
						exec($command, $error_output, $exit_code);
						if ($exit_code === 0) {echo "true";}
						else {echo implode("\n", $error_output);}							
					}
					else {echo implode("\n", $error_output);}
				} 
				else {echo implode("\n", $error_output);}
				break;
			case 'getID3_perm':
				$command = 'sudo chmod -R 755 /var/www/inc/getid3/ 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
				exec($command, $error_output, $exit_code);
				if ($exit_code === 0) {echo "true";}
				else {echo implode("\n", $error_output);}
				break;
			case 'curl':
				$command = 'sudo apt-get install php-curl 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
				$error_output = [];
				$exit_code = -1;
				exec($command, $error_output, $exit_code);
				if ($exit_code === 0) {echo "true";} 
				else {echo implode("\n", $error_output);}
				break;
			case 'xml':
				$command = 'sudo apt-get install php-xml 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
				$error_output = [];
				$exit_code = -1;
				exec($command, $error_output, $exit_code);
				if ($exit_code === 0) {echo "true";} 
				else {echo implode("\n", $error_output);}
				break;
			case 'token_perm':
				$command = 'sudo chmod 666 /var/www/addons/Stephanowicz/lyrics/clientaccesstoken.txt 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
				exec($command, $error_output, $exit_code);
				if ($exit_code === 0) {echo "true";}
				else {echo implode("\n", $error_output);}
				break;
			case 'bookmarks':
				$command = 'sudo mkdir -m 775 /var/lib/mpd/playlists/bookmarks 2>&1'; // 2>&1 leitet Fehler in die Ausgabe um
				exec($command, $error_output, $exit_code);
				if ($exit_code === 0) {echo "true";}
				else {echo implode("\n", $error_output);}
				break;
		}
		break;
    default:
		echo 'Unknown command';
		break;
}
