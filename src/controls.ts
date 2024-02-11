import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MsgRenderer } from "./msg_renderer";

export function setupAutoRotate(controls: OrbitControls, msgRenderer: MsgRenderer) {
    let rotateBt = document.getElementById("autoRotateBt") as HTMLButtonElement;
    rotateBt.onpointerdown = () => {
        controls.autoRotate = !controls.autoRotate;
        controls.autoRotateSpeed = -0.6;

        let inputMsg = msgRenderer.inputMsg

        if (controls.autoRotate) {
            inputMsg.box.style.animation = 'zoomOut 0.1s ease-in forwards'
            rotateBt.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" style="transform: rotate(-270deg);" viewBox="0 0 24 24"><g fill="none"><path d="M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036c-.01-.003-.019 0-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="white" d="M12 1.5c1.07 0 1.852.652 2.346 1.279c.507.643.898 1.481 1.198 2.383c.607 1.819.956 4.236.956 6.838c0 2.602-.35 5.02-.956 6.838c-.3.902-.691 1.74-1.198 2.383c-.494.627-1.275 1.279-2.346 1.279c-1.501 0-2.43-1.243-2.929-2.19c-.565-1.073-.979-2.495-1.239-4.065a1.5 1.5 0 1 1 2.96-.49c.23 1.393.572 2.471.933 3.157c.066.125.125.225.178.305l.096.136c.209-.27.46-.747.7-1.463c.479-1.439.801-3.521.801-5.89c0-2.369-.322-4.451-.802-5.89c-.238-.715-.49-1.191-.698-1.461c-.093.12-.207.3-.332.553a6.895 6.895 0 0 0-.305.73a1.5 1.5 0 0 1 .373 2.647l-1.611 1.13a1.495 1.495 0 0 1-1.099.276a1.495 1.495 0 0 1-.987-.58L6.86 7.72a1.5 1.5 0 0 1 1.522-2.33c.174-.554.372-1.063.595-1.514c.286-.58.647-1.137 1.107-1.567C10.552 1.871 11.2 1.5 12 1.5m0 9v3H5a1.5 1.5 0 0 1 0-3zm6 0h1a1.5 1.5 0 0 1 0 3h-1z"/></g></svg>`
        } else {
            rotateBt.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5"/></svg>`

        }

    }
}


export let soundEnabled = false;
export function setupSound() {

    let soundBt = document.getElementById("soundBt") as HTMLButtonElement;
    const audioElement = document.querySelector("audio") as HTMLAudioElement;

    soundBt.onpointerdown = () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {

            soundBt.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 14.959V9.04C2 8.466 2.448 8 3 8h3.586a.98.98 0 0 0 .707-.305l3-3.388c.63-.656 1.707-.191 1.707.736v13.914c0 .934-1.09 1.395-1.716.726l-2.99-3.369A.98.98 0 0 0 6.578 16H3c-.552 0-1-.466-1-1.041M16 8.5c1.333 1.778 1.333 5.222 0 7M19 5c3.988 3.808 4.012 10.217 0 14"/></svg>`

        } else {
            audioElement.pause();
            soundBt.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><g fill="none" stroke="white" stroke-linecap="round" stroke-width="2"><path d="m22 15l-6-6m6 0l-6 6"/><path stroke-linejoin="round" d="M2 14.959V9.04C2 8.466 2.448 8 3 8h3.586a.98.98 0 0 0 .707-.305l3-3.388c.63-.656 1.707-.191 1.707.736v13.914c0 .934-1.09 1.395-1.716.726l-2.99-3.369A.98.98 0 0 0 6.578 16H3c-.552 0-1-.466-1-1.041"/></g></svg>`
        }
    }
}
