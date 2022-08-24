import http from "http";
import WebSocket from "ws";
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

/**
 * HTTP 및 WebSocket 서버 동시 구동
    : websocket 서버만 필요하다면 http 서버 없이 만들기
 */
// http 서버
const server = http.createServer(app);
// websocket 서버
const wss = new WebSocket.Server({ server });

server.listen(3000, handleListen);
