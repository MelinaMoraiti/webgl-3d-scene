
var gl; 
var canvas; 
var shadersProgram; 
var vertexPositionAttributePointer; 
var vertexColorAttributePointer;
var verticesTransformUniformPointer; 
var perspectiveViewUniformPointer;
var vertexBuffer;
var colorBuffer; 
var indexBuffer; 
var translationMatrix = new Float32Array(16);
// Scaling and translation matrices
var scaleMatrix = new Float32Array(16);
var finalMatrix = new Float32Array(16);

var perspectiveMatrix = new Float32Array(16);// perspective Matrix
var viewMatrix = new Float32Array(16); // position of camera
var pvMatrix = new Float32Array(16); // product of perspectiveMatrix and viewMatrix

function createGLContext(inCanvas) {
	var outContext = null;
	outContext = inCanvas.getContext("webgl");
		if (!outContext)
			outContext = inCanvas.getContext("experimental-webgl"); 
		if (!outContext) 
			alert("WebGL rendering context creation error.");
 
	return outContext;
}

function createCompileShader(shaderType, shaderSource) {
	var outShader = gl.createShader(shaderType);
	gl.shaderSource(outShader, shaderSource); 
	gl.compileShader(outShader); 
	if (!gl.getShaderParameter(outShader, gl.COMPILE_STATUS)) { 
		alert( "Shader compilation error. " + gl.getShaderInfoLog(outShader) ); 
		gl.deleteShader(outShader);
		outShader = null;
	}
	return outShader;
}

function initShaders() {
	var vertexShaderSource = document.getElementById("vShader").textContent; 
	var fragmentShaderSource = document.getElementById("fShader").textContent; 
	var vertexShader = createCompileShader(gl.VERTEX_SHADER, vertexShaderSource); 
	var fragmentShader = createCompileShader(gl.FRAGMENT_SHADER, fragmentShaderSource); 
	shadersProgram = gl.createProgram(); 
	gl.attachShader(shadersProgram, vertexShader); 
	gl.attachShader(shadersProgram, fragmentShader); 
	gl.linkProgram(shadersProgram); 
	if (!gl.getProgramParameter(shadersProgram, gl.LINK_STATUS)) { 
		alert("Shaders linking error.");
	}
	gl.useProgram(shadersProgram); 
	vertexPositionAttributePointer = 	gl.getAttribLocation(shadersProgram, "aVertexPosition"); 
	gl.enableVertexAttribArray(vertexPositionAttributePointer); 
	vertexColorAttributePointer = gl.getAttribLocation(shadersProgram, "aVertexColor"); 
	gl.enableVertexAttribArray(vertexColorAttributePointer); 
	verticesTransformUniformPointer = gl.getUniformLocation(shadersProgram, "uVerticesTransform"); 
    //Save in the new uniform pointer the address of uPerspectiveViewTransform
    perspectiveUniformPointer = gl.getUniformLocation(shadersProgram, "uPerspectiveViewTransform"); 
}

