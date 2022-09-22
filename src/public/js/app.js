const socket = io(); // 알아서 io 실행 중인 서버를 찾아서 연결

const welcome = document.getElementById("welcome");
const form = document.querySelector("form");
const room = document.getElementById("room");

// Room 접속 폼만 보이기
room.hidden = true;

let roomName;

// Message 출력 함수
const addMessage = (msg) => {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
};

// Room 접속 폼 => Room 내 메시지 전송 폼 전환
const showRoom = () => {
    welcome.hidden = true;
    room.hidden = false;
    // setting room name
    const h3 = room.querySelector("h3");
    h3.innerText = `[Room] ${roomName}`; // socket.emit은 비동기 처리로 roomName이 먼저 설정돼서 가능
};

// room join handler
const handleRoomSubmit = (event) => {
    event.preventDefault();
    const input = form.querySelector("input");

    // send message
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
};

form.addEventListener("submit", handleRoomSubmit);

// Room 내 유저 입장 체크
socket.on("welcome", () => {
    addMessage("Someone joined!");
});
