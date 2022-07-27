import {EventEmitter} from "events";
import uuid from "./uuid";
import log4js from "log4js";
const logger = log4js.getLogger();
const eventEmitter = new EventEmitter();
const listens = new Map<string,Map<string,Function>>();
const uuid2func = new Map();

export function addEvent(k:string){
    if(listens.has(k) == false){
        listens.set(k,new Map());
    }
}

export function listen(k:string,cb:Function):boolean{
    if(listens.has(k) == false){
        logger.warn(`没有这样的事件：${k}`);
        return false;
    }else{
        let id = uuid();
        listens.get(k)?.set(id,cb);
        return true;
    }
}

export function unlisten(id:string):boolean{
    listens.forEach((v,k)=>{
        if(v.has(id)){
            v.delete(id);
            return true;
        }
    })
    return false;
}

export function call(eventName: string, ...args: any[]):void{
    if(listens.has(eventName)){
        listens.get(eventName)?.forEach((v,k)=>{
            try{
                v.call(args);
            }catch(errr){
                logger.error(errr);
            }
        })
    }
}

export function addPackLsitener(uuid:string,callback:(...args: any[]) => void){
    uuid2func.set(uuid,callback);
}

export function callPack(uuid: string | symbol, ...args: any[]){
    if(uuid2func.has(uuid)){
        try{
            uuid2func.get(uuid)(args);
        }catch(err){
            logger.error(err);
        }
        uuid2func.delete(uuid);
    }
}

addEvent("onClientClose");
addEvent("onClientConnect");
addEvent("onPacketReceived");
addEvent("onPlayerJoin");
addEvent("onPlayerLeft");
addEvent("onPlayerChat");