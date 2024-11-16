<?php
/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
*/

$yturl = "";
if(isset($_REQUEST['yturl'])){
   createPLentry($_REQUEST['yturl'],$_REQUEST['plopts'],$_REQUEST['index'],$_REQUEST['length']);
}
elseif(isset($_REQUEST['ytpl'])){
  getYTPlaylist($_REQUEST['ytpl']);
}
elseif(isset($_REQUEST['loadnplay'])){
  shell_exec("mpc clear"); 
  sleep(0.5);
  shell_exec("mpc load youtube"); 
  sleep(0.5);
  shell_exec("mpc play"); 
  echo ("playlist loaded ... playback started");
}
elseif(isset($_REQUEST['playlist'])){showPlaylist();}
elseif(isset($_REQUEST['thumb'])){getThumb($_REQUEST['thumb']);}
elseif(isset($_REQUEST['ytpllist'])){ytpllist();}
elseif(isset($_REQUEST['saveytpl'])){saveytpl($_REQUEST['saveytpl']);}
elseif(isset($_REQUEST['delytpl'])){delytpl($_REQUEST['delytpl']);}

function ytpllist() {
  $plfile=shell_exec("cat /var/lib/mpd/playlists/ytpllist.txt");
  if($plfile!="")
  {
    $pltitles=explode("\n",$plfile);
    $csv = array_map('str_getcsv', $pltitles);
    echo json_encode($csv); 
  }
}    

function saveytpl($values) {
  //$plvals= explode(",",$values);
  file_put_contents('/var/lib/mpd/playlists/ytpllist.txt',$values."\r\n", FILE_APPEND);
  
  // $plfile=shell_exec("cat /var/lib/mpd/playlists/ytpllist.txt");
  // if($plfile!="")
  // {
    // $pltitles=explode("\n",$plfile);
    // $csv = array_map('str_getcsv', $pltitles);
    // echo json_encode($csv); 
  // }
} 

function delytpl($values) {
  $plfile=shell_exec("cat /var/lib/mpd/playlists/ytpllist.txt");
  if($plfile!="")
  {
    $pltitles_=explode("\n",$plfile);
    foreach ($pltitles_ as $value) {
        $pltitles[] = trim($value);
    }
    $key = array_search($values, $pltitles);
    if ($key !== false) {
      unset($pltitles[$key]);
      $f = @fopen("/var/lib/mpd/playlists/ytpllist.txt", "r+");
      if ($f !== false) {
          ftruncate($f, 0);
          fclose($f);
      }
      foreach($pltitles as $item)
      {
          file_put_contents('/var/lib/mpd/playlists/ytpllist.txt',$item."\r\n", FILE_APPEND);
      }
    }
  }
}

function createPLentry($yturl,$plopts,$cnt,$length) {
  $cmd = "youtube-dl --no-warnings --no-check-certificate --no-playlist --get-duration --get-thumbnail -e -f bestaudio -g $yturl";
  $yt = shell_exec($cmd);
  if($yt!=""){
    echo ("url created...");
    $yt_arr=explode("\n",$yt);
    $time_seconds = 0;
    if(isset($yt_arr[3])){
      $str_time = $yt_arr[3];
      $str_time = preg_replace("/^([\d]{1,2})\:([\d]{2})$/", "00:$1:$2", $str_time);
      sscanf($str_time, "%d:%d:%d", $hours, $minutes, $seconds);
      $time_seconds = $hours * 3600 + $minutes * 60 + $seconds;    
    }
    if($plopts == 'clear'){
      echo ("playlist cleared...");
      shell_exec("echo '#EXTM3U'|sudo tee /var/lib/mpd/playlists/youtube.m3u");     
    }
    if (in_array($plopts, array('clear', 'add'))){
      echo ("adding pl entry...");
      shell_exec("echo \"#EXTINF:$time_seconds, $yt_arr[0]\"|sudo tee -a /var/lib/mpd/playlists/youtube.m3u");
      shell_exec("sudo sh -c 'echo \"$yt_arr[1]\" >> /var/lib/mpd/playlists/youtube.m3u'");
      shell_exec("sudo sh -c 'echo \"#EXTIMG:$yt_arr[2]\" >> /var/lib/mpd/playlists/youtube.m3u'");
	  $img = file_get_contents($yt_arr[2]);
	  file_put_contents('/var/tmp/'.$cnt.'.jpg',$img);
    }
    elseif($plopts == 'append'){
      shell_exec("sudo mpc add '$yt_arr[1]'"); 
    }
    elseif($plopts == 'insert'){
      shell_exec("sudo mpc insert '$yt_arr[1]'");    
    }
    echo ("playlist entry created for: ".$yt_arr[0]. " (".$plopts.") " .$cnt."/".$length );
  }
  else {
    echo ("youtube-dl returned empty for: ".$yt_arr[0]. " (".$plopts.")");
  }
}

function getYTPlaylist($ytpl) {
  $ytpl=str_ireplace('&', '\&', $ytpl);
  $cmd = "youtube-dl --no-warnings -j --flat-playlist $ytpl";
  $ytpljson=shell_exec($cmd);
  $ytpljson1=str_ireplace("}\n{", '},{', $ytpljson);
  $ytpljson2='['.$ytpljson1.']';
  $ytplarray = json_decode($ytpljson2,true);
  $playlist = array ( );
  if(is_array($ytplarray)){
    foreach($ytplarray as $item)
    {
      if($item['id']!= ""){
        $url="https://youtu.be/".$item['id'];
//        echo $url."<br />";
        $playlist[$item['title']] = $url;        
 //       $ytmpd=shell_exec("sudo /var/www/command/yt-dl-mpd -i $url 2>&1");
      }
    }
    echo json_encode($playlist); 
  }
}

function showPlaylist() {
  $plfile=shell_exec("cat /var/lib/mpd/playlists/youtube.m3u | grep '#EXTINF:' | awk -F':' '{print $2}'");
  $plHtml="";
  if($plfile!="")
  {
    $pltitles=explode("\n",$plfile);
	$cnt=1;
    foreach($pltitles as $line){
      $sec=substr($line,0,strpos($line,','));
      $title=substr($line,strpos($line,',')+1);      
      if($sec!=""){
        $sec=sprintf('%02d:%02d:%02d', ($sec/3600),($sec/60%60), $sec%60);
      }
      if($title!=""){
        $plHtml.= sprintf('%02d',$cnt).". ".$title."  (".$sec.")<br />";
        $cnt++;
      }
    }
    echo $plHtml;
  }
  else {echo "empty";}
}

function getThumb($fileUrl){
echo $fileUrl."<br />";
$res=shell_exec("youtube-dl --no-warnings --list-thumbnails $fileUrl|grep mqdefault.jpg");
  if($res!="")
  {
    $thumbnails=explode("\n",$res);
	echo $thumbnails[0]."<br />";
	$thumbnail = substr($thumbnails[0], strpos($thumbnails[0],"http"));
	echo $thumbnail."<br />";
   }
}

?>
