/*

created by Alexandre Toudic

Be(e) Happy
=========

3-day workshop at Gobelins, l'école de l'image with David Ronai. We had to imagine and create an experiment about a color, mine was yellow.

Music is Umbusy by I'm Sinking - https://soundcloud.com/imsinking/umbusy
The bee's and flowers' model are made by Thomas De Cicco

*/

var play = false;

var svg = d3.select('svg');

var frame = 0;
var audio;

var plane, colorsTouch;
var materials = [];

var accelaration = 1;
var goFast = false;
var begin = false;

var flowerIn = [];
var flowerOut = [];

var config = {};
config.floor = -50;
config.camera = {};
config.ambientLight = {};
config.FLOWER_SENSIBILITY = 130;
config.BEE_SENSIBILITY = 200;

var container, stats;
var camera, scene, projector, renderer;
var pointLight;
var moveCamera = true;
var mouseX = 0, mouseY = 0;
var bee, flower;
var wings = {};
config.MAX_FLOWERS = 20;

var count = 0;
var beeFloat = 0.0;

var analyser;

var gui = new dat.GUI();

init();

function launch() {
	TweenMax.to('button', .5, {opacity: 0, onComplete: function () {
			$('button').css({'display': 'none'});
			$('body').css({'cursor': 'url(assets/images/fast.png), auto'});
		}
	});
	animate();
	play = true;
	audio.play();
}

function finishedLoading(bufferList) {
  // Create two sources and play them both together.
  var source = context.createBufferSource();
  source.buffer = bufferList[0];

  source.connect(context.destination);
  source.start(0);
}

