<?php
/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
*/

$ARTIST="";
$TITLE="";
$FILEPATH="";

$cfg = dirname(__DIR__, 1).'/config.json';
$json = file_get_contents($cfg); 
$arrCfg=[];
$geniuslyrics = false;
$lrcliblyrics = false;
$locallyrics = false;
if ($json !== false) {
	$arrCfg=json_decode($json,true);
	if(!empty($arrCfg)){
		$geniuslyrics = $arrCfg['genius'];
		$lrcliblyrics = $arrCfg['lrclib'];
	}
}
if(isset($_REQUEST['artist'])){
  $ARTIST=$_REQUEST['artist'];
}
else{
  $ARTIST_=shell_exec('mpc --format %artist% | head -n 1');
  $ARTIST =str_replace("\n","",$ARTIST_);
//  $ARTIST=str_replace(" ","+",$ARTIST_);
}

if(isset($_REQUEST['title'])){
  $TITLE=$_REQUEST['title'];
}
else{
  $TITLE_=shell_exec('mpc --format %title% | head -n 1');
  $TITLE =str_replace("\n","",$TITLE_);
 // $TITLE=str_replace(" ","+",$TITLE_);
}

if(isset($_REQUEST['file'])){
  $FILEPATH=$_REQUEST['file'];
}

if($FILEPATH != "")
	$cmd = 'php ' . dirname(__FILE__) . '/lyricsLocal.php artist="'.$ARTIST.'" title="'.$TITLE.'" filepath="'.$FILEPATH.'"';
else
	$cmd = 'php ' . dirname(__FILE__) . '/lyricsLocal.php artist="'.$ARTIST.'" title="'.$TITLE.'"';
	
$result = shell_exec($cmd);
if($result !=""){
	echo $result;
}
elseif($lrcliblyrics || $geniuslyrics){
/*
	$cmd = 'php ' . dirname(__FILE__) . '/geniuslyrics.php artist="'.$ARTIST.'" title="'.$TITLE.'"';
	$result = shell_exec($cmd);
	echo $result;
*/	
	$webfound=false;
	if($geniuslyrics && !$webfound){
		include(dirname(__FILE__) . '/geniuslyrics.php');
		if($genius['found']){
			echo $genius['data'];
			$webfound=true;
		}
	}
	if($lrcliblyrics && !$webfound){
		include(dirname(__FILE__) . '/lrclib.php');
		if($lrc['found']){
			echo $lrc['data'];
			$webfound=true;
		}	
	}
	if(!$webfound){
		if(($lrcliblyrics && $lrc['err']) || ($geniuslyrics && $genius['err'])){
			echo "<h2>Error<h2>";
			if($lrcliblyrics && $lrc['err']){
				echo "<p>lrclib-error: <br>".$lrc['data']."<p/>";
			}
			if($geniuslyrics && $genius['err']){
				echo "<p>genius-error: <br>".$genius['data']."<p/>";
			}
		}
		else{
			if($lrcliblyrics){echo "<p>lrclib: <br>".$lrc['data']."<p/>";}
			if($geniuslyrics){echo "<p>genius: <br>".$genius['data']."<p/>";}
		}
	}
}
