// frontend websocket 연결
const socket = new WebSocket(`ws://${window.location.host}`);

// socket open listener (connect)
socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

// socket receive message listener
socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data);
});

// socket close listener
socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌");
});

setTimeout(() => {
    // socket send message event
    socket.send("hello from the browser!!");
}, 5000);
