//---------Show synced lyrics above album cover---------------------------------------------
var slLast = 0;
var slLastSecs = -1;
var secsLyrics = [];
var lyricsNextSecs = 0;
function syncLyrics() {
	if(($("#syncedLyrics")[0]!=null && syncedLyrics!=null && lrclibsynced)&&($("#screen-saver").css("display") == 'block'||document.getElementById("playback-panel").className.includes("active"))){
	//	if(slPosL==0){ //removed query as it is not accurate enough -> @moment position is checked every cycle
			//syncedLyricsPos();
	//	}
		$("#syncedLyrics").css("display", "block");
		$.getJSON('command/playback.php?cmd=get_mpd_status', function(data) {
			var secsElapsed=data["elapsed"];
			let last = 0;
			for(i=slLast;i<secsLyrics.length;i++){
				if(secsLyrics[i] < secsElapsed){
					last = i;
					slLastSecs=secsLyrics[i];		
				}
				else{
					if((slLastSecs<=secsElapsed && slLastSecs > -1) && (i > slLast)){
						const element = document.getElementById(secsLyrics[last]);
						const prev = document.getElementById(secsLyrics[last-1]); 
						const pEl = document.getElementById("syncedLyrics");
						let posTop = element.offsetTop-pEl.offsetHeight/4;
						
						if(last < secsLyrics.length && ((last > 0 && secsLyrics[last]-secsLyrics[last-1]>1) || last == 0)){
							if(last == 0) {
								pEl.scrollTo({
									top: posTop,
									left: 0,
									behavior: "smooth",
								});
							}
							if(last > 0) { 
								if (prev.offsetHeight < slPosH / 4 || prev.offsetHeight+element.offsetHeight > pEl.offsetHeight) {
									if(element.offsetHeight > 0.8 * pEl.offsetHeight) {
										posTop = element.offsetTop;
									}
									pEl.scrollTo({
										top: posTop,
										left: 0,
										behavior: "smooth",
									});
								}
								else {
									pEl.scrollTo({
										top: prev.offsetTop,
										left: 0,
										behavior: "smooth",
									});
								}
							}
						}
						else if(last > 0 && secsLyrics[last]-secsLyrics[last-1]<1 && document.getElementById(secsLyrics[last-1]).style.opacity == 0){
							last -= 1;
							i-=1;
							slLastSecs=secsLyrics[last];
							if(last > 0 && secsLyrics[last]-secsLyrics[last-1]<1 && document.getElementById(secsLyrics[last-1]).style.opacity == 0){
								last -= 1;
								i-=1;
								slLastSecs=secsLyrics[last];
							}
							if (prev.offsetHeight < slPosH / 4 || prev.offsetHeight+element.offsetHeight > pEl.offsetHeight) {
								pEl.scrollTo({
									top: posTop,
									left: 0,
									behavior: "smooth",
								});
							}
							else {
								pEl.scrollTo({
									top: prev.offsetTop,
									left: 0,
									behavior: "smooth",
								});
							}
						}
						lyricsNextSecs = 10;	
						if(last+1 < secsLyrics.length){
							lyricsNextSecs = secsLyrics[last+1] - secsLyrics[last];
						}
						if(last > 0){
							if(Object.entries(syncedLyrics)[last-1][1] !=""){
//										document.getElementById(secsLyrics[last-1]).style.transition = "opacity 3s cubic-bezier(0.7,0.46,1,1)";
								document.getElementById(secsLyrics[last-1]).style.transition = "opacity 1s linear 2s";
								document.getElementById(secsLyrics[last-1]).style.opacity = 0;					
							}
						}
						if(Object.entries(syncedLyrics)[last][1] !=""){
							document.getElementById(secsLyrics[last]).style.transition = "opacity "+ lyricsNextSecs > 2? 2:1 + "s";
							document.getElementById(secsLyrics[last]).style.opacity = 1;
							if(lyricsNextSecs > 9){
								setTimeout(() => {
									document.getElementById(secsLyrics[last]).style.transition = "opacity 9s";
									document.getElementById(secsLyrics[last]).style.opacity = 0;
								},8000);									
							}
						}
					}
					slLast = i;		
					break;
				}
			}
		});
	}
	else{
		$("#syncedLyrics").css("display", "none");	
	}
}

//new IntersectionObserver(function() {
//	console.log("IntersectionObserver");
//}).observe($('#playback-panel.tab-pane')[0]);

var observeScreenSaver= new ResizeObserver(function() {
	($('#screen-saver').css('display')=='block' && $("#syncedLyrics").css("display") == 'block') && $(function () {
		  console.log("syncedLyrics: ResizeObserver fired for 'screensaver'");
		  syncedLyricsPos();
	});
}).observe($('#screen-saver')[0]);

var observeCover = new ResizeObserver(function() {
	($('#screen-saver').css('display')!='block' && $("#syncedLyrics").css("display") == 'block' && $('#playback-panel.tab-pane').css("visibility")=='visible') && $(function () {
		  console.log("syncedLyrics: ResizeObserver fired for 'coverart'");
		  syncedLyricsPos();
	});
}).observe($('.covers')[0]);

