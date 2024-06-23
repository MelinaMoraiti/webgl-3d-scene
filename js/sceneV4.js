var gl; 
var canvas; 
var shadersProgram; 
var vertexPositionAttributePointer; 
// Instead of a pointer to the location of the color attribute, declare a global for the pointer to the location of the texture attribute 
var textureCoordinatesAttributePointer;
var verticesTransformUniformPointer; 
var perspectiveViewUniformPointer;
var uSamplerPointer;
var vertexBuffer;
var indexBuffer; 
var translationMatrix = new Float32Array(16);
// Scaling and translation matrices
var scaleMatrix = new Float32Array(16);
var finalMatrix = new Float32Array(16);
// Camera Matrices
var perspectiveMatrix = new Float32Array(16);// perspective Matrix
var viewMatrix = new Float32Array(16); // position of camera
var pvMatrix = new Float32Array(16); // product of perspectiveMatrix and viewMatrix

var requestID = 0; // used in start/stop animation functions
var totalCameraAngle = -1.0; // Used for the spiral camera rotation.
var totalZ = 0.01; // The Height of the camera

var textureBuffer;
var tableTexture;
var chairTexture;
var skyboxTexture;

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
	//vertexColorAttributePointer = gl.getAttribLocation(shadersProgram, "aVertexColor"); 
	//gl.enableVertexAttribArray(vertexColorAttributePointer); 
    textureCoordinatesAttributePointer = gl.getAttribLocation(shadersProgram, "aTextureCoordinates");
    gl.enableVertexAttribArray(textureCoordinatesAttributePointer);
	verticesTransformUniformPointer = gl.getUniformLocation(shadersProgram, "uVerticesTransform"); 
    //Save in the new uniform pointer the address of uPerspectiveViewTransform
    perspectiveUniformPointer = gl.getUniformLocation(shadersProgram, "uPerspectiveViewTransform"); 
    //	We also "remember" the new uniform via the pointer we declared 	
    uSamplerPointer = gl.getUniformLocation(shadersProgram, "uSampler");
}

