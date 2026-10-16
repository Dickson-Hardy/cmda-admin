import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "~/components/Global/Button/Button";
import { Pagination } from "~/components/Global/Pagination/Pagination";
import { useGetAllConferencesQuery } from "~/redux/api/eventsApi";
import { formatEventAudience } from "~/utilities/formatEventAudience";
import { formatCurrency } from "~/utilities/formatCurrency";
import { formatDateTime } from "~/utilities/formatDateTime";
import { conferenceTypes, conferenceZones, conferenceRegions } from "~/constants/conferences";
import Select from "~/components/Global/FormElements/Select/Select";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import { useForm } from "react-hook-form";

const Conferences = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const { control, register, watch } = useForm();

  const searchBy = watch("searchBy");
  const conferenceType = watch("conferenceType");
  const zone = watch("zone");
  const region = watch("region");
  const membersGroup = watch("membersGroup");
  const { data: conferences, isLoading } = useGetAllConferencesQuery({
    page: currentPage,
    limit: 10,
    searchBy,
    conferenceType,
    zone,
    region,
    membersGroup,
  });

  const conferenceData = conferences?.items || [];
  const meta = conferences?.meta || {};

  const getConferenceTypeDisplay = (conf) => {
    const type = conf.conferenceConfig?.conferenceType;
    if (type === "Zonal") {
      return `${type} - ${conf.conferenceConfig?.zone}`;
    } else if (type === "Regional") {
      return `${type} - ${conf.conferenceConfig?.region}`;
    }
    return type || "Conference";
  };

  const getRegistrationStatus = (conf) => {
    if (!conf.conferenceConfig) return "N/A";

    const now = new Date();
    const regularEnd = new Date(conf.conferenceConfig.regularRegistrationEndDate);
    const lateEnd = new Date(conf.conferenceConfig.lateRegistrationEndDate);

    if (now <= regularEnd) {
      return { status: "Regular", color: "text-green-600" };
    } else if (now <= lateEnd) {
      return { status: "Late", color: "text-yellow-600" };
    } else {
      return { status: "Closed", color: "text-red-600" };
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-bold">Conferences Management</h2>
        <Button label="Create Conference" onClick={() => navigate("/events/create?type=conference")} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow mb-6">
        <h3 className="font-semibold text-lg mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextInput label="searchBy" title="Search" register={register} placeholder="Search conferences..." />

          <Select
            label="conferenceType"
            title="Conference Type"
            control={control}
            options={[{ label: "All Types", value: "" }, ...conferenceTypes]}
          />

          <Select
            label="zone"
            title="Zone"
            control={control}
            options={[{ label: "All Zones", value: "" }, ...conferenceZones]}
            disabled={conferenceType !== "Zonal"}
          />

          <Select
            label="region"
            title="Region"
            control={control}
            options={[{ label: "All Regions", value: "" }, ...conferenceRegions]}
            disabled={conferenceType !== "Regional"}
          />
        </div>
      </div>

      {/* Conference List */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Audience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    Loading conferences...
                  </td>
                </tr>
              ) : conferenceData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No conferences found
                  </td>
                </tr>
              ) : (
                conferenceData.map((conference) => {
                  const regStatus = getRegistrationStatus(conference);
                  return (
                    <tr key={conference._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={conference.featuredImageUrl}
                            alt={conference.name}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{conference.name}</div>
                            <div className="text-sm text-gray-500">{conference.eventType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getConferenceTypeDisplay(conference)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatEventAudience(conference.membersGroup)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDateTime(conference.eventDateTime)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-medium ${regStatus.color}`}>{regStatus.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {conference.isPaid ? (
                          <div>
                            <div className="text-green-600 font-medium">Paid</div>
                            {conference.paymentPlans.map((plan, idx) => (
                              <div key={idx} className="text-xs text-gray-500">
                                {plan.role}: {formatCurrency(plan.price, plan.role === "GlobalNetwork" ? "USD" : "NGN")}
                                {plan.registrationPeriod && ` (${plan.registrationPeriod})`}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-blue-600 font-medium">Free</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{conference.registeredUsers?.length || 0}</td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => navigate(`/events/${conference.slug}`)}
                          className="text-primary hover:text-primary-dark"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/events/create?slug=${conference.slug}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(`/events/${conference.slug}/stats`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Stats
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.totalPages}
              totalItems={meta.totalItems || 0}
              itemsPerPage={meta.itemsPerPage || 10}
              onPageChange={setCurrentPage}
              showInfo={true}
              showFirstLast={true}
              maxVisiblePages={5}
              size="medium"
              variant="primary"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Conferences;
