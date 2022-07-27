//LiteXLoader Dev Helper
/// <reference path="c:\Users\amsq\.vscode\extensions\moxicat.lxldevhelper-0.1.8/Library/JS/Api.js" /> 

let client = new WSClient();
let uuid2func = new Map();

let AUTH_SUCCESS = false;

function listenPack(uuid, func) {
    uuid2func.set(uuid, func);
}

function callPack(uuid, params) {
    if (uuid2func.has(uuid)) {
        try {
            uuid2func.get(uuid)(params);
            uuid2func.delete(uuid);
        } catch (err) {
            log(err.stack);
            warn(['error when callback!!']);
        }
    }
}

function checkDir(path) {
    if (File.exists(path) == false) {
        File.mkdir(path);
    }
}
function checkFile(path, thing) {
    if (File.exists(path) == false) {
        File.writeTo(path, thing);
    }
}


checkDir('./plugins/NilClient/');
checkFile("./plugins/NilClient/config.json", JSON.stringify({
    target: 'ws://127.0.0.1:8080/',
    ServerName: '生存服务器',
    Debug: false,
    Upload: {
        Join: true,
        Left: true,
        Chat: true,
        MobDie: true,
        Bag: true,
        EnderChest: true,
        Tag: false,
        Money: {
            enable: true,
            type: 0,  // 0是计分板， 1为LLMoney
            boardName: 'score'
        },
        Level: false
    },
    Download: {
        Bag: true,
        EnderChest: true,
        Tags: false,
        Money: {
            enable: true,
            type: 0,  // 0是计分板， 1为LLMoney
            boardName: 'score'
        },
        Level: false
    },
    BoardCast: {
        Join: true,
        Left: true,
        ProxyCmd: {
            enable: true,
            token: '1234509876'
        }
    }
}, null, 4));

//#region PackBase

class PacketBase {
    #date = 'undefined';
    #type;
    #action;
    #params;
    #id;
    protocol = "bedrock_server_client";
    constructor() {
        this.#date = new Date().getTime();
        this.#params = new Map();
        this.#id = uuid();
    }
    setType(ty) {
        this.#type = ty;
    }
    setAction(ac) {
        this.#action = ac;
    }
    setParam(key, value) {
        this.#params?.set(key, value);
    }
    getSendableString() {
        return JSON.stringify({protocol: this.protocol, id: this.#id, date: this.#date, type: this.#type, action: this.#action, params: Object.fromEntries(this.#params) });
    }
    getType() {
        return this.#type;
    }
    getAction() {
        return this.#action;
    }
    getParams() {
        return Object.fromEntries(this.#params);
    }
    get date() {
        return this.#date;
    }
    get id() {
        return this.#id;
    }
    static parse(raw_pack) {
        let tmp = JSON.parse(raw_pack);
        let pack = new this();
        if (typeof tmp.action != 'undefined') {
            pack.setAction(tmp.action);
        } else if (typeof tmp.type != 'undefined') {
            pack.setType(tmp.type);
        } else {
            throw new Error('missing the param : type or action, bad pack!!');
        }
        for (let i in tmp.params) {
            pack.setParam(i, tmp.params[i]);
        }
        if (typeof tmp.date != 'undefined') {
            pack.#date = tmp.date;
        } else {
            throw new Error('missing the param : date bad pack!!');
        }
        if(typeof tmp.protocol != 'undefined'){
            pack.protocol = tmp.protocol;
        }else{
            warn('missing the param : protocol, bad pack!!');
        }
        pack.#id = tmp.id;
        return pack;
    }
}

//#region 

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function loadJSON(path) {
    return JSON.parse(file.readFrom(path));
}

const config = loadJSON("./plugins/NilClient/config.json");

client.listen('onTextReceived', (msg) => {
    log('received',msg);
    try {
        let pack = PacketBase.parse(msg);
        callPack(pack.id, pack.getParams());
    } catch (err) {
        log(err.stack);
        warn(['error when callback!!']);;
    }
});

function connect(){
    client.connectAsync(config.target, (success) => {
        if (success) {
            let auth_pack = new PacketBase;
            auth_pack.setAction('auth');
            auth_pack.setParam('Name', config.ServerName);
            listenPack(auth_pack.id, (params) => {
                if (params.success) {
                    AUTH_SUCCESS = true;
                    log('登入中央服务器成功！');
                }else{
                    warn('登入中央服务器失败');
                }
            })
            client.send(auth_pack.getSendableString());
        }
    });
}

function send(pack){
    if(AUTH_SUCCESS == false){
        warn(['中央服务器鉴权未成功，信息发送失败','请检查中央服务器是否正常运行']);
        return;
    }
    if(client.status == 0){
        if(typeof pack == 'string'){
            client.send(pack)
        }else{
            client.send(pack.getSendableString());
        }
    }else{
        warn(['中央服务器连接异常','信息发送失败']);
    }
}

function warn(msg) {
    log('=======WARN=======');
    if (typeof msg == 'string') {
        log('>', msg);
    } else {
        msg.forEach(i => {
            log('>', i);
        })
    }
    log('=======WARN=======');
}

setInterval(() => {
    if (client.status == 2) {
        warn(['与远程服务器的连接已经中断', '请检查远程服务器是否开启', '请检查远程地址是否正确']);
        connect();
    } else if (client.status == 0) {
        if(AUTH_SUCCESS){
            let ping_pack = new PacketBase;
            ping_pack.setType('heartbeat'); //心跳包
            ping_pack.setParam('version', mc.getBDSVersion());
            ping_pack.setParam('online', mc.getOnlinePlayers().map((pl) => { return pl.realName }));
            send(ping_pack.getSendableString());
        }
    }
}, 3e3);

client.listen('onLostConnection', (code) => {
    AUTH_SUCCESS = false;
    warn(['连接丢失！！', 'code：' + code]);
});


mc.listen("onJoin",(pl)=>{
    if(config.Upload.Join){
        let join_pack = new PacketBase;
        join_pack.setType('Join');
        join_pack.setParam('realName',pl.realName);
        join_pack.setParam('name',pl.name);
        join_pack.setParam('xuid',pl.xuid);
        join_pack.setParam('ip',pl.getDevice().ip);
        join_pack.setParam('os',pl.getDevice().os);
        send(join_pack.getSendableString());
    }
})

mc.listen("onLeft",(pl)=>{
    if(config.Upload.Left){
        let left_pack = new PacketBase;
        left_pack.setType('left');
        left_pack.setParam('realName',pl.realName);
        left_pack.setParam('name',pl.name);
        left_pack.setParam('xuid',pl.xuid);
        send(left_pack.getSendableString());
    }
});

connect();