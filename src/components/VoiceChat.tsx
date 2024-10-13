import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

import {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    LocalUser, RemoteAudioTrack,
    RemoteUser,
    useJoin,
    useLocalMicrophoneTrack, useLocalScreenTrack,
    useRemoteAudioTracks, useRemoteUsers,
} from "agora-rtc-react";

function sortByVideo(data: IAgoraRTCRemoteUser[]): IAgoraRTCRemoteUser[] {
    const array = data;
    array.sort((a, b) => {
        return (a.hasVideo ? 1 : 0) - (b.hasVideo ? 1 : 0);
    });
    return array
}

export const VoiceChat = (
    props: {
        client: IAgoraRTCClient
        appId: string
    }
) => {

    // const client_screen = props.client_screen;
    // const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })); // Initialize Agora Client

    const client = props.client;
    const userUID = client.uid;

    const { channelName } = useParams() //pull the channel name from the param

    // set the connection state
    const [activeConnection, setActiveConnection] = useState(true);

    // track the mic/video state - Turn on Mic and Camera On
    const [micOn, setMic] = useState(false);
    // const [cameraOn, setCamera] = useState(false);
    const [shareScreenOn, setShareScreen] = useState(false);

    // const { localCameraTrack } = useLocalCameraTrack(cameraOn);
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn, {encoderConfig: 'high_quality_stereo', ANS: true, AGC: false, AEC: false});
    // const client_screen = useRTCClient(AgoraRTC.createClient({codec: "av1", mode: "rtc"}));
    const { screenTrack } = useLocalScreenTrack(shareScreenOn, {encoderConfig: "1080p_5", optimizationMode: "detail"}, "disable");
    // const screenTrack = AgoraRTC.createScreenVideoTrack({encoderConfig: "1080p_5", optimizationMode: "detail" }, 'auto')
    // to leave the call

    // const [innerWidth, setInnerWidth] = useState(window.innerWidth);
    // const [innerHeight, setInnerHeight] = useState(window.innerHeight);

    const navigate = useNavigate()

    // Join the channel
    useJoin(
        {
            appid: props.appId,
            channel: channelName!,
            token: null,
        },
        activeConnection,
    );

    if (localMicrophoneTrack) client.publish(localMicrophoneTrack).then(() => {})
    // usePublish([localMicrophoneTrack], true, client);

    if (!shareScreenOn && screenTrack) {
        client.unpublish(screenTrack).then(() => {})
    } else if (shareScreenOn && screenTrack) {
        client.publish(screenTrack).then(() => {})
    }

    //remote users
    // const remoteUsers = useRemoteUsers();
    const remoteUsers = useRemoteUsers();
    // const remoteUserScreen = client.remoteUsers;
    const { audioTracks } = useRemoteAudioTracks(remoteUsers);

    // play the remote user audio tracks
    audioTracks.forEach((track) => {
        track.play()
    });

    if (!micOn) {
        localMicrophoneTrack?.setMuted(true);
    } else {
        localMicrophoneTrack?.setMuted(false);
    }

    const [modal, setModal] = useState(false);
    const [selectedUser, setUser] = useState(remoteUsers[0]);

    const toggleModal = (user: IAgoraRTCRemoteUser) => {
        setUser(user);
        setModal(!modal);
    }

    return (
        <div className={"container"}>
            <div className={"navbar"}>
                <h2>{"ZeroFK"}</h2>
                <div className={"navbarData"}>
                    <div>{`Lobby: ${channelName}`}</div>
                    <div className={'left-space'}>{`User ID: ${userUID}`}</div>
                </div>
            </div>
            {!modal ? (
                <>
                    <div id='remoteVideoGrid'>
                        {
                            sortByVideo(remoteUsers).reverse().map((user) => {
                                return (
                                    <div>
                                        <div id={`user-${user.uid}`} key={user.uid} className={"remote-video-container"}
                                             onClick={() => {toggleModal(user)}}>
                                            <RemoteUser user={user} />
                                            {/*<RemoteAudioTrack key={user.uid} play={true} track={user.audioTrack} />*/}
                                        </div>
                                        <div id={"userUID"}>
                                            <div className={'text-user'}>{user.uid}</div>
                                        </div>
                                    </div>
                                )}
                            )
                        }
                    </div>
                    <div>
                        <div id='localVideo'>
                            <LocalUser
                                // audioTrack={localMicrophoneTrack}
                                videoTrack={screenTrack}
                                cameraOn={shareScreenOn}
                                micOn={micOn}
                                // playAudio={micOn}
                                playVideo={shareScreenOn}
                            />
                            <div>
                                <div id="controlsToolbar">
                                    <div id="mediaControls">
                                        <button className={micOn ? 'buttonOn' : 'buttonOff'}
                                                onClick={() => setMic(a => !a)}>
                                            Micro
                                        </button>
                                        <button className={shareScreenOn ? 'buttonOn' : 'buttonOff'}
                                                onClick={() => setShareScreen(a => !a)}>
                                            Share screen
                                        </button>
                                        <button id="endConnection"
                                                onClick={() => {
                                                    setShareScreen(false);
                                                    setActiveConnection(false)
                                                    navigate('/zerofk/')
                                                }}> Disconnect
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{display: "flex"}}>
                    <div className={"backBTN"} onClick={() => setModal(false)}>Back</div>
                    <div className={"remote-modal-container"} style={{width: (selectedUser.videoTrack ? (selectedUser.videoTrack.getCurrentFrameData().width / 2) : undefined), height: (selectedUser.videoTrack ? (selectedUser.videoTrack.getCurrentFrameData().height / 2) : undefined)}}>
                        <div id={`user-${selectedUser.uid}`} key={selectedUser.uid}
                             className={"remote-video-modal"}>
                            <RemoteUser user={selectedUser} />
                        </div>
                        <div id={"userUID"}>
                            <div className={'text-user'}>{selectedUser.uid}</div>
                        </div>
                    </div>
                    <div id='remoteVideoGrid'>
                        {remoteUsers.reverse().map((user) => (
                            <div>
                                <div id={`user-${user.uid}`} key={user.uid}>
                                    <RemoteAudioTrack key={user.uid} play={true} track={user.audioTrack}/>
                                </div>
                            </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}