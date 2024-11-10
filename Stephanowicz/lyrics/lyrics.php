<?php
/**
 * moOde audio player (C) 2014 Tim Curtis
 * http://moodeaudio.org
 *
 * (C) 2020 Stephanowicz
 * https://github.com/Stephanowicz
 *
 * This Program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3, or (at your option)
 * any later version.
 *
 * This Program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * 2020-12-15 TC moOde 7.0.0
 *
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