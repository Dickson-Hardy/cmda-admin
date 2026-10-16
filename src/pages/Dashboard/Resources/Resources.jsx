import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ItemCard from "~/components/Dashboard/ItemCard/ItemCard";
import Button from "~/components/Global/Button/Button";
import Select from "~/components/Global/FormElements/Select/Select";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import MiniPagination from "~/components/Global/MiniPagination/MiniPagination";
import Modal from "~/components/Global/Modal/Modal";
import PageHeader from "~/components/Global/PageHeader/PageHeader";
import { useCreateResourceMutation, useGetAllResourcesQuery, useGetResourceStatsQuery } from "~/redux/api/resourcesApi";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";

const Resources = () => {
  const [perPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: allResources } = useGetAllResourcesQuery({ limit: perPage, page: currentPage });
  const [createResource, { isLoading }] = useCreateResourceMutation();
  const { data: stats } = useGetResourceStatsQuery();

  const resourceStats = useMemo(
    () => ({
      total: stats?.totalResources,
      newsletters: stats?.totalNewsletters,
      articles: stats?.totalArticles,
      webinars: stats?.totalWebinars,
      others: stats?.totalOthers,
    }),
    [stats]
  );

  const [openCreate, setOpenCreate] = useState(false);
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" });

  const onSubmit = (payload) => {
    createResource(payload)
      .unwrap()
      .then(() => {
        setOpenCreate(false);
        toast.success("Resource created successfully");
      });
  };

  return (
    <div>
      <PageHeader
        title="Resources"
        subtitle="Manage all resources created from wordpress and youtube links"
        action={() => setOpenCreate(true)}
        actionLabel="Create Resource"
      />

      <div className="grid  sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {Object.entries(resourceStats).map(([key, value]) => (
          <div key={key} className="p-4 bg-white border rounded-xl">
            <h4 className="uppercase text-xs font-medium text-gray mb-3">{convertToCapitalizedWords(key)}</h4>
            <p className="font-bold text-lg">{value || 0}</p>
          </div>
        ))}
      </div>

      <section className="my-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {allResources?.items?.map((res) => (
            <Link key={res.slug} to={`/resources/${res.slug}`}>
              <ItemCard
                image={res?.featuredImage}
                title={res.title}
                category={res?.category}
                dateTime={formatDate(res.createdAt).date}
              />
            </Link>
          ))}
        </div>
        {allResources?.meta?.totalItems && (
          <MiniPagination
            itemsPerPage={perPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={allResources?.meta?.totalItems}
            totalPages={allResources?.meta?.totalPages}
          />
        )}
      </section>

      {/*  */}
      <Modal isOpen={openCreate} maxWidth={400} onClose={() => setOpenCreate(false)} title="Add New Resource">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Select
            options={["Article", "Newsletter", "Webinar", "Others"].map((x) => ({ label: x, value: x }))}
            label="category"
            control={control}
            errors={errors}
          />
          <TextInput label="sourceUrl" register={register} errors={errors} />
          <Button label="Create New Resource" loading={isLoading} large type="submit" className="w-full" />
        </form>
      </Modal>
    </div>
  );
};

export default Resources;
