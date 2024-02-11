import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GlRenderer } from "./gl_renderer";
import { MsgRenderer } from "./msg_renderer";
import { Socket, io } from 'socket.io-client';
import { listenOnlineAmount, sendMessage } from './socket';



export function cursorGrab() {
    window.onpointerdown = () => {
        document.body.style.cursor = "grab"
    }
    window.onpointerup = () => {
        document.body.style.cursor = "default"
    }
}


export async function getIpLocation() {


    let coordinates: { latitude: number, longitude: number } = await (await fetch("https://freeipapi.com/api/json/")).json()


    if (!coordinates.latitude) {
        //an error happened here 
        document.body.innerHTML = "Error: too many location Requests (try again in a minute)"
        document.body.style.backgroundColor = "white"
    }

    return coordinates
}

export function moveCameraToCoord(coord: { latitude: number, longitude: number }, camera: THREE.camera) {
    //convert to threejs earth coordinates
    let threeLoc = getCoordinateLocation(coord.latitude, coord.longitude, 1)
    camera.position.set(threeLoc.x, threeLoc.y, threeLoc.z)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
}


export function addInputBubble(msgRenderer: MsgRenderer, coord: { latitude: number, longitude: number }, socket: Socket) {
    //create bubble at location
    let inputBubble = msgRenderer.addBubble(coord.latitude, coord.longitude, "", true)

    //add input field to bubble
    const inputDiv = document.createElement('input');
    inputDiv.className = "input-field"
    inputDiv.style.outline = "none"
    inputDiv.style.backgroundColor = "transparent"
    inputDiv.placeholder = "Say something..."
    inputDiv.maxLength = 26
    inputBubble.box.appendChild(inputDiv)

    const sendBt = document.createElement("div");
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M27.71 4.29a1 1 0 0 0-1.05-.23l-22 8a1 1 0 0 0 0 1.87l8.59 3.43L19.59 11L21 12.41l-6.37 6.37l3.44 8.59A1 1 0 0 0 19 28a1 1 0 0 0 .92-.66l8-22a1 1 0 0 0-.21-1.05"/></svg>';
    sendBt.style.alignSelf = "center"
    sendBt.style.alignItems = "center"
    sendBt.style.display = "flex"
    sendBt.innerHTML = svgString;
    sendBt.style.cursor = "pointer"
    inputBubble.box.appendChild(sendBt)

    inputDiv.style.width = "100%"
    sendBt.style.visibility = "hidden"
    sendBt.style.width = "0px"
    inputDiv.style.width = "127px"
    inputDiv.oninput = () => {
        inputDiv.value ? sendBt.style.visibility = "visible" : sendBt.style.visibility = "hidden"

        if (inputDiv.value != "") {
            inputDiv.style.width = inputDiv.value.length + "ch";
            sendBt.style.width = "24px"
        } else {
            inputDiv.style.width = "127px"
            sendBt.style.width = "0px"
        }

    }


    sendBt.onpointerdown = sendMessage.bind(null, inputDiv, sendBt, inputBubble, socket)
    window.onkeydown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            sendMessage(inputDiv, sendBt, inputBubble, socket)
        }
    }
}






export function resize(controls: OrbitControls, camera: THREE.PerspectiveCamera, glRenderer: GlRenderer, msgRenderer: MsgRenderer) {

    //resize for mobile devices
    let dist = window.innerWidth < 640 ? 5.7 : 4;
    controls.minDistance = dist
    controls.maxDistance = dist
    controls.update();

    var elements: NodeListOf<HTMLDivElement> = document.querySelectorAll('.box');

    if (elements) {
        if (window.innerWidth < 640) {
            elements.forEach(function (element) {
                element.style.fontSize = "medium";
            });

        } else {
            elements.forEach(function (element) {
                element.style.fontSize = "large";
            });
        }
    }

    //update camera
    camera.aspect = windowAspect();
    camera.updateProjectionMatrix();

    //update renderers
    glRenderer.renderer.setSize(window.innerWidth, window.innerHeight);
    glRenderer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    msgRenderer.renderer.setSize(window.innerWidth, window.innerHeight);

}

var clock = new THREE.Clock();
export function animate(controls: OrbitControls, camera: THREE.PerspectiveCamera, scene: THREE.Scene, glRenderer: GlRenderer, msgRenderer: MsgRenderer) {

    //hide message if behind the earth
    msgRenderer.messages.forEach(msg => {
        msgRenderer.updateVisibility(msg, controls.autoRotate)
    })

    let delta = clock.getDelta();
    controls.update(delta);
    glRenderer.renderer.render(scene, camera);
    msgRenderer.renderer.render(scene, camera);

    requestAnimationFrame(animate.bind(null, controls, camera, scene, glRenderer, msgRenderer));
}

export function createOrbitControls(camera: THREE.Camera, domElement: HTMLElement): OrbitControls {
    const controls = new OrbitControls(camera, domElement)
    controls.zoomSpeed = 1.2
    controls.rotateSpeed = 0.53
    controls.enableZoom = true
    controls.enablePan = false
    return controls
}

//converts a real world coordinate to a 3d scene location
export function getCoordinateLocation(lat: number, lon: number, size: number) {
    let longcomb = lon - 90;
    const pitchRad = THREE.MathUtils.degToRad(lat);
    const yawRad = THREE.MathUtils.degToRad(longcomb);


    const x = size * Math.sin(yawRad) * Math.cos(pitchRad);
    const y = size * Math.sin(pitchRad);
    const z = size * Math.cos(yawRad) * Math.cos(pitchRad);
    return new THREE.Vector3(x, y, z);
}

export function windowAspect() {
    return window.innerWidth / window.innerHeight;
}

export function getRandomIntMax(max: number) {
    return Math.floor(Math.random() * max);
}