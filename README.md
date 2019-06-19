
![GIF compilation of the makers](https://space10.io/content/uploads/2019/06/learning-from-machines.gif)

# Examples
We've put together some examples on how to use OpenPoseNet and a KNN classifier. All sketches are basic html and js using processing.js (http://processingjs.org/) and the ml5.js library (https://github.com/ml5js). 

The repository includes examples for training KNN classifier Classes with your own poses to create a prediction model. The prediction models can be saved and later loaded into your application.

## AI Aerobics: Moving with Machines

AI Aerobics is a digital experience where you follow a machine’s instructions on how to move. Sounds simple enough, right? In fact, the poses the computer demands of you reflect what it’s learned about unique movement through reinforcement learning techniques. And not only that: they’ve also been tweaked in response to what CIRG found out about movement through talking to choreographers, yoga teachers and more. In the experiment itself, however, you don’t get that whole backstory. Instead, you get an entertaining experience where you work out like a machine says you should—and then export your routine as a GIF if you wish to.

about the project: 
prototype: 

## Getting started

(Please run the Examples in Chrome or Safari)

### Example 1 (simpleOpenPoseExample) OpenPoseNet Example, selecting the most Centered Pose
A basic example on how to use OpenPoseNet for pose detection. Selecting the most centered pose (Highlighted in red). 
(We added this feature to get clean training data and don't end up training our KNN classifier on background noise)

### Example 2 (trainingWithCameraInput) Training KNN classifier Classes with WebCam input.
Simple interface for training your KNN classifier model with real time webcam data. Easy way to get started and test your ideas.

#### Notes: 
- You should always train a default class with random movements. We recommend to use class »Z« for this. 
- Just train as many classes as you need, the emtpy ones will not be taken into consideration. Classes are hardcoded, but you can easily change names and quantity in the code.

### Example 3 (trainingWithVideoInput) Training KNN classifier Classes with video files as input.
Enables you to train your KNN classifier model with pre-recorded video files. So you can easily try out different settings and combinations for the same input data. (No need to dance in front of the camera all day long ;) 

#### Notes: 
- You should always train a default class with random movements. We recommend to use class »Z« for this. 
- Just train as many classes as you need, the emtpy ones will not been taken into considereation. Classes are hardcoded, but you can easily change names and quantity in the code.

### Example 4 (poseClassesPrediction) loading a pretrained model with 3 poses and predicting the representet pose
A Simple example, detecting if you rise your left or right arm. (class A - right Arm, class B - left arm, class Z - all other poses). Model is pre-trained with the sample videos from example 3. 


## Copyleft

The examples are based on the original examples by the ml5.js project: https://github.com/ml5js/ml5-examples

Licensed under the GNU Lesser General Public License. See license.txt for further details.
