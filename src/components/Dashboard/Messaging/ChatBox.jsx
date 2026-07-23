import { useEffect, useRef, useState } from "react";
import icons from "~/assets/js/icons";
import { useNavigate } from "react-router-dom";
import { classNames } from "~/utilities/classNames";
import ContactListItem from "./ContactListItem";
import { useGetAllContactsQuery, useGetChatHistoryQuery } from "~/redux/api/chatsApi";
import Loading from "~/components/Global/Loading/Loading";
import Message from "./Message";
import { useGetMemberByIdQuery } from "~/redux/api/membersApi";
import { useSocket } from "~/utilities/socket";

const ChatBox = ({ userId, recipientId }) => {
  const [inputValue, setInputValue] = useState("");
  const [inputHeight, setInputHeight] = useState(48); // Initial height
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const maxInputHeight = 160;

  const {
    data: chatData,
    isLoading,
    isFetching,
  } = useGetChatHistoryQuery({ id: recipientId, page, limit: 50 }, { refetchOnMountOrArgChange: true });
  const { data: recipientData, isLoading: loadingRecipientData } = useGetMemberByIdQuery(recipientId);
  const { data } = useGetAllContactsQuery(null, { refetchOnMountOrArgChange: true });

  const [allMessages, setAllMessages] = useState([]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setInputHeight(e.target.scrollHeight);
    if (inputHeight > maxInputHeight) {
      setInputHeight(maxInputHeight);
    }
  };

  const { socket } = useSocket();

  const handleSend = (e) => {
    e.preventDefault();
    socket.emit("newMessage", { sender: userId, receiver: recipientId, content: inputValue });
    setInputValue("");
  };

  useEffect(() => {
    if (chatData?.messages) {
      setAllMessages(chatData.messages);
    }
  }, [chatData]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      setAllMessages((prev) => [...prev, newMessage]);
    };

    const eventName = `newMessage_${[userId, recipientId].sort().join("_")}`;

    socket.on(eventName, handleNewMessage);

    return () => {
      socket.off(eventName, handleNewMessage);
    };
  }, [socket, recipientId, userId]);

  const scrollRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Only auto-scroll on new messages or first page load, not on "load more"
    if (page === 1) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, page]);

  const handleLoadMore = () => {
    if (chatData?.pagination?.hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop < 50 && chatData?.pagination?.hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full lg:w-3/5 flex flex-col rounded-xl">
      {/* back button mobile screen */}
      <div className="lg:hidden">
        <div
          className="flex items-center text-black gap-x-2 mt-1 mb-4 cursor-pointer"
          onClick={() => navigate("/messaging")}
        >
          <span className="text-lg">{icons.arrowLeft}</span> <span>Back</span>
        </div>
      </div>

      <div className="bg-white shadow rounded-t-xl max-md:pt-4">
        {loadingRecipientData ? (
          <div className="flex justify-center items-center w-full h-full">
            <Loading />
          </div>
        ) : (
          <ContactListItem
            asHeader={true}
            name={recipientData?.fullName}
            image={recipientData?.avatarUrl}
            subText={recipientData?.email}
          />
        )}
      </div>
      <div className="w-full bg-onPrimary h-[calc(100vh-400px)] md:h-[calc(100vh-320px)]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loading className="text-primary h-16 w-16" />
          </div>
        ) : (
          <div
            ref={messagesContainerRef}
            className="w-full h-full overflow-y-auto flex flex-col"
            onScroll={handleScroll}
          >
            {/* Load More Button */}
            {chatData?.pagination?.hasMore && (
              <div className="flex justify-center py-3">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="text-sm text-primary hover:text-primary/80 font-medium px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  {isFetching ? "Loading..." : "Load older messages"}
                </button>
              </div>
            )}
            {allMessages.map(
              (item) =>
                item.content && (
                  <Message
                    key={item._id}
                    content={item.content}
                    timestamp={item.createdAt}
                    isSender={item.sender === userId}
                  />
                )
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>
      <div className="bg-white rounded-b-xl p-4 shadow">
        <form onSubmit={handleSend} className="flex gap-4">
          <textarea
            className={classNames(
              "bg-white border border-gray placeholder:text-[gray] rounded-lg block w-full text-sm p-3",
              "focus:ring focus:ring-primary/25 focus:outline-none focus:bg-white focus:border-transparent transition-all",
              inputHeight >= maxInputHeight && "overflow-auto"
            )}
            style={{ height: `${inputHeight}px` }}
            placeholder="Your message..."
            onChange={handleInputChange}
            value={inputValue}
            required
          />
          <button
            type="submit"
            className={classNames(
              "bg-primary text-white hover:bg-primaryContainer h-12 w-12 p-4 rounded-full shadow-lg",
              "inline-flex justify-center items-center text-2xl cursor-pointer",
              "focus:ring focus:ring-primary/25 focus:outline-none focus:border-transparent transition-all"
            )}
          >
            {icons.send}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
