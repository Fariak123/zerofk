import {useState} from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    IAgoraRTCClient, IAgoraRTCRemoteUser,
    LocalUser,
    RemoteUser,
    useJoin,
    // useLocalCameraTrack,
    useLocalMicrophoneTrack, useLocalScreenTrack,
    usePublish,
    useRemoteAudioTracks,
    useRemoteUsers,
} from "agora-rtc-react";

function sortByVideo(data: IAgoraRTCRemoteUser[]): IAgoraRTCRemoteUser[] {
    const array = data;
    array.sort((a, b) => {
        return (a.hasVideo ? 1 : 0) - (b.hasVideo ? 1 : 0);
    });
    return array
}


export const VoiceChat = (
    props: {client: IAgoraRTCClient, appId: string}
) => {

    const client = props.client;
    const userUID = client.uid;
    const { channelName } = useParams() //pull the channel name from the param

    // set the connection state
    const [activeConnection, setActiveConnection] = useState(true);

    // track the mic/video state - Turn on Mic and Camera On
    const [micOn, setMic] = useState(false);
    // const [cameraOn, setCamera] = useState(false);
    const [shareScreenOn, setShareScreen] = useState(false);


    // get local video and mic tracks
    // const { localCameraTrack } = useLocalCameraTrack(cameraOn);
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    const { screenTrack } = useLocalScreenTrack(shareScreenOn, {encoderConfig: "1080p_1", optimizationMode: "detail"}, "disable");

    // to leave the call
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

    usePublish([localMicrophoneTrack, screenTrack]);

    //remote users
    const remoteUsers = useRemoteUsers();
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
                <div className={"navbarData"} style={{display: "flex"}}>
                    <div>{`Lobby: ${channelName} `}</div>
                    <div style={{color: 'transparent'}}>----</div>
                    <div>{`User ID: ${userUID} `}</div>
                </div>
            </div>
            {!modal ? (
                <>
                    <div id='remoteVideoGrid'>
                        {
                            sortByVideo(remoteUsers).reverse().map((user) => (
                                    <div>
                                        <div id={`user-${user.uid}`} key={user.uid} className={"remote-video-container"}
                                             onClick={() => {toggleModal(user)}}>
                                            <RemoteUser user={user}/>
                                        </div>
                                        <div id={"userUID"}>
                                            <div className={'text-user'}>{user.uid}</div>
                                        </div>
                                    </div>
                                )
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
                                playAudio={micOn}
                                playVideo={shareScreenOn}
                                className=''
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
                                                    navigate('/zerofk')
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
                    <div className={"remote-modal-container"}>
                        <div id={`user-${selectedUser.uid}`} key={selectedUser.uid} className={"remote-video-modal"}>
                            <RemoteUser user={selectedUser} />
                        </div>
                        <div id={"userUID"}>
                            <div className={'text-user'}>{selectedUser.uid}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}