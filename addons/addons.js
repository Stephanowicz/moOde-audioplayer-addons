$.getScript("addons/Stephanowicz/script.js");


//------------also working :
//let scriptEle = document.createElement("script");
//scriptEle.setAttribute("src", "addons/Stephanowicz/script.js");
//document.head.appendChild(scriptEle);
//scriptEle.addEventListener("load", () => {
//    console.log("addons/Stephanowicz/script.js loaded")
//});

//scriptEle.addEventListener("error", (ev) => {
//    console.log("Error on loading addons/Stephanowicz/script.js", ev);
//});

//--------------------------------------------------

//----------- maybe too :
//function loadScript(src) {
//    return new Promise(function (resolve, reject) {
//        let script = document.createElement('script');
//        script.src = src;

//        script.onload = () => {
//            console.log('Script loaded successfuly');
//        };
//        script.onerror = () => reject(new Error(`script load error for ${src}`));

//        document.body.appendChild(script);
//    });
//}

//$(function () {
//    loadScript("addons/Stephanowicz/script.js")
//        .catch(console.error);
//});

//------------------------------------------