function initBuffers() {
    var cubeVertices = new Float32Array([
        // Front face
        1.0,  1.0,  1.0, 1.0,  // Vertex 0
        -1.0,  1.0,  1.0, 1.0,  // Vertex 1
        -1.0, -1.0,  1.0, 1.0,  // Vertex 2
        1.0, -1.0,  1.0, 1.0,  // Vertex 3
        // Back face
        1.0,  1.0, -1.0, 1.0,  // Vertex 4
        -1.0,  1.0, -1.0, 1.0,  // Vertex 5
        -1.0, -1.0, -1.0, 1.0,  // Vertex 6
        1.0, -1.0, -1.0, 1.0,  // Vertex 7
        // Top face
        1.0,  1.0, -1.0, 1.0,  // Vertex 8
        -1.0,  1.0, -1.0, 1.0,  // Vertex 9
        -1.0,  1.0,  1.0, 1.0,  // Vertex 10
        1.0,  1.0,  1.0, 1.0,  // Vertex 11
        // Bottom face
        1.0, -1.0,  1.0, 1.0,  // Vertex 12
        -1.0, -1.0,  1.0, 1.0,  // Vertex 13
        -1.0, -1.0, -1.0, 1.0,  // Vertex 14
        1.0, -1.0, -1.0, 1.0,  // Vertex 15
        // Right face
        1.0,  1.0, -1.0, 1.0,  // Vertex 16
        1.0,  1.0,  1.0, 1.0,  // Vertex 17
        1.0, -1.0,  1.0, 1.0,  // Vertex 18
        1.0, -1.0, -1.0, 1.0,  // Vertex 19
        // Left face
        -1.0,  1.0, -1.0, 1.0,  // Vertex 20
        -1.0,  1.0,  1.0, 1.0,  // Vertex 21
        -1.0, -1.0,  1.0, 1.0,  // Vertex 22
        -1.0, -1.0, -1.0, 1.0,  // Vertex 23
    ]);
    vertexBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW); 
    vertexBuffer.itemSize = 4;  
    vertexBuffer.itemCount = 24;

	// Colors for 6 faces
    var cubeColors = new Float32Array([
        // Front face - Light cyan
        0.79, 0.94, 0.97, 1.0,  // Vertex 0
        0.79, 0.94, 0.97, 1.0,  // Vertex 1
        0.79, 0.94, 0.97, 1.0,  // Vertex 2
        0.79, 0.94, 0.97, 1.0,  // Vertex 3

        // Back face - Honolulu blue
        0, 0.54, 0.71, 1.0,  // Vertex 4
        0, 0.54, 0.71, 1.0,  // Vertex 5
        0, 0.54, 0.71, 1.0,  // Vertex 6
        0, 0.54, 0.71, 1.0,   // Vertex 7

        // Top face - Vivid Sky blue
        0.28, 0.79, 0.89, 1.0,  // Vertex 8
        0.28, 0.79, 0.89, 1.0,  // Vertex 9
        0.28, 0.79, 0.89, 1.0,  // Vertex 10
        0.28, 0.79, 0.89, 1.0,  // Vertex 11

        // Bottom face - federal blue
        0.01, 0.02, 0.37, 1.0,  // Vertex 12
        0.01, 0.02, 0.37, 1.0,  // Vertex 13
        0.01, 0.02, 0.37, 1.0,  // Vertex 14
        0.01, 0.02, 0.37, 1.0,  // Vertex 15

        // Right face - Marian blue
        0.01, 0.24, 0.54, 1.0,  // Vertex 16
        0.01, 0.24, 0.54, 1.0,  // Vertex 17
        0.01, 0.24, 0.54, 1.0,  // Vertex 18
        0.01, 0.24, 0.54, 1.0,  // Vertex 19

        // Left face - Non photo blue
        0.56, 0.87, 0.93, 1.0,  // Vertex 20
        0.56, 0.87, 0.93, 1.0,  // Vertex 21
        0.56, 0.87, 0.93, 1.0,  // Vertex 22
        0.56, 0.87, 0.93, 1.0   // Vertex 23

    ]);
	colorBuffer = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW); 
	colorBuffer.itemSize = 4;  
	colorBuffer.itemCount = 24;

    var cubeIndices = new Uint16Array([
        0, 1, 2,  0, 2, 3,  // Front face
        4, 5, 6,  4, 6, 7,  // Back face
        8, 9, 10,  8, 10, 11,  // Top face
        12, 13, 14,  12, 14, 15,  // Bottom face
        16, 17, 18,  16, 18, 19,  // Right face
        20, 21, 22,  20, 22, 23   // Left face
    ]);
    indexBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
    indexBuffer.itemCount = 36; 
}

function drawScene(farVisibilityThreshold) { 

// Create camera matrices
    setCameraAndView(farVisibilityThreshold);

//Create Cubes transformations TO CREATE A TABLE
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear color and depth buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
	gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); 
	gl.vertexAttribPointer(vertexColorAttributePointer, colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	/* TABLE TOP */
	drawTableTop();
    /* FRONT LEFT LEG */
    drawLeg(-19,19);
    /* FRONT RIGHT LEG */
    drawLeg(-19,-19);
    /* BACK LEFT LEG */
    drawLeg(19, -19);
    /* BACK RIGHT LEG */
    drawLeg(19,19);
}

