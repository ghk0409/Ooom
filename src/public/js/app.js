const messgaeList = document.querySelector("ul");
const nickNameForm = document.querySelector("#nickName");
const messageForm = document.querySelector("#message");
// frontend websocket 연결
const socket = new WebSocket(`ws://${window.location.host}`);

// socket open listener (connect)
socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

// socket receive message listener
socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messgaeList.append(li);
});

// socket close listener
socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌");
});

// JSON convert 핸들러
function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg);
}

// 메시지 전송 핸들러
function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
}

// 닉네임 전송 핸들러
function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickNameForm.querySelector("input");
    socket.send(makeMessage("nickName", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickNameForm.addEventListener("submit", handleNickSubmit);
