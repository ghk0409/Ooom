const socket = io(); // 알아서 io 실행 중인 서버를 찾아서 연결

const welcome = document.getElementById("welcome");
const form = document.querySelector("form");

const handleRoomSubmit = (event) => {
    event.preventDefault();
    const input = form.querySelector("input");

    // send message
    socket.emit("enter_room", { payload: input.value }, () => {
        console.log("server is done"); // front-end에서 실행되는 함수
    });

    input.value = "";
};

form.addEventListener("submit", handleRoomSubmit);
