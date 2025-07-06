# mpd_pl_nextalbum.py  
Tiny helper to skip forward/backward to next/previous album or folder in playlist 
(restarts the list if last album is currently playing)  
 obviously this requires a playlist of local files with an apropiate folder structure:  
 eg. /xyz/Artist/Album1/Song123.mp3 .... /xyz/Artist/Album2/Song456.mp3  
 ...at least different folders are required  
 eg. /xyz/abc/Song123.mp3 .... /xyz/def/Song456.mp3  
  
 calling the script without argument skips forward - add 'back' for skipping backwards 
 e.g python mpd_pl_nextalbum.py back 
  
 You may use this with a remotecontrol and lirc: 
  In Your /etc/lirc/irexec.lircrc You may add smth like this:

```
 begin
 	prog = irexec
 	button = KEY_RIGHT
 	config = python /var/www/addons/Stephanowicz/utils/mpd_pl_nextalbum.py
 end

 begin
 	prog = irexec
 	button = KEY_LEFT
 	config = python /var/www/addons/Stephanowicz/utils/mpd_pl_nextalbum.py back
 end
```
