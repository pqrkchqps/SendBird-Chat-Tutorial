const Channel = ({ channelName, children }) => {
    return <div className="channel">
        <div className="channel-header">{channelName}</div>
        <div>{children}</div>
    </div>;
}

export default Channel