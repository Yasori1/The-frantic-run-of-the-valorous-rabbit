var scene,
  camera,
  fieldOfView,
  aspectRatio,
  nearPlane,
  farPlane,
  globalLight,
  shadowLight,
  backLight,
  renderer,
  container,
  controls,
  clock
var delta = 0
var floorRadius = 200
var speed = 5
var distance = 0
var level = 1
var levelInterval
var levelUpdateFreq = 3000
var initSpeed = 4
var maxSpeed = 48
var monsterPos = 0.64
var monsterPosTarget = 0.64
var floortRotation = 0
var collisionObstacle = 10
var collisionBonus = 20
var gameStatus = 'play'
var cameraPosGame = 160
var cameraPosGameOver = 260
var monsterAcceleration = 0.004
var malusClearColor = 0xb44b36
var malusClearAlpha = 0

var fieldGameOver, fieldDistance

//Screen & Mouse Varıbles

var HEIGHT,
  WIDTH,
  windowHalfx,
  windowHalfY,
  mousePos = {
    x: 0,
    y: 0,
  }

//3D Objects varıbles

var hero

//Materials
var blackMat = new THREE.MeshPhongMaterial({
  color: 0x100707,
  shading: THREE.FlatShading,
})

var brownMat = new THREE.MeshPhongMaterial({
  color: 0xb44b39,
  shading: 0,
  shading: THREE.FlatShading,
})

var greenMat = new THREE.MeshPhongMaterial({
  color: 0x7abf8e,
  shading: THREE.FlatShading,
})

var pinkMat = new THREE.MeshPhongMaterial({
  color: 0xdc5f45,
  shinniness: 0,
  shading: THREE.FlatShading,
})

var lightBrownMat = new THREE.MeshPhongMaterial({
  color: 0xe07a57,
  shading: THREE.FlatShading,
})

var whiteMat = new THREE.MeshPhongMaterial({
  color: 0xa49789,
  shading: THREE.FlatShading,
})

var skinMat = new THREE.MeshPhongMaterial({
  COLOR: 0xff9ea5,
  shading: THREE.FlatShading,
})

//Other Varıbles
var PI = Math.PI

//Inıt THREE JS, SCREEN AND MOUSE EVENTS

function initScreenAnd3D() {
  HEIGHT = window.innerHeight
  WIDTH = window.innerWidth
  windowHalfx = WIDTH / 2
  windowHalfY = HEIGHT / 2

  scene = new THREE.Scene()

  scene.fog = new THREE.Fog(0xd6eae6, 160, 350)

  aspectRatio = WIDTH / HEIGHT
  fieldOfView = 50
  nearPlane = 1
  farPlane = 2000

  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane,
  )
  camera.position.x = 0
  camera.position.z = cameraPosGame
  camera.position.y = 30
  camera.lookAt(new THREE.Vector3(0, 30, 0))

  renderer = new THREE.WebGlRenderer({
    alpha: true,
    antialias: true,
  })

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(malusClearColor, malusClearAlpha)

  renderer.setSize(WIDTH, HEIGHT)
  renderer.shadowMap.enabled = true

  container = document.getElementById('world')
  container.appendChild(renderer.domElement)

  window.addEventListener('resize', handleWindowResize, false)
  document.addEventListener('mousedown', handleMouseDown, false)
  document.addEventListener('mousemove', handleMouseDown, false)

  clock = new THREE.Clock()
}
function handleWindowResize() {
  HEIGHT = window.innerHeight
  WIDTH = window.innerWidth
  windowHalfx = WIDTH / 2
  windowHalfY = HEIGHT / 2
  renderer.setSize(WIDTH, HEIGHT)
  camera.aspect = WIDTH / HEIGHT
  camera.updateProjectionMatrix()
}
function createLights() {
  globalLight = new THREE.AmbientLight(0xffffff, 0.9)

  shadowLight = new THREE.DirectionalLight(0xffffff, 1)
  shadowLight.position.set(-30, 40, 20)
  shadowLight.castShadow = true
  shadowLight.shadow.camera.left = -400
  shadowLight.shadow.camera.right = 400
  shadowLight.shadow.camera.top = 400
  shadowLight.shadow.camera.bottom = -400
  shadowLight.shadow.camera.near = 1
  shadowLight.shadow.camera.far = 2000
  shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 2048

  scene.add(globalLight)
  scene.add(shadowLight)
}
function createFloor() {
  
    floorShadow = new THREE.Mesh(new THREE.SphereGeometry(floorRadius, 50, 50), new THREE.MeshPhongMaterial({
      color: 0x7abf8e,
      specular:0x000000,
      shininess:1,
      transparent:true,
      opacity:.5
    }));
    //floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.receiveShadow = true;
    
    floorGrass = new THREE.Mesh(new THREE.SphereGeometry(floorRadius-.5, 50, 50), new THREE.MeshBasicMaterial({
      color: 0x7abf8e
    }));
    //floor.rotation.x = -Math.PI / 2;
    floorGrass.receiveShadow = false;
    
    floor = new THREE.Group();
    floor.position.y = -floorRadius;
    
    floor.add(floorShadow);
    floor.add(floorGrass);
    scene.add(floor);
    
  }
