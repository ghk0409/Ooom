import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
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
// socket.io 서버 (admin panel 추가)
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});
// instrument 설정
instrument(wsServer, {
    auth: false,
});

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

// User Count in Room
const countRoom = (roomName) => {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
};

// socket.io connection
wsServer.on("connection", (socket) => {
    // 현재 생성된 Room 목록 알림
    wsServer.sockets.emit("room_change", publicRoom());
    // socket.onAny: Socket에 있는 모든 event 체크
    socket.onAny((event) => {
        console.log(`Socket Events: ${event}`);
    });
    // Room 입장 시 이벤트
    socket.on("enter_room", (roomName, nickName, done) => {
        socket["nickname"] = nickName;
        socket.join(roomName); // room 생성 후 join
        done(countRoom(roomName));
        // welcome event
        socket
            .to(roomName)
            .emit("welcome", socket.nickname, countRoom(roomName)); // send message in the room (Except Me)
        // Room 변경사항 전체 알림
        wsServer.sockets.emit("room_change", publicRoom());
    });
    // Room 퇴장 시 이벤트
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => {
            // bye event (아직 room 떠나기 전 상태기 때문에 countRoom - 1)
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
        });
    });
    // Room 연결 해제 이벤트
    socket.on("disconnect", () => {
        // Room 변경사항 전체 알림
        wsServer.sockets.emit("room_change", publicRoom());
    });

    // Room 내 채팅 발생 이벤트
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
});

httpServer.listen(3000, handleListen);