function createShadesForCube(R,G,B)
{
    R = parseFloat(R);G = parseFloat(G);B = parseFloat(B);
    var colorShades = new Float32Array([
        // Front face 
        R, G, B, 1.0,  // Vertex 0
        R, G, B, 1.0,  // Vertex 1
        R, G, B, 1.0,  // Vertex 2 
        R, G, B, 1.0,  // Vertex 3

        // Back face
        R, G, B, 0.2,  // Vertex 4 
        R, G, B, 0.2,  // Vertex 5 
        R, G, B, 0.2,  // Vertex 6 
        R, G, B, 0.2,  // Vertex 7

        // Top face
        R, G, B, 0.8,  // Vertex 8 
        R, G, B, 0.8,  // Vertex 9 
        R, G, B, 0.8,  // Vertex 10 
        R, G, B, 0.8,  // Vertex 11

        // Bottom face 
        R, G, B, 0.4,  // Vertex 12 
        R, G, B, 0.4,  // Vertex 13 
        R, G, B, 0.4,  // Vertex 14 
        R, G, B, 0.4,  // Vertex 15 

        // Right face
        R, G, B, 0.3,  // Vertex 16 
        R, G, B, 0.3,  // Vertex 17 
        R, G, B, 0.3,  // Vertex 18 
        R, G, B, 0.3,  // Vertex 19

        // Left face 
        R, G, B, 0.6,  // Vertex 20 
        R, G, B, 0.6,  // Vertex 21 
        R, G, B, 0.6,  // Vertex 22
        R, G, B, 0.6  // Vertex 23 
    ]);
    return colorShades;
    
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
    // Create texture buffer
    textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    var textureCoordinates = new Float32Array([
        // Front face
        1.0, 1.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,
        // Back face
        1.0, 1.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,
        // Top face
        1.0, 1.0,  0.0, 1.0,  0.0, 1.0,  1.0, 1.0,
        // Bottom face
        1.0, 1.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,
        // Right face
        1.0, 1.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,
        // Left face
        1.0, 1.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,
    ]);
      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);  
    textureBuffer.itemSize = 2;
    textureBuffer.itemCount = 24;
    // Create a texture object for wooden table.
    tableTexture = gl.createTexture();
    var tableImageURL = "textures/wood_2k.jpg";
    preprocessTextureImage(tableImageURL, tableTexture);
    // Create a texture object for fabric chair.
    chairTexture = gl.createTexture();
    var chairImageURL = "textures/fabric_hd.png";
    preprocessTextureImage(chairImageURL, chairTexture);
    skyboxTexture = gl.createTexture();
    var skyboxImageURL = "textures/sky_2k.jpg";
    preprocessTextureImage(skyboxImageURL, skyboxTexture);
    nameTexture = gl.createTexture();
    var nameImageURL = "textures/name_am.jpg";
    preprocessTextureImage(nameImageURL, nameTexture);
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
//	Custom function for linking texture object to image and image preprocessing
function preprocessTextureImage(imageURL, textureObject) {
// 	Create a new image object
	var imageObject = new Image();
    imageObject.crossOrigin = "anonymous"; // Set the crossOrigin attribute
	imageObject.onload = function() {    
		gl.bindTexture(gl.TEXTURE_2D, textureObject);	
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageObject);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
	};
	//	Load the image
	imageObject.src = imageURL;	
}
function drawScene(farVisibilityThreshold) { 

// Create camera matrices
    setCameraAndView(farVisibilityThreshold);

//Create Cubes transformations TO CREATE A TABLE
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear color and depth buffer
    // Bind Vertices Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
	gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // ACTIVATE TEXTURE UNIT 0 FOR TABLE
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(uSamplerPointer, 0);
    // Bind Texture Buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.vertexAttribPointer(textureCoordinatesAttributePointer, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
    /* BIG TABLE  */
    /* TABLE TOP Dimensions = 20x20x1*/
    drawCube(10, 10, 0.5, 0, 0, 8, tableTexture);
    /* FRONT LEFT LEG Dimensions = 1x1x15*/
    drawCube(0.5, 0.5, 7.5, 9.5, 9.5, 0, tableTexture);  
    /* FRONT RIGHT LEG Dimensions = 1x1x15*/
    drawCube(0.5, 0.5, 7.5, -9.5, -9.5, 0, tableTexture);  
    /* BACK LEFT LEG Dimensions = 1x1x15*/
    drawCube(0.5, 0.5, 7.5, 9.5, -9.5, 0, tableTexture);  
    /* BACK RIGHT LEG Dimensions = 1x1x15*/
    drawCube(0.5, 0.5, 7.5, -9.5, 9.5, 0, tableTexture);  
    // ACTIVATE TEXTURE UNIT 1 FOR TABLE
    gl.activeTexture(gl.TEXTURE1);
	gl.uniform1i(uSamplerPointer, 1);
    /* STOOL (half table) */
    /* TABLE TOP Dimensions = 10x10x0.5*/
    drawCube(5, 5, 0.25, 10, 0, 4-3.75, chairTexture);  // Halved dimensions
    /* FRONT LEFT LEG Dimensions = 0.5x0.5x7.5*/
    drawCube(0.25, 0.25, 3.75, 10+4.75, 4.75, -3.75, chairTexture);  // Halved dimensions
    /* FRONT RIGHT LEG Dimensions = 0.5x0.5x7.5*/
    drawCube(0.25, 0.25, 3.75, 10-4.75, -4.75, -3.75, chairTexture);  // Halved dimensions
    /* BACK LEFT LEG Dimensions = 0.5x0.5x7.5*/
    drawCube(0.25, 0.25, 3.75, 10+4.75, -4.75, -3.75, chairTexture);  // Halved dimensions
    /* BACK RIGHT LEG Dimensions = 0.5x0.5x7.5*/
    drawCube(0.25, 0.25, 3.75, 10-4.75, 4.75, -3.75, chairTexture);  // Halved dimensions
    /* BACK */
    /* TABLE TOP Dimensions = 0.5x10x7.5*/
    drawCube(0.25, 5, 3.75, 14.75, 0, 8-3.75, chairTexture);  // Halved dimensions

    gl.activeTexture(gl.TEXTURE2);
    gl.uniform1i(uSamplerPointer, 2);
    drawCube(500,500,500,0,0,0,skyboxTexture);
    gl.activeTexture(gl.TEXTURE3);
    gl.uniform1i(uSamplerPointer, 3);
    drawCube(25,25,0.1,0,0,(-2*3.75) - 0.1,nameTexture);
}

