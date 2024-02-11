import * as THREE from 'three';
import { animate, createOrbitControls,  cursorGrab, resize, windowAspect,  getIpLocation, moveCameraToCoord, addInputBubble } from "./utils";
import { GlRenderer } from './gl_renderer';
import { MsgRenderer } from './msg_renderer';
import { io } from 'socket.io-client';
import { setupAutoRotate, setupSound} from './controls';
import { listenMessages, listenOnlineAmount } from './socket';

//change cursor when mouse down
cursorGrab() 

//create camera and scene
const camera = new THREE.PerspectiveCamera(40, windowAspect());
const scene = new THREE.Scene();

//renders earth and stars
const glRenderer = new GlRenderer(scene, 8)

//renders all message bubbles
const msgRenderer = new MsgRenderer(scene, camera)

//controls for rotating the camera
const controls = createOrbitControls(camera, msgRenderer.renderer.domElement)

//update renderers with events
resize(controls, camera, glRenderer, msgRenderer)
window.onresize = resize.bind(null, controls, camera, glRenderer, msgRenderer);
requestAnimationFrame(animate.bind(null, controls, camera, scene, glRenderer, msgRenderer));


//setup the controls on the top right
setupAutoRotate(controls, msgRenderer)
setupSound()


asyncMain();
async function asyncMain() {
    //get very approximate longitude and latitude of user on earth
    let worldCoord = await getIpLocation()
    moveCameraToCoord(worldCoord,camera)

    var socket = io()

    addInputBubble(msgRenderer,worldCoord, socket);
    listenMessages(msgRenderer,socket)

    //listen for online amount changes displayed on the bottom right
    listenOnlineAmount(socket)
}