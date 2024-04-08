const {MongoClient} = require("mongodb")
const WebSocket = require('ws')
const uri = "mongodb+srv://Mustafalou:Yilmaz98@cluster0.wirg0db.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(uri)
const wss = new WebSocket.Server({port:7071})
const clients = new Map()

wss.on('connection', (ws)=>{
    const id = uuidv4()
    const color = Math.floor(Math.random() * 360)
    const metadata = { id, color }
    clients.set(ws, metadata)
    ws.on('message', async (msg)=>{
        const message = JSON.parse(msg)
        const metadata = clients.get(ws)
        message.sender = metadata.id
        message.color = metadata.color
        console.log("messsage received : ", message)
        if (message.topic == "client1"){
            const object = message.payload
            const database = client.db("Technivor_Data")
            const client1 = database.collection("Client1")
            console.log(object)
            await client1.insertOne(object)
        }
    })
    ws.on("close", ()=>{
        clients.delete(ws)
    })
})

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
console.log("wss up")