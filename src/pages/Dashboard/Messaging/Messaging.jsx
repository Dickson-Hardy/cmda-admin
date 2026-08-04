import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ChatBox from "~/components/Dashboard/Messaging/ChatBox";
import ContactList from "~/components/Dashboard/Messaging/ContactList";
import SendNewMessage from "~/components/Dashboard/Messaging/SendNewMessage";
import { useGetAllContactsQuery } from "~/redux/api/chatsApi";

const DashboardMessagingPage = () => {
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get("id");
  const [page, setPage] = useState(1);
  const limit = 30;

  const {
    data: { contacts: allContacts, pagination } = { contacts: [], pagination: {} },
    isLoading: isLoadingContacts,
    isFetching: isFetchingContacts,
    refetch: refetchContacts,
  } = useGetAllContactsQuery({ page, limit }, { refetchOnMountOrArgChange: true });

  const hasMore = pagination && page < pagination.totalPages;

  const handleLoadMore = () => {
    if (hasMore && !isFetchingContacts) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div>
      <div className="flex justify-between gap-2 items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-primary">Messaging</h2>
        <SendNewMessage refetchContacts={refetchContacts} />
      </div>

      {/* large screen */}
      <section className="gap-10 h-[calc(100vh-190px)] hidden lg:flex">
        {/* messages Lists */}
        <ContactList
          allContacts={allContacts}
          isLoading={isLoadingContacts}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isLoadingMore={isFetchingContacts && page > 1}
        />

        {/* Chatbox */}
        {recipientId ? (
          <ChatBox userId={"admin"} recipientId={recipientId} refetchContacts={refetchContacts} />
        ) : (
          <div className="w-3/5 flex flex-col justify-center items-center">
            <p className="font-bold text-lg text-center cursor-not-allowed">Select A User to start chatting with</p>
          </div>
        )}
      </section>

      {/* small screen  */}
      <section className=" gap-10 h-[calc(100vh-190px)] lg:hidden flex">
        {/* messages Lists */}
        {!recipientId && (
          <ContactList
            allContacts={allContacts}
            isLoading={isLoadingContacts}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            isLoadingMore={isFetchingContacts && page > 1}
          />
        )}

        {/* Chatbox */}
        {recipientId && <ChatBox userId={"admin"} recipientId={recipientId} refetchContacts={refetchContacts} />}
      </section>
    </div>
  );
};

export default DashboardMessagingPage;
