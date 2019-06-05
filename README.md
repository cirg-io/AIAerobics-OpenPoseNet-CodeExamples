
![GIF compilation of the makers](https://space10.io/content/uploads/2019/06/learning-from-machines.gif)

# learning-from-machines-examples
We've put together some examples on how to use OpenPoseNet and a KNN classifier. All sketches are basic html and js using processing.js (http://processingjs.org/) and the ml5.js library (https://github.com/ml5js). 

The repository includes examples for training KNN classifier Classes with your own poses to create a prediction model. The prediction models can be saved and later loaded into your application.

## The Intelligence of Silly Walks (IoSw)?

About the Project


## Getting started

(Please run the Examples in Chrome or Safari)

###  01 - simpleOpenPoseExample - OpenPoseNet Example, selecting the most Centered Pose
A basic example on how to use OpenPoseNet for pose detection. Selecting the most centered pose (Highlighted in red). 
(We added this feature to get clean training data and don't end up training our KNN classifier on background noise)

### 02 - trainingWithCameraInput - Training KNN classifier Classes with WebCam input.
Simple interface for training your KNN classifier model with real time webcam data. Easy way to get started and test your ideas.

#### Notes: 
- You should always train a default class with random movements. We recommend to use class »Z« for this. 
- Just train as many classes as you need, the emtpy ones will not be taken into consideration. Classes are hardcoded, but you can easily change names and quantity in the code.

### 03 trainingWithVideoInput - Training KNN classifier Classes with video files as input.
Enables you to train your KNN classifier model with pre-recorded video files. So you can easily try out different settings and combinations for the same input data. (No need to dance in front of the camera all day long ;) 

#### Notes: 
- You should always train a default class with random movements. We recommend to use class »Z« for this. 
- Just train as many classes as you need, the emtpy ones will not been taken into considereation. Classes are hardcoded, but you can easily change names and quantity in the code.

### Example 4 (poseClassesPrediction) - loading a pretrained model with 3 poses and predicting the representet pose
todo :/



## Copyleft

The examples are based on the original examples by the ml5.js project: https://github.com/ml5js/ml5-examples

Licensed under the GNU Lesser General Public License. See license.txt for further details.
