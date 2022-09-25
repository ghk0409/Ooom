const socket = io(); // 알아서 io 실행 중인 서버를 찾아서 연결

const welcome = document.getElementById("welcome");
const form = document.querySelector("#enterRoom");
const room = document.getElementById("room");

// Room 접속 폼만 보이기
room.hidden = true;

let roomName;
let nickName;

// Message 출력 함수
const addMessage = (msg) => {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
};

// Room 채팅 출력 함수
const handleMessageSubmit = (event) => {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const msg = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${msg}`);
    });
    input.value = "";
};

// Room 접속 폼 => Room 내 메시지 전송 폼 전환
const showRoom = () => {
    welcome.hidden = true;
    room.hidden = false;
    // setting room name
    const h3 = room.querySelector("h3");
    h3.innerText = `[Room] ${roomName}`; // socket.emit은 비동기 처리로 roomName이 먼저 설정돼서 가능
    // setting nickname
    const h4 = room.querySelector("h4");
    h4.innerText = `[My Nickname] ${nickName}`;
    // Room 내 채팅 이벤트 추가
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
};

// Room 입장 핸들러
const handleRoomSubmit = (event) => {
    event.preventDefault();
    const inputRoom = form.querySelector("#roomName");
    const inputNickname = form.querySelector("#nickName");

    // Room, Nickname 설정 후 입장
    roomName = inputRoom.value;
    nickName = inputNickname.value;
    socket.emit("enter_room", roomName, nickName, showRoom);

    inputRoom.value = "";
    inputNickname.value = "";
};

form.addEventListener("submit", handleRoomSubmit);

// Room 내 유저 입장 체크 (welcome event )
socket.on("welcome", (user) => {
    addMessage(`${user} joined!`);
});

// Room 내 유저 퇴장 체크 (bye event)
socket.on("bye", (user) => {
    addMessage(`${user} left...`);
});

// Room 채팅 메시지 체크 (new_message event)
socket.on("new_message", addMessage); // addMessage = (msg) => {addMessage(msg)}

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = ""; // Room 리스트 중복 출력 방지를 위해 빈 값 초기화
    if (rooms.length === 0) {
        return;
    }

    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});
