
/* AI Aerobics: Moving with Machines - EXAMPLE CODE 
 * -------------------------------------------------
 *
 * Code Snippets created during the »AI Aerobics: Moving with Machines« project 
 * by CIRG (https://cirg.io) and Space10 (https://space10.io/)
 *  
 * Project URL: https://ai-aerobics.space10.io/
 * Code Snippet Repository: https://github.com/cirg-io/AIAerobics-examples
 *  
 * Example Using openPosNet and ml5.js in p5.js 
 * Based on ml5.js examples: https://github.com/ml5js/ml5-examples  
 * 
 * Licensed under the GNU Lesser General Public License. See license.txt for further details.
 * 
 * CIRG + Space10 | Summer 2019 |
 * 
 * -------------------------------------------------
 *
 * This Example is training poses into KNN-Classifier Classes with Videoflie as input
 * 
 */

// debug prints to the DOM
var drawDomDebug = true;

// draw all the not selected trainingPoseScoreThreshold
var poseDebugDraw = true;

// use the most centered pose for prediction and training 
useMostCenteredPose = true;

// p5 canvas size
var canvasW = 640; // 1280;  // 
var canvasH = 480; // 970; // 120

// p5 camera resolution
var cameraResW = 640;  // 
var cameraResH = 480; // 120

// the canvas object
var cnv;
// video capture object 
var video;


////// openPoseNetVars
let poseNet;
let poses = [];

// set options for poseNet (single detection)
let poseNetOptions = {
  imageScaleFactor: 0.4,
  outputStride: 8,
  flipHorizontal: false,
  minConfidence: 0.4 ,
  maxPoseDetections: 0,
  //scoreThreshold: 0,
  //nmsRadius: 20,
  detectionType: 'multi',
  multiplier: 0.5,
}

// who is in the middle
var selectedPosId = 0;

var selectedPosStrokeWeight = 6;


///////////// KNN Model
// Create a KNN classifier
var knnClassifier = ml5.KNNClassifier();

// prediction class IDs 
var classId = ['Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];   // Z is the base class
// confidence levels for each class to be accesd globaly 
var confLevels = [];

// class agnostic confidence level
let conf = 0;

// workflow bools
var doPrediction = false;
var waitingForResult = false;



////////// video trainings vars
var videoFrameCount = 0;
var loopFrameCount = 0;

//var trainingVideoSource, 
var trainingClass;
var doTraining = false;
var videoIsRunning = false;

// thershold for pose score used for training
var trainingPoseScoreThreshold = 0.70;



// vars for framerate count
var lastMillis = 0;
var frameRateCounter = 0; 
var frameRateCount =  0;


function preload() {

}


function setup() {

  console.log("start setup");

  ////// init confLevel array
  resetConfLevels();

  console.log("init camera");
  initCamera();  
 
  console.log("init display canvas");
  initCanvas();

  console.log("init posNet");
  initPoseNet();
  
  if(drawDomDebug){
    $(".debugText").each(function(){
      $(this).css("display", "block");  
    });
  }

    bindTrainingInput();
  
}


function resetConfLevels(){
   for (let e = 0; e < classId.length; e++) {
    confLevels[e] = 0;
  }
}


function initCamera(){
  video = createCapture(VIDEO);
  video.size(cameraResW, cameraResH);
  video.hide();  
}

function initCanvas(){
  cnv = createCanvas(canvasW, canvasH);
  pixelDensity(1);
  cnv.style("z-index", "-1");
  centerCanvas(); 
}

function initPoseNet() {

 if(drawDomDebug)select('#status').html('init openPosNet')
  if(poseNet != null){
    poses = [];
    poseNet.removeAllListeners();
    //console.log(poseNet);
  }

  // Create poseNet
  poseNet = ml5.poseNet(video, poseNetOptions);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
}


function draw() {

  if(drawDomDebug) printFrameRate();

  // if training video is running    
  if(videoIsRunning){
    loopFrameCount++;
    if(drawDomDebug)document.getElementById("debug3").innerHTML = "loop-frames: " + loopFrameCount + "; video-frames: " + int(video.time()*25);
    
    if(video.time() == video.duration()){
      stopVideo();
    }
  }

  //draw the camera input
  translate(width,0);
  scale(-1.0,1.0);
  //draw image
  if(video != null) { 
    image(video, 0, 0, width, height);
    filter(GRAY);
  }
  
  //if there are poses available 
  if( poses.length > 0) {    
    if(drawDomDebug)document.getElementById("debug1").innerHTML = "poses detected: " + poses.length;
    if(useMostCenteredPose) {
      selectedPosId = getCenterPos();  
    } else {
      selectedPosId = 0;
    }

    drawSelectedPose(selectedPosId);
    if(poseDebugDraw)drawOtherPoses(selectedPosId);
    
    // trainings draw !!!!
    if(doTraining){
      if(poses[selectedPosId].pose.score >= trainingPoseScoreThreshold){
        console.log("adding class: " + trainingClass);
        addExample(trainingClass);
        //console.log("videoFrameCount" + videoFrameCount);
      } else {
         // console.log(" not adding class, score to low");
      }
      videoFrameCount++;
    }
    //// trainings draw end

    // if we are ready for a new prediction : )
    if(doPrediction == true && waitingForResult == false){
      classify();
    }

  } else {
    if(drawDomDebug)document.getElementById("debug1").innerHTML =  "no pose detected";
  }

  // flip canvas back, horizontally
  //translate(width,0);
  //scale(-1.0,1.0);

}


function windowResized() {
  if(cnv != null) {
    centerCanvas();
  }
}


function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) /2; //- 50; /// 2;
  cnv.position(x, y);
}


