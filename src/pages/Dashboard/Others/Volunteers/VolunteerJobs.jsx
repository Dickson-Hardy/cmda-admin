import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import icons from "~/assets/js/icons";
import MiniPagination from "~/components/Global/MiniPagination/MiniPagination";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import { useGetAllVolunteerJobsQuery, useGetVolunteerJobStatsQuery } from "~/redux/api/volunteerApi";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";

const VolunteerJobs = () => {
  const navigate = useNavigate();
  const [perPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchBy, setSearchBy] = useState("");
  const { data: allVolunteerJobs } = useGetAllVolunteerJobsQuery({
    limit: perPage,
    page: currentPage,
    searchBy,
  });
  const { data: stats } = useGetVolunteerJobStatsQuery();

  const jobStats = useMemo(
    () => ({
      totalJobs: stats?.totalJobs,
      openJobs: stats?.totalOpen,
      closedJobs: stats?.totalClosed,
    }),
    [stats]
  );

  return (
    <div>
      <PageHeader
        title="Volunteer"
        subtitle="Manage all volunteer jobs"
        action={() => navigate("/others/jobs/create")}
        actionLabel="Add Job New"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {Object.entries(jobStats).map(([key, value]) => (
          <div key={key} className="p-4 bg-white border rounded-xl">
            <h4 className="uppercase text-xs font-medium text-gray mb-3">{convertToCapitalizedWords(key)}</h4>
            <p className="font-bold text-lg">{value || 0}</p>
          </div>
        ))}
      </div>

      <section className="my-8">
        <div className="flex justify-end mb-4">
          <SearchBar
            onSearch={(v) => {
              setSearchBy(v);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allVolunteerJobs?.items?.map((job) => (
            <Link key={job._id} to={`/others/jobs/${job._id}`}>
              <div className="rounded-xl border bg-white px-4 py-4 flex gap-4 items-center">
                <span className="size-24 bg-onPrimary rounded-xl flex-shrink-0 inline-flex items-center justify-center text-4xl text-primary">
                  {icons.briefcase}
                </span>
                <div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-3xl ${job.isActive ? "bg-success/20 text-success" : "bg-error/20 text-error"}`}
                  >
                    {job.isActive ? "Open" : "Closed"}
                  </span>
                  <h3 className="font-semibold text-sm truncate mt-2 mb-0.5">{job.title}</h3>
                  <p className="line-clamp-2 text-sm text-gray-600 mb-2">{job.description}</p>
                  <p className="text-xs text-gray-600 font-medium">
                    Created: <span className="text-black">{formatDate(job.createdAt).date}</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {allVolunteerJobs?.meta?.totalItems && (
          <MiniPagination
            itemsPerPage={perPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={allVolunteerJobs?.meta?.totalItems}
            totalPages={allVolunteerJobs?.meta?.totalPages}
          />
        )}
      </section>
    </div>
  );
};

export default VolunteerJobs;