function setCameraAndView(farVisibilityThreshold) {
    // Calculate camera's total rotation angle from user's input
	numCameraStepAngle = 0.50 * Math.PI/180.0; 
	totalCameraAngle += numCameraStepAngle; 

	totalZ += 0.01;

    // Create view matrix 
    var viewDistanceText = document.getElementById("viewDistanceTxt").value;
    var viewDistance = parseFloat(viewDistanceText);
    var selectedCameraPosition = document.querySelector('input[name="cameraPosition"]:checked').value;
    var cameraPositions = {
        "Left-Front-Top": [-viewDistance * Math.cos(totalCameraAngle), viewDistance* Math.sin(totalCameraAngle), viewDistance + totalZ],
        "Left-Front-Bottom": [-viewDistance * Math.cos(totalCameraAngle), viewDistance* Math.sin(totalCameraAngle), -viewDistance+ totalZ],
        "Left-Back-Top": [-viewDistance * Math.cos(totalCameraAngle), -viewDistance* Math.sin(totalCameraAngle), viewDistance+ totalZ],
        "Left-Back-Bottom": [-viewDistance * Math.cos(totalCameraAngle), -viewDistance* Math.sin(totalCameraAngle), -viewDistance+ totalZ],
        "Right-Front-Top": [viewDistance* Math.cos(totalCameraAngle), viewDistance* Math.sin(totalCameraAngle), viewDistance+ totalZ],
        "Right-Front-Bottom": [viewDistance* Math.cos(totalCameraAngle), viewDistance* Math.sin(totalCameraAngle), -viewDistance+ totalZ],
        "Right-Back-Top": [viewDistance* Math.cos(totalCameraAngle), -viewDistance* Math.sin(totalCameraAngle), viewDistance+ totalZ],
        "Right-Back-Bottom": [viewDistance* Math.cos(totalCameraAngle), -viewDistance * Math.sin(totalCameraAngle), -viewDistance+ totalZ]
    };
    var cameraPosition = cameraPositions[selectedCameraPosition]
    //var cameraPosition = [-viewDistance * Math.cos(totalCameraAngle), viewDistance * Math.sin(totalCameraAngle), totalZ];
    var cameraTargetPoint = [0, 0, 0];
    var pointUp = [0, 0, 1];
    glMatrix.mat4.lookAt(viewMatrix, cameraPosition, cameraTargetPoint, pointUp);

    // Create perspective matrix
    var viewAngleText = document.getElementById("viewAngleTxt").value;
    var fieldOfView = parseFloat(viewAngleText) * Math.PI / 180.0;
    var aspect = 1; // Assuming square canvas
    var near = 0.01;
    if (!farVisibilityThreshold) farVisibilityThreshold = 100;
    glMatrix.mat4.perspective(perspectiveMatrix, fieldOfView, aspect, near, farVisibilityThreshold);

    // Combine view and perspective matrices
    glMatrix.mat4.multiply(pvMatrix, perspectiveMatrix, viewMatrix);
    // Set the uniform matrix for shaders
    gl.uniformMatrix4fv(perspectiveUniformPointer, false, pvMatrix);
}

function drawCube(scaleX, scaleY, scaleZ, translateX, translateY,translateZ,textureObject)
{
    gl.bindTexture(gl.TEXTURE_2D, textureObject); 
    // Reset matrices
    glMatrix.mat4.identity(scaleMatrix);
    glMatrix.mat4.identity(translationMatrix);
    glMatrix.mat4.identity(finalMatrix);

    // Scale and translate table top
    scaleCube(scaleMatrix, scaleX, scaleY, scaleZ);
    translateCube(translationMatrix, translateX, translateY,translateZ); 
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
function startAnimation() {
	if (requestID == 0)
		requestID = window.requestAnimationFrame(animationStep);
}

function animationStep() {
	redesign(100);
	requestID = window.requestAnimationFrame(animationStep);
}

function stopAnimation() {
	window.cancelAnimationFrame(requestID);
	requestID = 0;
}
