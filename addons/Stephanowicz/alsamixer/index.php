<!--
/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
 * based on elovattibr's Webmixer: https://github.com/elovattibr/webmixer/
*/
-->
<!DOCTYPE html> 
<html>
    <head>
        
        <title>WebMixer</title>
        <meta charset="utf-8" />
        <link rel="stylesheet" href="public/css/bootstrap.min.css"/>
        <link rel="stylesheet" href="public/css/jquery-ui.css"/>
        <link rel="stylesheet" href="public/css/app.css"/>

    </head>
    <body> 
        <script src="public/js/jquery.min.js"></script>
        <script src="public/js/jquery-ui.min.js"></script>
        <script src="public/js/jsviews.min.js"></script>
        <script src="public/js/bootstrap.min.js"></script>

<!--        <div style="font: 1rem 'Fira Sans', sans-serif;"><input type="checkbox" id="linkchannels" name="linkchannels" style="margin: .4rem;"><label for="linkchannels">link L/R</label></div>
        <div style="font: 1rem 'Fira Sans', sans-serif;"><input type="button" id="reset" name="reset" style="margin: .4rem;" value="reset"></div>
-->        
<div id="main" style="
    display: grid;
    grid-template-columns: 140px 150px 140px;
    position: absolute;
    width: max-content;
    height: max-content;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    transform-origin: top;
    transform: scale(1);
