import React, { useState } from 'react'
import logo from './../assets/logo.svg'
import './animation.scss'

interface ConnectFormProps {
    connectToVideo: (channelName: string, appId: string) => void
}

export const ConnectForm = ({ connectToVideo } : ConnectFormProps) => {

    const [channelName, setChannelName] = useState('')
    const [appId, setAppId] = useState('')
    const [invalidInputMsg, setInvalidInputMsg] = useState('')


    const handleConnect = (e: React.FormEvent<HTMLFormElement>) => {
        const trimmedChannelName = channelName.trim()
        const trimmedAppId = appId.trim()

        if (trimmedChannelName === '' && trimmedAppId === '') {
            e.preventDefault()
            setInvalidInputMsg("App ID and Channel name can't be empty.")
            setChannelName('')
            return;
        }

        connectToVideo(trimmedChannelName, trimmedAppId)
    }

    return (
        <div className="add-theme">
            <div className="form-container">
                <form onSubmit={handleConnect}>
                    <img src={logo} className="logo" alt="logo"/>
                    <div className="card">
                        <input
                            id="appId"
                            type='text'
                            placeholder='App ID (- u can get it from owner or his followers)'
                            value={appId}
                            onChange={(e) => {
                                setAppId(e.target.value)
                                setInvalidInputMsg('')
                            }}
                        />
                        <input
                            id="channelName"
                            type='text'
                            placeholder='Channel Name (- connect to or create channel with typed {name})'
                            value={channelName}
                            onChange={(e) => {
                                setChannelName(e.target.value)
                                setInvalidInputMsg('')
                            }}
                        />
                        <button className={'btnConnect'} style={{color: "#000000", background: "#ffffff"}}>Connect</button>
                        {invalidInputMsg && <p style={{color: 'red'}}> {invalidInputMsg} </p>}
                    </div>
                </form>
            </div>
            <div className={"stars"}>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
            </div>
        </div>
    )
}