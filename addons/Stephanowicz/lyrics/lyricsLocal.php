<?php
/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
*/

	if(isset($_SERVER['argv'])){
		if(count($argv)>1){
		  parse_str(implode('&', array_slice($argv, 1)), $_GET);
		}
	}
	if(isset($_GET['artist'])){
	  $ARTIST=$_GET['artist'];
	}
	else{
	  $ARTIST =shell_exec('mpc --format %artist% | head -n 1');
	  $ARTIST =str_replace("\n","",$ARTIST);
	}
	if(isset($_GET['title'])){
	  $TITLE=$_GET['title'];
	}
	else{
	  $TITLE =shell_exec('mpc --format %title% | head -n 1');
	  $TITLE =str_replace("\n","",$TITLE);
	}
	if(isset($_GET['filepath'])){
	  $filepath=$_GET['filepath'];
	}
	else{
		$filepath=shell_exec('mpc -f %file%|head -n 1');
	}
	if($filepath){
		$filepath=trim ($filepath);
		$path = '/var/lib/mpd/music/' . $filepath;
		$path = dirname($path) . '/';
	}
	if($path){
		foreach (glob($path . '*{.txt,.lrc}',GLOB_BRACE) as $file) {
			$info = pathinfo($file);
			$filename = basename($file,'.'.$info['extension']);
			if (is_file($file) && (stripos($TITLE,$filename)!==false || stripos($filename,$TITLE)!==false)) {
				$fdata = file_get_contents($file);
				if($fdata){
					if($info['extension']=="lrc"){
						$fdata = preg_replace('/\[[\s\S]+?\]/', '', $fdata);
					}
					$fdata=nl2br($fdata);
					echo '<p>'.$ARTIST.' - '.$TITLE.'<p>';
					echo $fdata;
//					echo '<p>(local file: ' . $file . ')</p>';
					break;
				}						
			}
		}
	}
	
?>
