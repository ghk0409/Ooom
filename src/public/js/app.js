const socket = io();

// Media Area

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraList = document.getElementById("cameraList");

const call = document.getElementById("call");

// 첫 페이지 로드 시, 미디어 영역 숨기기
call.hidden = true;

let myStream;
// 상태 확인용 변수 선언
let muted = false;
let camOff = false;
let roomName;
/** @type{RTCPeerConnection} */
let myPeerConnection;

// 카메라 선택 옵션 생성
const getCameras = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(
            (device) => device.kind === "videoinput"
        );
        // 현재 사용 중인 카메라 확인
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            // 현재 사용 중인 카메라를 select 하기
            if (currentCamera.label == camera.label) {
                option.selected = true;
            }

            cameraList.appendChild(option);
        });
    } catch (e) {
        console.log(e);
    }
};

// 미디어 불러오기
const getMedia = async (deviceId) => {
    // 초기 설정
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user" },
    };
    // 유저 선택 카메라 설정
    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstraints
        );
        myFace.srcObject = myStream;
        // 카메라 목록으로부터 옵션 선택창 생성 (초기 실행 시에만 생성)
        if (!deviceId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
};

// Mute 버튼 핸들러
const handleMuteBtnClick = () => {
    // 버튼 클릭 시, 모든 AudioTrack에 대해 상태 전환
    myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
};
// Camera On/Off 버튼 핸들러
const handleCameraBtnClick = () => {
    myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    if (!camOff) {
        cameraBtn.innerText = "Turn Camera On";
        camOff = true;
    } else {
        cameraBtn.innerText = "Turn Camera Off";
        camOff = false;
    }
};

// Camera 변경 감지
const handleCameraChange = async () => {
    await getMedia(cameraList.value);
};

muteBtn.addEventListener("click", handleMuteBtnClick);
cameraBtn.addEventListener("click", handleCameraBtnClick);
cameraList.addEventListener("input", handleCameraChange);

/////////////////////////////////////////////////////////////////
// Welcome Form (join a Room)

const welcome = document.getElementById("welcome");
welcomeForm = welcome.querySelector("form");

const initCall = async () => {
    // 룸 입장 폼 숨기기 + 미디어 영역 표시
    welcome.hidden = true;
    call.hidden = false;
    // 미디어 (카메라, 마이크) 불러오기
    await getMedia();
    // RTC 커넥션 생성
    makeConnection();
};

// 룸 입장 버튼 핸들러
const handleWelcomeSubmit = async (e) => {
    e.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    roomName = input.value;
    // 해당 룸 이름으로 입장
    socket.emit("join_room", roomName);
    input.value = "";
};

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

// 특정 룸 입장 확인 (welcome event) -> WebRTC 연결 주체인 offer 확인
// Offer에서 실행됨 (Peer A)
socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    // set local description
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    // socketIO를 통해 offer 보내기
    socket.emit("offer", offer, roomName);
});

// Offer 전달 받기 (Peer B)
socket.on("offer", async (offer) => {
    // remote description
    myPeerConnection.setRemoteDescription(offer);
    // answer 생성
    const answer = await myPeerConnection.createAnswer();
    console.log(answer);
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
});

// Answer 전달 받기 (Peer A)
socket.on("answer", (answer) => {
    myPeerConnection.setRemoteDescription(answer);
});

// RTC Code
// RTC 커넥션 생성 (== addStream())
const makeConnection = () => {
    // peer-to-peer connection 만들기
    myPeerConnection = new RTCPeerConnection();
    // 연결된 Peer들의 카메라/마이크(track) 데이터 steam을 RTC에 추가
    myStream
        .getTracks()
        .forEach((track) => myPeerConnection.addTrack(track, myStream));
};
