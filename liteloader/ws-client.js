
let client = new WSClient();

client.listen('onTextReceived', (msg) => {
    //let data = JSON.parse(msg);
    console.log(msg);
})

log(client.connect('ws://127.0.0.1:8080'));

setInterval(() => {
    client.send(JSON.stringify({
        type: "heartbeat",
        date: new Date().getTime(),
        params: {
            version: mc.getBDSVersion()
        }
    }));
}, 1e3);

