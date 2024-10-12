import React, { useState } from 'react'
import logo from './../assets/logo.svg'

interface ConnectFormProps {
    connectToVideo: (channelName: string, appId: string) => void
}

export const ConnectForm = ({ connectToVideo } : ConnectFormProps) => {

    const [channelName, setChannelName] = useState('')
    const [appId, setAppId] = useState('')
    const [invalidInputMsg, setInvalidInputMsg] = useState('')


    const handleConnect = (e: React.FormEvent<HTMLFormElement>) => {
        // trim spaces
        const trimmedChannelName = channelName.trim()
        const trimmedAppId = appId.trim()

        // validate input: make sure channelName is not empty
        if (trimmedChannelName === '' && trimmedAppId === '') {
            e.preventDefault() // keep the page from reloading on form submission
            setInvalidInputMsg("App ID and Channel name can't be empty.") // show warning
            setChannelName('') // resets channel name value in case user entered blank spaces
            return;
        }

        connectToVideo(trimmedChannelName, trimmedAppId)
    }

    return (
        <form onSubmit={handleConnect}>
            <img src={logo} className="logo" alt="logo" />
            <div className="card">
                <input
                    id="appId"
                    type='text'
                    placeholder='App ID'
                    value={appId}
                    onChange={(e) => {
                        setAppId(e.target.value)
                        setInvalidInputMsg('') // clear the error message
                    }}
                />
                <input
                    id="channelName"
                    type='text'
                    placeholder='Channel Name'
                    value={channelName}
                    onChange={(e) => {
                        setChannelName(e.target.value)
                        setInvalidInputMsg('') // clear the error message
                    }}
                />
                <button>Connect</button>
                {invalidInputMsg && <p style={{color: 'red'}}> {invalidInputMsg} </p>}
            </div>
        </form>
    )
}