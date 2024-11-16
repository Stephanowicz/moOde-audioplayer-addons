<?php
/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
*/

$ARTIST="";
$TITLE="";
$FILEPATH="";

if(isset($_REQUEST['artist'])){
  $ARTIST=$_REQUEST['artist'];
}
if(isset($_REQUEST['title'])){
  $TITLE=$_REQUEST['title'];
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
else{
	$cmd = 'php ' . dirname(__FILE__) . '/geniuslyrics.php artist="'.$ARTIST.'" title="'.$TITLE.'"';
	$result = shell_exec($cmd);
	echo $result;
}