function init() {

	audio = new Audio();
				audio.src = './assets/audio/Umbusy.mp3';
				audio.autoplay = false;
				audio.loop = false;

				audio.addEventListener("ended", function() 
			    {
			          audio.currentTime = 0;
			          TweenMax.to('.veil', 3, {height: 100+'%'});
			    });

				var context = new webkitAudioContext();
				analyser = context.createAnalyser();

				window.addEventListener('load', function(e) {
				  var source = context.createMediaElementSource(audio);
				  source.connect(analyser);
				  analyser.connect(context.destination);
				}, false);

	container = document.getElementById('container');
	scene = new THREE.Scene();

	/*------------------------------------------
					  CAMERAS
	------------------------------------------*/

	config.camera.fov = 70;
	config.camera.near = 1;
	config.camera.far = 10000;
	config.camera.positionX = 0;
	config.camera.positionY = 20;
	config.camera.positionZ = 0;

	camera = new THREE.PerspectiveCamera( config.camera.fov, window.innerWidth / window.innerHeight, config.camera.near, config.camera.far );
	camera.position.x = config.camera.positionX;
	camera.position.y = config.camera.positionY;
	camera.position.z = config.camera.positionZ;
	camera.rotation.x = -Math.PI/10;

	/*------------------------------------------
					  LIGHTS
	------------------------------------------*/

	var light = new THREE.AmbientLight( 0x151515 ); // soft white light
	scene.add( light );

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	directionalLight.position.set( 0, 1, 0 );
	scene.add( directionalLight );

	pointLight = new THREE.PointLight( 0x151515, 10, 100 );
	pointLight.position.set( 0, 0, 0 );
	scene.add( pointLight );

	/*------------------------------------------
					  MESHES
	------------------------------------------*/

	plane = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth*5, 4000), new THREE.MeshLambertMaterial({
		color: 0x000000
	}));
	plane.rotation.x = -Math.PI/2;
	plane.material.side = THREE.DoubleSide;
	plane.position.x = 0;
	plane.position.y = config.floor;
	plane.position.z = -300;
    scene.add(plane);

    var geometry = new THREE.PlaneGeometry(2500, 4000, 256, 1);

    var j = 255;
    var k = 256;
    var colors = ['#ffd200', '#be2d2d', '#00b4ff', '#39c318'];
    var colorIndex = 0;

    for(var i = 0; i < 256; ++i) {
    	var color = colors[colorIndex++];
    	if(colorIndex > 3) colorIndex = 0;

	    materials.push( new THREE.MeshPhongMaterial({
			// light
			specular: color,
			// intermediate
			color: color,
			// dark
			emissive: color,
			shininess: 1
		}));
    	geometry.faces[j--].materialIndex = i;
    	geometry.faces[k++].materialIndex = i;
    }

    colorsTouch = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	colorsTouch.rotation.x = -Math.PI/2;
	colorsTouch.material.side = THREE.DoubleSide;
	colorsTouch.position.x = 0;
	colorsTouch.position.y = config.floor + 1;
	colorsTouch.position.z = -300;
    scene.add(colorsTouch);

	var loader = new THREE.OBJLoader();
	loader.load( './assets/3D/bee.obj', function ( object ) {

		object = object.children[0];
		bee = object;
		bee.scale.set(0.1,0.1,0.1);
		bee.position.x = 0;
		bee.position.y = 0;
		bee.position.z = 200;
		bee.rotation.y = -Math.PI/2;
		bee.material = new THREE.MeshPhongMaterial({
			    	// light
			    	specular: 0x7c7500,
			    	// intermediate
			    	color: 0x7c7500,
			    	// dark
			    	emissive: 0x7c7500,
			    	shininess: 1
			    });
		scene.add(bee);

		if(play)
			animate();
	} );

	var loader2 = new THREE.OBJLoader();
	loader2.load( './assets/3D/flower.obj', function ( object ) {

		object = object.children[0];
		flower = object;
		flower.scale.set(0.05,0.05,0.05);

		if(play)
			animate();
	} );

	var loader3 = new THREE.OBJLoader();
	loader3.load( './assets/3D/wing.obj', function ( object ) {

		object = object.children[0];
		wings.right = object;
		wings.right.scale.set(0.1,0.1,0.1);
		wings.right.position.x = 0;
		wings.right.position.y = 0;
		wings.right.position.z = 200;
		wings.right.rotation.y = -Math.PI/2;
		wings.right.material = new THREE.MeshPhongMaterial({
			    	// light
			    	specular: 0xffffff,
			    	// intermediate
			    	color: 0xffffff,
			    	// dark
			    	emissive: 0xffffff,
			    	shininess: 1,
			    	transparent: true
			    });
	    wings.right.side = THREE.DoubleSide;
	    wings.left = wings.right.clone();
	    wings.left.scale.set(wings.right.scale.x,wings.right.scale.y,-wings.right.scale.z);

		scene.add(wings.right);
		scene.add(wings.left);

		TweenMax.fromTo(wings.right.scale, .1, {y: wings.right.scale.y}, {y: -wings.right.scale.y, repeat:-1});
		TweenMax.fromTo(wings.left.scale, .1, {y: wings.left.scale.y}, {y: -wings.left.scale.y, repeat:-1});

		if(play)
			animate();
	} );

	/*------------------------------------------
					 RENDERER
	------------------------------------------*/

	renderer = new THREE.WebGLRenderer();
	renderer.sortObjects = false;
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild(renderer.domElement);

	/*------------------------------------------
						GUI
	------------------------------------------*/

	var f1 = gui.addFolder('camera');
	f1.add(config.camera, 'positionX', -3000, 3000).onChange(function (newValue) {
		moveCamera = false;
		camera.position.x = newValue;
	});
	f1.add(config.camera, 'positionY', -3000, 3000).onChange(function (newValue) {
		moveCamera = false;
		camera.position.y = newValue;
	});
	f1.add(config.camera, 'positionZ', -3000, 3000).onChange(function (newValue) {
		moveCamera = false;
		camera.position.z = newValue;
	});

	gui.add(config, 'MAX_FLOWERS', 0, 1000);
	gui.add(config, 'BEE_SENSIBILITY', 0, 300);
	gui.add(config, 'FLOWER_SENSIBILITY', 0, 300);

	gui.close();

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousedown', function () {
		goFast = true;
	}, false );
	document.addEventListener( 'mouseup', function () {
		goFast = false;
	}, false );
}

function onDocumentMouseMove( event ) {
	mouseX = event.clientX - window.innerWidth/2;
	mouseY = event.clientY - window.innerHeight/2;

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}