new MutationObserver(function() {
	($('#playback-panel.tab-pane').css("visibility")=='visible')  && $(function () {
		console.log("syncedLyrics: MutationObserver fired for 'playback-panel.tab-pane'");
	//	console.log($('#playback-panel.tab-pane').css("visibility"));
		syncedLyricsPos();
	});
}).observe($('#playback-panel.tab-pane')[0], { attributes: true, childList: true });

var slPosW,slPosH,slPosL = 0,slPosTop;
function syncedLyricsPos() {
	if(document.getElementById("syncedLyrics")){
		let len = document.getElementsByClassName("coverart").length; //Screen-saver cover and main view cover have same class-name :/
		if( len > 0 ){
			let index = 0;
			
			if($("#screen-saver").css("display") == 'block'){
				index = 0;
				slPosL = parseInt(window.getComputedStyle($(".coverart")[index]).marginLeft); //Screen-saver cover is first element if available
			}
			else{
				index = len -1;
				if($(".coverart")[index].offsetLeft > 0){		
					slPosL = $(".coverart")[index].offsetLeft;
				}
				else{
					slPosL = $("#coverart-url")[0].offsetLeft;
				}
			}
			slPosW = document.getElementsByClassName("coverart")[index].offsetWidth;
			slPosH = document.getElementsByClassName("coverart")[index].offsetHeight;
			slPosTop = document.getElementsByClassName("coverart")[index].offsetParent.offsetTop;
			if (slPosTop == 0) {slPosTop = document.getElementsByClassName("coverart")[index].offsetTop;}
			document.getElementById("syncedLyrics").style.width = slPosW + "px";
			document.getElementById("syncedLyrics").style.height = slPosW + "px";
			document.getElementById("syncedLyrics").style.top = slPosTop + "px";
//			document.getElementById("syncedLyrics").style.top = 0.2*slPosH + "px";
			document.getElementById("syncedLyrics").style.left = slPosL  + "px";
		}
	}
}

function render_syncedLyrics() {
	if (MPD.json['file'] !== UI.currentFile){
		syncedLyrics=null;
		var cmd = 'addons/Stephanowicz/lyrics/lrcsync.php';
		if(MPD.json['state'] === "stop"){cmd += "?artist="+MPD.json['artist']+"&title="+MPD.json['title']+"&album="+MPD.json['album'];}
		$.getJSON(cmd, function (data) {
			if (data) {
				syncedLyrics=data;
				
				if(typeof $("#syncedLyrics")[0] === 'undefined'){
					var tempstr = '<div id="syncedLyrics"></div>';
					$(".tab-content").append(tempstr);
//								$(".covers").append(tempstr);
//								$(".ss-coverart").append(tempstr);
				}
				else{
					$("#syncedLyrics").empty();
				}
				$("#syncedLyrics").append("<div id='syncedLyricsContent'>");
				secsLyrics = [];
				let iLength=Object.entries(syncedLyrics).length;
				for(i=0;i<iLength;i++){
//								if(Object.entries(syncedLyrics)[i][1] ===""){
//									delete syncedLyrics[Object.entries(syncedLyrics)[i][1]];
//									iLength-=1;
//								}
//								else{
						let [ss=0, mm=0, hh=0] = Object.entries(syncedLyrics)[i][0].split(':').reverse();
						secsLyrics[i] = (+hh) * 3600 + (+mm) * 60 + (+ss);							
						let p = "<p id='"+secsLyrics[i]+"'>"+
						Object.entries(syncedLyrics)[i][1] + "</p>";
						$("#syncedLyricsContent").append(p);
//								}
				}
				if(iLength > 0) {$("#syncedLyricsContent").append("<p style='height: 100px;'></p>");} //append empty <p> at end for scrolling last element to higher position
				console.log("Lyrics for synced display loaded");
				lrclibsynced && $(".lrclibsynced svg").css("fill","var(--accentxts)");
				!lrclibsynced ? $("[id=slyricsavail]").css("display", "block"):$("[id=slyricsavail]").css("display", "none");;
			}
			else{
				if(typeof $("#syncedLyrics") !== 'undefined'){
					$("#syncedLyrics").empty();
				}
				lrclibsynced && $(".lrclibsynced svg").css("fill","#ae3c27");
				$("[id=slyricsavail]").css("display", "none");
			}
			$("#syncedLyrics").css("display", "none");	
			if(document.getElementById("syncedLyrics")){
				window.clearInterval(window.updateSyncedLyrics)
				slLast=0;
				slLastSecs=0;
				window.updateSyncedLyrics = setInterval(function () {
					if (MPD.json['state'] === 'play'){
						syncLyrics();
					}
				}, 750);	
			}
		});
	}
	else{
		slLast=0;
		slLastSecs=0;					
	}
}
