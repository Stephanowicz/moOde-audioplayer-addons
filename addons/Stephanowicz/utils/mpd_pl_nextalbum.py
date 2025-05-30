#!/usr/bin/python
###################################################################################################
#
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright 2024 Stephanowicz 
# 
##################################################################################################
#
# Tiny helper to skip forward/backward to next/previous album or folder in playlist 
# (restarts the list if last album is currently playing)
# obviously this requires a playlist of local files with an apropiate folder structure
# eg. /xyz/Artist/Album1/Song123.mp3 .... /xyz/Artist/Album2/Song456.mp3
# ...at least different folders are required
# eg. /xyz/abc/Song123.mp3 .... /xyz/def/Song456.mp3
#
# calling the script without argument skips forward - add 'back' for skipping backwards
# e.g python mpd_pl_nextalbum.py back
#
# You may use this with a remotecontrol and lirc
# In Your /etc/lirc/irexec.lircrc You may add smth like this:
#
# begin
# 	prog = irexec
# 	button = KEY_RIGHT
# 	config = python /var/www/addons/Stephanowicz/utils/mpd_pl_nextalbum.py
# end
#
# begin
# 	prog = irexec
# 	button = KEY_LEFT
# 	config = python /var/www/addons/Stephanowicz/utils/mpd_pl_nextalbum.py back
# end
##################################################################################################

import sys
import os

direction = 1
if "back" in sys.argv:
	direction = -1

stream = os.popen('mpc -f "%file%" playlist')
mpclist = stream.read().splitlines()
mpclen=len(mpclist)
stream = os.popen('mpc status %songpos%')
mpcindex = stream.read()
index = 0
if mpclen > 0 and int(mpcindex) < (mpclen - 2):
	mpcsong = mpclist[int(mpcindex)-1]
#	print("mpcsong: " + mpcsong)
	mpcalbumindex = mpcsong.rfind('/')
	if mpcalbumindex > 0:
		mpcalbum = mpcsong[0:mpcalbumindex]
#		print("mpcalbum: " + mpcalbum)
		index = int(mpcindex)
#		for i in range(int(mpcindex),mpclen-1):
		if direction > 0:
			while index < mpclen-1:
				song = mpclist[index]
				songalbumindex = song.rfind('/')
				if songalbumindex > 0:
					songalbum  = song[0:songalbumindex]
					if songalbum != mpcalbum: 
						print("songalbum: " + songalbum + " index: " + str(index+1))
					#	mpcalbum = songalbum
						break
				index += 1
		else:
			found = False
			while index > 0:
				song = mpclist[index]
				songalbumindex = song.rfind('/')
				if songalbumindex > 0:
					songalbum  = song[0:songalbumindex]
					if songalbum != mpcalbum: 
						print("songalbum: " + songalbum + " index: " + str(index+1))
						if found:
							index += 1
							break
						found = True
						mpcalbum = songalbum						
				index -= 1
		
		
if index >= mpclen-1 or index < 0:
	index = 0
os.popen('mpc play ' + str(index+1))
