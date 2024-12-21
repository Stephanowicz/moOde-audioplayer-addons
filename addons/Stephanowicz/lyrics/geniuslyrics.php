<?php
/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
*/
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

$genius = [];
$genius['err'] = true;
$genius['errtxt'] = '';
$genius['data'] = "";
$genius['found'] = false;

$ClientAccessToken = "";
$fp = @fopen(dirname(__FILE__) . "/clientaccesstoken.txt", "r");
if ($fp) {
    $ClientAccessToken = fgets($fp);
	fclose($fp);
}
if($ClientAccessToken != ""){
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

	  $query = array('q' => $TITLE.' '.$ARTIST,'access_token' => $ClientAccessToken);
	  $geniusurl .= 'https://api.genius.com/search';
	  $geniusurl .= (strpos("?",$geniusurl)===false ? "?" : "&") . http_build_query($query);

	  $ch = curl_init();
	  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	  curl_setopt($ch, CURLOPT_URL,$geniusurl);
	  $result=curl_exec($ch);
	  curl_close($ch);
	//print_r(json_decode($result, true));

	  $json = json_decode($result, TRUE);
	  //print_r($json);
	  $val = $json["response"]["hits"];
	  //print_r($val);
	  $song_api_path="";
	  $song_url="";
	  foreach($val as $hit){
		if(stripos ($hit["result"]["primary_artist"]["name"],$ARTIST)!==False){
			//print('found' . chr(10));
			$artistFound=$hit["result"]["primary_artist"]["name"];
			$songFound=$hit["result"]["title"];
			$song_api_path = $hit["result"]["api_path"];
			$song_url=$hit["result"]["url"];
			break;
		}
	  }
	  $songlyrics="";
	  if($song_url != ""){
		$found=false;
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_URL,$song_url);
		$result=curl_exec($ch);
		curl_close($ch);
		$file =str_replace(array("<br>", "<br />", "<br/>"), "!rn!",$result);
		if($file!=""){
			$dom = new DOMDocument;
			$dom->loadHTML($file);
			$xpath = new DOMXPath($dom);
//			foreach( $xpath->query('//div[starts-with(@class, "Lyrics__Container")]') as $e ) {
			foreach( $xpath->query('//div[starts-with(@data-lyrics-container, "true")]') as $e ) {
				$songlyrics.=$e->nodeValue;
			}
		}

		if($songlyrics!=""){
		  $songlyrics=nl2br($songlyrics);
		  $songlyrics=str_replace("!rn!","<br />",$songlyrics);
	//      $songlyrics=str_replace("]","]<br />",$songlyrics);
	//      $songlyrics=str_replace("[","<br />[",$songlyrics);
			$msg = '<p>'.$artistFound.' - '.$songFound.'<p>'.
				$songlyrics.
				"<p><a target='_blank' href='".$song_url."'>".$song_url."</a></p>";
				
//		  echo '<p>'.$artistFound.' - '.$songFound.'<p>';
//		  echo $songlyrics;
//		  echo "<p><a target='_blank' href='".$song_url."'>".$song_url."</a></p>";
			if(isset($_SERVER['argv'])){echo $msg;}
			else{
				$genius['err'] = false;
				$genius['data'] = $msg;
				$genius['found'] = true;
			}	
		}
		else{
			$msg = "<br /><br />cannot parse the lyrics-page<br />".
				"<a target='_blank' href='".$song_url."'>".$song_url."</a>".
				"If the lyrics are shown in the above link, please don't hesitate to contact me @<br />".
				"<a target='_blank' href='https://github.com/Stephanowicz/moOde-audioplayer-addons/issues'>".
				"moOde-audioplayer-addons - Issues<br />".
				"as it happens from time to time that genius changes their code!";
			if(isset($_SERVER['argv'])){echo $msg;}
			else{
				$genius['err'] = true;
				$genius['data'] = $msg;
				$genius['found'] = false;
			}	
			
//		  echo "<br /><br />cannot parse the lyrics-page<br />";
//		  echo "<a target='_blank' href='".$song_url."'>".$song_url."</a>";
		}
	  }
	  else{
		if($result[0]=="401"){
		  //echo "401 Unauthorized<br /><br />please check Your client accesstoken!<br /><br />";
			$msg = "401 Unauthorized<br /><br />please check Your client accesstoken!<br /><br />";
			if(isset($_SERVER['argv'])){echo $msg;}
			else{
				$genius['err'] = true;
				$genius['data'] = $msg;
				$genius['found'] = false;
			}			
		}
		else{
			//echo "<br /><br />Sorry, no lyrics found...<br /><br />";
			$msg = "<br /><br />Sorry, no lyrics found...<br /><br />";
			if(isset($_SERVER['argv'])){echo $msg;}
			else{
				$genius['err'] = false;
				$genius['data'] = $msg;
				$genius['found'] = false;
			}						
		}
	  }
	}
	else{
//	  echo("<br /><br />not enough information provided for a specific lyrics-query...<br />");
//	  if($TITLE==""){echo ("(Title missing)");}
//	  if($ARTIST==""){echo ("(Artist missing)");}
		$msg="<br /><br />not enough information provided for a specific lyrics-query...<br />".
			`$TITLE=="" ? "(Title missing)<br>":""`.`$ARTIST=="" ? "(Artist missing<br>)":""`;
		if(isset($_SERVER['argv'])){echo $msg;}
		else{
			$genius['err'] = true;
			$genius['data'] = $msg;
			$genius['found'] = false;
		}
	}
}
else{
//	echo("<br /><br />You need to provide a client accesstoken in file<br /> <i>" . dirname(__FILE__) . "/clientaccesstoken.txt</i>!<br />");
	$msg="<br /><br />You need to provide a client accesstoken in file<br /> <i>" . dirname(__FILE__) . "/clientaccesstoken.txt</i>!<br />";
	if(isset($_SERVER['argv'])){echo $msg;}
	else{
		$genius['err'] = true;
		$genius['data'] = $msg;
		$genius['found'] = false;
	}	
}
?>
