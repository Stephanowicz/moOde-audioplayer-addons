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
//			echo "<br>data: <br>";
//			print_r($data)."<br>";
			if($data!=null && array_key_exists('trackName', $data) && array_key_exists('syncedLyrics', $data)){
//				echo "<br>synced: <br>";
//				echo $data["syncedLyrics"]."<br>";
				if($data["syncedLyrics"] !=null){
					$arr=preg_split('/\r\n|\r|\n/', $data["syncedLyrics"]);
					$songlyrics = array();
	//				echo "<br>arr: <br>";
	//				print_r($arr)."<br>";
	//				echo "<br>split: <br>";
	//				echo "<br>count: ".count($arr)."<br>";
					if(count($arr)>1){
						foreach($arr as $item){
							$tmp=preg_split('/\]/', $item,2);
		//					print_r($tmp)."<br>";
							$songlyrics[trim($tmp[0],"\[")]=trim($tmp[1]);
						}
		//				echo "<br>songlyrics: <br>";
		//				print_r($songlyrics)."<br>";
						echo json_encode($songlyrics);
					}
				}
			}
		}
	}
