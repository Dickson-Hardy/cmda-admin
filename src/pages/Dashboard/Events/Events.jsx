import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import icons from "~/assets/js/icons";
import EventFilterModal from "~/components/Dashboard/Events/EventFilterModal";
import ItemCard from "~/components/Dashboard/ItemCard/ItemCard";
import Button from "~/components/Global/Button/Button";
import Loading from "~/components/Global/Loading/Loading";
import MiniPagination from "~/components/Global/MiniPagination/MiniPagination";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import { useGetAllEventsQuery } from "~/redux/api/eventsApi";
import { classNames } from "~/utilities/classNames";
import formatDate from "~/utilities/fomartDate";

const Events = () => {
  const navigate = useNavigate();
  const [perPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchBy, setSearchBy] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [membersGroup, setMembersGroup] = useState("");
  const [eventType, setEventType] = useState("");
  const {
    data: allEvents,
    isLoadingEvents,
    isFetching,
  } = useGetAllEventsQuery({
    page: currentPage,
    limit: perPage,
    searchBy,
    eventType,
    eventDate,
    membersGroup,
  });

  const eventStats = useMemo(
    () => [
      { label: "Total Events", bgClass: "bg-white", value: allEvents?.meta?.totalItems || 0 },
      // { label: "Today's Events", bgClass: "bg-onPrimaryContainer", value: 50292938 },
      // { label: "Future Events", bgClass: "bg-onPrimaryContainer", value: 50292938 },
      // { label: "Past Events", bgClass: "bg-onPrimaryContainer", value: 50292938 },
      // { label: "Students Only", bgClass: "bg-primary", value: 50292938 },
      // { label: "Doctors Only", bgClass: "bg-secondary", value: 50292938 },
      // { label: "Global Network Only", bgClass: "bg-tertiary", value: 50292938 },
    ],
    [allEvents]
  );

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Manage all events"
        action={() => navigate("/events/create-event")}
        actionLabel="New Event"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
        {eventStats.map((stat) => (
          <div
            key={stat.label}
            className={classNames("p-4 border rounded-xl", stat.bgClass, stat.label.includes("Only") && "text-white")}
          >
            <h4 className="uppercase text-xs font-medium opacity-70 mb-3">{stat.label}</h4>
            <p className="font-bold text-lg">{Number(stat.value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <section className="my-8">
        <div className="flex flex-wrap justify-end items-end gap-3 mb-4">
          <Button
            label="Filter"
            className="ml-auto"
            onClick={() => setOpenFilter(true)}
            icon={icons.filter}
            variant="outlined"
          />
          <SearchBar
            onSearch={(v) => {
              setSearchBy(v);
              setCurrentPage(1);
            }}
          />
        </div>

        {isLoadingEvents || isFetching ? (
          <div className="flex justify-center px-6 py-20">
            <Loading height={64} width={64} className="text-primary" />
          </div>
        ) : allEvents?.items?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {allEvents?.items?.map((evt) => (
              <Link key={evt?._id} to={`/events/${evt.slug}`}>
                <ItemCard
                  image={evt.featuredImageUrl}
                  title={evt.name}
                  category={evt.eventType}
                  dateTime={formatDate(evt.eventDateTime).dateTime}
                  extraText={"Posted - " + formatDate(evt.createdAt).date}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 flex justify-center">
            <div className="w-full max-w-[360px] text-center">
              <span
                className={classNames(
                  "flex items-center justify-center text-primary text-2xl",
                  "size-14 mx-auto rounded-full bg-onPrimaryContainer"
                )}
              >
                {icons.file}
              </span>

              <h3 className="font-bold text-primary mb-1 text-lg mt-2">No Data Available</h3>
              <p className=" text-sm text-gray-600 mb-6">There are currently no matching events to display</p>
            </div>
          </div>
        )}

        {allEvents?.meta?.totalItems ? (
          <MiniPagination
            itemsPerPage={perPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={allEvents?.meta?.totalItems}
            totalPages={allEvents?.meta?.totalPages}
          />
        ) : null}
      </section>

      {/*  */}
      <EventFilterModal
        isOpen={openFilter}
        onClose={() => setOpenFilter(false)}
        defaultValues={{ eventDate, eventType, membersGroup }}
        onSubmit={({ eventDate, eventType, membersGroup }) => {
          setEventDate(eventDate);
          setMembersGroup(membersGroup);
          setEventType(eventType);
          setOpenFilter(false);
        }}
      />
    </div>
  );
};

export default Events;
