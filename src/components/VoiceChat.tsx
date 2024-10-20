import React, {useCallback, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

import settingsIcon from './icons/settings.svg'
import microOnIcon from './icons/micro-on.svg';
import microOffIcon from './icons/micro-off.svg';
import headPhonesOnIcon from './icons/headphones-on.svg';
import headPhonesOffIcon from './icons/headphones-off.svg';
import screenOnIcon from './icons/screen-on.svg';
import screenOffIcon from './icons/screen-off.svg';
import disconnectIcon from './icons/disconnect.svg';
import volumeOnIcon from './icons/volumeOn.svg';
import volumeOffIcon from './icons/volumeOff.svg';

import {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    LocalUser, RemoteAudioTrack,
    RemoteUser,
    useJoin,
    useLocalMicrophoneTrack, useLocalScreenTrack, usePublish,
    useRemoteUsers,
} from "agora-rtc-react";
import {useHotkeys} from "react-hotkeys-hook";

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

    const client = props.client;
    const userUID = client.uid;

    const { channelName } = useParams()

    const [activeConnection, setActiveConnection] = useState(true);

    const [micOn, setMic] = useState(false);
    const [headPhones, setHeadPhones] = useState(true);
    const [shareScreenOn, setShareScreen] = useState(false);

    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn, {encoderConfig: 'high_quality_stereo',
        ANS: true,
        AGC: true,
        AEC: false,
    });
    const { screenTrack } = useLocalScreenTrack(shareScreenOn, {encoderConfig: "1080p_5", optimizationMode: "detail"}, "disable");

    const navigate = useNavigate()

    useJoin(
        {
            appid: props.appId,
            channel: channelName!,
            token: null,
        },
        activeConnection,
    );

    usePublish([localMicrophoneTrack])

    if (!shareScreenOn && screenTrack) {
        client.unpublish(screenTrack).then(() => {})
    } else if (shareScreenOn && screenTrack) {
        client.publish(screenTrack).then(() => {})
    }

    const remoteUsers = useRemoteUsers();
    // const { audioTracks } = useRemoteAudioTracks(remoteUsers);
    // audioTracks.forEach((track) => {
    //     track.play()
    // });

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

    if (userUID === undefined) {
        const element = document.getElementById('uid')
        if (element) {
            element.style.color = '#C96868'
        }
    } else {
        const element = document.getElementById('uid')
        if (element) {
            element.style.color = '#ffffff'
        }
    }

    const [keyMic, setKeyMic] = useState('v')
    const [keyHeadphones, setKeyHeadphones] = useState('m')


    const handleMicKey = useCallback(() => {
        setMic(!micOn)
    }, [micOn])

    const handleHeadphonesKey = useCallback(() => {
        setHeadPhones(!headPhones)
    }, [headPhones])

    useHotkeys(keyMic, handleMicKey)
    useHotkeys(keyHeadphones, handleHeadphonesKey)

    const handleSetNewKey = (e: React.KeyboardEvent, type: string) => {
        if (e.key) {
            if (type === 'micro') {
                setKeyMic(e.key)
            } else if (type === 'headphones') {
                setKeyHeadphones(e.key)
            }
        }
    }

    const [volume, setVolume] = useState(100);
    const [showSettings, setShowSettings] = useState(false);

    if (showSettings) {
        document.getElementById('body')?.classList.add('show-drawer');
        document.getElementById('settings-icon')?.classList.add('active');
    } else {
        document.getElementById('body')?.classList.remove('show-drawer');
        document.getElementById('settings-icon')?.classList.remove('active');
    }

    return (
        <div id={'body'}>
            <div className={"navbar"}>
                <h2 style={{display: 'flex'}}>
                    <div className={'gold'}>ZeroFK</div>
                    <div style={{fontFamily: 'ruthie-regular', paddingLeft: "5px", color: "#b07dff", textShadow: "0 0 5px #ffffff"}}>x SpaceBlack</div>
                </h2>

                <div className={"navbarData"}>
                    <div className={'left-space'}>{`Lobby: ${channelName}`}</div>
                    <div className={'left-space'} style={{display: 'flex', gap: '4px'}}>
                        <div>{`User ID:`}</div>
                        <div id={'uid'}>{userUID ?? 'undefined'}</div>
                    </div>
                </div>

                <button className={'btn-settings'} style={{display: 'flex', gap: '4px', opacity: showSettings ? "0" : "1"}}
                onClick={()=>{setShowSettings(a => !a); console.log(showSettings)}}>
                    <div className={'control-icons'}>
                        <img src={settingsIcon} alt={"settings"} />
                    </div>
                    <div>Settings</div>
                </button>

            </div>
            {!modal ? (
                <>
                    <div id={'drawer'}>
                        <div className={'nav-modal'}>
                            <button className={'btn-settings'}
                                    style={{display: 'flex', gap: '4px'}}
                                    onClick={() => {
                                        setShowSettings(a => !a);
                                        console.log(showSettings)
                                    }}>
                                <div className={'control-icons'}>
                                    <img id={'settings-icon'} src={settingsIcon} alt={"settings"}/>
                                </div>
                                <div>Settings</div>
                            </button>
                        </div>
                        <div style={{height: '76px', color: 'transparent'}}></div>

                        <div style={{position: 'relative', backgroundColor: 'rgba(103,103,103,0.65)', padding: '1em', paddingBottom: '3em', borderRadius: '15px', border: '1px solid #fff'}}>
                            <h2 style={{paddingBottom: '1em'}}>Hotkeys</h2>
                                <div style={{display: 'flex', alignItems: 'center', gap: '1em'}}>
                                    <div className={'modal-action-text'}>(Off/On) MICROPHONE</div>
                                    <button onKeyDown={(e) => handleSetNewKey(e, 'micro')}>{keyMic}</button>
                                </div>

                                <div style={{display: 'flex', alignItems: 'center', gap: '1em', paddingTop: '2em'}}>
                                    <div className={'modal-action-text'}>(Off/On) HEADPHONES</div>
                                    <button onKeyDown={(e) => handleSetNewKey(e, 'headphones')}>{keyHeadphones}</button>
                                </div>
                        </div>

                    </div>

                    <div id='remoteVideoGrid'>
                        {
                            sortByVideo(remoteUsers).reverse().map((user) => {
                                return (
                                    <div className={'remote-full-container'}>
                                        <div>
                                            <div className={'remote-addition'}>
                                                <div id={"userUID"}>
                                                    <div className={'text-user'}>{user.uid}</div>
                                                </div>
                                                <input
                                                    id={'range'}
                                                    type='range'
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    onChange={(e) => {
                                                        setVolume(e.target.valueAsNumber)
                                                    }}
                                                />
                                                <img style={{width: "20px"}}
                                                     src={volume > 0 ? volumeOnIcon : volumeOffIcon} alt={"volume"}/>
                                                <div style={{paddingTop: "3px"}}>{volume}</div>
                                            </div>
                                            <div id={`user-${user.uid}`} key={user.uid}
                                                 className={"remote-video-container"}
                                                 onClick={() => {
                                                     toggleModal(user)
                                                 }}>
                                                <RemoteUser user={user} playAudio={headPhones} volume={volume}/>
                                            </div>
                                        </div>
                                    </div>
                                )
                                }
                            )
                        }
                    </div>
                </>
            ) : (
                <div style={{display: "flex"}}>
                    <div className={"backBTN"} onClick={() => setModal(false)}>Back</div>
                    <div className={"remote-modal-container"} style={{
                        width: (selectedUser.videoTrack ? (selectedUser.videoTrack.getCurrentFrameData().width / 2) : undefined),
                        height: (selectedUser.videoTrack ? (selectedUser.videoTrack.getCurrentFrameData().height / 2) : undefined)
                    }}>
                        <div id={`user-${selectedUser.uid}`} key={selectedUser.uid}
                             className={"remote-video-modal"}>
                            <RemoteUser user={selectedUser} playAudio={headPhones}/>
                        </div>
                        <div id={"userUID-modal"}>
                            <div className={'text-user-modal'}>{selectedUser.uid}</div>
                        </div>
                    </div>
                    <div id='remoteVideoGrid'>
                        {remoteUsers.reverse().map((user) => {
                            if (user.uid === selectedUser.uid) {
                                return (
                                    <div>
                                        <div id={`user-${user.uid}`} key={user.uid}>
                                            <RemoteAudioTrack key={user.uid} play={headPhones} track={user.audioTrack}/>
                                        </div>
                                        </div>
                                    )
                                }
                            }
                        )}
                    </div>
                </div>
            )}
            <div id='localVideo'>
                <LocalUser
                    videoTrack={screenTrack}
                    cameraOn={shareScreenOn}
                    micOn={micOn}
                    playVideo={shareScreenOn}
                />
                <div>
                    <div id="controlsToolbar">
                        <div id="mediaControls">
                            <button className={micOn ? 'buttonOn' : 'buttonOff'}
                                    onClick={() => setMic(a => !a)}>
                                <div className={'control-icons'}>
                                {micOn ? (
                                    <img src={microOnIcon} alt={"Micro"}/>
                                ) : (
                                    <img src={microOffIcon} alt={"Micro"}/>
                                )}
                                </div>
                            </button>
                            <button className={headPhones ? 'buttonOn' : 'buttonOff'}
                                    onClick={() => setHeadPhones(a => !a)}>
                                <div className={'control-icons'}>
                                    {headPhones ? (
                                        <img src={headPhonesOnIcon} alt={"Headphones"}/>
                                    ) : (
                                        <img src={headPhonesOffIcon} alt={"Headphones"}/>
                                    )}
                                </div>
                            </button>
                            <button className={shareScreenOn ? 'buttonOn' : 'buttonOff'}
                                    onClick={() => setShareScreen(a => !a)}>
                                <div className={'control-icons'}>
                                    {shareScreenOn ? (
                                        <img src={screenOnIcon} alt={"ShareScreen"}/>
                                    ) : (
                                        <img src={screenOffIcon} alt={"ShareScreen"}/>
                                    )}
                                </div>
                            </button>
                            <button id="endConnection"
                                    onClick={() => {
                                        setShareScreen(false);
                                        setActiveConnection(false)
                                        navigate('/zerofk/')
                                    }}>
                                <div className={'control-icons'}>
                                        <img src={disconnectIcon} alt={"Disconnect"} style={{color: '#ffffff'}}/>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}