import { Socket } from "socket.io-client";
import { IMessage, MsgRenderer } from "./msg_renderer";

export function listenOnlineAmount(socket: Socket) {
    let onlineDiv = document.getElementById("onlineAmount") as HTMLDivElement;
    socket.on("online", (num: number) => {
        onlineDiv.textContent = num.toString() + " Online";
    })
}

//wheter the user sent his first message out
let firstMessageSent = false

export function sendMessage(inputEl: HTMLInputElement, sendBt: HTMLDivElement, inputMsg: IMessage, socket: Socket) {
    if (inputEl.value == "") return;
    firstMessageSent = true;
    socket.emit("message_to_server", inputEl.value, inputMsg.lat, inputMsg.lon);


    inputEl.blur();
    //wait fot the animation to finish first
    setTimeout(() => {
        inputEl.value = ""
        sendBt.style.visibility = "hidden"
        inputEl.style.width = "127px"
        sendBt.style.width = "0px"
    }, 500);
}

export function listenMessages(msgRenderer: MsgRenderer, socket: Socket) {

    socket.on("message_to_clients", (msg: string, lat: number, lng: number, duration: number, isInit) => {

        console.log("message will last for " + Math.round(duration / 1000) + " seconds")

        let samePlace = (msgRenderer.inputMsg.lat === lat && msgRenderer.inputMsg.lon === lng)
        if (samePlace && !firstMessageSent && isInit) return;

        let bubble = msgRenderer.addBubble(lat, lng, msg)

        //if message at same place as input make the duration only 3 seconds
        if (msgRenderer.inputMsg.lat == bubble.lat && msgRenderer.inputMsg.lon == bubble.lon) duration = 3000;
        //remove bubble after duration
        setTimeout(() => {
            msgRenderer.removeBubble(bubble)
        }, duration);
    })

}