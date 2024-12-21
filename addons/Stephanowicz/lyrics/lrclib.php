<?php
/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
*/

	error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
	
	$lrc = [];
	$lrc['err'] = true;
	$lrc['errtxt'] = '';
	$lrc['data'] = "";
	$lrc['found'] = false;
	if(isset($_SERVER['argv'])){
		if(count($argv)>1){
			parse_str(implode('&', array_slice($argv, 1)), $_GET);
		}
	}
	if(isset($_GET['artist'])){
	  $ARTIST=$_GET['artist'];
	}
	else{
	  $ARTIST_=shell_exec('mpc --format %artist% | head -n 1');
	  $ARTIST =str_replace("\n","",$ARTIST_);
	//  $ARTIST=str_replace(" ","+",$ARTIST_);
	}
	if(isset($_GET['title'])){
	  $TITLE=$_GET['title'];
	}
	else{
	  $TITLE_=shell_exec('mpc --format %title% | head -n 1');
	  $TITLE =str_replace("\n","",$TITLE_);
	 // $TITLE=str_replace(" ","+",$TITLE_);
	}

	if($TITLE!="" && $ARTIST!=""){
		$songlyrics="";
		$found=false;
		$query = array('track_name' => $TITLE, 'artist_name' => $ARTIST);
		$lrcurl .= 'https://lrclib.net/api/get';
		$lrcurl .= (strpos("?",$lrcurl)===false ? "?" : "&") . http_build_query($query);
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_URL,$lrcurl);
		$result=curl_exec($ch);
		curl_close($ch);
		$file =str_replace(array("<br>", "<br />", "<br/>"), "!rn!",$result);
		if($file!=""){
			$data=json_decode($file, true);
			if($data!=null && array_key_exists('trackName', $data)){
				$songlyrics=nl2br($data["plainLyrics"]);
				$songlyrics=str_replace("!rn!","<br />",$songlyrics);
				
				$msg='<p>'.$data["artistName"].' - '.
					$data["trackName"].'<p>'.$songlyrics.
					"<p><a target='_blank' href='".$lrcurl."'>".$lrcurl."</a></p>";
			//	echo '<p>'.$data["artistName"].' - '.$data["trackName"].'<p>';
			//	echo $songlyrics;
			//	echo "<p><a target='_blank' href='".$lrcurl."'>".$lrcurl."</a></p>";
				if(isset($_SERVER['argv'])){echo $msg;}
				else{
					$lrc['err'] = false;
					$lrc['data'] = $msg;
					$lrc['found'] = true;
				}
			}
			else{
				$msg="<br /><br />Sorry, no lyrics found<br />".
					"<a target='_blank' href='".$lrcurl."'>".$lrcurl."</a>";
				if(isset($_SERVER['argv'])){echo $msg;}
				else{
					$lrc['err'] = false;
					$lrc['data'] = $msg;
					$lrc['found'] = false;
				}
			//  echo "<br /><br />Sorry, no lyrics found<br />";
			//  echo "<a target='_blank' href='".$lrcurl."'>".$lrcurl."</a>";
			}		
		}
		else{
		//	echo "<br /><br />Sorry, no lyrics found<br />";
		//	echo "<a target='_blank' href='".$lrcurl."'>".$lrcurl."</a>";
			$msg="<br /><br />Sorry, no lyrics found<br />".
				"<a target='_blank' href='".$lrcurl."'>".$lrcurl."</a>";
			if(isset($_SERVER['argv'])){echo $msg;}
			else{
				$lrc['err'] = false;
				$lrc['data'] = $msg;
				$lrc['found'] = false;
			}
		}
	}
	else{
		$msg="<br /><br />not enough information provided for a specific lyrics-query...<br />".
			`$TITLE=="" ? "(Title missing)<br>":""`.`$ARTIST=="" ? "(Artist missing<br>)":""`;
	//  echo("<br /><br />not enough information provided for a specific lyrics-query...<br />");
	//  if($TITLE==""){echo ("(Title missing)");}
	//  if($ARTIST==""){echo ("(Artist missing)");}
		if(isset($_SERVER['argv'])){echo $msg;}
		else{
			$lrc['err'] = true;
			$lrc['data'] = $msg;
			$lrc['found'] = false;
		}
	}
	