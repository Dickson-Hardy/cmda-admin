import formatDate from "~/utilities/fomartDate";

const Message = ({ content, timestamp, isSender }) => {
  return (
    <div className={`flex my-2 mx-2 ${isSender ? "justify-end" : "justify-start"}`}>
      <div>
        <p
          className={`${isSender ? "bg-primary text-white" : "bg-white text-ink"} text-sm w-max max-w-[290px] py-2 px-4 rounded-xl text-left shadow`}
        >
          {content}
        </p>

        <p className="text-[9px] text-gray mt-1 text-right">{formatDate(timestamp).dateTime}</p>
      </div>
    </div>
  );
};

export default Message;
