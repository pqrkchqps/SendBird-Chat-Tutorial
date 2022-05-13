import { useState, useRef } from 'react';

import CreateUserForm from './CreateUserForm'
import Channel from './Channel'
import MessagesList from "./MessagesList"
import MessageInput from "./MessageInput"

import axios from 'axios'

import { SENDBIRD_INFO } from '../constants/constants';

const sendBirdConfig = {
    headers: {
        'Content-Type': "application/json; charset=utf8",
        'Api-Token': SENDBIRD_INFO.masterToken
    }
}
const sendBirdURL = `https://api-${SENDBIRD_INFO.appId}.sendbird.com/v3/`

const channelName = "Test Channel"
const ChatRoom = (props) => {

    const [state, updateState] = useState({
        joinedChannel: null,
        messages: [],
        messageInputValue: "",
        userNameInputValue: "",
        userIdInputValue: "",
        settingUpUser: true,
        messageToUpdate: null,
        loading: false,
        error: false
    });

    const onError = (error) => {
        updateState({ ...state, error: error.message });
        console.log(error);
    }

    const onUserNameInputChange = (e) => {
        const userNameInputValue = e.currentTarget.value;
        updateState({ ...state, userNameInputValue });
    }

    const onUserIdInputChange = (e) => {
        const userIdInputValue = e.currentTarget.value;
        updateState({ ...state, userIdInputValue });
    }

    const onMessageInputChange = (e) => {
        const messageInputValue = e.currentTarget.value;
        updateState({ ...state, messageInputValue });
    }

    const sendMessage = async () => {
        const { messageToUpdate, messages, userIdInputValue, messageInputValue } = state;

        if (messageToUpdate) {
            const updateMessageUrl = sendBirdURL+"open_channels/"+state.joinedChannel.channel_url
                                    +"/messages/"+messageToUpdate.message_id;

            const updateMessageBody = {message_type: "MESG", message: messageInputValue}

            const updatedMessageResponse = await axios.put(updateMessageUrl,updateMessageBody,sendBirdConfig)
            const updatedMessage = updatedMessageResponse.data;

            const messageIndex = messages.findIndex((item => item.message_id == messageToUpdate.message_id));
            messages[messageIndex] = updatedMessage;

            updateState({ ...state, messages, messageInputValue: "", messageToUpdate: null });
        } else {
            const sendMessageUrl = sendBirdURL+"open_channels/"
                                    +state.joinedChannel.channel_url+"/messages";

            const sendMessageBody = {message_type: "MESG", 
                                    user_id: userIdInputValue, message: messageInputValue}

            const messageResponse = await axios.post(sendMessageUrl, sendMessageBody, sendBirdConfig)
            const message = messageResponse.data;
            const updatedMessages = [...messages, message]
            updateState({ ...state, messages: updatedMessages, messageInputValue: "" });
        }
    }

    const handleDeleteMessage = async (messageToDelete) => {
        const { joinedChannel, messages } = state;
        const deleteMessageUrl = sendBirdURL+"open_channels/"+joinedChannel.channel_url
                                    +"/messages/"+messageToDelete.message_id;
        await axios.delete(deleteMessageUrl, sendBirdConfig);
        const updatedMessages = messages.filter((message) => {
            return message.message_id !== messageToDelete.message_id;
        });
        updateState({ ...state, messages: updatedMessages });
    }

    const updateMessage = async (message) => {
        updateState({ ...state, messageToUpdate: message, messageInputValue: message.message });
    }

    const setupUser = async () => {
        const { userNameInputValue, userIdInputValue } = state;

        const usersResponse = await axios.get(sendBirdURL+"users", sendBirdConfig)
        const users = usersResponse.data.users;
        const usersThatMatch = users.filter(user => user.user_id === userIdInputValue)
        
        if (usersThatMatch.length === 0) {
            const userBody = {user_id: userIdInputValue, nickname: userNameInputValue, profile_url: ""}
            await axios.post(sendBirdURL+"users", userBody, sendBirdConfig)
        } else {
            const userBody = {user_id: userIdInputValue, nickname: userNameInputValue}
            await axios.put(sendBirdURL+"users/"+userIdInputValue, userBody, sendBirdConfig)
        }

        updateState({ ...state, loading: true });
        let [joinedChannel, messages, error] = await joinTestChannel();
        if (error) {
            return onError(error);
        }
        updateState({ ...state, joinedChannel, messages, loading: false, settingUpUser: false });
    }

    const joinTestChannel = async () => {
        try {
            const channelResponse = await axios.get(sendBirdURL+"open_channels", sendBirdConfig);
            const channels = channelResponse.data.channels;
            let testChannel = channels.find(channel => channel.name === channelName)
            if (!testChannel) {
                const [openChannel, error] = await createChannel(channelName);
                if (error){
                    return [null, null, error]
                }
                testChannel = openChannel;
            }

            const messageslUrl = sendBirdURL+"open_channels/"+testChannel.channel_url+"/messages";
            const messagesConfig = sendBirdConfig;
            messagesConfig.params = {message_ts: 0}

            const messagesResponse = await axios.get(messageslUrl, messagesConfig);
            const messages = messagesResponse.data.messages;
            return [testChannel, messages, null];
    
        } catch (error) {
            return [null, null, error];
        }
    
    }

    const createChannel = async () => {
        try {
            const createChannelUrl = sendBirdURL+"open_channels";
            const createChannelBody = {name: channelName};
            const openChannelResponse = await axios.post(createChannelUrl, createChannelBody, sendBirdConfig)
            const openChannel = openChannelResponse.data;
            return [openChannel, null];
        } catch (error) {
            return [null, error];
        }
    
    }
    

    if (state.loading) {
        return <div>Loading...</div>
    }

    if (state.error) {
        return <div className="error">{state.error} check console for more information.</div>
    }

    console.log('- - - - State object very useful for debugging - - - -');
    console.log(state);
    
    return (
        <>
            <CreateUserForm
                setupUser={setupUser}
                userNameInputValue={state.userNameInputValue}
                userIdInputValue={state.userIdInputValue}
                settingUpUser={state.settingUpUser}
                onUserIdInputChange={onUserIdInputChange}
                onUserNameInputChange={onUserNameInputChange} />
            <Channel channelName={channelName}>
                <MessagesList
                    messages={state.messages}
                    handleDeleteMessage={handleDeleteMessage}
                    updateMessage={updateMessage}
                    userId={state.userIdInputValue} />
                <MessageInput
                    value={state.messageInputValue}
                    onChange={onMessageInputChange}
                    sendMessage={sendMessage} />
            </Channel>
        </>
    );
};

export default ChatRoom;