">        
		<div id="mixer" data-device="alsaequal" style="
	    	grid-column-start: 1;
	    	grid-column-end: 4;
		">
    
            <div class="render_controls"></div>
            
        </div>
		<div style="font: 1rem 'Fira Sans', sans-serif;"> output: <br /><select id="outputs" name="outputs" style="width: 130px;"></select></div>
        <div style="font: 1rem 'Fira Sans', sans-serif;"> presets: <br /><select id="curves" name="curves" style="width: 130px;"></select><br />
		<input type="button" class="button" id="loadCurve" name="loadCurve" style="margin: .4rem;margin-left: 0px;" value="load">
        <input type="button" class="button" id="saveCurve" name="saveCurve" style="margin: .4rem;" value="save">
        <input type="button" class="button" id="deleteCurve" name="deleteCurve" style="margin: .4rem;" value="delete"></div>
        <div style="font: 1rem 'Fira Sans', sans-serif;">new / rename:<br /><input id="curveName" name="curveName" style="width: 130px;border-width: thin; color:black;"><br />
		<input type="button" class="button" id="newCurve" name="newCurve" style="margin: .4rem;margin-left: 0px;" value="new">
        <input type="button" class="button" id="renameCurve" name="renameCurve" style="margin: .4rem;" value="rename">
		</div>
        <script type="text/html" id="tpl_control">
                    
                {{for controls}}
                    <div class="col-xs-1" style="width:40px; padding: 0; margin: 0; margin-left: 1px;">
                        <div class="panel panel-default" >
                            <div class="panel-heading" style="text-align: center; padding-left:2px; padding-right: 2px; white-space: nowrap; overflow: hidden;">
                                <small>{{:name.slice(4)}}</small>
                            </div>
                            {{if volume}}
                                <div class="panel-body">
                                    <div class="row control">
                                        {{for volume.channels}}
                                            <div class="col-xs-6 " style="padding: 0;">
                                                <div class="slider" title="{{:name}}" data-id="{{:id}}" data-channel="{{:channel}}" data-min="{{:min}}" data-max="{{:max}}" data-step="{{:step}}" data-value="{{:current}}" style="margin: 5px;"></div>
                                                <div class="control-level" style="font-size: 80%; text-align: center;"></div>                                            
                                            </div>
                                        {{/for}}
                                    </div>
                                </div>
                            {{/if}}
                            <!--<a class="bt-customize-control" data-id="{{:id}}" data-name="{{:name}}" style="cursor: pointer;"><span class="glyphicon glyphicon-cog"></span></a>-->
                        </div>    
                    </div>
                {{/for}} 
        </script>

        <script>
        $(function(){
          
            var page = $("#mixer"),
                device = page.data('device'),
                controls = $('.render_controls',page),
                template = $.templates("#tpl_control");
                updateSlide = false;

            function setControl(data, ui){
                if(!updateSlide){
	                var values = []; 
					updateSlide = true;
	                $('.slider[data-id='+data.id+']', controls).each(function(){
	                    values.push( $(this).slider("value") );
	                });

		            $.post('alsadevice.php', {command:'set',device:device,id:data.id, channel:data.channel, value: values.join(",")}, function(response){
	//	                console.log("set: ", response);
						updateSlide = false;   
		            }, 'json');
				}
            }
    
            function resetControl(){
	            $.post('alsadevice.php', {command:'reset'}, function(response){
//	                console.log("reset: ", response);   
					update(response);
	            }, 'json');
                
            }
            
            function bind(){                
                $(".slider", controls).each(function(){
                    var slide = $(this),
                        level = slide.parents(".control").find(".control-level"),
                        data = slide.data(),
                        options = $.extend({
                            orientation: "vertical",
                            create: function() {
                                level[options.channel].textContent=options.value;
                            },
                            slide: function (event, ui) {
                                
                               // level.text( ui.value); //  + "dB" );
                                level[options.channel].textContent=ui.value;
                                setControl(options, ui);
                                
                            }, 
                            stop: function (event, ui) {
                                level[options.channel].textContent=ui.value;
                                setControl(options, ui);
                            },

                        }, data);

                    slide.slider(options);
                    var slider1 = document.createElement("span");
                    slider1.style = `bottom: ${data.value}%;height: 0.5em;width: 1.1em;left: -0.55em;margin-bottom: -.25em;background-color: #ff4d4d;background-image: none;display:none;`;
                    slider1.className = "ui-slider-handle ui-state-default ui-corner-all";
                //    slider1.name = data('name');
                    slider1.setAttribute("data-id", data.id);
                    slider1.setAttribute("data-channel", data.channel);
                    slide.append(slider1);
                });

                $(':input', controls).on({

                    change:function(){

                        var post = {
							command: 'set',
                            id: $(this).data('id'),
                            device:device,
                            channel: $(this).data('channel'),
                            value: null
                        };

                        if($(this).is(":checkbox")){
                            post.value = $(this).prop('checked')?"on":"off";
                        } else {
                            post.value = $(this).val();
                        }

                        mixer.set(post, function(response){

//                            console.log("Response", response);
                            
                        });
                    }

                });   

                $('.customize-modal',page).on({
                    
                    'init':function(){
                        $(this).modal('hide');
                    },
                    'show':function(e, data){
                        
                        
                        
                        $(this).modal('show');
                        
                    },
                    'hide':function(){
                        $(this).modal('close');
                    },
                    
                }).trigger('init');
                
                $('.bt-customize-control',controls).on({
                    click:function(){
                        
                        var bt = $(this),
                            id = bt.data('id');
                    
                        $('.customize-modal',page).trigger('show', {
                            'id':id
                        });
                        
                    }
                });
//        		$('#reset').click(resetControl);
        		$('#saveCurve').click(save_curve);
        		$('#loadCurve').click(load_curve);
        		$('#deleteCurve').click(delete_curve);
        		$('#newCurve').click(new_curve);
        		$('#renameCurve').click(rename_curve);
                $('#curves').change(select_curve);
            }

			function init(){
	            $.post('alsadevice.php', {'command': 'get'}, function(result){
                    $(result["outputs"][0]).each(function(x,val){
                        $('#outputs')[0].options.add(new Option(val, x));
                    });
					var sel = result.outputs[1].enabled;
                    $('#outputs')[0].options[sel].selected = true;
                    $('#outputs').change(setOutput)
					controls.empty();
	                controls.append( template.render(result) );
	                bind();
	            }, 'json');

			}
            function select_curve(){
                var curvename = $('#curves')[0].options[$('#curves')[0].selectedIndex].text;
                console.log("selected: ", curvename);
                
	            $.post('alsadevice.php', {command:'getCurveValues', curve_name: curvename}, function(response){
	                console.log("load: ", response);
                    displayCurve(response);
	            }, 'json');
            }

            function get_curves(){
 	            $.post('alsadevice.php', {'command': 'getCurves'}, function(result){
                    $(result).each(function(x,val){
                        $('#curves')[0].options.add(new Option(val[0], x));
                    });
                    get_activecurve();
	            }, 'json');               
            }
            function get_activecurve(){
 	            $.post('alsadevice.php', {'command': 'getActiveCurve'}, function(result){
                    if(!['Off','Flat'].includes($(result)[0][0]))
                    {
                        $('#curves option').filter(function() {(console.log($(this).text()));});
                        $('#curves option').filter(function() {return $(this).text() === $(result)[0][0];}).prop('selected', true);
                    }
                   console.log("active: ", $(result)[0][0]);

		            }, 'json');               
            }
            function save_curve(){
                var values = [];
                $(".row", controls).each(function(x,val){
                    values.push($(".control-level",val)[0].innerText);
                    values.push($(".control-level",val)[1].innerText);
                });
                var curvename = $('#curves')[0].options[$('#curves')[0].selectedIndex].text;
	            $.post('alsadevice.php', {command:'saveCurve', curve_name: curvename, curve_values: values.join(",")}, function(response){
	                console.log("save: ", response);   
	            }, 'json');
                
            }
            function load_curve(){
                var curvename = $('#curves')[0].options[$('#curves')[0].selectedIndex].text;
	            $.post('alsadevice.php', {command:'loadCurve', curve_name: curvename}, function(response){
	                console.log("load: ", response);
                    update(response);
	            }, 'json');
                
            }
            function delete_curve(){
				if($('#curves')[0].selectedIndex > 0){
	                var curvename = $('#curves')[0].options[$('#curves')[0].selectedIndex].text;
		            $.post('alsadevice.php', {command:'deleteCurve', curve_name: curvename}, function(response){
		                console.log("delete: ", response);
						$('#curves')[0].remove($('#curves')[0].selectedIndex);
		            }, 'json');
                }
            }
            function new_curve(){
                if($('#curveName')[0].value !== ""){
                    var clength = $('#curves')[0].options.length;
                    $('#curves')[0].options.add(new Option($('#curveName')[0].value,clength));
                    $('#curves')[0].selectedIndex=clength;
                    save_curve();
                }
            }
            function rename_curve(){
                if(($('#curveName')[0].value !== "") & ($('#curves')[0].selectedIndex > 0)){
                    var curveOldName = $('#curves')[0].options[$('#curves')[0].selectedIndex].text;
                    var curveNewName = $('#curveName')[0].value;
                    $('#curves')[0].options[$('#curves')[0].selectedIndex].text = curveNewName;
		            $.post('alsadevice.php', {command:'renameCurve', curve_name: curveOldName, new_name: curveNewName}, function(response){
		                console.log("rename: ", response);
		            }, 'json');
                }
            }
            function update(result){
       //               console.log("update: ",result["output"]["controls"]);
                      $(result["output"]["controls"]).each(function(x){
       //                   console.log("ID: ", $(this)[0].id);
       //                   console.log("Volume: ", $(this)[0].volume.values[0]);
                          
                          $($(".slider", controls)[x*2]).slider( "value", $(this)[0].volume.values[0] );                    
                          $($(".slider", controls)[x*2+1]).slider( "value", $(this)[0].volume.values[1] );                    
                          $($(".slider", controls)[x*2]).parents(".control").find(".control-level")[0].textContent=$(this)[0].volume.values[0];
                          $($(".slider", controls)[x*2]).parents(".control").find(".control-level")[1].textContent=$(this)[0].volume.values[1];
                          $($(".slider", controls)[x*2])[0].children[1].style.display='none';
                          $($(".slider", controls)[x*2+1])[0].children[1].style.display='none';
                      });
            }
            function displayCurve(result){
                      $(result).each(function(x){
                          $($(".slider", controls)[x*2])[0].children[1].style.bottom=$(this)[0]+"%";
                          $($(".slider", controls)[x*2+1])[0].children[1].style.bottom=$(this)[1]+"%";
                          $($(".slider", controls)[x*2])[0].children[1].style.display='inherit';
                          $($(".slider", controls)[x*2+1])[0].children[1].style.display='inherit';
                      });
            }
            
            function setOutput()
            {
//                console.log("Selected Index:", $('#outputs')[0].options.selectedIndex);
                $.post('alsadevice.php', {command:'setOutput',output:$('#outputs')[0].options.selectedIndex+1}, function(response){
	                console.log("setoutput: ", response);   
	            }, 'json');

            }
            function updateScaleFactor(){
               var min=400;
               var max=800;
               var current = innerWidth < outerWidth ? innerWidth:outerWidth;
               var x = Math.min(Math.max(current, min), max);
               var scale = x/(min+80);
               $('#main').css('transform', 'scale(' + scale + ')');
            }
            init(); 
            get_curves();
            //get_activecurve();
            window.addEventListener("resize", updateScaleFactor);
            updateScaleFactor(); // Run on page load
        });  
        </script>
        
    </body>
</html>
