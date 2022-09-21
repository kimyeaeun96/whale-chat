var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http)

// 첫화면 
app.get('/', function(req, res){
    console.log('client')
    res.sendFile(__dirname + "/whale.html")
});

app.use("/public", express.static("public"));
app.use(express.urlencoded({extended: true}));

// select에 들어갈 닉네임
var list = {};

io.on("connection", function(socket){
    console.log( "connected : ", socket.id);
    socket.on("info2", function(data){ 
        list[socket.id] = data.nickname; 
        io.emit("notice", data.nickname + "    님이 입장하셨습니다."); 
        io.emit("list", list); 
    })
    // 메세지 send
    socket.on("send", function(data){
        console.log("client message : ", data.msg);

        data["is_dm"] = false;
        data["nickname"] = list[socket.id];
        if ( data.to == "전체" ){
            io.emit("newMessage", data);
        }else {

            data["is_dm"] = true;
            let socketID = Object.keys(list).find( (key) => { return list[key] == data.to; });
            io.to(socketID).emit("newMessage", data);
            socket.emit("newMessage", data);
        }
    });
    
    socket.on("disconnect", function(){
        io.emit("notice", list[socket.id] + "님이 퇴장하셨습니다.");
        delete list[socket.id];
    });
});

http.listen( 8000, function(){
    console.log( "server port: ", 8000);
});