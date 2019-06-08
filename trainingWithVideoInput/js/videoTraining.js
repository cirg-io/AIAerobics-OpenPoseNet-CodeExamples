

/* LEARNING FROM MACHINES - EXAMPLE CODE 
 * --------------------------------------
 *
 * Code Snippets created during the Intelligence of SiIly Walks project 
 * by CIRG (https://cirg.io) and Space10 (https://space10.io/)
 *  
 * Project URL:
 * Code Snippet Repository:  
 *  
 * Example Using openPosNet and ml5.js in p5.js 
 * Based on ml5.js examples: https://github.com/ml5js/ml5-examples  
 * 
 * Licensed under the GNU Lesser General Public License. See license.txt for further details.
 * 
 * CIRG + Space10 | Summer 2019 |
 * 
 */

var selectedVideoFile = null;

function bindTrainingInput(){

  $(document).on("change", ".file_multi_video", function(evt) {
   selectedVideoFile = URL.createObjectURL(this.files[0]);
   //alert(selectedVideoFile);
  });
  
}

function startVideoTraingingFormPrevDefinedVid(){
  
 // trainingVideoSource = _scr;
 // trainingClass = _class;
  if(drawDomDebug)select('#status').html('startingNewVideoTraining');
  
  if(selectedVideoFile != null){
    
    // get the selected class
    var e = document.getElementById("trainingVideoClass");
    var selectedClass = e.options[e.selectedIndex].value;

    initTrainingVideo(selectedVideoFile);   
    initTraining(classId[selectedClass]);

    videoFrameCount = 0;
    loopFrameCount = 0;

  } else {
    alert("no video file selected");
  }
}

function startVideoTrainging(_scr, _class){
  
 // trainingVideoSource = _scr;
 // trainingClass = _class;
  if(drawDomDebug)select('#status').html('startingNewVideoTraining');
  initTrainingVideo(_scr);
  initTraining(_class);

  videoFrameCount = 0;
  loopFrameCount = 0;

}

function initTraining(_class){

  console.log("startTraining" );
  trainingClass = _class;
  doTraining = true;

}

function initTrainingVideo(_scr) {

  //trainingFilesCount++;

  //if(trainingFilesCount < trainingFiles.length){
  // --> desktop <--
  console.log("init vidoe:" + _scr)

  video = createVideo(_scr);
  video.size(cameraResW, cameraResH);
  // Hide the video element, and just show the canvas
  video.hide();
  video.play().time(0);

  videoIsRunning = true;

  initCanvas();

  initPoseNet();

}

function stopVideo(){

  videoIsRunning = false;
  doTraining = false;
  video.stop();
  if(drawDomDebug)select('#status').html('Video is Done! Stoped Training');
   console.log("Video is Done! Stoped Training");
}

function reInitCamera(){
  
  // --> desktop <--
  //videoCanvas = createCanvas(canvasW, canvasH);
  //videoCanvas.parent('videoContainer'); 
  videoIsRunning = false;

  initCamera()

  initCanvas();

  initPoseNet();

}

