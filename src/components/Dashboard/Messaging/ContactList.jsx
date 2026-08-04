import SearchBar from "~/components/Global/SearchBar/SearchBar";
import ContactListItem from "./ContactListItem";
import { useSearchParams } from "react-router-dom";
import Loading from "~/components/Global/Loading/Loading";

const ContactList = ({ isLoading, allContacts, hasMore, onLoadMore, isLoadingMore }) => {
  const [, setSearchParams] = useSearchParams();

  return (
    <div className="w-full lg:w-2/5 border-r pr-1">
      <SearchBar className="mx-2 mb-4" />

      <div className="mt-4 h-[calc(100%-60px)] overflow-y-auto">
        <h4 className="text-sm font-semibold mb-1 sticky top-0 pb-1 bg-background">Recent Messages</h4>
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <div className="w-full h-full justify-center flex items-center">
              <Loading />
            </div>
          ) : (
            <>
              {allContacts?.map((contact) => {
                return (
                  <ContactListItem
                    key={contact._id}
                    name={contact.user?.fullName}
                    image={contact.user?.avatarUrl}
                    subText={contact.lastMessage}
                    onClick={() => setSearchParams({ id: contact.user?._id })}
                    unreadCount={contact.unreadCount}
                  />
                );
              })}
              {hasMore && (
                <button
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? "Loading..." : "Load more contacts"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactList;
