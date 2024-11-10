<?php
/**
 * moOde audio player (C) 2014 Tim Curtis
 * http://moodeaudio.org
 *
 * (C) 2022 Stephanowicz
 * https://github.com/Stephanowicz/moode/
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
 * 2022-MM-DD TC moOde 8.x.x
 *
 */
	require_once dirname(__FILE__) . '/../../../inc/common.php';

	if(count($argv)>1){
	  parse_str(implode('&', array_slice($argv, 1)), $_GET);
	}
	if(isset($_GET['artist'])){
	  $ARTIST=$_GET['artist'];
	}
	else{
	  $ARTIST =shell_exec('mpc --format %artist% | head -n 1');
	  $ARTIST =str_replace("\n","",$ARTIST);
	}
//	echo "ARTIST " . $ARTIST . PHP_EOL;
	if(isset($_GET['title'])){
	  $TITLE=$_GET['title'];
	}
	else{
	  $TITLE =shell_exec('mpc --format %title% | head -n 1');
	  $TITLE =str_replace("\n","",$TITLE);
	}
//	echo "TITLE " . $TITLE . PHP_EOL;

	if(isset($_GET['filepath'])){
	  $filepath=$_GET['filepath'];
	}
	else{
		$filepath=shell_exec('mpc -f %file%|head -n 1');
	}
//	echo "filepath " . $filepath . PHP_EOL;
	if($filepath){
		$filepath=trim ($filepath);
		$path = MPD_MUSICROOT . $filepath;
		$path = dirname($path) . '/';
//	      	echo "path: ".$path . PHP_EOL;
	}
	if($path){
		foreach (glob($path . '*.txt') as $file) {
			$filename = basename($file, $suffix = ".txt");
//			echo "file: " .$filename . PHP_EOL;
//			echo "Title: " .$TITLE . PHP_EOL;

			if (is_file($file) && stripos($TITLE, $filename) !== false) {
//			if (is_file($file)) {
				$fdata = file_get_contents($file);
				if($fdata){
					$fdata=nl2br($fdata);
					echo '<p>'.$ARTIST.' - '.$TITLE.'<p>';
					echo $fdata;
//					echo '<p>(local file: ' . $file . ')</p>';
					break;
				}						
			}
//			else{
//				echo "stripos: " . stripos($TITLE, $file) . PHP_EOL;
//			}

		}
	}
	
?>
