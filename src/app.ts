import {WebSocketServer} from "ws";

import config from "./config";
import log4js from "log4js";
const logger = log4js.getLogger();
import {PacketBase} from "./packet/base";

import {callPack} from "./utils/EventEmitter";

const wss = new WebSocketServer({
    port:config.port
});

export const Servers = new Map();

wss.on('connection',(ws)=>{
    console.log(`[SERVER] connection`);
    ws.on("message",(data)=>{
        try{
            let pack =PacketBase.parse(data.toString());
            callPack(pack.id,pack.getParams());
        }catch(err){
            logger.error(err);
        }
    });
});