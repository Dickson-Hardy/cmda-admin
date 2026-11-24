import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import icons from "~/assets/js/icons";
import Button from "~/components/Global/Button/Button";
import Loading from "~/components/Global/Loading/Loading";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import StatusChip from "~/components/Global/StatusChip/StatusChip";
import Table from "~/components/Global/Table/Table";
import { doctorsRegionLists, globalRegionsData, studentChapterOptions } from "~/constants/regions";
import { useGetAllDevotionalsQuery } from "~/redux/api/devotionalsApi";
import { useGetAllEventsQuery } from "~/redux/api/eventsApi";
import { useGetMembersStatsQuery } from "~/redux/api/membersApi";
import { useGetAllOrdersQuery } from "~/redux/api/ordersApi";
import { classNames } from "~/utilities/classNames";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";
import { formatCurrency } from "~/utilities/formatCurrency";

const OverviewPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: devotionals } = useGetAllDevotionalsQuery();
  const { data: memberStats } = useGetMembersStatsQuery();
  const { data: todayEvents, isLoadingEvents } = useGetAllEventsQuery({
    page: 1,
    limit: 3,
    eventDate: new Date().toISOString().split("T")[0],
  });

  const STATS = useMemo(
    () => ({
      members: {
        totalMembers: memberStats?.totalMembers || 0,
        totalStudents: memberStats?.totalStudents || 0,
        totalDoctors: memberStats?.totalDoctors || 0,
        totalGlobalNetworks: memberStats?.totalGlobalNetworks || 0,
        thisMonthMembers: memberStats?.registeredThisMonth || 0,
        todayMembers: memberStats?.registeredToday || 0,
      },
      chapters: {
        chaptersAndRegions: "",
        total: studentChapterOptions.length + doctorsRegionLists.length + globalRegionsData.length,
        studentChapters: studentChapterOptions.length,
        doctorChapters: doctorsRegionLists.length,
        globalNetworkRegions: globalRegionsData.length,
      },
    }),
    [memberStats]
  );

  const { data: orders, isLoadingOrders } = useGetAllOrdersQuery({ page: 1, limit: 5 });

  const COLUMNS = [
    { header: "Reference", accessor: "paymentReference" },
    { header: "Date", accessor: "createdAt" },
    { header: "Total Amount", accessor: "totalAmount" },
    { header: "Total Items", accessor: "totalItems" },
    { header: "Status", accessor: "status" },
  ];

  const formattedColumns = COLUMNS.map((col) => ({
    ...col,
    cell: (info) => {
      const [value, item] = [info.getValue(), info.row.original];
      return col.accessor === "status" ? (
        <StatusChip status={value} />
      ) : col.accessor === "createdAt" ? (
        formatDate(value).dateTime
      ) : col.accessor === "totalAmount" ? (
        formatCurrency(value, item.currency)
      ) : col.accessor === "totalItems" ? (
        item.products?.reduce((acc, prod) => acc + prod.quantity, 0)
      ) : (
        value || "--"
      );
    },
    enableSorting: false,
  }));

  return (
    <div>
      <div className="mb-6">
        <PageHeader title={`Hey ${user?.fullName || "--"}`} subtitle="What is happening today?" />
      </div>
      <section className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(STATS).map((key) => (
              <div key={key} className="p-5 rounded-xl bg-white shadow-sm space-y-5">
                {Object.entries(STATS[key]).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <p className={label === "chaptersAndRegions" ? "font-semibold" : "text-sm"}>
                      {convertToCapitalizedWords(label)}
                    </p>
                    <p className="font-semibold text-base">{value}</p>
                  </div>
                ))}
                {key === "members" && (
                  <Button
                    variant="outlined"
                    className="w-full"
                    label={`Go to ${key} list`}
                    onClick={() => navigate(`/${key}`)}
                  />
                )}
              </div>
            ))}
          </div>

          <section className="bg-white rounded-xl shadow-sm pt-6 mt-8">
            <div className="flex items-center justify-between gap-6 px-6 pb-6">
              <h3 className="font-bold text-base">Recent Orders</h3>
              <Link to="/payments/orders" className="font-semibold text-sm text-primary">
                See More
              </Link>
            </div>

            <Table
              tableData={orders?.items || []}
              tableColumns={formattedColumns}
              showPagination={false}
              loading={isLoadingOrders}
            />
          </section>
        </div>{" "}
        <div className="w-full lg:w-1/3 min-w-0 space-y-8">
          <div className="p-5 rounded-xl bg-white shadow-sm space-y-5">
            <h4 className="font-semibold text-base">{"Most Recent Devotional"}</h4>
            <p className="text-sm">
              {devotionals && devotionals[0] ? devotionals[0].keyVerseContent : "No devotional content available"}
            </p>
            <p className="text-sm text-gray">{devotionals && devotionals[0] ? `- ${devotionals[0].keyVerse}` : ""}</p>
            <Button
              variant="outlined"
              className="w-full"
              label={`Go to devotionals list`}
              onClick={() => navigate(`/others/devotionals`)}
            />
          </div>

          <div className="p-5 rounded-xl bg-white shadow-sm space-y-5">
            <h4 className="font-semibold text-base">{"Today's Events"}</h4>
            {isLoadingEvents ? (
              <div className="flex justify-center px-6 py-14">
                <Loading height={64} width={64} className="text-primary" />
              </div>
            ) : todayEvents?.items?.length ? (
              <>
                <ul className="space-y-3">
                  {todayEvents?.items?.map((evt, i) => (
                    <li
                      key={i}
                      className="bg-white border rounded-xl p-4 cursor-pointer"
                      onClick={() => navigate(`/events/${evt.slug}`)}
                    >
                      <p className="text-gray-dark text-xs mb-2 truncate flex items-center gap-2">
                        <span>{icons.clockCounter}</span> {formatDate(evt.eventDateTime).dateTime}
                      </p>
                      <h4 className="text-sm font-bold truncate">{evt.name}</h4>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outlined"
                  className="w-full"
                  label={`Go to Events list`}
                  onClick={() => navigate("events")}
                />
              </>
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
                  <p className=" text-sm text-gray-600 mb-6">There are currently no data to display for this table</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewPage;
