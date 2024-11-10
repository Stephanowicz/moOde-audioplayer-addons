<!DOCTYPE html>
<html>
	<head>
	  <link rel="stylesheet" href="/css/styles.min.css">	  
      <script src="alsamixer/public/js/jquery.min.js"></script>
	  <style>
		.settings {
			padding-left: 10px;
			padding-top: 5px;
		}
		#youtube-dl, #eq, #albumart, #lyrics, #random, #favorites, #repeat, #single, #browsertitle {
			width: 19px;
			height: 19px;
			margin: 5px;
		}
		.flex-container {
  			display: flex;
			align-items: center;
		}
	  </style>
	</head>
	<body style="background-color: #1e272c;">

	<!-- Configfile -->
	<div class="settings flex-container" id="cfg" style="padding-bottom: 10px;">
		<div><i class="fa-regular fa-ban" aria-hidden="true" style="font-size: 18px;color: red;"></i></div>
		<div>
			<span style="padding-left: 19px;"><i><?php echo dirname(__FILE__).'/config.json' ?></i> is not writeable! </span><br>
			<span style="padding-left: 19px;">Settings cannot be saved! </span>
		</div>
	</div>

	
	<!-- Youtube audio-playback -->
	<div class="settings" id="ytdl">
		<input type="checkbox" id="youtube-dl" name="youtube-dl" disabled> Youtube audio-playback
		<div id="youtube-dl_err">
			<span id="youtube-dl_text" style="font-size: small;padding-left: 19px;">/usr/local/bin/youtube-dl </span>
			<span id="youtube-dl_check"><i class="fa-regular fa-ban" aria-hidden="true" style="font-size: 18px;color: red;"></i></span><br>
			<span id="youtube-dl_check_text" style="font-size: small;padding-left: 19px;">Install with: <i>sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/youtube-dl</i><br></span>
		</div>
	</div>

	<!-- Albumart -->
	<div class="settings" id="getid3">
		<input type="checkbox" id="albumart" name="albumart" disabled> Extended Albumart
		<div id="getid3_check_err1">
			<span id="getid3_text" style="font-size: small;padding-left: 19px;">/var/www/inc/getid3 </span>
			<span id="getid3_check"><i class="fa-regular fa-ban" aria-hidden="true" style="font-size: 18px;color: red;"></i></span><br>
			<span id="getid3_check_text" style="font-size: small;padding-left: 19px;">Install with: <i>wget -O ~/getid3.zip https://github.com/JamesHeinrich/getID3/archive/master.zip </i><br></span>
			<span id="getid3_check_text1" style="font-size: small;padding-left: 19px;"><i>sudo 7z e ~/getid3.zip -aoa -o/var/www/inc/getid3/ getID3-master/getid3/*.php</i><br></span>
		</div>
		<div id="getid3_check_err2">
			<span id="getid3_check_mod_text" style="font-size: small;padding-left: 19px;">Filepermissions 755 </span>
			<span id="getid3_check_mod"><i class="fa-regular fa-ban" aria-hidden="true" style="font-size: 18px;color: red;"></i><br></span>
			<span id="getid3_check_text2" style="font-size: small;padding-left: 19px;"><i>sudo chmod -R 755 /var/www/inc/getid3/</i><br></span>
		</div>
	</div>
	
	<!-- Graphics Equalizer -->
	<div class="settings">
		<input type="checkbox" id="eq" name="eq" disabled> Graphics Equalizer<br>
	</div>

	<!-- Lyrics -->
	<div class="settings" id="songlyrics">
		<input type="checkbox" id="lyrics" name="lyrics" disabled> Songlyrics
		<div id="lyrics_xml_err">
			<span id="lyrics_xml_text" style="font-size: small;padding-left: 19px;">php-xml </span>
			<span id="lyrics_xml_check"><i class="fa-regular fa-ban" aria-hidden="true" style="font-size: 18px;color: red;"></i><br></span>
			<span id="lyrics_xml_check_text" style="font-size: small;padding-left: 19px;">Install with: <i>sudo apt-get install php-xml</i><br></span>
		</div>
			
		<div id="lyrics_curl_err">
			<span id="lyrics_curl_text" style="font-size: small;padding-left: 19px;">php-curl </span>
			<span id="lyrics_curl_check"><i class="fa-regular fa-ban" aria-hidden="true" style="font-size: 18px;color: red;"></i><br></span>
			<span id="lyrics_curl_check_text" style="font-size: small;padding-left: 19px;">Install with: <i>sudo apt-get install php-curl</i><br></span>
		</div>
			
		<div id="lyrics_dom_err">
			<span id="lyrics_dom_text" style="font-size: small;padding-left: 19px;">php-curl </span>
			<span id="lyrics_dom_check"><i class="fa-regular fa-ban" aria-hidden="true" style="font-size: 18px;color: red;"></i><br></span>
			<span id="lyrics_dom_check_text" style="font-size: small;padding-left: 19px;">Install with: <i>sudo apt-get install php-dom</i><br></span>
		</div>
			
	</div>
		
	<div class="settings flex-container" id="token" style="padding-bottom: 10px;">
		<div><i class="fa-regular fa-ban" aria-hidden="true" style="font-size: 18px;color: red;"></i></div>
		<div>
			<span style="padding-left: 19px;">Genius lyrics: no client access token found! </span><br>
			<span style="padding-left: 19px;">If You already have one You can insert it here: </span><br>
			<span style="padding-left: 19px;">otherwise create a free account: http://genius.com/api-clients </span><br>
			<span style="padding-left: 19px;">then create a new API client: https://genius.com/api-clients/new ("App Website URL" and "Redirect URI" can be anything)</span><br>
			<span style="padding-left: 19px;">finally generate a client access token: https://genius.com/api-clients by clicking "Generate Access Token"</span><br>
		</div>
	</div>
	
	<!-- Playback-menu -->
	<div class="settings">
		<input type="checkbox" id="random" name="random" disabled> Playback-menue: Show "Random Album playback" button <i class="ralbum"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M475.31 364.144L288 256l187.31-108.144c5.74-3.314 7.706-10.653 4.392-16.392l-4-6.928c-3.314-5.74-10.653-7.706-16.392-4.392L272 228.287V12c0-6.627-5.373-12-12-12h-8c-6.627 0-12 5.373-12 12v216.287L52.69 120.144c-5.74-3.314-13.079-1.347-16.392 4.392l-4 6.928c-3.314 5.74-1.347 13.079 4.392 16.392L224 256 36.69 364.144c-5.74 3.314-7.706 10.653-4.392 16.392l4 6.928c3.314 5.74 10.653 7.706 16.392 4.392L240 283.713V500c0 6.627 5.373 12 12 12h8c6.627 0 12-5.373 12-12V283.713l187.31 108.143c5.74 3.314 13.079 1.347 16.392-4.392l4-6.928c3.314-5.74 1.347-13.079-4.392-16.392z"></path></svg></i><br>
	</div>
	<div class="settings">
		<input type="checkbox" id="favorites" name="favorites" disabled> Playback-menue: Show "Add to favorites" button <i class="fal fa-heart sx"></i><br>
	</div>
	<div class="settings">
		<input type="checkbox" id="repeat" name="repeat" disabled> Playback-menue: Show "Repeat playback" button <i class="fal fa-repeat"></i><br>
	</div>
	<div class="settings">
		<input type="checkbox" id="single" name="single" disabled> Playback-menue: Show "Single playback" button <i class="fal fa-redo"></i><br>
	</div>
	
	<!-- Browsertitle -->
	<div class="settings">
		<input type="checkbox" id="browsertitle" name="browsertitle" disabled> Show Songtitle, Albumname und Albumicon in Browsertitlebar
	</div>
	
	<?php
		$cfgCheck = array(
			"cfg" => false, 
			"ytdl" => false, 
			"getid3" => false,
			"getid3_ex" => false,
			"xml" => false,
			"curl" => false,
			"dom" => false,
			"token" => false,
			"lyrics" => false
		);
		$cfg = dirname(__FILE__).'/config.json';
		$json = file_get_contents($cfg); 
		if ($json !== false) {
			if(is_writable($cfg)) {		
				$cfgCheck["cfg"] = true;
			}
		}
		if(file_exists("/usr/local/bin/youtube-dl")){
			$cfgCheck["ytdl"] = true;
		}
		if(file_exists("/var/www/inc/getid3/getid3.php")){
			$cfgCheck["getid3"] = true;
			if(is_executable(dirname("/var/www/inc/getid3/getid3.php"))){
				$cfgCheck["getid3_ex"] = true;
			}
		}
		$found=true;
		$loaded_extensions = get_loaded_extensions();
		if(in_array("xml",$loaded_extensions)){		
			$cfgCheck["xml"] = true;
		}		
		else {$found=false;}
		if(in_array("curl",$loaded_extensions)){		
			$cfgCheck["curl"] = true;
		}
		else {$found=false;}
		if(in_array("dom",$loaded_extensions)){		
			$cfgCheck["dom"] = true;
		}		
		else {$found=false;}
		$ClientAccessToken = "";
		$fp = @fopen(dirname(__FILE__) . "/lyrics/clientaccesstoken.txt", "r");
		if ($fp) {
			$ClientAccessToken = fgets($fp);
			fclose($fp);
		}
		if($ClientAccessToken != ""){
			$cfgCheck["token"] = true;
		}		
		else {$found=false;}
		if($found){
			$cfgCheck["lyrics"] = true;
		}		
			
	?>	
		<script>
			var cfgCheck = <?php echo json_encode($cfgCheck); ?>;
			var cfgJson = <?php echo $json; ?>;

			cfgCheck["cfg"] && $("#cfg").hide();
			if(cfgCheck["ytdl"]){
				$("#youtube-dl").prop('disabled', false);
				$("#youtube-dl").prop('checked', cfgJson['ytdl']);
				$("#youtube-dl_err").hide();
			}
			if(cfgCheck["getid3"]){
				$("#getid3_check_err1").hide();
				if(cfgCheck["getid3_ex"]){
					$("#getid3_check_err2").hide();
					$("#albumart").prop('disabled', false);
					$("#albumart").prop('checked', cfgJson['albumart']);
				}
			}				
			cfgCheck["xml"] && $("#lyrics_xml_err").hide();
			cfgCheck["curl"] && $("#lyrics_curl_err").hide();
			cfgCheck["dom"] && $("#lyrics_dom_err").hide();
			cfgCheck["token"] && $("#token").hide();
			if(cfgCheck["lyrics"]){
				$("#lyrics").prop('disabled', false);
				$("#lyrics").prop('checked', cfgJson['lyrics']);
			}
			$("#eq").prop('disabled', false);
			$("#eq").prop('checked', cfgJson['eq']);
			$("#random").prop('disabled', false);
			$("#random").prop('checked', cfgJson['random']);
			$("#favorites").prop('disabled', false);
			$("#favorites").prop('checked', cfgJson['fav']);
			$("#repeat").prop('disabled', false);
			$("#repeat").prop('checked', cfgJson['repeat']);
			$("#single").prop('disabled', false);
			$("#single").prop('checked', cfgJson['single']);
			$("#browsertitle").prop('disabled', false);
			$("#browsertitle").prop('checked', cfgJson['browsertitle']);
		</script>				
	</body>
</html>