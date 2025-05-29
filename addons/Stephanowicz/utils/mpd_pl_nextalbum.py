#!/usr/bin/python
###################################################################################################
#
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright 2024 Stephanowicz 
# 
##################################################################################################
#
# Tiny helper to skip to next album in playlist 
# (restarts the list if last album is currently playing)
# obviously this requires a playlist of local files with an apropiate folder structure
# eg. /xyz/Artist/Album/Song123.mp3 .... /xyz/Artist/Album/Song456.mp3
# ...at least different folders are required
# eg. /xyz/abc/Song123.mp3 .... /xyz/def/Song456.mp3
#
##################################################################################################

import sys
import os
stream = os.popen('mpc -f "%file%" playlist')
mpclist = stream.read().splitlines()
mpclen=len(mpclist)
stream = os.popen('mpc status %songpos%')
mpcindex = stream.read()
if mpclen > 0 and int(mpcindex) < (mpclen - 2):
	mpcsong = mpclist[int(mpcindex)-1]
#	print("mpcsong: " + mpcsong)
	mpcalbumindex = mpcsong.rfind('/')
	if mpcalbumindex > 0:
		mpcalbum = mpcsong[0:mpcalbumindex]
#		print("mpcalbum: " + mpcalbum)
		index = int(mpcindex)
#		for index in range(int(mpcindex),mpclen-1):
		while index < mpclen-1:
			song = mpclist[index]
			songalbumindex = song.rfind('/')
			if songalbumindex > 0:
				songalbum  = song[0:songalbumindex]
				if songalbum != mpcalbum: 
					print("songalbum: " + songalbum + " index: " + str(index+1))
				#	mpcalbum = songalbum
					break
			index +=1
		if index == mpclen-1:
			index = 0
		os.popen('mpc play ' + str(index+1))