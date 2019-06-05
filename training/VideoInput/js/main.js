
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
 * -------------------------------------
 *
 * This Example is training poses into KNN-Classifier Classes with Videoflie as input
 * 
 */



// prints debug information to the console
var consoleDebug = true;

// debug prints to the DOM
var drawDomDebug = true;

// draw all the not selected poses
var poseDebugDraw = true;


// video input container 
var video;

// Create a KNN classifier
var knnClassifier = ml5.KNNClassifier();
let poseNet;
let poses = [];

// set options for poseNet (single detection)
let poseNetOptions = {
  imageScaleFactor: 0.1,
  outputStride: 8,
  flipHorizontal: true,
  minConfidence: 0 ,
  maxPoseDetections: 0,
  //scoreThreshold: 0,
  //nmsRadius: 20,
  detectionType: 'multi',    multiplier: 0.5,// doesn't work 

}

// p5 canvas size
var canvasW = 640; // 1280;  // 
var canvasH = 480; // 970; // 120

// p5 camera resolution
var cameraResW = 640;  // 
var cameraResH = 480; // 120

var selectedPosStrokeWeight = 6;

// the canvas object
var cnv;
var videoCanvas;

// workflow bools
var doPrediction = false;
var waitingForResult = false;
var isFreaze = false; 

// who is in the middle
var selectedPosId = 0;

// vars for framerate count
var lastMillis = 0;
var frameRateCounter = 0; 
var frameRateCount =  0;