function getCenterPos(){

  var bestSoFar = 0;
  var bestSoFar_val = cameraResW/2;

  for (let i = 0; i < poses.length; i++) {
    var xPosSum = 0;
    var xPosSumCount =0;
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      //console.log(pose.keypoints[j].part)
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        xPosSum += keypoint.position.x;
        xPosSumCount++;
        
      }
    }
    var xPosAve = xPosSum / xPosSumCount;
    var distanceToCenter = abs(xPosAve - cameraResW/2);
    if(distanceToCenter < bestSoFar_val){
      bestSoFar_val = distanceToCenter;
      bestSoFar = i;
    }
  }
  if(drawDomDebug)document.getElementById("debug2").innerHTML =  "selected pose score: " +  poses[bestSoFar].pose.score.toFixed(2);

  return bestSoFar
}



function drawSelectedPose(_selectedPos){
  let thePose = poses[_selectedPos];
  let pose = thePose.pose;
  
  //draw the  keypoints 
  fill(255, 82, 30);
  noStroke();   
  for (let j = 0; j < pose.keypoints.length; j++) {
    // A keypoint is an object describing a body part (like rightArm or leftShoulder)
    let keypoint = pose.keypoints[j];
    //console.log(pose.keypoints[j].part)
    // Only draw an ellipse is the pose probability is bigger than 0.2
    if (keypoint.score > 0.2) {    
      ellipse(keypoint.position.x, keypoint.position.y, 10, 10);      
    }
  }

  //draw the  skeleton
  let skeleton = thePose.skeleton;
  noFill();

  stroke(255, 82, 30);
  strokeWeight(selectedPosStrokeWeight);  

  for (let j = 0; j < skeleton.length; j++) {
    let partA = skeleton[j][0];
    let partB = skeleton[j][1];
    line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
  }
  
}


function drawOtherPoses(_selectedPos){
  drawKeypoints(_selectedPos);
  drawSkeleton(_selectedPos);
}


// A function to draw ellipses over the detected keypoints
function drawKeypoints(_selectedPos)  {
  fill(255, 255, 0);
  noStroke();
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    
    if(i != _selectedPos){
      // For each pose detected, loop through all the keypoints
      let pose = poses[i].pose;
      for (let j = 0; j < pose.keypoints.length; j++) {
        // A keypoint is an object describing a body part (like rightArm or leftShoulder)
        let keypoint = pose.keypoints[j];
        //console.log(pose.keypoints[j].part)
        // Only draw an ellipse is the pose probability is bigger than 0.2
        if (keypoint.score > 0.2) {
          ellipse(keypoint.position.x, keypoint.position.y, 5, 5);     
          
        }
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton(_selectedPos) {
  
  stroke(255,255, 0);
  strokeWeight(1);
    
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
  
    if(i != _selectedPos){
      let skeleton = poses[i].skeleton;
      // For every skeleton, loop through all body connections
      for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }
    }
  }
}


///////////// mothers little helpers 

function printFrameRate(){

  frameRateCounter += (int)(frameRate());
  frameRateCount++; 

  if(millis() > lastMillis+300){
    lastMillis = millis();
    var fr = frameRateCounter / frameRateCount;
    if(drawDomDebug)document.getElementById("frameRate").innerHTML = "fr: " + (int)(fr);

    frameRateCounter = 0;
    frameRateCount = 0;
  } 
}


function getTimeStamp() {
  var str = "";

  var currentTime = new Date()
  str += currentTime.getFullYear() + "-";
  str += currentTime.getMonth()+1 + "-";
  str += currentTime.getDate() + "-";
  str += currentTime.getHours() + "-";
  str += currentTime.getMinutes() + "-";
  str += currentTime.getSeconds();

  return str;

}