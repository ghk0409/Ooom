import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

// view 엔진 및 경로 설정
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// public static folder regist (public URL 설정해서 클라이언트가 볼 수 있도록 공유)
app.use("/public", express.static(__dirname + "/public"));

// Router 설정
app.get("/", (req, res) => res.render("home"));
// catch all url
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

// http 서버
const httpServer = http.createServer(app);
// socket.io 서버
const wsServer = SocketIO(httpServer);

// socket.io connection
wsServer.on("connection", (socket) => {
    socket.on("enter_room", (msg, done) => {
        console.log(msg);
        setTimeout(() => {
            done();
        }, 5000);
    });
});

httpServer.listen(3000, handleListen);
