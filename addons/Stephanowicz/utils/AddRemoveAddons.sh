#!/bin/bash

OUTPUT=`grep "addons\/addons.js" /var/www/header.php`
if [[ -n $OUTPUT ]]
then 
read -p "Do You want to remove the Addons Script? (y/n)? " answer
case ${answer:0:1} in
    y|Y )
        sed -i '/<script src="addons\/addons.js/s/\(.*\)$//' /var/www/header.php
		echo Removed Addons Script
    ;;
    * )
        echo No
    ;;
esac
else
read -p "Do You want to add the Addons Script? (y/n)? " answer
case ${answer:0:1} in
    y|Y )
		sed -i '/<script src="js\/lib.min.js/s/\(.*\)$/\1\n\t<script src="addons\/addons.js?t=1729607710734" defer><\/script>/' /var/www/header.php
		echo Added Addons Script
    ;;
    * )
        echo No
    ;;
esac

fi

