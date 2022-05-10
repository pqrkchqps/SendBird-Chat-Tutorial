const MessageInput = ({ value, onChange, sendMessage }) => {
    return (
        <div className="message-input">
            <input
                placeholder="write a message"
                value={value}
                onChange={onChange} />

            <div className="message-input-buttons">
                <button className="send-message-button" onClick={sendMessage}>Send Message</button>
            </div>

        </div>);
}

export default MessageInput