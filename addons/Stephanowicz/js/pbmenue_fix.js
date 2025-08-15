//Fix for large playbackmenue out of scope (bootstrap bug?)
 setTimeout(window.onload = function(){
	var targetNode = document.getElementById('context-menu-playback');
	var observer = new MutationObserver(function(){
		if(($(targetNode)).hasClass('open')){
			if($(document.getElementById('context-menu-playback')).position().top < 0){
				$("#context-menu-playback").css("top",0);
			}
		}
	});
	observer.observe(targetNode, { attributes: true, childList: true });
}, 500);