var currentSum = 0;
function animate() {
	if(!bee || !flower || !wings.right) return;

	++frame;

	if(frame == 1) {
		TweenMax.to('.veil', 3, {height: 10+'%'});
	}

	var freqByteData = new Uint8Array(analyser.frequencyBinCount);
  	analyser.getByteFrequencyData(freqByteData);

	for(var k = 0; k < flowerIn.length; ++k) {
		if(flowerIn[k].position.z > camera.position.z){
			flowerOut.push(flowerIn.splice(k, 1)[0]);
		}
	}

	for(var i = 0; i < 256; ++i) {

		materials[i].visible = freqByteData[i] > 200;

		//crazy bee
		if(freqByteData[i] > config.BEE_SENSIBILITY && i > 20) {
			var dposX = (Math.random() > .5)?freqByteData[i]:-freqByteData[i];
			var dposY = (Math.random() > .5)?freqByteData[i]:-freqByteData[i];
			TweenMax.to(bee.position, .5, {x: (bee.position.x + dposX/20), y: (bee.position.y + dposY/20)});
			TweenMax.to(wings.right.position, .5, {x: (wings.right.position.x + dposX/20), y: (wings.right.position.y + dposY/20)});
			TweenMax.to(wings.left.position, .5, {x: (wings.left.position.x + dposX/20), y: (wings.left.position.y + dposY/20)});
		}

		if(i%9== 1)
			currentSum = 0;

		currentSum += freqByteData[i];

		//flower grower
		if(flowerIn.length < config.MAX_FLOWERS && i%9 == 0 && currentSum/10 > config.FLOWER_SENSIBILITY) {

			var newFlower = flowerOut.splice(0, 1)[0];

			if(!newFlower) {
				var color = '#'+Math.floor(Math.random()*16777215).toString(16);
				newFlower = new THREE.Mesh( flower.geometry, new THREE.MeshPhongMaterial({
			    	// light
			    	specular: color,
			    	// intermediate
			    	color: color,
			    	// dark
			    	emissive: color,
			    	shininess: 1
			    }));
			}

			newFlower.scale.set(0.00000001,0.00000001,0.00000001);
			newFlower.position.x = bee.position.x + Math.random()*700 - 350;
			newFlower.position.y = config.floor;
			newFlower.position.z = bee.position.z - Math.random()*100 - 200;

			var scale = Math.floor((((currentSum - config.FLOWER_SENSIBILITY)/10)-100)/10)/50 + 0.05;
			TweenMax.to(newFlower.scale, .3, {x: scale, y: scale, z: scale});

			flowerIn.push(newFlower);
			scene.add(newFlower);
		}
	}

	requestAnimationFrame( animate );

	render();
}

function render() {
	if(!bee) return;

	if(!begin && bee.position.z <= -100) {
		begin = true;
	}

	if(bee.position.x < -40 || bee.position.x > 40 || bee.position.y < config.floor + 10 || bee.position.y > 30) {
		TweenMax.to(bee.position, .3, {x: 0, y: 0});
		TweenMax.to(wings.right.position, .3, {x: 0, y: 0});
		TweenMax.to(wings.left.position, .3, {x: 0, y: 0});
	}

	beeFloat += 0.1;

	bee.position.x += Math.cos(beeFloat)/5;
	bee.position.y += Math.sin(beeFloat)/5;
	wings.right.position.x += Math.cos(beeFloat)/5;
	wings.right.position.y += Math.sin(beeFloat)/5;
	wings.left.position.x += Math.cos(beeFloat)/5;
	wings.left.position.y += Math.sin(beeFloat)/5;

	if(goFast && accelaration < 5) {
		++accelaration;
		config.camera.fov += accelaration;
		var temp = {
			x: camera.position.x,
			y: camera.position.y,
			z: camera.position.z
		};
		camera = new THREE.PerspectiveCamera( config.camera.fov, window.innerWidth / window.innerHeight, config.camera.near, config.camera.far );
		camera.position.x = temp.x;
		camera.position.y = temp.y;
		camera.position.z = temp.z;
		audio.playbackRate += 0.3;
	}
	else if(!goFast && accelaration > 1) {
		--accelaration;
		config.camera.fov -= accelaration;
		var temp = {
			x: camera.position.x,
			y: camera.position.y,
			z: camera.position.z
		};
		camera = new THREE.PerspectiveCamera( config.camera.fov, window.innerWidth / window.innerHeight, config.camera.near, config.camera.far );
		camera.position.x = temp.x;
		camera.position.y = temp.y;
		camera.position.z = temp.z;
		audio.playbackRate -= 0.3;
	}
	else if(!goFast && accelaration == 1) {
		config.camera.fov = 70;
		var temp = {
			x: camera.position.x,
			y: camera.position.y,
			z: camera.position.z
		};
		camera = new THREE.PerspectiveCamera( config.camera.fov, window.innerWidth / window.innerHeight, config.camera.near, config.camera.far );
		camera.position.x = temp.x;
		camera.position.y = temp.y;
		camera.position.z = temp.z;
		audio.playbackRate = 1;
	} 

	if(begin && moveCamera) {
		camera.position.x += (bee.position.x - camera.position.x)*0.1;
		camera.position.y += ((bee.position.y + config.camera.positionY) - camera.position.y)*0.1;
		camera.position.z -= 2*accelaration;

		camera.position.x += mouseX*0.01;
		camera.position.y += mouseY*0.01;
	}

	$("#container").css({'background-position': -camera.position.y -camera.position.x});

	bee.position.z -= 2*accelaration;
	wings.right.position.z -= 2*accelaration;
	wings.left.position.z -= 2*accelaration;
	plane.position.z -= 2*accelaration;
	colorsTouch.position.z -= 2*accelaration;
	pointLight.position = camera.position;

	renderer.render( scene, camera );

}