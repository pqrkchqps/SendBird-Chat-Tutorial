import ChannelHeader from "./ChannelHeader";

const Channel = ({ channelName, children }) => {
    return <div className="channel">
        <ChannelHeader>{channelName}</ChannelHeader>
        <div>{children}</div>
    </div>;
}

export default Channel