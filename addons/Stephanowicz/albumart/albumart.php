<?php
/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2024 Stephanowicz 
 * https://github.com/Stephanowicz/moOde-audioplayer-addons
*/

require_once dirname(__FILE__) . '/../../../inc/getid3/getid3.php';
require_once dirname(__FILE__) . '/../../../inc/common.php';
require_once dirname(__FILE__) . '/../../../inc/session.php';
require_once dirname(__FILE__) . '/../../../inc/sql.php';

$query = urldecode($_SERVER['QUERY_STRING']);
if($query && strpos($query,'filepath=')!==false){
	$path = substr($query,strpos($query,'filepath=')+9);
	if(strpos($query,'http')===false)
	{
    	$path = MPD_MUSICROOT . $path;
	}
}
else {
    $file=shell_exec('mpc -f %file%|head -n 1');
    if($file){
        $file=trim ($file);
		if(strpos($file,'http')!==false)
		{
			$path = $file;
		}
        else $path = MPD_MUSICROOT . $file;
    }
}
if($path){
	if(strpos($path,'http')!==false)
	{
		$index=shell_exec('mpc -f %position%|head -n 1');
		$index=trim ($index);
		$imgArray = webimage($index);
	}
	else {
		$imgArray = getImage($path); //get embedded images
		
		$dirpath = pathinfo($path, PATHINFO_DIRNAME) . '/';
		$img = parseFolder($dirpath); //parse for image-files in folder
		foreach($img as $item){
			$imgArray[] = $item;
		}
	}
    if($imgArray){
        echo json_encode($imgArray);
    }
    else {
        echo "";
    }
}
else{
    echo "";
}

die;

function getImage($filename)
 {
     if (!file_exists($filename)) {
         return null;
     }
     $getID3 = new getID3();
     $file_info = $getID3->analyze($filename);
     $artwork = null;
     //flac ogg
     if (isset($file_info['comments']['picture'][0]['data'])) {
       foreach($file_info['comments']['picture'] as $value){
         if(isset($value['data'])){
               $artwork[] = buildImageData($value);
				if(count($artwork) > 4) break;
         }
       }
     }
     else {
       //mp3
       if (isset($file_info['id3v2']['APIC'][0]['data'])) {
         foreach($file_info['id3v2']['APIC'] as $value){
           if(isset($value['data'])){
               $artwork[] = buildImageData($value);
				if(count($artwork) > 4) break;
           }
         }
       }
     }
     return $artwork;
 }

 function webimage($index) {
			$artwork = null;
//			$res=shell_exec("youtube-dl --list-thumbnails $file|grep sddefault.jpg");
//			if($res!=""){
//				$thumbnails=explode("\n",$res);
//				echo $thumbnails[0]."<br />";
//				$thumbnail = substr($thumbnails[0], strpos($thumbnails[0],"http"));
//				echo $thumbnail."<br />";
				$file = '/var/tmp/'.$index.'.jpg';
				if(is_file($file)){
					$filesize = filesize ($file);
	//				$imgheader = get_headers($thumbnail, 1);
	//				$filesize = $imgheader ["Content-Length"];
	//				if($filesize > 40*1024) {
	//					$img = file_get_contents($thumbnail);
	//					file_put_contents('/var/tmp/thumb.jpg',$img);
					//	imagejpeg($img, 'thumb.jpg');
	//					$file = '/var/tmp/thumb.jpg';

					//	$width = imagesx($img);
					//	$height = imagesy($img);
						$image_info = getimagesize($file); 
						list($width, $height, $image_type) = getimagesize($file);
						if(($width > 300 && $height > 300) && ($width < 2000 && $height < 2000)) {
							$fh = fopen($file, 'rb');
							$imageData = fread($fh, $filesize);
							fclose($fh);
						//	$image_data = scaleImageFileToBlob($imageData, $width, $height, $image_type);
							$artwork[] = array('data:'.$image_info['mime'].';charset=utf-8;base64,'.base64_encode($imageData),$image_info[3],basename($file));
						}
				}
//				}
//				echo "Header: ".print_r($imgheader)."<br />";
//				echo "Index: ".$index."<br />";
//				echo "File: ".$file."<br />";
//				echo "Filesize: ".$filesize."<br />";
//				echo "Width: ".$width."<br />";
//				echo "Height: ".$height."<br />";
//				echo "artwork: ".print_r($artwork)."<br />";
//				echo "img: ".$img."<br />";
//				imagejpeg($img);
				//imagedestroy($img);
				return $artwork;
			//}
}
 function buildImageData($value){
	$image_width = $value['image_width'];
	$image_height = $value['image_height'];
	$image_mime = $value['image_mime'];
	$image_data = $value['data'];
	$image_type = $value['picturetype'];
	$img_mime = 0;
	
	// switch (true){
		// case stristr($image_mime,'gif'):
			// $img_mime = 1;
			// break;
		// case stristr($image_mime,'jpeg'):
			// $img_mime = 2;
			// break;
		// case stristr($image_mime,'png'):
			// $img_mime = 3;
			// break;
		// case stristr($image_mime,'bmp'):
			// $img_mime = 6;
			// break;
	// }
	
//	$image_data = scaleImageFileToBlob($value['data'], $image_width, $image_height, $img_mime);

	$imgData='data:'.$image_mime.';charset=utf-8;base64,'.base64_encode($image_data);
	
    $imgProportion='width="'.$image_width.'" height="'.$image_height.'"';
    return array($imgData,$imgProportion,$image_type);
 }

 function parseFolder($path) {
	$artwork = null;
	$extensions = array('jpg', 'jpeg', 'png', 'tif', 'tiff');
	$path = str_replace('[', '\[', $path);
	$path = str_replace(']', '\]', $path);
	foreach (glob($path . '*') as $file) {
		if (is_file($file) && in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), $extensions) ) {
			$filesize = filesize ($file);
			if($filesize > 40*1024) {
				$image_info = getimagesize($file); 
				list($width, $height, $image_type) = getimagesize($file);
				if(($width > 500 && $height > 500) && ($width < 2000 && $height < 2000)) {
					$fh = fopen($file, 'rb');
					$imageData = fread($fh, $filesize);
					fclose($fh);
				//	$image_data = scaleImageFileToBlob($imageData, $width, $height, $image_type);
					$artwork[] = array('data:'.$image_info['mime'].';charset=utf-8;base64,'.base64_encode($imageData),$image_info[3],basename($file));
					if(count($artwork) > 4) break;
				}
			}

		}
	}
