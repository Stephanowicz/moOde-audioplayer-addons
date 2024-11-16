<?php
/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
 * based on elovattibr's Webmixer: https://github.com/elovattibr/webmixer/
*/
    require_once dirname(__FILE__) . '/../../../inc/common.php';
    require_once dirname(__FILE__) . '/../../../inc/session.php';
    require_once dirname(__FILE__) . '/../../../inc/sql.php';

    $dbh = sqlConnect();
    phpSession('open');
    $device = 'alsaequal'; 
    $preferences = Array();
    
    $prefixes = Array(
        "numid" => "id",
        "  ; t" => "type",
        "  ; I" => "item",
        "  : v" => "values",
        "  | d" => "dB",
        "  | c" => "container",
        "    |" => "sub_container",
    );
            
    $channels = channels();
        
//    $this->preferences = $this->preferences();
        
    if(isset($_POST['command']) ) {
        switch($_POST['command']) {
            case 'get':
                echo json_encode(interfacer());
                break;
            case 'set':
                set($_POST);
                break;
            case 'reset':
                reset_defaults();
                break;
            case 'setOutput':
                setOutput($_POST['output']);
                break;
            case 'getCurves':
                get_curves($_POST['curvename']);
                break;
            case 'getActiveCurve':
                get_active();
                break;
            case 'saveCurve':
                save_curve($_POST);
                break;
            case 'loadCurve':
                load_curve($_POST);
                break;
            case 'getCurveValues':
                getCurveValues($_POST);
                break;
            case 'deleteCurve':
                delete_curve($_POST);
                break;
            case 'renameCurve':
                rename_curve($_POST);
                break;
            default:
                echo "";
                break;
        }
    }
    
    function get(){
        return interfacer();
    }

    function delete_curve($request){
		global $dbh;
        $result = sqlQuery("DELETE FROM cfg_eqalsa WHERE curve_name='" . $request['curve_name'] . "'", $dbh);
		$_SESSION['notify']['title'] = 'curve deleted!';
        exit(json_encode($result,true));
    }
    
    function rename_curve($request){
		global $dbh;
//        $result = sqlQuery("SELECT id FROM cfg_eqalsa WHERE curve_name='" . $request['curve_name'] . "'", $dbh);
        $result = sqlQuery("UPDATE cfg_eqalsa SET curve_name='" . $request['new_name'] . "' WHERE curve_name='" . $request['curve_name'] . "'" , $dbh);
		$_SESSION['notify']['title'] = 'curve reanmed!';
        exit(json_encode($result,true));
    }
    
    function get_curves($request){
		global $dbh;
        $result = sqlQuery('SELECT curve_name FROM cfg_eqalsa', $dbh);
        exit(json_encode($result,true));
    }
    function get_active(){
		global $dbh;
        $result = sqlQuery('SELECT value FROM cfg_system where param="alsaequal"', $dbh);
        exit(json_encode($result,true));
    }    
    function save_curve($request){
		global $dbh;
        $curve_values = $request['curve_values'];
        $result = sqlQuery("SELECT id FROM cfg_eqalsa WHERE curve_name='" . $request['curve_name'] . "'", $dbh);
        if (empty($result[0])) {
            // add
            $newid = sqlQuery('SELECT MAX(id)+1 FROM cfg_eqalsa', $dbh);
            $result = sqlQuery("INSERT INTO cfg_eqalsa VALUES ('" . $newid[0][0] . "','" . $request['curve_name'] . "','" . $curve_values . "')", $dbh);
            $_GET['curve'] = $request['curve_name'];
            $_SESSION['notify']['title'] = 'New curve added';
        }
        else {
            // update
            $result = sqlQuery("UPDATE cfg_eqalsa SET curve_values='" . $curve_values . "' WHERE curve_name='" . $request['curve_name'] . "'" , $dbh);
            $_SESSION['notify']['title'] = 'Curve updated';
        }
        exit(json_encode($result,true));
    }
    
    function load_curve($request){
		global $dbh;
        $curve_name = $request['curve_name'];
        $result = sqlQuery("SELECT curve_values FROM cfg_eqalsa WHERE curve_name='" . $curve_name . "'", $dbh);
        $values = explode(',', $result[0]['curve_values']);
        if (count($values) > 0) {
            if (count($values) < 11) {
                for($i = 0; $i < 10; $i++){
                    $j=$i+1;
                    $contents = amixer("cset numid={$j} {$values[$i]}");
                };
            }
            else {
                for($i = 0; $i < 10; $i++){
                    $k=$i*2;
                    $j=$i+1;
                    $n=$k+1;
                    $contents = amixer("cset numid={$j} {$values[$k]},{$values[$n]}");
                };
            } 
            phpSession('write', 'alsaequal',  $curve_name);
            exit(json_encode(Array(
                "status"=>true,
                "amixer"=>$contents,
                "sql"=>$values,
                "output"=>  interfacer()
            ),true));
        }
    }
    function getCurveValues($request){
		global $dbh;
        $curve_name = $request['curve_name'];
        $result = sqlQuery("SELECT curve_values FROM cfg_eqalsa WHERE curve_name='" . $curve_name . "'", $dbh);
        $values = explode(',', $result[0]['curve_values']);
        if (count($values) > 0) {
            if (count($values) < 11) {
                for($i = 0; $i < 10; $i++){
                    $j=$i+1;
                    $contents = array();
                    $contents[] = "{$values[$i]}";
                    $contents[] = "{$values[$i]}";
                    $control[] = $contents;
                };
            }
            else {
                for($i = 0; $i < 10; $i++){
                    $k=$i*2;
                    $j=$i+1;
                    $n=$k+1;
                    $contents = array();
                    $contents[] = "{$values[$k]}";
                    $contents[] = "{$values[$n]}";
                    $control[] = $contents;
                };
            } 
            exit(json_encode($control,true));
        }
    }
        
    function groups(){
//        error_log("\n groups \n");
        $response = $this->interfacer();
        
        $groups = Array(
            "playback"=>Array(),
            "capture"=>Array(),
            "master"=>Array(),
            "preferences"=>$this->preferences,
        );
        
        foreach($response['controls'] AS $idx => $control) {
            
            switch(true){
                
                case (strpos($control['name'], 'PCM') !== false):
                case (strpos($control['name'], 'Master') !== false):
                case (strpos($control['name'], 'master') !== false):
                case (strpos($control['name'], 'Line') !== false):
                case (strpos($control['name'], 'line') !== false):
                    $groups['master'][] = $control;
                    break;
            }
                
            switch(true){
                case (strpos($control['name'], 'Mic') !== false):
                case (strpos($control['name'], 'mic') !== false):
                case (strpos($control['name'], 'Capture') !== false):
                case (strpos($control['name'], 'capture') !== false):
                case (strpos($control['name'], 'Line') !== false):
                case (strpos($control['name'], 'line') !== false):
                    $groups['capture'][] = $control;
                    break;
            }
            
//            error_log("\n groups controlname: ".$control['name']."\n");
            
        }
        
        return $groups;
        
    }
    
    function set($request){
//        error_log("\n set \n");
        
        $contents = amixer("cset numid={$request['id']} {$request['value']} {$request['channel']} ");
        
        exit(json_encode(Array(
            "status"=>true,
            "output"=>  interfacer($contents)
        ),true));
        
    }

    function reset_defaults(){
        for($i = 1; $i < 11; $i++){
            $contents = amixer("cset numid={$i} 50");
        };
        exit(json_encode(Array(
            "status"=>true,
            "output"=>  interfacer()
        ),true));
        
/*         exit(json_encode(Array(
            "status"=>true,
            "output"=>  "ok"
        ),true));
 */	
 }
     function setOutput($output){
//        error_log("\n setOutput \n");
//        error_log("\n $output \n");
        $stat = "";
        $cmdl = "mpc|grep playing";               
        exec($cmdl,$contents);        
        if($contents != ""){
            $cmdl = "mpc pause";
            $stat="playing";
            exec($cmdl,$contents);        
        }
        $cmdl = "mpc enable only ".$output;               
        exec($cmdl,$contents);  
        if($stat=="playing"){
            $cmdl = "mpc play";               
            exec($cmdl,$contents);   
        }            
        exit(json_encode(Array(
            "status"=>true,
            "content"=>$contents
        ),true));
        
    }
   
    /*AMIXER*/
    function amixer($params, $grep=false){
        
        $cmdl = "sudo amixer -D alsaequal " .
                "{$params}" .
                (($grep!==false)?" |grep {$grep}":"");
                
//        error_log("\n amixer cmdl: ".$cmdl."\n");
                
        exec($cmdl,$contents);
        return $contents;        
    }
    
    function parser($contents=null){
        global $prefixes;
        //Our mixes will be populated here
        $mixers  = Array();
        
        //Pointer for mixer finding
        $pointer = null;
        
        $contents = ($contents===null)?amixer("contents"):$contents;
//        error_log("\n parser contents".count($contents)."\n");
//        error_log("\n $prefixes".count($prefixes)."\n");

        //Ask amixer for its content
        foreach($contents AS $idx => $row){
           
            /* The first 6 chars are the prefixes 
             * for each kind of possible row */
            $prfxid = substr($row,0,5);
//            error_log("\n parser prefixid: ".$prfxid."\n");

            /*But we strip only 4 to parse 
             * all information correctly*/
            $endfx  = substr($row, 3);
            
            /*Association so we can see the pattern*/
            $prefix = isset($prefixes[$prfxid])?$prefixes[$prfxid]:false;
//            error_log("\n parser prefix: ".$prefix."\n");
//            error_log("\n parser $prefixes[$prfxid]: ".$prefixes[$prfxid]."\n");

            switch($prefix){
                
                case "id":
                case "type":
                case "dB":
                    
                    /* This prefix means a new mixer */
                    if($prefix === "id"){
                        $pointer = &$mixers[];
                        $pointer = Array();
                    }
                    
                    foreach(explode(',', $endfx) AS $aidx => $arg) {
                        list($key, $val) = explode('=', $arg);
                        $pointer[trim($key)] = trim(trim($val),"'");
                    };
                    break;
                    
                case "values":
                    $item = str_replace("values=","",$endfx);
                    $values = explode(',', $item);
                    /*Check if count is same as values found*/
                    if(count($values) == $pointer['values']){
                        $pointer['values'] = $values;
                    } else {
                        unset($pointer['values']);
                    }
                    break;
                    
                case "item":
                    if(!is_array($pointer['items'])){
                        $pointer['items'] = Array();
                    };
                    $item = str_replace(Array("Item #","'"),"",$endfx);
                    $num = trim(substr($item, 0,2));
                    $desc = trim(substr($item, 2));
                    $pointer['items'][] = Array(
                        'index'=>$num, 
                        'source'=>$pointer['id'], 
                        'description'=>$desc, 
                    );
                    break;
                
                /*Can we use it ? Not figure out how. Yet.*/
                case "container":
                    $pointer['container'] = Array();
                    break;
                
                case "sub_container":
                    $pointer['container'][] = str_replace(" |","",$endfx);
                    break;
                
            }
            
        }
//        error_log("\n parser mixer count: ".count($mixers)."\n");

        return $mixers;
        
    }
    
    function channels(){
         
        //Our channels will be populated here
        $channels  = Array();
        
        //Pointer for mixer finding
        $pointer = null;
        
        //Ask amixer for its content
        foreach(amixer("", "-e control -e channels") AS $idx => $row){
//           error_log("\n channels row: ".$row."\n");
            $prfxid = trim(substr($row,0,2));
            
            if($prfxid != ""){
                
                preg_match_all("/\'(.*?)\'/", $row, $matches);
                $description = $matches[1][0];
//                error_log("\n channels descr: ".$description."\n");
                $pointer = &$channels[$description];
                $pointer = Array();
                
            } else {
                
                if(isset($pointer)){
                    
                    $name = explode(": ",$row)[1];
                    
                    foreach(explode("-", $name) AS $idx => $val){
                        $pointer[$idx] = trim($val);
//						error_log("\n channels pointer: ".$pointer[$idx]."\n");
                    }
                }
                
            }

        }
//        error_log("\n channels \n");
        
        return $channels;
        
    }
    
    function interfacer($contents=null){
        
        $controls    = Array();
        global $channels;

        foreach(parser($contents) AS $idx => &$mixer){
            
            $id         = $mixer['id'];
            $full_name  = $mixer['name'];
            $short_name = str_replace(Array("Source","Switch","Volume","Playback"), "", $full_name);
            $short_name = str_replace("  ", " ", $short_name);
//            error_log("\n interfacer id: ".$id."\n");
//            error_log("\n interfacer full_name: ".$full_name."\n");
//            error_log("\n interfacer short_name: ".$short_name."\n");

            /*Format workarounds*/
            if(isset($mixer['step'])){
                $mixer['step'] = floatval(str_replace("dB", "", $mixer['step']));
            }

            switch($mixer['type']){
                
                case 'ENUMERATED':

                    if(is_array($mixer['items']) && is_array($mixer['values'])){
                        if(isset($mixer['values'][0])){
                            $selection = intval($mixer['values'][0]);
                            $mixer['items'][$selection]['checked'] = true;
                        }
                    }
                    
                    $controls[trim($short_name)]['source'] = $mixer;
                    break;
                
                case 'BOOLEAN':
                    if(is_array($mixer['values']) && is_array($mixer['values'])){
                        $mixer['values'] = array_map(function($state){
                            switch(true){
                                case ( trim($state) === 'on' ): return true;
                                case ( trim($state) === 'off' ): return false;
                            }
                            return $state;
                        }, $mixer['values']);
                    }                   
                    
                    $controls[trim($short_name)]['switch'] = $mixer;
                    break;
                
                case 'INTEGER':
                    
                    $mixer['channels'] = Array();
                    
                    if($mixer['step'] > 0){
                        
                        foreach($channels[trim($short_name)] AS $idx => $name){
                            
                            $mixer['channels'][] = Array(
                                "name" => $name,
                                "id" => $mixer['id'],
                                "channel" => $idx,
                                "min" => $mixer['min'],
                                "max" => $mixer['max'],
                                "step" => $mixer['step'],
                                "current" => isset($mixer['values'][$idx])?$mixer['values'][$idx]:false
                            );
                        }

                        $controls[trim($short_name)]['volume'] = $mixer;
                        
                    }
                    break;
                
                default:
                    $controls[trim($short_name)]['unknown'] = $mixer;
                    break;
                
            }
            
            $controls[trim($short_name)]['id'] = trim($id);
            $controls[trim($short_name)]['name'] = trim($short_name);
//            $controls[trim($short_name)]['preferences'] = preferences;
            
        }
        return Array(
//            "preferences" => $this->preferences,
//            "preferences" => Array(),
            "controls" => array_values($controls),
            "total" => count($controls),
            "outputs" => mpc_outputs()
        );
        
    }

    function mpc_outputs(){
		$key = -1;
        $cmdl = "mpc outputs| grep 'Output'";               
        exec($cmdl,$contents);
		$outputs = array_values($contents);
		for ($i=0;$i < count($outputs); $i++) {
			if(stripos($outputs[$i],'enabled')!== false){$key=$i;}
			preg_match('/\((.*?)\)/', $outputs[$i], $match);
			$outputs[$i] = $match[1];
		} 
		$result = array();
		$result[] = $outputs;
		$result[] = array("enabled" => $key);
        return  $result;                
        
    }
    /*CUSTOM*/
/*     function preferences(){
        
        error_log("\n function preferences \n");
        $api = $this->modules->preferences();
        
        $set = $api->preferences->devices->{$this->device};
        
        $this->preferences = $set;
        
        return $set;
        
    }
 */
