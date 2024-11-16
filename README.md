# moOde-audioplayer-addons

This is a collection of addons I made for the [moOde audioplayer](https://github.com/moode-player)

It consists of:

1. Extended Albumart
	- Displays embedded images and files in albumfolder as thumbnails below albumcover and on the audioinfo page.  
	A click opens the full image in a modal pop-up

2. Youtube audioplayback
	- parses youtube playlists or single videos and adds them to playlist

3. Graphics equalizer
	- same functionality like the moode eq but with instant reaction without stopping playback 

4. Songlyrics
	- query lyrics of current song and display them in a modal pop-up

5. Playbackmenue
	- Add/remove items for playbackcontrol on mainscreen - "repeat", "random", "single", "random album", "add to favourites"

6. Show Songtitle, Albumname and albumicon in browsertitlebar

7. Browse to folder 
	- Contextmenue-option to browse to songfolder in folderview

8. Show total and remainig playtime below playlist



## requirements & installation
- Tested with moOde audioplayer v9.x  
should also work with v8.x (will NOT work with v7.x)
  
 
- Download the repo and copy the **addons** folder and it's subfolders into the www-root folder */var/www/*  
the folder structure then should look like this:  
	/var/www/addons/Stephanowicz/...  
	The folder structure is important as all scripts rely on it  



- Generally You need to add a link to **addons.js** in **header.php**  
-> below the `<!-- Common JS -->` section in **header.php** You should find a link to *lib.min.js*: `<script src="js/lib.min.js?t=1729607710734" defer></script>`   
after this add `<script src="addons/addons.js?t=1729607710734" defer></script>`  
(the *t=xxxx* can be different - you may copy the one from lib.min.js) 
- make sure that /var/www/addons/Stephanowicz/**config.json** is writeable for all  
-> sudo chmod 666 /var/www/addons/Stephanowicz/config.json

 

1. Extended Albumart
	- requires [getid3](https://github.com/JamesHeinrich/getID3)  
	  install with: 
		- wget -O ~/getid3.zip https://github.com/JamesHeinrich/getID3/archive/master.zip
		- sudo 7z e ~/getid3.zip -aoa -o/var/www/inc/getid3/ getID3-master/getid3/*.php
  		- (or copy the  **getid3 subfolder** manually to */var/www/inc/*)
		- sudo chmod -R 755 /var/www/inc/getid3/

2. Youtube audioplayback
	- requires [yt-dlp](https://github.com/yt-dlp/yt-dlp)  
	  install with: 
		- sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/youtube-dl  
      		-> sudo chmod 755 /usr/local/bin/youtube-dl
		
4. Songlyrics
	- requires php-xml, php-curl, php-dom  
	  install with: 
	- sudo apt-get install php-xml php-curl php-dom  
	  
	- You will also need a **client access token** for the [Genius Lyrics](http://genius.com) API ->
	- Create a free account: [Genius Lyrics API](http://genius.com/api-clients )
	- then create a [new API client](https://genius.com/api-clients/new)  
	("App Website URL" and "Redirect URI" can be anything)
	- finally generate a [client access token](https://genius.com/api-clients) by clicking "Generate Access Token"  
	 -> add the **client access token** to **clientaccesstoken.txt** in the lyrics folder */var/www/addons/Stephanowicz/lyrics*  

	The other addons don't have any further requirements

## Addons

With /var/www/addons/Stephanowicz/**config.json** the addons can be dis-/enabled  
You can also do that by the [config-page](http://moode9.local/addons/Stephanowicz/config.html)  `http://moode9.local/addons/Stephanowicz/config.html`  
This page also checks if the requirements are met.  
![image](https://github.com/user-attachments/assets/5b9a6477-4e60-42bd-8e81-5306c7b35656)  
![image](https://github.com/user-attachments/assets/3c1ad513-13cb-4f79-9dea-24143cfc6971)
  
Worst case:  
![image](https://github.com/user-attachments/assets/e695ee40-9601-4054-bd86-a76f4108ab15)

1. Extended Albumart
	- Displays embedded images and files in the albumfolder as thumbnails below albumcover and on the audioinfo page.  
  	Below the albumcover 3 dots signalize that images are available  
   	![Albumart](https://github.com/user-attachments/assets/b440306d-3184-414d-b4e3-e982eb6f92bb)   
	a click on the dots opens the thumblist below  
	![Albumart1](https://github.com/user-attachments/assets/78ee4bc8-3f58-4ffb-a7ca-05f5f1677a3e)  
	a click on a thumb shows the image in albumview  
	![Albumart2](https://github.com/user-attachments/assets/0c3c8a83-a8ea-4e1a-8f9f-a6624c5d1ecf)  
	a doubleclick opens the image in a modal view  
	![Albumart3](https://github.com/user-attachments/assets/13a53b84-bbfd-4eb8-a9b5-7f642cc6f84e)  
	in the Audio Information modal, the images are listed with more info at the end of the file infos  
	![Albumart4](https://github.com/user-attachments/assets/65110d36-3739-4e21-bda9-f7912e70faa9)  

2. Youtube audioplayback
	- parses youtube playlists or single videos and adds them to playlist  
	![image](https://github.com/user-attachments/assets/069b8a15-b197-4d4e-b93d-49acd94ec4a4)  
	You have the option to add a link to a single video or a link to a video playlist.  
	Keep in mind that single links and the links generated from the playlists last only a few hours.  
	While the link to a playlist should stay the same for a long time.  
	Therefore You have the option to safe the playlist-url and reuse it later - but still the links to the audiosource have to be generated  
	
   	After adding a link, ytdl starts a query for the link(s) of the audiosource(s)  
	![image](https://github.com/user-attachments/assets/858e6a80-8b69-4701-a8ab-27bbe0942f22)  
 	You have the option to clear the playlist before adding or to append to the list.  
	For single vids You also have the option to add them to the current moOde playlist.  
	
	When clicking *create playlist*, ytdl creates a playlist for mpd (youtube.m3u)
	![image](https://github.com/user-attachments/assets/8d1535f8-e4cf-4c8e-8fee-473e605f461c) 

	*load & play* finally starts the playback
	![image](https://github.com/user-attachments/assets/ae47a380-8083-45c1-82be-650f01aa0c17)  

3. Graphics equalizer  
	The equalizer has the same functionality like the moode eq but with instant reaction without stopping playback  
	![image](https://github.com/user-attachments/assets/2af8d756-3970-47e4-a49d-5edcd8417aa5)  
	You can save presets and reload them.  
	When selecting a different preset, the changes are signalized by red bars - by clicking *load* the preset will be activated  
	![image](https://github.com/user-attachments/assets/dd933489-e99f-461a-bbe7-34cdd9f32a75)  

	
4. Songlyrics
	- query lyrics of current song and display them in a modal  
	![image](https://github.com/user-attachments/assets/21f61711-1f0c-44bc-b5df-2ab6b8ebf7eb)  
	
5. Playbackmenue
	- Add/remove items for playbackcontrol on mainscreen - "repeat", "random", "single", "random album", "add to favourites"  
	![image](https://github.com/user-attachments/assets/ef1deacc-5fef-4c33-9947-474d9194d9fd)  
	Removed items are placed in the pop-up menue  
	![image](https://github.com/user-attachments/assets/873f2767-8699-4140-b7e0-813b02874d6e)  

6. Show Songtitle, Albumname and albumicon in browsertitlebar or tab  
	![image](https://github.com/user-attachments/assets/55c6f3e3-3b67-4911-8156-28cea76f9f5b)  
	Tip: use a bare window without controls for the moOde audioplayer  
	for edge (chrome?) you need to add the params `--app=http://moode9.local --window-size=800,600` to the browser command:  
	`msedge --app=http://moode9.local --window-size=800,600`  
	(this should also be possible for firefox etc. - but I don't know the commands at moment)  

7. Browse to folder 
	- Contextmenue-option to browse to songfolder in folderview  
	![image](https://github.com/user-attachments/assets/085b1245-e2c2-4642-9e35-64186c2a4251)  
	->  
	![image](https://github.com/user-attachments/assets/00044b3e-9255-454d-913c-d0226c592425)  

8. Show total and remainig/elapsed playtime below playlist  
	- ![image](https://github.com/user-attachments/assets/e9b5049d-a9b4-4ce8-8b68-6c51aa6bcc01)
 	- remaining or elapsed playtime will be shown according to Your general display setting of showing playtime	


That's it - have fun!


	
 
	





	

	
