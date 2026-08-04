import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Button from "~/components/Global/Button/Button";
import Select from "~/components/Global/FormElements/Select/Select";
import TextArea from "~/components/Global/FormElements/TextArea/TextArea";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import RadioGroup from "~/components/Global/FormElements/RadioGroup/RadioGroup";
import Switch from "~/components/Global/FormElements/Switch/Switch";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import Modal from "~/components/Global/Modal/Modal";
import Checkbox from "~/components/Global/FormElements/Checkbox/Checkbox";
import ConfirmationModal from "~/components/Global/ConfirmationModal/ConfirmationModal";
import icons from "~/assets/js/icons";
import Dropdown from "~/components/Global/Dropdown/DropDown";
import StepperWizard from "~/components/Global/StepperWizard/StepperWizard";
import FileUploader from "~/components/Global/FormElements/FileUploader/FileUploader";
import Table from "~/components/Global/Table/Table";
import OTPInput from "~/components/Global/FormElements/OTPInput/OTPInput";

const WelcomePage = () => {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm({ mode: "all" });

  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  const [openModal, setOpenModal] = useState(false);

  const STEPS = [
    {
      label: "First",
      component: (props) => (
        <h2 className="text-2xl p-28 bg-gray-100 grid grid-cols-2 gap-4">
          <span className="col-span-2"> First</span>
          <Button variant="outlined" onClick={props.onPrev}>
            Prev
          </Button>
          <Button onClick={props.onNext}>Next</Button>
        </h2>
      ),
    },
    {
      label: "Second",
      component: (props) => (
        <h2 className="w-full text-2xl p-28 bg-green-100 grid grid-cols-2 gap-4">
          <span className="col-span-2"> Second</span>
          <Button variant="outlined" onClick={props.onPrev}>
            Prev
          </Button>
          <Button onClick={props.onNext}>Next</Button>
        </h2>
      ),
    },
    {
      label: "Third",
      component: (props) => (
        <h2 className="text-2xl p-28 bg-yellow-100 grid grid-cols-2 gap-4">
          <span className="col-span-2"> Third</span>
          <Button variant="outlined" onClick={props.onPrev}>
            Prev
          </Button>
          <Button onClick={props.onNext}>Next</Button>
        </h2>
      ),
    },
  ];

  const [posts, setPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://blog-admin.wetalksound.co/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}&_fields=id,title,slug,categories,date,modified,status`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPosts(data);
        // Access pagination information from the response headers
        const totalPagesHeader = response.headers.get("x-wp-totalpages");
        const totalItemsHeader = response.headers.get("x-wp-total");
        // Update state with pagination information
        setTotalPages(+totalPagesHeader);
        setTotalItems(+totalItemsHeader);
      } catch (error) {
        console.error("Error fetching WordPress posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, perPage]);

  useEffect(() => {
    console.log({ selectedPosts });
  }, [selectedPosts]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [confirm, setConfirm] = useState(false);

  const COLUMNS = [
    { header: "ID", accessor: "id" },
    { header: "Title", accessor: "title.rendered" },
    { header: "Categories", accessor: "categories" },
    { header: "Slug", accessor: "slug" },
    { header: "Date Created", accessor: "date" },
    { header: "Status", accessor: "status" },
    { header: "Date Modified", accessor: "modified" },
    { header: "Action", accessor: "action" },
  ];
  const tableColumns = COLUMNS.map((col) => ({
    ...col,
    enableSorting: col.accessor === "action" ? false : true,
    cell: (info) => {
      const value = info.getValue();
      return col.accessor === "title.rendered" ? (
        value.slice(0, 25) + "..."
      ) : col.accessor === "slug" ? (
        value.slice(0, 15) + "..."
      ) : col.accessor === "categories" ? (
        value.join(", ")
      ) : col.accessor === "date" ? (
        new Date(value).toDateString()
      ) : col.accessor === "modified" ? (
        new Date(value).toDateString()
      ) : col.accessor === "status" ? (
        <span className={"capitalize " + (value === "publish" ? "text-green-600" : "text-error")}>{value}</span>
      ) : col.accessor === "action" ? (
        <Dropdown
          toggleElement={
            <div className="text-center">
              <button className="p-2 rounded-full bg-onPrimary">{icons.verticalDots}</button>
            </div>
          }
        >
          <div className="flex h-max w-max flex-col justify-start rounded-lg bg-white bg-cover bg-no-repeat py-2 shadow-xl">
            <ul>
              {[1, 2, 3].map((x) => (
                <li
                  key={x}
                  className="border-b last:border-0 py-2 px-6 text-xs font-medium cursor-pointer"
                  onClick={() => alert("Action " + x + " for  post - " + info.row.original.id)}
                >
                  Action Handler {x}
                </li>
              ))}
            </ul>
          </div>
        </Dropdown>
      ) : (
        value || "---"
      );
    },
  }));

  return (
    <div>
      <ConfirmationModal
        icon={icons.check}
        title="Account"
        subtitle={`Your account has been successfully updated`}
        subAction={() => {}}
        actionsFlex="flex-col-reverse"
        maxWidth={400}
        mainAction={() => setConfirm(false)}
        mainActionText="Go Back"
        isOpen={confirm}
        onClose={() => setConfirm(false)}
      />

      <div className="p-10 gap-8 flex flex-col justify-center items-center">
        <Button onClick={() => setOpenModal(true)}>Open Modal</Button>

        <Button variant="outlined" onClick={() => setConfirm(true)}>
          Open Confirm
        </Button>

        <Button dense label="Outlined Button" variant="outlined" loading loadingText="Processing..." />

        <Button label="Filled Button" loading loadingText="Sending..." />

        <Button dense onClick={() => toast.error("An error occurred")}>
          Toast
        </Button>

        <Dropdown toggleElement={<span>Dropdown</span>}>
          <div className="flex h-max w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat pb-4 shadow-xl">
            <div className="mt-3 ml-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-navy-700 dark:text-white">👋 Hey, Adela</p>{" "}
              </div>
            </div>
            <div className="mt-3 h-px w-full bg-gray-200 dark:bg-white/20 " />

            <div className="mt-3 ml-4 flex flex-col">
              <a href=" " className="text-sm text-gray-800 dark:text-white hover:dark:text-white">
                Profile Settings
              </a>
              <a href=" " className="mt-3 text-sm text-gray-800 dark:text-white hover:dark:text-white">
                Newsletter Settings
              </a>
              <a href=" " className="mt-3 text-sm font-medium text-red-500 hover:text-red-500">
                Log Out
              </a>
            </div>
          </div>
        </Dropdown>

        <div className="w-3/5 flex justify-between">
          <Link to="/login">Login</Link>
          <Dropdown toggleElement={<span>Toggle Dropdown</span>}>
            <div className="flex h-max w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat pb-4 shadow-xl">
              <div className="mt-3 ml-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">👋 Hey, Adela</p>{" "}
                </div>
              </div>
              <div className="mt-3 h-px w-full bg-gray-200 dark:bg-white/20 " />

              <div className="mt-3 ml-4 flex flex-col">
                <a href=" " className="text-sm text-gray-800 dark:text-white hover:dark:text-white">
                  Profile Settings
                </a>
                <a href=" " className="mt-3 text-sm text-gray-800 dark:text-white hover:dark:text-white">
                  Newsletter Settings
                </a>
                <a href=" " className="mt-3 text-sm font-medium text-red-500 hover:text-red-500">
                  Log Out
                </a>
              </div>
            </div>
          </Dropdown>
        </div>
        <div className="flex justify-center p-4"></div>

        <div className="w-1/2">
          <Checkbox
            label="itemCheck"
            control={control}
            activeText="Disabled"
            inActiveText="Disabled"
            register={register}
          />
        </div>

        <form onSubmit={handleSubmit(console.log)} className="w-4/5 flex flex-wrap gap-4">
          <div className="w-1/2">
            <Select
              label="selectOption"
              control={control}
              options={options}
              errors={errors}
              multiple={true}
              required={"Please select an item"}
            />
          </div>
          <div className="w-1/2">
            <TextInput label="tolaDev" required={false} register={register} errors={errors} placeholder="Enter name" />
          </div>
          <div className="w-1/2">
            <TextInput
              type="password"
              label="password"
              required={false}
              register={register}
              errors={errors}
              placeholder="Enter password"
            />
          </div>
          <div className="w-1/2">
            <TextArea
              label="additionalComment"
              register={register}
              control={control}
              errors={errors}
              placeholder="Enter comment..."
              required={"Comment is required"}
            />
          </div>

          <div className="w-1/2">
            <Switch label="item" control={control} register={register} />
          </div>
          <div>
            <RadioGroup
              label="chooseGender"
              control={control}
              register={register}
              required="Please select one"
              errors={errors}
              options={options}
            />
          </div>
          <div className="w-full">
            <FileUploader label="uploadFile" register={register} errors={errors} setValue={setValue} />
          </div>
          <div>
            <Button label="Submit" type="submit" />
            <Button label="Submit" type="submit" variant="text" className="bg-transparent text-white" />
          </div>
        </form>
        <div className="w-2/3">
          <SearchBar />
        </div>

        <Modal isOpen={openModal} className="max-w-3xl" onClose={() => setOpenModal(false)}>
          <form className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <h2 className="text-primary font-bold text-3xl">Registration Form</h2>
            </div>
            <TextInput label="firstName" register={register} errors={errors} />
            <TextInput label="lastName" register={register} errors={errors} />
            <TextInput type="date" label="dateOfBirth" register={register} errors={errors} />
            <TextInput label="address" register={register} errors={errors} />
            <TextInput label="phoneNumber" register={register} errors={errors} />
            <TextInput label="website" register={register} errors={errors} />
            <Button variant="outlined" label="Cancel" onClick={() => setOpenModal(false)} />
            <Button label="Register" onClick={() => setOpenModal(false)} />
          </form>
        </Modal>
      </div>

      <div className="w-4/5 my-30 px-10 py-10">
        <h4 className="text-center mb-3">Enter OTP</h4>
        <OTPInput length={4} onComplete={(otp) => alert("Entered ==> " + otp)} />
      </div>

      <div className="w-full mx-auto shadow-md mb-6">
        <StepperWizard steps={STEPS} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      </div>

      <div className="w-full my-12 p-8">
        <Table
          tableColumns={tableColumns}
          tableData={posts}
          loading={loading}
          serverSidePagination={true}
          currentPage={page}
          perPage={perPage}
          totalPageCount={totalPages}
          totalItemsCount={totalItems}
          enableRowSelection
          onRowSelect={setSelectedPosts}
          onPaginationChange={({ currentPage, perPage }) => {
            setPage(currentPage);
            setPerPage(perPage);
          }}
        />
      </div>
    </div>
  );
};

export default WelcomePage;
