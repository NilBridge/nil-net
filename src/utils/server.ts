import { WebSocket } from "ws";
import { getPingPack } from "../packet/ping";
export default class{
    #ws;
    constructor(ws:WebSocket){
       this.#ws = ws;
    }
    ping(){
        this.#ws.send(getPingPack());
    }
    get ws(){
        return this.#ws;
    }
}