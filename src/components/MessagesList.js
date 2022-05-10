import Message from "./Message";

const MessagesList = ({ messages, handleDeleteMessage, updateMessage, userId }) => {
    return messages.map(message => {
        return (
            <div key={message.message_id} className="oc-message-item">
                <Message 
                    handleDeleteMessage={handleDeleteMessage}
                    updateMessage={updateMessage}
                    message={message}
                    userId={userId}
                />
            </div>);
    })
}

export default MessagesList