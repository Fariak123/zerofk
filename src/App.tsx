import { Route, Routes, useNavigate } from 'react-router-dom'
import { ConnectForm } from './components/ConnectForm'

import AgoraRTC, {
    AgoraRTCProvider,
    useRTCClient,
} from "agora-rtc-react";

import './App.css'
import {VoiceChat} from "./components/VoiceChat.tsx";
import {useState} from "react";

function App() {
    const navigate = useNavigate()
    const agoraClient = useRTCClient(AgoraRTC.createClient({ codec: "av1", mode: "rtc" })); // Initialize Agora Client
    const [appId, setAppId] = useState("");
    // AgoraRTC.setParameter("AUDIO_VOLUME_INDICATION_INTERVAL", 200)
    // agoraClient.enableAudioVolumeIndicator()

    const handleConnect = (channelName: string, app_id: string) => {
        setAppId(app_id);
        navigate(`/via/${channelName}`) // on form submit, navigate to new route
    }

    return (
        <Routes>
            <Route path='/' element={ <ConnectForm connectToVideo={ handleConnect } /> } />
            <Route path='/via/:channelName' element={
                <AgoraRTCProvider client={agoraClient}>
                    <VoiceChat client={agoraClient} appId={appId}/>
                </AgoraRTCProvider>
            } />
        </Routes>
    )
}

export default App