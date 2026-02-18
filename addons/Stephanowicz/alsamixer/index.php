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

        <div id="main" style="display: grid; grid-template-columns: 140px 150px 140px; position: absolute; width: max-content; height: max-content; top: 0; bottom: 0; left: 0; right: 0; margin: 0 auto;">        
            <div id="mixer" data-device="alsaequal" style="grid-column-start: 1; grid-column-end: 4;">
                <div class="render_controls"></div>
            </div>
            
            <div style="font: 1rem 'Fira Sans', sans-serif;"> 
                output: <br />
                <select id="outputs" name="outputs" style="width: 130px;"></select>
                <div style="margin-top: 0.4em; font-size: xx-small;">Channel select:</div>
                <div style="display: flex; margin-top: -0.2em;">
                    <input type="radio" id="combi" name="channel_select" value="combi" style="height: 0.8em; margin: 0.4em 0 0;" checked="checked">
                    <span style="margin-top: 0.4em; font-size: xx-small; margin-right: 7px;">combined </span>
                    <input type="radio" id="single" name="channel_select" value="single" style="height: 0.8em; margin: 0.4em 0 0;">
                    <span style="margin-top: 0.4em; font-size: xx-small;">single</span>
                </div>
            </div>
            
            <div style="font: 1rem 'Fira Sans', sans-serif;"> presets: <br /><select id="curves" name="curves" style="width: 130px;"></select><br />
                <input type="button" class="button" id="loadCurve" name="loadCurve" style="margin: .4rem; margin-left: 0px;" value="load">
                <input type="button" class="button" id="saveCurve" name="saveCurve" style="margin: .4rem;" value="save">
                <input type="button" class="button" id="deleteCurve" name="deleteCurve" style="margin: .4rem;" value="delete">
            </div>
            
            <div style="font: 1rem 'Fira Sans', sans-serif;">new / rename:<br /><input id="curveName" name="curveName" style="width: 130px; border-width: thin; color:black;"><br />
                <input type="button" class="button" id="newCurve" name="newCurve" style="margin: .4rem; margin-left: 0px;" value="new">
                <input type="button" class="button" id="renameCurve" name="renameCurve" style="margin: .4rem;" value="rename">
            </div>
        </div>

        <script type="text/html" id="tpl_control">
            {{for controls}}
                <div class="col-xs-1" style="width:40px; padding: 0; margin: 0; margin-left: 1px;">
                    <div class="panel panel-default">
                        <div class="panel-heading" style="text-align: center; padding-left:2px; padding-right: 2px; white-space: nowrap; overflow: hidden;">
                            <small>{{:name.slice(4)}}</small>
                        </div>
                        {{if volume}}
                            <div class="panel-body">
                                <div class="row control">
                                    {{for volume.channels}}
                                        <div class="col-xs-6" style="padding: 0;">
                                            <div class="slider" title="{{:name}}" data-id="{{:id}}" data-channel="{{:channel}}" data-min="{{:min}}" data-max="{{:max}}" data-step="{{:step}}" data-value="{{:current}}" style="margin: 5px;"></div>
                                            <div class="control-level" style="font-size: 80%; text-align: center;"></div>                                            
                                        </div>
                                    {{/for}}
                                </div>
                            </div>
                        {{/if}}
                    </div>    
                </div>
            {{/for}} 
        </script>

        <script>
        $(function(){
            var page = $("#mixer"),
                device = page.data('device'),
                controls = $('.render_controls', page),
                template = $.templates("#tpl_control"),
                updateSlide = false,
                lastValue = {}; // Stores the previous value of each slider for delta calculation

            /**
             * Handles slider movement with relative offset logic in combined mode
             */
            function setControl(data, ui, activeSlider) {
                var values = [];
                var isCombined = document.getElementById('combi').checked;
                
                // Calculate the difference (delta) between current and previous position
                var currentVal = ui.value;
                var prevVal = lastValue[data.id + '_' + data.channel]; // || currentVal;
                var delta = currentVal - prevVal;

                $('.slider[data-id=' + data.id + ']', controls).each(function(index) {
                    var slider = $(this);
                    var sliderData = slider.data();
                    var newValue;

                    if (isCombined) {
                        if (this === activeSlider) {
                            newValue = currentVal;
                        } else {
                            // Apply the same movement (delta) to the other channel
                            newValue = slider.slider("value") + delta;
                            // Ensure boundaries (0-100)
                            newValue = Math.max(sliderData.min, Math.min(sliderData.max, newValue));
                            slider.slider("value", newValue);
                        }
                    } else {
                        newValue = (this === activeSlider) ? currentVal : slider.slider("value");
                    }
                    
                    $(this).parents(".control").find(".control-level")[index].textContent = newValue;
                    values.push(newValue);
                    
                    // Update the stored "last value" for both channels
                    lastValue[sliderData.id + '_' + sliderData.channel] = newValue;
                });
                if(!updateSlide){
                    updateSlide = true;
                    $.post('alsadevice.php', {command:'set',device:device,id:data.id, channel:data.channel, value: values.join(",")}, function(response){
                        updateSlide = false;   
                    }, 'json');
                }
            }

            function bind() {                
                $(".slider", controls).each(function() {
                    var slide = $(this),
                        data = slide.data(),
                        options = $.extend({
                            orientation: "vertical",
                            create: function() {
                                var level = slide.parents(".control").find(".control-level");
                                level[data.channel].textContent = data.value;
                                // Initialize lastValue store
                                lastValue[data.id + '_' + data.channel] = data.value;
                            },
                            start: function(event, ui) {
                                // Refresh last known value when dragging starts
                                lastValue[data.id + '_' + data.channel] = ui.value;
                            },
                            slide: function (event, ui) {
                                setControl(data, ui, this);
                            },
                            stop: function (event, ui) {
                                setControl(data, ui, this);
                            }
                        }, data);

                    slide.slider(options);
                    
                    var handle = document.createElement("span");
                    handle.style = "bottom: " + data.value + "%; height: 0.5em; width: 1.1em; left: -0.55em; margin-bottom: -.25em; background-color: #ff4d4d; position: absolute; display:none;";
                    handle.className = "ui-slider-handle ui-state-default ui-corner-all marker-handle";
                    slide.append(handle);
                });

                $('#saveCurve').click(save_curve);
                $('#loadCurve').click(load_curve);
                $('#deleteCurve').click(delete_curve);
                $('#newCurve').click(new_curve);
                $('#renameCurve').click(rename_curve);
                $('#curves').change(select_curve);
            }

            function init() {
                $.post('alsadevice.php', {'command': 'get'}, function(result) {
                    $(result["outputs"][0]).each(function(x, val) {
                        $('#outputs')[0].options.add(new Option(val, x));
                    });
                    var sel = result.outputs[1].enabled;
                    $('#outputs')[0].options[sel].selected = true;
                    $('#outputs').change(setOutput);
                    controls.empty();
                    controls.append(template.render(result));
                    bind();
                }, 'json');
            }

            // Curve management...
            function select_curve() {
                var curvename = $('#curves')[0].options[$('#curves')[0].selectedIndex].text;
                $.post('alsadevice.php', {command:'getCurveValues', curve_name: curvename}, function(response) {
                    displayCurve(response);
                }, 'json');
            }

            function get_curves() {
                $.post('alsadevice.php', {'command': 'getCurves'}, function(result) {
                    $(result).each(function(x, val) {
                        $('#curves')[0].options.add(new Option(val[0], x));
                    });
                    get_activecurve();
                }, 'json');               
            }

            function get_activecurve() {
                $.post('alsadevice.php', {'command': 'getActiveCurve'}, function(result) {
                    if(!['Off','Flat'].includes($(result)[0][0])) {
                        $('#curves option').filter(function() {
                            return $(this).text() === $(result)[0][0];
                        }).prop('selected', true);
                    }
                }, 'json');               
            }

            function save_curve() {
                var values = [];
                $(".row.control", controls).each(function(x, val) {
                    values.push($(".control-level", val)[0].innerText);
                    values.push($(".control-level", val)[1].innerText);
                });
                var curvename = $('#curves')[0].options[$('#curves')[0].selectedIndex].text;
                $.post('alsadevice.php', {command:'saveCurve', curve_name: curvename, curve_values: values.join(",")}, null, 'json');
            }

            function load_curve() {
                var curvename = $('#curves')[0].options[$('#curves')[0].selectedIndex].text;
                $.post('alsadevice.php', {command:'loadCurve', curve_name: curvename}, function(response) {
                    update(response);
                }, 'json');
            }

            function delete_curve() {
                if($('#curves')[0].selectedIndex > 0) {
                    var curvename = $('#curves')[0].options[$('#curves')[0].selectedIndex].text;
                    $.post('alsadevice.php', {command:'deleteCurve', curve_name: curvename}, function() {
                        $('#curves')[0].remove($('#curves')[0].selectedIndex);
                    }, 'json');
                }
            }

            function new_curve() {
                if($('#curveName')[0].value !== "") {
                    var clength = $('#curves')[0].options.length;
                    $('#curves')[0].options.add(new Option($('#curveName')[0].value, clength));
                    $('#curves')[0].selectedIndex = clength;
                    save_curve();
                }
            }

            function rename_curve() {
                if(($('#curveName')[0].value !== "") && ($('#curves')[0].selectedIndex > 0)) {
                    var curveOldName = $('#curves')[0].options[$('#curves')[0].selectedIndex].text;
                    var curveNewName = $('#curveName')[0].value;
                    $('#curves')[0].options[$('#curves')[0].selectedIndex].text = curveNewName;
                    $.post('alsadevice.php', {command:'renameCurve', curve_name: curveOldName, new_name: curveNewName}, null, 'json');
                }
            }

            function update(result) {
                if (!result || !result.output || !result.output.controls) return;
                $(result.output.controls).each(function(x) {
                    var valL = this.volume.values[0];
                    var valR = this.volume.values[1];
                    var sliderElements = $(".slider", controls);
                    var sL = $(sliderElements[x*2]);
                    var sR = $(sliderElements[x*2+1]);

                    sL.slider("value", valL);
                    sR.slider("value", valR);
                    sL.parents(".control").find(".control-level")[0].textContent = valL;
                    sR.parents(".control").find(".control-level")[1].textContent = valR;
                    
                    // Sync internal lastValue tracker
                    lastValue[sL.data().id + '_0'] = valL;
                    lastValue[sR.data().id + '_1'] = valR;

                    sL.find('.marker-handle').hide();
                    sR.find('.marker-handle').hide();
                });
            }

            function displayCurve(result) {
                $(result).each(function(x) {
                    var sliderElements = $(".slider", controls);
                    var valL = this[0];
                    var valR = this[1];
                    $(sliderElements[x*2]).find('.marker-handle').css('bottom', valL + "%").show();
                    $(sliderElements[x*2+1]).find('.marker-handle').css('bottom', valR + "%").show();
                });
            }
            
            function setOutput() {
                $.post('alsadevice.php', {command:'setOutput', output:$('#outputs')[0].options.selectedIndex+1}, null, 'json');
            }

            init(); 
            get_curves();
        });  
        </script>
    </body>
</html>