/////////////Mode 1 KNN Model
// prediction class IDs 
var classId = ['Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];   // Z is the base class
// confidence levels for each class to be accesd globaly 
var confLevels = [];

// class agnostic confidence level
let conf = 0;



////////// video trainings vars
var videoFrameCount = 0;
var loopFrameCount = 0;

//var trainingVideoSource, 
var trainingClass;
var doTraining = false;
var videoIsRunning = false;


// thershold for pose score used for training
var trainingPoseScoreThreshold = 0.70;



function preload() {

}


function setup() {

  if(consoleDebug) console.log("start setup");

  ////// init confLevel array
  resetConfLevels();

  if(consoleDebug) console.log("init camera");
  initCamera();  
 
  if(consoleDebug) console.log("init display canvas");
  initCanvas();

  if(consoleDebug) console.log("init posNet");
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
   // --> desktop <--
  //videoCanvas = createCanvas(cameraResW, cameraResH);
  //videoCanvas.parent('videoContainer');
  video = createCapture(VIDEO);
  video.size(cameraResW, cameraResH);
  video.hide();  
}

function initCanvas(){
  cnv = createCanvas(canvasW, canvasH);
  pixelDensity(1);  // otherwise we get gif export problems with retina displays
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

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady, poseNetOptions);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
     // console.log("lklzuzukjdf");
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
    translate(width,0);
    scale(-1.0,1.0);
    //draw image
    if(video != null) { 
      tint(255,255);
      image(video, 0, 0, width, height);
      filter(GRAY);
    }
  
  //if there are poses available 
  if( poses.length > 0) {    
   if(drawDomDebug)document.getElementById("debug1").innerHTML = "poses detected: " + poses.length;
    selectedPosId = getCenterPos();  
    
    drawSelectedPose(selectedPosId);
    if(poseDebugDraw)drawOtherPoses(selectedPosId);
    
    // trainings draw !!!!
    if(doTraining){
      if(poses[selectedPosId].pose.score >= trainingPoseScoreThreshold){
        if(consoleDebug)console.log("adding class: " + trainingClass);
        addExample(trainingClass);
        //if(consoleDebug)console.log("videoFrameCount" + videoFrameCount);
      } else {
         // if(consoleDebug)console.log(" not adding class, score to low");
      }
      videoFrameCount++;
    }
    //// trainings draw end

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
        // flip matrix back
        //translate(keypoint.position.x, keypoint.position.y); // move to far corner
        //text(keypoint.part,0,0);
        //text(keypoint.position.x,0,0);
        
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

  // making dynamic mid values available outside for-loop
  let midShouldersX;
  let midShouldersY;
  let midHipsX;
  let midHipsY;

  //draw the  keypoints 
  /*let pose = thePose.pose;
  fill(255, 0, 0);
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
  */
  let skeleton = thePose.skeleton;

  noFill();

  // change skeleton color from white to red if person matches the pose
  if (conf === 100) {
    stroke(255, 82, 30);
  } else {
    stroke(255, 255, 255);
  };
  strokeWeight(selectedPosStrokeWeight);  
  // For every skeleton, loop through all body connections
  for (let j = 0; j < skeleton.length; j++) {
    let partA = skeleton[j][0];
    let partB = skeleton[j][1];

    
  if(videoIsRunning){
      // draw stright lines 
      let xa = (partA.position.x * (canvasW / cameraResW));
      let xb = (partB.position.x * (canvasW / cameraResW));
      let ya = (partA.position.y * (canvasW / cameraResW));
      let yb = (partB.position.y * (canvasW / cameraResW));
      line(xa, ya, xb, yb);
    
    } else {
      // draw wiggly lines
      // scale coordinates to canvas resolution
      let xa = (partA.position.x * (canvasW / cameraResW));
      let xb = (partB.position.x * (canvasW / cameraResW));
      let ya = (partA.position.y * (canvasW / cameraResW));
      let yb = (partB.position.y * (canvasW / cameraResW));
        
      // get center point of vertex
      let halfX = (xa + xb) / 2;
      let halfY = (ya + yb) / 2;
      // get 1/3 point of vertex
      let oneThirdX = ((0.66 * xa) + (0.33 * xb));
      let oneThirdY = ((0.66 * ya) + (0.33 * yb));
      // get 3/4 point of vertex
      let twoThirdsX = ((0.33 * xa) + (0.66 * xb));
      let twoThirdsY = ((0.33 * ya) + (0.66 * yb));
      //get 1/4 point of vertex
      let oneFourthX = ((0.75 * xa) + (0.25 * xb));
      let oneFourthY = ((0.75 * ya) + (0.25 * yb));
      //get 3/4 point of vertex
      let threeFourthsX = ((0.25 * xa) + (0.75 * xb));
      let threeFourthsY = ((0.25 * ya) + (0.75 * yb));

      // map class agnostic confidence to range
      let range = map(conf, 0, 100, 30, 0);

      // draw skeleton
      // exchange default torso lines with custom torso
      // make them lines wiggle, wiggle, wiggle
      if(((partA.part === "leftShoulder") && (partB.part === "rightShoulder")) || ((partB.part === "leftShoulder") && (partA.part === "rightShoulder")) || ((partA.part === "leftHip") && (partB.part === "rightHip")) || ((partB.part === "leftHip") && (partA.part === "rightHip")) || ((partA.part === "leftHip") && (partB.part === "leftShoulder")) || ((partB.part === "leftHip") && (partA.part === "leftShoulder")) || ((partA.part === "rightHip") && (partB.part === "rightShoulder")) || ((partB.part === "rightHip") && (partA.part === "rightShoulder"))) {
        if(((partA.part === "leftShoulder") && (partB.part === "rightShoulder")) || ((partB.part === "leftShoulder") && (partA.part === "rightShoulder"))){
          // draw left collar
          beginShape();
          // draw vertex starting point
          curveVertex(xa, ya);
          curveVertex(xa, ya);
          // draw 1/4 vertex control point
          curveVertex(random(oneFourthX - range, oneFourthX + range), random(oneFourthY - range, oneFourthY + range));
          curveVertex(random(oneFourthX - range, oneFourthX + range), random(oneFourthY - range, oneFourthY + range));
          // draw vertex endpoint
          curveVertex(halfX, halfY);
          curveVertex(halfX, halfY);
          endShape(); 

          //draw right collar
          beginShape();
          // draw vertex starting point
          curveVertex(xb, yb);
          curveVertex(xb, yb);
          // draw 3/4 vertex control point
          curveVertex(random(threeFourthsX - range, threeFourthsX + range), random(threeFourthsY - range, threeFourthsY + range));
          curveVertex(random(threeFourthsX - range, threeFourthsX + range), random(threeFourthsY - range, threeFourthsY + range));
          // draw vertex endpoint
          curveVertex(halfX, halfY);
          curveVertex(halfX, halfY);
          endShape(); 
            
          //get mid point between shoulders
          midShouldersX = (xa + xb) / 2;
          midShouldersY = (ya + yb) / 2;
            
        } else if(((partA.part === "leftHip") && (partB.part === "rightHip")) || ((partA.part === "leftHip") && (partB.part === "rightHip"))){
          // draw left hips
          beginShape();
          // draw vertex starting point
          curveVertex(xa, ya);
          curveVertex(xa, ya);
          // draw 1/4 vertex control point
          curveVertex(random(oneFourthX - range, oneFourthX + range), random(oneFourthY - range, oneFourthY + range));
          curveVertex(random(oneFourthX - range, oneFourthX + range), random(oneFourthY - range, oneFourthY + range));
          // draw vertex endpoint
          curveVertex(halfX, halfY);
          curveVertex(halfX, halfY);
          endShape(); 

          //draw right hips
          beginShape();
          // draw vertex starting point
          curveVertex(xb, yb);
          curveVertex(xb, yb);
          // draw 3/4 vertex control point
          curveVertex(random(threeFourthsX - range, threeFourthsX + range), random(threeFourthsY - range, threeFourthsY + range));
          curveVertex(random(threeFourthsX - range, threeFourthsX + range), random(threeFourthsY - range, threeFourthsY + range));
          // draw vertex endpoint
          curveVertex(halfX, halfY);
          curveVertex(halfX, halfY);
          endShape(); 

          // get mid point between Hips
          midHipsX = (xa + xb) / 2;
          midHipsY = (ya + yb) / 2;

          // get 1/3 point of spine vertex
          let oneThirdSpineX = ((0.66 * midShouldersX) + (0.33 * midHipsX));
          let oneThirdSpineY = ((0.66 * midShouldersY) + (0.33 * midHipsY));
          // get 3/4 point of Spine vertex
          let twoThirdsSpineX = ((0.33 * midShouldersX) + (0.66 * midHipsX));
          let twoThirdsSpineY = ((0.33 * midShouldersY) + (0.66 * midHipsY));

          // draw spine
          beginShape();
          // draw vertex starting point
          curveVertex(midShouldersX, midShouldersY);
          curveVertex(midShouldersX, midShouldersY);
          // draw 1/3 vertex control point
          curveVertex(random(oneThirdSpineX - range, oneThirdSpineX + range), random(oneThirdSpineY - range, oneThirdSpineY + range));
          curveVertex(random(oneThirdSpineX - range, oneThirdSpineX + range), random(oneThirdSpineY - range, oneThirdSpineY + range));
          // draw 3/4 vertex control point
          curveVertex(random(twoThirdsX - range, twoThirdsSpineX + range), random(twoThirdsSpineY - range, twoThirdsSpineY + range));
          curveVertex(random(twoThirdsX - range, twoThirdsSpineX + range), random(twoThirdsSpineY - range, twoThirdsSpineY + range));
          // draw vertex endpoint
          curveVertex(midHipsX, midHipsY);
          curveVertex(midHipsX, midHipsY);
          endShape();
        }
      }
      else {
        beginShape();
        // draw vertex starting point
        curveVertex(xa, ya);
        curveVertex(xa, ya);
        // draw 1/3 vertex control point
        curveVertex(random(oneThirdX - range, oneThirdX + range), random(oneThirdY - range, oneThirdY + range));
        curveVertex(random(oneThirdX - range, oneThirdX + range), random(oneThirdY - range, oneThirdY + range));
        // draw 3/4 vertex control point
        curveVertex(random(twoThirdsX - range, twoThirdsX + range), random(twoThirdsY - range, twoThirdsY + range));
        curveVertex(random(twoThirdsX - range, twoThirdsX + range), random(twoThirdsY - range, twoThirdsY + range));
        // draw vertex endpoint
        curveVertex(xb, yb);
        curveVertex(xb, yb);
        endShape(); 
      }
    }
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

          // flip matrix back for text
          /*push();
          translate(keypoint.position.x, keypoint.position.y); // move to far corner
          scale(-1.0,1.0);    // flip x-axis backwards
          text(keypoint.part,0,0);
          //text(keypoint.position.x,0,0);
          pop ();
          */

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
    //document.getElementById("frameRate").innerHTML = "fr: " + (int)(frameRate()) ;

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