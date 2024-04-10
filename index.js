const {MongoClient} = require("mongodb")
const WebSocket = require('ws')
const http = require('http');
const cors = require('cors');
const express = require('express')
const uri = "mongodb+srv://Mustafalou:Yilmaz98@cluster0.wirg0db.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(uri)

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({server})

app.use(cors())

const clients = new Map()

wss.on('connection', (ws)=>{
    const id = uuidv4()
    const color = Math.floor(Math.random() * 360)
    const metadata = { id, color }
    clients.set(ws, metadata)
    console.log(id)
    ws.on('message', async (msg)=>{
        const message = JSON.parse(msg)
        const metadata = clients.get(ws)
        message.sender = metadata.id
        message.color = metadata.color
        console.log("messsage received : ", message)
        if (message.topic == "client1"){
            await client.connect();
            const object = message.payload
            const database = client.db("Technivor_Data")
            const client1 = database.collection("Client1")
            console.log(object)
            await client1.insertOne(object)
            client.close()
        }
        if (message.topic == "askData"){
            await client.connect();
            const database = client.db("Technivor_Data");
            const client1 = database.collection("Client1");
            const documents = await client1.find({}).toArray();
            ws.send(JSON.stringify(documents))
            client.close()
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

server.listen(7071, ()=>{
    console.log('Server is running on port 7071')
})