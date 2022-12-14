import http from "http";
import { Server } from "socket.io";
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

// http 서버
const httpServer = http.createServer(app);
// socket.io 서버
const wsServer = new Server(httpServer);

// Public Room 목록
const publicRoom = () => {
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } = wsServer;
    const publicRooms = [];

    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });

    return publicRooms;
};

wsServer.on("connection", (socket) => {
    // 특정 룸 입장 시 이벤트
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    // offer 수신 이벤트
    socket.on("offer", (offer, roomName) => {
        // 특정 룸 참가자에게 offer 전달
        socket.to(roomName).emit("offer", offer);
    });
    // answer 수신 이벤트
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
    // Ice candidate 수신 이벤트
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });
    // Room 퇴장 시 이벤트
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => {
            // bye event (아직 room 떠나기 전 상태기 때문에 countRoom - 1)
            socket.to(room).emit("leave_user", socket.nickname);
        });
    });
    // Room 연결 해제 이벤트
    socket.on("disconnect", () => {
        // Room 변경사항 전체 알림
        wsServer.sockets.emit("room_update", publicRoom());
    });
});

const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);
