import {WebSocketServer,WebSocket} from "ws";
import {IncomingMessage} from 'http';

import config from "./config";
import log4js from "log4js";
const logger = log4js.getLogger();
import {PacketBase} from "./packet/base";

import {callPack} from "./utils/EventEmitter";

const wss = new WebSocketServer({
    port:config.port
});

export const Servers = new Map();

/**
 * @getClientIP
 * @desc 获取用户 ip 地址
 * @param {Object} req - 请求
 */
 function getClientIP(req:IncomingMessage) {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.socket.remoteAddress;// 判断后端的 socket 的 IP
};

export const AUTH = new Map<WebSocket,boolean>();
export const SERVERS = new Map<string,WebSocket>();

wss.on('connection',(ws,req)=>{
    console.log(getClientIP(req),'建立连接');
    console.log(`[SERVER] connection`);
    AUTH.set(ws,false);
    ws.on("message",(data)=>{
        try{
            console.log('receive ==> ',data.toString());
            if(AUTH.get(ws) == false){
                let pack = PacketBase.parse(data.toString());
                if(pack.getAction() == 'auth'){
                    let su_pack = new PacketBase();
                    su_pack.id = pack.id;
                    su_pack.setType('authorize');
                    su_pack.setParam("success",true);
                    su_pack.setProtocol(pack.protocol);
                    ws.send(su_pack.getSendableString());
                    AUTH.set(ws,true);
                    SERVERS.set(pack.getParams().Name.toString(),ws);
                }else{
                    let ask_pack = new PacketBase();
                    ask_pack.setType("unatuh");
                    ask_pack.setParam('msg','请确认身份');
                    ws.send(ask_pack.getSendableString());
                }
            }else{
                let pack = PacketBase.parse(data.toString());
                callPack(pack.id,pack.getParams());
            }
        }catch(err){
            console.log(err);
        }
    });
    ws.on("close",(code,reason)=>{
        AUTH.delete(ws);
        SERVERS.forEach((v,k)=>{
            if(v == ws){
                SERVERS.delete(k);
                console.log(k,'连接已移除');
            }
        });
    })
});