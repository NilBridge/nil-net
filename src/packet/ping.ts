import {PacketBase} from "./base";

export function getPingPack():string{
    let pack = new PacketBase();
    pack.setType('ping');
    return pack.getSendableString();
}
export function checkPingPack(pack:PacketBase):boolean{
    let now = new Date().getTime();
    if(now - pack.date <= 100){
        return true;
    }else{
        return false;
    }
}