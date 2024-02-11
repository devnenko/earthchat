import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { getCoordinateLocation, getRandomIntMax } from "./utils";

import { soundEnabled } from './controls';

export interface IMessage {
    msg: string,
    lat: number,
    lon: number,
    obj: CSS2DObject,
    box: HTMLDivElement,
    hasPopped: boolean,
    isInput?: boolean
}

export class MsgRenderer {
    messages: IMessage[] = [];
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: CSS2DRenderer;
    inputMsg: IMessage;
    inputBlocked = false;
    popSounds: THREE.PositionalAudio[]
    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = this.addRenderer();
        this.popSounds = this.loadPopSounds()
    }

    private addRenderer() {
        const renderer = new CSS2DRenderer();
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0px';
        renderer.domElement.className = "bubbleCanvas"
        document.body.appendChild(renderer.domElement);
        return renderer;
    }

    public addBubble(lat: number, lon: number, msg: string, isInput: boolean = false) {

        //create the bubbble html elements
        const wrapper = document.createElement('button');
        wrapper.style.border = "none"
        wrapper.style.backgroundColor = "transparent"
        wrapper.className = "wrapper"

        const box = document.createElement('div');
        box.className = "box"
        box.textContent = msg;
        box.style.minHeight = "0px"
        wrapper.appendChild(box);

        const arrow = document.createElement('div');
        arrow.className = "arrow"
        box.appendChild(arrow)


        //create threejs control object and set position
        const obj = new CSS2DObject(wrapper);
        obj.position.add(getCoordinateLocation(lat, lon, 1))
        obj.center.set(0.5, 1.27);
        this.scene.add(obj);




        let blockingMessages = this.messages.filter(msg => msg.lon == lon && msg.lat == lat);
        blockingMessages.forEach(msg => {
            if (msg.isInput) {
                console.log("message will block input for 3 seconds")
                this.inputBlocked = true;



                //not properly being removed from array
                setTimeout(() => {
                    this.inputBlocked = false;
                }, 3000);
            } else {
                this.removeBubble(msg)
            }
        })


        let message = {
            msg,
            lat,
            lon,
            obj,
            box,
            isInput,
            hasPopped: false
        };
        if (isInput) {
            this.inputMsg = message;
        }
        this.messages.push(message);


        //cancels out the animation for bubbles that spawn on the other side
        if (!this.updateVisibility(message)) {
            box.style.visibility = "hidden"
            setTimeout(() => {
                box.style.visibility = "visible"
            }, 100);
        }

        return message;
    }

    public removeBubble(msg: IMessage) {

        if (msg.isInput) return;
        //we dont have an input yet
        if (!this.inputMsg) return;



        let isBlockingInput = msg.lat == this.inputMsg.lat && msg.lon == this.inputMsg.lon;


        //if(isBlockingInput) return;




        if (this.messages.indexOf(msg) == -1) return;
        this.messages.splice(this.messages.indexOf(msg), 1);
        msg.box.style.animation = 'zoomOut 0.1s ease-in forwards';
        setTimeout(() => {
            this.scene.remove(msg.obj);
        }, 100);
    }

    updateVisibility(msg: IMessage, autoRotate?: boolean) {
        let objDist = this.camera.position.distanceTo(msg.obj.position)
        let centerDist = this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0))

        let isVisible = centerDist > objDist;

        //dont show input 
        if (msg.isInput && (this.inputBlocked || autoRotate)) {
            this.inputMsg.box.style.animation = 'zoomOut 0.1s ease-in forwards'
            return
        }


        if (isVisible) {
            //show the label
            msg.box.style.animation = 'zoomIn 0.6s ease-out forwards';

            //for the pop sounds when sound is enabled
            if (soundEnabled && !msg.hasPopped) {

                let pop = this.popSounds[getRandomIntMax(this.popSounds.length - 1)]

                msg.obj.add(pop)
                pop.stop()
                pop.play()

            }
            msg.hasPopped = true;


            if (window.innerWidth < 640) {
                msg.box.style.fontSize = "medium"
            } else {
                msg.box.style.fontSize = "large"
            }


        } else {
            //hide the label
            msg.box.style.animation = 'zoomOut 0.1s ease-in forwards';
            msg.hasPopped = false;
        }


        return isVisible
    }

    private loadPopSounds() {
        const listener = new THREE.AudioListener();
        this.camera.add(listener);


        let soundUrls = [
            require("url:../public/pop1.mp3"),
            require("url:../public/pop2.mp3"),
            require("url:../public/pop3.mp3"),
            require("url:../public/pop4.mp3"),
            require("url:../public/pop5.mp3")
        ]

        let sounds: THREE.PositionalAudio[] = []

        const audioLoader = new THREE.AudioLoader();

        for (let i = 0; i < 3; i++) {
            soundUrls.forEach(soundUrl => {
                let sound = new THREE.PositionalAudio(listener);
                audioLoader.load(soundUrl, function (buffer) {
                    sound.setBuffer(buffer)
                    sound.setVolume(0.2)
                    sound.setRefDistance(1);
                });
            })
        }

        return sounds;
    }
}