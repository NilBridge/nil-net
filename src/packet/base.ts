import guid from "../utils/uuid";
export  class PacketBase{
    #date : number;
    #type: string | undefined;
    #action : string | undefined;
    #params : Map<string,object | string | boolean | number>;
    id : string;
    #protocol : string;
    constructor(){
        this.#date = new Date().getTime();
        this.#params = new Map();
        this.id = guid();
        this.#protocol = 'undefined';
    }
    setType(ty:string){
        this.#type = ty;
    }
    setAction(ac:string){
        this.#action = ac;
    }
    setParam(key:string,value:object | string | number | boolean){
        this.#params?.set(key,value);
    }
    setProtocol(protocol:string){
        this.#protocol = protocol;
    }
    getSendableString(){
        return JSON.stringify({id:this.id, protocol:this.#protocol, date:this.#date,type:this.#type,params:Object.fromEntries(this.#params)});
    }
    getType(){
        return this.#type;
    }
    getAction(){
        return this.#action;
    }
    getParams(){
        return Object.fromEntries(this.#params);
    }
    get protocol(){
        return this.#protocol;
    }
    get date(){
        return this.#date;
    }
    static parse(raw_pack:string){
        let tmp = JSON.parse(raw_pack);
        let pack = new this();
        if(typeof tmp.action != 'undefined'){
            pack.setAction(tmp.action);
        }else if(typeof tmp.type != 'undefined'){
            pack.setType(tmp.type);
        }else{
            throw new Error('missing the param : type or action, bad pack!!');
        }
        for(let i in tmp.params){
            pack.setParam(i,tmp.params[i]);
        }
        if(typeof tmp.date != 'undefined'){
            pack.#date = tmp.date;
        }else{
            throw new Error('missing the param : date, bad pack!!');
        }
        if(typeof tmp.protocol != 'undefined'){
            pack.#protocol = tmp.protocol;
        }else{
            throw new Error('missing the param : protocol, bad pack!!');
        }
        pack.id = tmp.id;
        return pack;
    }
}