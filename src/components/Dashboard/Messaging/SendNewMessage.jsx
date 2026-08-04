import { useEffect, useState } from "react";
import icons from "~/assets/js/icons";
import Button from "~/components/Global/Button/Button";
import Modal from "~/components/Global/Modal/Modal";
import ContactListItem from "./ContactListItem";
import Loading from "~/components/Global/Loading/Loading";
import SearchBar from "~/components/Global/SearchBar/SearchBar";
import { useGetAllMembersQuery } from "~/redux/api/membersApi";
import Chip from "~/components/Global/Chip/Chip";
import { classNames } from "~/utilities/classNames";
import Select from "~/components/Global/FormElements/Select/Select";
import { useForm } from "react-hook-form";
import { doctorsRegionLists, globalRegionsData, studentChapterOptions } from "~/constants/regions";
import TextArea from "~/components/Global/FormElements/TextArea/TextArea";
import MiniPagination from "~/components/Global/MiniPagination/MiniPagination";
import { useBroadcastMessageMutation } from "~/redux/api/chatsApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SendNewMessage = ({ refetchContacts }) => {
  const [openModal, setOpenModal] = useState(false);
  const [searchBy, setSearchBy] = useState("");
  const ROLES = ["Student", "Doctor", "GlobalNetwork"];
  const [perPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");

  const handleSelectRole = (role) => {
    if (selectedRole === role) {
      setSelectedRole("");
    } else {
      setSelectedRole(role);
    }
  };

  const { control, watch, setValue, register, getValues } = useForm();

  useEffect(() => {
    setValue("region", null);
  }, [selectedRole, setValue]);

  const {
    data: allUsers,
    isLoading: loadingUsers,
    isFetching,
  } = useGetAllMembersQuery(
    { page: currentPage, limit: perPage, role: selectedRole, region: watch("region"), searchBy },
    { refetchOnMountOrArgChange: true }
  );

  const [broadcastMessage, { isLoading: isSending }] = useBroadcastMessageMutation();
  const navigate = useNavigate();

  const handleSend = async () => {
    try {
      await broadcastMessage({
        receiverCriteria: { role: selectedRole, region: getValues("region"), searchBy },
        content: getValues("message"),
      }).unwrap();
      navigate("/messaging");
      setValue("message", null);
      setOpenModal(false);
      await refetchContacts();
      toast.success("Broadcast message sent");
    } catch (error) {
      toast.error(error?.data?.message || "Broadcast could not be sent. Please try again.");
    }
  };

  return (
    <>
      <Button icon={icons.pencil} label="New" onClick={() => setOpenModal(true)} />

      <Modal isOpen={openModal} title="Send Broadcast Message" maxWidth={500} onClose={() => setOpenModal(false)}>
        {/* search bar */}
        <SearchBar onSearch={setSearchBy} className="w-full" />

        <div className="flex flex-wrap gap-2 my-2.5">
          {ROLES.map((role) => (
            <Chip
              key={role}
              label={role}
              variant={selectedRole.includes(role) ? "filled" : "outlined"}
              color={"primary"}
              onClick={() => handleSelectRole(role)}
            />
          ))}
        </div>

        <Select
          showTitleLabel={false}
          label="region"
          placeholder="Select Chapter/Region..."
          control={control}
          options={
            selectedRole === "Student"
              ? studentChapterOptions
              : selectedRole === "Doctor"
                ? doctorsRegionLists
                : selectedRole === "GlobalNetwork"
                  ? globalRegionsData
                  : []
          }
          required={false}
          errors={{}}
        />

        <div className="divide-y mt-4 h-64 overflow-y-auto">
          {isFetching || loadingUsers ? (
            <div className="flex w-full h-full justify-center items-center">
              <Loading />
            </div>
          ) : allUsers?.items?.length ? (
            <>
              <div className="text-right text-xs pb-2 font-semibold">{allUsers?.meta?.totalItems} Members</div>
              {allUsers?.items.map((user) => (
                <div key={user._id} className="flex items-center gap-4 w-full">
                  <div className="truncate">
                    <ContactListItem asHeader name={user.fullName} image={user?.avatarUrl} subText={user?.region} />
                  </div>
                  <span
                    className={classNames(
                      "inline-flex ml-auto capitalize px-4 py-2 rounded text-xs font-medium",
                      user.role === "Student"
                        ? "bg-onPrimaryContainer text-primary"
                        : user.role === "Doctor"
                          ? "bg-onSecondaryContainer text-secondary"
                          : "bg-onTertiaryContainer text-tertiary"
                    )}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
              <MiniPagination
                itemsPerPage={perPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalItems={allUsers?.meta?.totalItems}
                totalPages={allUsers?.meta?.totalPages}
              />
            </>
          ) : (
            <div className="px-6 py-10 flex justify-center">
              <div className="w-full max-w-[360px] text-center">
                <span
                  className={classNames(
                    "flex items-center justify-center text-primary text-3xl",
                    "size-14 mx-auto rounded-full bg-onPrimaryContainer"
                  )}
                >
                  {icons.person}
                </span>
                <h3 className="font-bold text-primary mb-1 text-lg mt-2">No Matching Member</h3>
                <p className=" text-sm text-gray-600 mb-6">
                  There are currently no member matching the filter criteria above
                </p>
              </div>
            </div>
          )}
        </div>

        {allUsers?.items?.length ? (
          <div className="pt-2">
            <TextArea
              label="message"
              register={register}
              errors={{}}
              placeholder="Enter message to send to all members matching the search criteria above"
            />
            <Button
              className="w-full mt-3"
              large
              label="Send Broadcast Message"
              disabled={!watch("message")}
              loading={isSending}
              onClick={handleSend}
            />
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default SendNewMessage;
