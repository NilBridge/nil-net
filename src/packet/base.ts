import guid from "../utils/uuid";
export  class PacketBase{
    #date : number;
    #type: string | undefined;
    #action : string | undefined;
    #params : Map<string,object | string | boolean | number>;
    #id : string;
    constructor(){
        this.#date = new Date().getTime();
        this.#params = new Map();
        this.#id = guid();
    }
    setType(ty:string){
        this.#type = ty;
    }
    setAction(ac:string){
        this.#action = ac;
    }
    setParams(key:string,value:object | string | number | boolean){
        this.#params?.set(key,value);
    }
    getSendableString(){
        return JSON.stringify({date:this.#date,type:this.#type,params:Object.fromEntries(this.#params)});
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
    get date(){
        return this.#date;
    }
    get id(){
        return this.#id;
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
            pack.setParams(i,tmp.params[i]);
        }
        pack.#date = tmp.date;
        pack.#id = tmp.id;
        return pack;
    }
}