Hero = function(){
    this.status = "running";
    this.runningCycle = 0;
    this.mesh = new THREE.Group();
    this.body = new THREE.Group();
    this.mesh.add(this.body);

    var torsoGeom = new THREE.CubeGeometry(7, 7, 10,1);

    this.torso = new THREE.Mesh(torsoGeom, brownMat);
    this.torso.position.z=0;
    this.torso.position.y=7;
    this.torso.castshadow = true;
    this.body.add(this.torso);

    var pantsGeom = new THREE.CubeGeometry(9,9,5,1);
    this.panst = new THREE.Mesh(pantsGeom, whiteMat);
    this.panst.position.z=-3;
    this.panst.position.y=0;
    this.panst.castshadow = true;
    this.torso.add(this.panst);

    var tailGeom = new THREE.CubeGeometry(3,3,3,1);
    tailGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -2));
    this.tail.position.z=-4;
    this.tail.position.y=5;
    this.tail.castshadow = true;
    this.torso.add(this.tail);

    this.torso.rotation.x=-Math.PI/8;

    var headGeom = new THREE.CubeGeometry(10,10,13,1);
    headGeom.APPLYmATRİX(new THREE.Matrix4().makeTranslation(0, 0, 7.5));
    this.head=new THREE.Mesh(headGeom, brownMat);
    this.head.position.z=2;
    this.head.position.y=11;
    this.head.castshadow = true;
    this.body.add(this.head);

    var cheekGeom = new THREE.CubeGeometry(1,4,4,1);
    this.cheekR= new THREE.Mesh(cheekGeom, pinkMat);
    this.cheekR.position.z=7;
    this.cheekR.position.y=-2.5;
    this.cheekR.position.x = -5;
    this.cheekR.castshadow = true;
    this.head.add(this.cheekR);

    this.cheekL=this.cheekR.clone();
    this.cheekL.position.x=- this.cheekR.position.x;
    this.head.add(this.cheekL);

    var noseGeom = new THREE.CubeGeometry(6,6,3,1);
    this.nose.position.z=13.5;
    this.nose.position.y=2.6;
    this.nose.castshadow = true;
    this.head.add(this.nose);

    var mouthGeom = new THREE.CubeGeometry(4,2,4,1);
    mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 3));
    mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslationX(Math.PI/12));
    this.mouth= new THREE.Mesh(mouthGeom,brownMat);
    this.mouth.position.z=8;
    this.mouth.position.y=-4;
    this.mouth.castshadow = true;
    this.head.add(this.mouth);

    var pawBGeom = new THREE.CubeGeometry(3,3,6,1);
    this.pawBL= new THREE.Mesh(pawBGeom, lightBrownMat);
    this.pawBL.position.y=1.5;
    this.pawBL.position.z=0;
    this.pawBL.position.x=5;
    this.pawBL.castshadow = true;
    this.body.add(this.pawBL);

    this.pawBR=this.pawBL.clone();
    this.pawBR.position.x=-this.pawBL.position.x;
    this.pawBR.castshadow = true;
    this.body.add(this.pawBR);

    var earGeom = new THREE.CubeGeometry(7,18,2,1);
    earGeom.vertices[6].x+=2;
    earGeom.vertices[6].z+=.5;

    earGeom.vertices[7].x+=2;
    earGeom.vertices[7].z+=.5;

    earGeom.vertices[2].x-=2;
    earGeom.vertices[2].z-=.5;

    earGeom.vertices[3].x-=2;
    earGeom.vertices[3].z+=.5;
    earGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,9,0));

    this.earL= new THREE.Mesh(earGeom,brownMat);
    this.earL.position.x=2;
    this.earL.position.y=5;
    this.earL.position.z=2.5;
    this.earL.castshadow = true;
    this.body.add(this.earL);

    this.earR=this.earL.clone();
    this.earR.position.x=-this.earL.position.x;
    this.earR.position.z=-this.earL.position.z;
    this.earR.castshadow = true;
    this.body.add(this.earR);

    var eyeGeom=new THREE.Mesh(2,4,4);

    this.eyeL=new THREE.Mesh(eyeGeom,whiteMat);
    this.eyeL.position.x=5;
    this.eyeL.position.z=5.5;
    this.eyeL.position.y=2.9;
    this.eyeL.castShadow = true;
    this.head.add(this.eyeL);

    var irisGeom = new THREE.CubeGeometry(.6,2,2);
    this.iris.position.x=1.2;
    this.iris.position.y=1;
    this.iris.position.z=1;
    this.iris.castShadow = true;
    this.eyeL.add(this.iris);

    this.eyeR=this.eyeL.clone();
    this.eyeR.children[0].position.x= -this.iris.position.x;

    this.eyeR.position.x= -this.eyeL.position.x;
    this.head.add(this.eyeR);

    this.body.traverse(function(Object){
      if(Object instanceof THREE.Mesh){
        Object.castShadow = true;
        Object.receiveShadow = true;
      }
    });
}

