//---------Add Bookmark--------------------------------------------------------
async function add_bookmark(songdata){
	var playlist = songdata['lastloadedplaylist'];
	var elapsed = songdata['elapsed'];
	var song = songdata['song'];
	var bookmark = "";
	var tempstr = '<div id="bookmarksPL-modal" class="hide" tabindex="-1" role="dialog" aria-hidden="true" style="transform: translate(-50%);' + 
		'width:70%;height:80%;' +
		'border-radius: 6px;' +
		'left: 50%;' +
		'position: fixed;' +
		'z-index: 10001;' +
		'box-shadow: 0 3px 7px rgba(0,0,0,.3);">' +
			'<div class="modal-content" style="margin: 40px;">' + 
				'<div style="margin-left: 10px;margin-bottom: 35px;"><p style="font-size: x-large;">Save current Playlist and Bookmark</p></div>' + 
				'<label class="control-label">Current Song: <span id="currentSong">' + song + '</span></label>' +
				'<label class="control-label">Elapsed: <span id="timeElapsed">' + elapsed + '</span></label>' +
				'<label class="control-label" for="pl-save-name">Playlist name</label>' +
				'<div class="controls">' +
					'<input id="pl-save-name" type="text" value="' + playlist + '" autofocus style="width:50%;height:1.8em;">' +
				'</div>' +
				'<label class="control-label" for="bm-save-name">Bookmark name</label>' +
				'<div class="controls">' +
					'<input id="bm-save-name" type="text" value="' + playlist + '" autofocus style="width:50%;height:1.8em;">' +
				'</div>' +
				'<button id="savebm" class="btn singleton" style="font-size: 1.2em;width: 6em;height: 2em;padding: 0px;border-radius: 5rem;background-color: var(--btnshade4);margin:0;color: inherit;">SAVE</button>' +
				'<div style="margin-top: 16px; width: 70%;">' + 
					'Attention: an existing playlist of the same name will be overwritten!' +
				'</div>' +	
			'</div>' +			
			'<div class="modal-footer">' +
				'<button aria-label="Close" class="btn singleton" data-dismiss="modal" aria-hidden="true" style="bottom: 19px; position: fixed; transform: translate(-50%);">' + 
				'Close</button>' +
			'</div>' +
		'</div>';
	$("#shutdown").after(tempstr);
	$('#bookmarksPL-modal').modal();	
	$("[id='savebm']").click(function() {
		var $this = $(this);
		$this.elapsed = document.getElementById('timeElapsed').innerText;
		$this.song = document.getElementById('currentSong').innerText;
		$this.playlist = document.getElementById('pl-save-name').value; 
		$this.bookmark = document.getElementById('bm-save-name').value;
		
		console.log($this.playlist);
		console.log($this.bookmark);
		if($this.playlist !='' && $this.bookmark != ''){
			$('#bookmarksPL-modal').modal('hide');
			console.log($this.elapsed);
			console.log($this.song);
			
			$.getJSON('addons/Stephanowicz/commands.php?cmd=add_bookmark&pl='+$this.playlist+'&bm='+$this.bookmark+'&elapsed='+$this.elapsed+'&song='+$this.song, function(res) {
				console.log(res);
				let title_info = '';
				title_info = res['status'] == 'ok' ? NOTIFY_TITLE_INFO : NOTIFY_TITLE_ERROR;
				$('.ui-pnotify-closer').click();
				$.pnotify({
					title: title_info,
					text: res['msg'],
					icon: '',
					delay: (3000),
					opacity: 1.0,
					history: false
				});
			});
			
		}
		else{
			$('.ui-pnotify-closer').click();
			$.pnotify({
				title: NOTIFY_TITLE_ERROR,
				text: 'both fields must not be empty!',
				icon: '',
				delay: (3000),
				opacity: 1.0,
				history: false
			});
			$('.ui-pnotify').css('z-index',100000);
		}
	});
	$('#bookmarksPL-modal').on('hide.bs.modal', function(){
		$('#bookmarksPL-modal').remove();;
	});
/*
	if(playlist ==''){
		$.ajaxSetup({
			async: false
		});
		
		
		var bmlist = "";
		$.getJSON('addons/Stephanowicz/commands.php?cmd=list_bookmarks', function(res) {
			bmlist = res;
		});
		$.ajaxSetup({
			async: true
		});
		console.log(bmlist);
	} 

	if(playlist !='' && bookmark != ''){
		$.getJSON('addons/Stephanowicz/commands.php?cmd=add_bookmark&pl='+playlist+'&bm='+bookmark+'&elapsed='+elapsed+'&song='+song, function(res) {
			console.log(res);
			let title_info = '';
			title_info = res['status'] == 'ok' ? NOTIFY_TITLE_INFO : NOTIFY_TITLE_ERROR;
			$('.ui-pnotify-closer').click();
			$.pnotify({
				title: title_info,
				text: res['msg'],
				icon: '',
				delay: (3000),
				opacity: 1.0,
				history: false
			});
		});
	}
*/
}
//------Load Bookmark--------------------------------------------------------
function list_bookmarks(){
	$.getJSON('addons/Stephanowicz/commands.php?cmd=list_bookmarks', function(res) {
		return res;
	});
}
function bookmarks(){
	$.getJSON('addons/Stephanowicz/commands.php?cmd=list_bookmarks', function(res) {
		console.log(res[0]);
		let bmLine = '<div style="margin: auto; width: 70%;">';
		res.forEach((bm) => {
			bmLine += '<li id="' + bm + '" style="padding-bottom: 5px;display: grid;grid-template-columns: 70% auto auto;align-items: center;">' + bm + '<button id="loadbm" class="btn singleton" data-bmname="' + bm + '" style="font-size: 0.8em;width: 6em;height: 2em;padding: 0px;border-radius: 5rem;background-color: var(--btnshade4);margin: .2em 1vw;color: inherit;">Load</button><button id="delbm" class="btn singleton" data-bmname="' + bm + '" style="font-size: 0.8em;width: 6em;height: 2em;padding: 0px;border-radius: 5rem;background-color: var(--btnshade4);color: inherit;">Delete</button></li>';
		});
		bmLine += '</div>';
		tempstr = '<div id="bookmarks-modal" class="hide" tabindex="-1" role="dialog" aria-hidden="true" style="transform: translate(-50%);' + 
			'width:70%;height:80%;' +
			'border-radius: 6px;' +
			'left: 50%;' +
			'position: fixed;' +
			'z-index: 10001;' +
			'box-shadow: 0 3px 7px rgba(0,0,0,.3);">' +
				'<div class="modal-content" style="margin: 40px;">' + 
					'<div style="margin-left: 10px;"><p style="font-size: x-large;">Bookmarks</p></div>' + 
				'</div>' + bmLine +
				'<div class="modal-footer">' +
					'<button aria-label="Close" class="btn singleton" data-dismiss="modal" aria-hidden="true" style="bottom: 19px; position: fixed; transform: translate(-50%);">' + 
						'Close</button>' +
				'</div>' +
			'</div>';
		$("#shutdown").after(tempstr);
		$('#bookmarks-modal').modal();	
		$("[id='loadbm']").click(function() {
			var $this = $(this);
			var bm = $this.data('bmname');
			console.log(bm);
			$('#bookmarks-modal').modal('hide');
			load_bookmark(bm);
		});
		$("[id='delbm']").click(function() {
			var $this = $(this);
			var bm = $this.data('bmname');
			console.log(bm);
			del_bookmark(bm);
		});
		$('#bookmarks-modal').on('hide.bs.modal', function(){
			$('#bookmarks-modal').remove();;
		});
	});
}
function del_bookmark(bmFile){
	$.ajaxSetup({
		async: false
	});
	$.getJSON('addons/Stephanowicz/commands.php?cmd=del_bookmark&bm='+bmFile, function(res) {
			console.log(res);
			let title_info = '';
			title_info = res['status'] == 'ok' ? NOTIFY_TITLE_INFO : NOTIFY_TITLE_ERROR;
			$('.ui-pnotify-closer').click();
			$.pnotify({
				title: title_info,
				text: res['msg'],
				icon: '',
				delay: (3000),
				opacity: 1.0,
				history: false
			});
			$('.ui-pnotify').css('z-index',100000);
			window.res = res['status'];
	});	
	if(window.res == 'ok'){
		$('#'+bmFile).remove();
	}
	$.ajaxSetup({
		async: true
	});
}
function load_bookmark(playlist){
	$.getJSON('addons/Stephanowicz/commands.php?cmd=load_bookmark&pl='+playlist, function(res) {
			console.log(res);
			let title_info = '';
			title_info = res['status'] == 'ok' ? NOTIFY_TITLE_INFO : NOTIFY_TITLE_ERROR;
			$('.ui-pnotify-closer').click();
			$.pnotify({
				title: title_info,
				text: res['msg'],
				icon: '',
				delay: (3000),
				opacity: 1.0,
				history: false
			});
			$('.ui-pnotify').css('z-index',100000);
	});
}