function setCameraAndView(farVisibilityThreshold) {
    // Create view matrix (adjust according to your camera position logic)
    viewMatrix = glMatrix.mat4.create();
    var viewDistanceText = document.getElementById("viewDistanceTxt").value;
    var viewDistance = parseFloat(viewDistanceText);
    var selectedCameraPosition = document.querySelector('input[name="cameraPosition"]:checked').value;
    var cameraPositions = {
        "Left-Front-Top": [-viewDistance, viewDistance, viewDistance],
        "Left-Front-Bottom": [-viewDistance, viewDistance, -viewDistance],
        "Left-Back-Top": [-viewDistance, -viewDistance, viewDistance],
        "Left-Back-Bottom": [-viewDistance, -viewDistance, -viewDistance],
        "Right-Front-Top": [viewDistance, viewDistance, viewDistance],
        "Right-Front-Bottom": [viewDistance, viewDistance, -viewDistance],
        "Right-Back-Top": [viewDistance, -viewDistance, viewDistance],
        "Right-Back-Bottom": [viewDistance, -viewDistance, -viewDistance]
    };
    var cameraPosition = cameraPositions[selectedCameraPosition];
    var cameraTargetPoint = [0, 0, 0];
    var pointUp = [0, 0, 1];
    glMatrix.mat4.lookAt(viewMatrix, cameraPosition, cameraTargetPoint, pointUp);

    // Create perspective matrix
    perspectiveMatrix = glMatrix.mat4.create();
    var viewAngleText = document.getElementById("viewAngleTxt").value;
    var fieldOfView = parseFloat(viewAngleText) * Math.PI / 180.0;
    var aspect = 1; // Assuming square canvas
    var near = 0.01;
    if (!farVisibilityThreshold) farVisibilityThreshold = 100;
    glMatrix.mat4.perspective(perspectiveMatrix, fieldOfView, aspect, near, farVisibilityThreshold);
    pvMatrix = glMatrix.mat4.create();
    // Combine view and perspective matrices
    glMatrix.mat4.multiply(pvMatrix, perspectiveMatrix, viewMatrix);
    // Set the uniform matrix for shaders
    gl.uniformMatrix4fv(perspectiveUniformPointer, false, pvMatrix);
}
function drawTableTop()
{
    // Reset matrices
    glMatrix.mat4.identity(scaleMatrix);
    glMatrix.mat4.identity(translationMatrix);
    glMatrix.mat4.identity(finalMatrix);

    // Scale and translate table top
    scaleCube(scaleMatrix, 20.0, 20.0, 1.0);
    translateCube(translationMatrix, 0.0, 0.0, 16); 
    combineCubes(finalMatrix, translationMatrix, scaleMatrix);
}
function drawLeg(translateX, translateY) {
     // Reset matrices
    glMatrix.mat4.identity(scaleMatrix);
    glMatrix.mat4.identity(translationMatrix);
    glMatrix.mat4.identity(finalMatrix);

    // Scale and translate leg
    scaleCube(scaleMatrix, 1.0, 1.0, 15.0);
    translateCube(translationMatrix, translateX, translateY, 0); 
    combineCubes(finalMatrix, translationMatrix, scaleMatrix);
}
function scaleCube(cube, scaleX, scaleY, scaleZ)
{
    glMatrix.mat4.fromScaling(cube, [scaleX, scaleY, scaleZ]);
}
function translateCube(cube, moveX, moveY, moveZ)
{
    glMatrix.mat4.fromTranslation(cube, [moveX, moveY, moveZ]);
}
function combineCubes(resultMat, mat1, mat2)
{
    // Combine matrices
    glMatrix.mat4.multiply(resultMat, mat1, mat2);
    // Set the transformation matrix
    gl.uniformMatrix4fv(verticesTransformUniformPointer, false, resultMat); 
    // Draw the cube
    gl.drawElements(gl.TRIANGLES, indexBuffer.itemCount, gl.UNSIGNED_SHORT, 0);
}

function main() {
	minDimension = Math.min(window.innerHeight, window.innerWidth);
	canvas = document.getElementById("sceneCanvas"); 
	canvas.width = 0.9*minDimension; 
	canvas.height = 0.9*minDimension; 
	gl = WebGLDebugUtils.makeDebugContext(createGLContext(canvas));
	initShaders(); 
	initBuffers(); 
	gl.clearColor(0.5, 0.5, 0.5, 1.0); // Background color
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.enable(gl.DEPTH_TEST); 
	drawScene(); 
 }
function redesign(factor) {
    var viewDistanceText = document.getElementById("viewDistanceTxt").value; 
    var viewDistance = parseFloat(viewDistanceText);
    var newFar = viewDistance * factor;
     // Redraw the scene
    drawScene(newFar);
}
/*
function startAnimation() {
	if (requestID == 0)
		requestID = window.requestAnimationFrame(animationStep);
}

function animationStep() {
	drawScene();
	requestID = window.requestAnimationFrame(animationStep);
}

function stopAnimation() {
	window.cancelAnimationFrame(requestID);
	requestID = 0;
}
*/