BonusParticles = function  (){
  this.mesh = new THREE.Group();
  var bigParticleGeom= new THREE.CubeGeometry(10,10,10,1);
  var smallParticleGeom = new THREE.CubeGeometry(5,5,5,1);
  this.part=[];
  for (var i = 0;i<10; i++){
    var partPink = new THREE.Mesh(BigParticleGeom,pinkMat);
    var partGreen = new THREE.Mesh(smallParticleGeom,greenMat);
    partGreen.scake.set(.5,.5,.5,);
    this.parts.psuh(partPink);
    this.parts.push(partGreen);
    this.mesh.add(partPink);
    this.mesh.add(partGreen);   
  }
}

BonusParticles.prototype.explose = function(){
  var _this = this;
  var explosionSpeed = .5;
  for(var i=0; i<this.parts.lenght; i++){
    var tx = -50+Math.random()*100;
    var ty = -50+Math.random()*100;
    var tz = -50+Math.random()*100;
    var p = this.parts[i];
    p.position.set(0,0,0,);
    p.scale.set(1,1,1);
    p.visible = true;
    var s = explosionSpeed+ Math.random()*.5;
    TweenMax.to(p.position, s,{x:tx,y:ty,z:tz,})
    TweenMax.to(p.scale,s,{x:0.1,y:.01,z:0.1,ease:Power4.easeOut,onComplete:removeParticle, onCompleteParams:[p]});   
  }
}

function removeParticle(p){
  p.visible=false;
}

Hero.prototype.run=function(){
  this.statsus="runnig";

  var s = Math.min(speed,maxSpeed);

  this.runningCycle +=delta * s* .7;
  this.runningCycle = this.runningCycle %(Math.PI*2);
  var t = this.runningCycle;

  var amp = 4;
  var disp =.2;

  //Body
  this.body.position.y = 6+Math.sin(t-Math.PI/2)+amp;
  this.body.rotation.x=.2 +Math.sin(t-Math.PI/2)*amp*.1;

  this.torso.rotation.x = Math.sin(t-Math.PI/2)*amp*.1;
  this.torso.position.y = 7+Math.sin(tMath.PI/2)*amp*.5;

  //Mouth
  this.mouth.rotation.x = Math.PI/16+MATH.cos(t)*amp*.05;

  //Head
  this.head.position.z = 2+ Math.sin(t-Math.PI/2)*amp*0.5;
  this.head.position.y = 8+Math.cos(t-Math.PI/2)*amp*.7;
  this.head.rotation.x = -.2 + Math.sin(t+ Math.PI)*amp*.1;

  //Ears
  this.earL.rotation.x = Math.cos(-MathPI/2 + t)*(amp*.2);
  this.earR.rotation.x = Math.cos(-Math.PI/2+ .2+ t)*(amp*.3);

  //Eyes
  this.eyeR.scale.y = this.eyeL.scale.y = .7 + Math.abs(Math.cos(-Math.PI/4+ t*.5))*.6;

  //Tail
  this.tail.rotation.x = Math.cos(Math.PI/2+t)*amp*.3;

  //Front Rıght Paw
  this.pawFR.position.y = 1.5+Math.sin(t)*amp;
  this.pawFR.rotation.x = Math.cos(t) * Math.PI/4;

  this.pawFR.position.z = 6- Math.cos(t)*amp*2;

  //Front Left Paw
  this.pawFL.position.y = 1.5+Math.sin(t)*amp;
  this.pawFL.rotation.x = Math.cos(t) * Math.PI/4;

  this.pawFL.rotation.z = 6-Math.cos(disp+t)*amp*2;

  //Back Rıght Paw
  this.pawBR.position.y = 1.5+ Math.sin(Math.PI+t) * amp;
  this.pawBR.rotation.x = Math.cos(t+Math.PI*1.5)* Math.PI/3;

  this.pawBR.position.z = -Math.cos(Math.PI*1.5) * Math.PI/3;

  //Back Left Paw
  this.pawBL.position.y = 1.5+Math.sin(Math.PI + t)*amp;
  this.pawBL.rotation.x = Math.cos(t + Math.PI *1.5) * Math.PI/3;

this.pawBL.position.z = -Math.cos(Math.PI + t)*amp;


}