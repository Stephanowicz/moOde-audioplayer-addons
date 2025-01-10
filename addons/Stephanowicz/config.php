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
			"getid3" => false,
			"getid3_ex" => false,
			"xml" => false,
			"curl" => false,
//			"dom" => false,
			"token" => false,
			"token_perm" => false,
			"geniustoken" => '',
			"geniuslyrics" => false,
			"lrcliblyrics" => false
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
		
    default:
		echo 'Unknown command';
		break;
}
