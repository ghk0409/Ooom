const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraList = document.getElementById("cameraList");

let myStream;
// 상태 확인용 변수 선언
let muted = false;
let camOff = false;

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

// 미디어 연결 실행
getMedia();

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