//	echo "artwork: ".print_r($artwork)."<br />";
	return $artwork;
}

function scaleImageFileToBlob($file, $width, $height, $image_type) {

    $source_pic = $file;
    $max_width = 800;
    $max_height = 800;

//    list($width, $height, $image_type) = getimagesize($file);

    // switch ($image_type)
    // {
        // case 1: $src = imagecreatefromgif($file); break;
        // case 2: $src = imagecreatefromjpeg($file);  break;
        // case 3: $src = imagecreatefrompng($file); break;
        // case 6: $src = imagecreatefrombmp($file); break;
        // default: return 'error - type='.$image_type;  break;
    // }
	$src = imagecreatefromstring($file);
	
    $x_ratio = $max_width / $width;
    $y_ratio = $max_height / $height;

    if( ($width <= $max_width) && ($height <= $max_height) ){
        $tn_width = $width;
        $tn_height = $height;
    }
	elseif (($x_ratio * $height) < $max_height){
		$tn_height = ceil($x_ratio * $height);
		$tn_width = $max_width;
    }
	else{
		$tn_width = ceil($y_ratio * $width);
		$tn_height = $max_height;
	}

	$tmp = imagecreatetruecolor($tn_width,$tn_height);

    /* Check if this image is PNG or GIF, then set if Transparent*/
    if(($image_type == 1) OR ($image_type==3)) {
        imagealphablending($tmp, false);
        imagesavealpha($tmp,true);
        $transparent = imagecolorallocatealpha($tmp, 255, 255, 255, 127);
        imagefilledrectangle($tmp, 0, 0, $tn_width, $tn_height, $transparent);
    }
	
    imagecopyresampled($tmp,$src,0,0,0,0,$tn_width, $tn_height,$width,$height);

    /*
     * imageXXX() only has two options, save as a file, or send to the browser.
     * It does not provide you the oppurtunity to manipulate the final GIF/JPG/PNG file stream
     * So I start the output buffering, use imageXXX() to output the data stream to the browser,
     * get the contents of the stream, and use clean to silently discard the buffered contents.
     */
    ob_start();

    switch ($image_type)
    {
        case 1: imagegif($tmp); break;
        case 2: imagejpeg($tmp, NULL, 100);  break; // best quality
        case 3: imagepng($tmp, NULL, 0); break; // no compression
        case 6: imagebmp($tmp); break;
        default: echo 'ERROR'; break;
    }

    $final_image = ob_get_contents();

    ob_end_clean();

    return $final_image;
}


 ?>
