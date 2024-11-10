# moOde-audioplayer-addons

This is a collection of addons I made for the [moOde audioplayer](https://github.com/moode-player)

It consists of:

1. Extended Albumart
	- Displays embedded images and files in albumfolder as thumbnails below albumcover and on the audioinfo page. A click opens the full image

2. Youtube audioplayback
	- parses youtube playlists or single videos and adds them to playlist

3. Graphics equalizer
	- same functionality like the moode eq but with instant reaction without stopping playback 

4. Songlyrics
	- query lyrics of current song and display them in a modal

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

2. 

	

	
