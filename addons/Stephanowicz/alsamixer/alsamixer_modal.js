var tempstr = '<div id="ALSAGraphicsEQ-modal" class="hide" tabindex="-1" role="dialog" aria-labelledby="ALSAGraphicsEQ-modal-label" aria-hidden="true" style="transform: translate(-50%);' +
	'border-radius: 6px;' +
	'left: 50%;' +
	'position: fixed;' +
	'z-index: 10001;' +
	'box-shadow: 0 3px 7px rgba(0,0,0,.3);' +
	'top:0px;"></div>';
$("#shutdown").after(tempstr);

tempstr = '<li><a href="#notarget" data-cmd="" data-addoncmd="ALSAgraphicEQ"><i class="fal fa-sliders fa-rotate-90 sx"></i>Graphic EQ</a></li>';
$("#context-menu-playback ul").append(tempstr);

//****************************ALSAgraphicEQ()***********************************************
function ALSAgraphicEQ() {
    //$('#ALSAGraphicsEQ').empty();	
	$('#ALSAGraphicsEQ-modal').empty();
	$('#ALSAGraphicsEQ-modal').load('addons/Stephanowicz/alsamixer/alsamodal.txt', function() {
		$('#ALSAGraphicsEQ').load('addons/Stephanowicz/alsamixer/ALSAGraphicsEQ.html');
		$('#ALSAGraphicsEQ-modal').modal();
	});		
}
//******************************************************************************************
