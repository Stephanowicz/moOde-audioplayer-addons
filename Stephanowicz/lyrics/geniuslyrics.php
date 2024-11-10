<?php
/*!
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
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
$ClientAccessToken = 'qx_rcEpbE919ce0QFHAskVUXk99F0J9kRI2SRKRlFSuLopSMKH8S-LnDeCwK2edo';

if(count($argv)>1){
  parse_str(implode('&', array_slice($argv, 1)), $_GET);
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
  $url .= 'https://api.genius.com/search';
  $url .= (strpos("?",$url)===false ? "?" : "&") . http_build_query($query);

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_URL,$url);
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
    };
  };
  if($song_url != ""){
    $songlyrics="";
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
		foreach( $xpath->query('//div[starts-with(@class, "Lyrics__Container")]') as $e ) {
			$songlyrics.=$e->nodeValue;
		};
    };

    if($songlyrics!=""){
      $songlyrics=nl2br($songlyrics);
      $songlyrics=str_replace("!rn!","<br />",$songlyrics);
//      $songlyrics=str_replace("]","]<br />",$songlyrics);
//      $songlyrics=str_replace("[","<br />[",$songlyrics);
      echo '<p>'.$artistFound.' - '.$songFound.'<p>';
      echo $songlyrics;
      echo "<p><a target='_blank' href='".$song_url."'>".$song_url."</a></p>";
    }
    else{
      echo "<br /><br />cannot parse the lyrics-page<br />";
      echo "<a target='_blank' href='".$song_url."'>".$song_url."</a>";
    };
  }
  else{
    if($result[0]=="401"){
      echo "401 Unauthorized<br /><br />please check Your client accesstoken!<br /><br />";
    }
    else{
    	echo "<br /><br />Sorry, no lyrics found...<br /><br />";
    };
  }
}
else{
  echo("<br /><br />not enough information provided for a specific lyrics-query...<br />");
  if($TITLE==""){echo ("(Title missing)");}
  if($ARTIST==""){echo ("(Artist missing)");}
};

?>
