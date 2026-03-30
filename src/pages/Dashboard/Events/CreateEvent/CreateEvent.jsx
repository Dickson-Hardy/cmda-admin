import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import BackButton from "~/components/Global/BackButton/BackButton";
import Button from "~/components/Global/Button/Button";
import Select from "~/components/Global/FormElements/Select/Select";
import TextArea from "~/components/Global/FormElements/TextArea/TextArea";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import DynamicPaymentPlans from "~/components/Global/FormElements/DynamicPaymentPlans.jsx";
import { useCreateEventMutation, useGetEventBySlugQuery, useUpdateEventBySlugMutation } from "~/redux/api/eventsApi";
import { conferenceTypes, conferenceZones, conferenceRegions, memberGroups } from "~/constants/conferences";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const { data: evt } = useGetEventBySlugQuery(slug, { skip: !slug });
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventBySlugMutation();

  const methods = useForm({
    mode: "all",
    defaultValues: {
      name: evt?.name,
      description: evt?.description,
      linkOrLocation: evt?.linkOrLocation,
      externalUrl: evt?.externalUrl,
      eventType: evt?.eventType,
      eventTags: evt?.eventTags,
      membersGroup: evt?.membersGroup,
      eventDateTime: evt?.eventDateTime?.slice(0, 16),
      additionalInformation: evt?.additionalInformation,
      paymentPlans: evt?.paymentPlans?.reduce((acc, { role, price, registrationPeriod }) => {
        const key = registrationPeriod ? `${role}_${registrationPeriod}` : role;
        acc[key] = +price;
        return acc;
      }, {}),
      // Conference fields
      isConference: evt?.isConference || false,
      conferenceType: evt?.conferenceConfig?.conferenceType,
      conferenceZone: evt?.conferenceConfig?.zone,
      conferenceRegion: evt?.conferenceConfig?.region,
      regularRegistrationEndDate: evt?.conferenceConfig?.regularRegistrationEndDate?.slice(0, 16),
      lateRegistrationEndDate: evt?.conferenceConfig?.lateRegistrationEndDate?.slice(0, 16),
      paystackSplitCode: evt?.conferenceConfig?.paystackSplitCode,
      usePayPalForGlobal: evt?.conferenceConfig?.usePayPalForGlobal || false,
      requiresSubscription: evt?.requiresSubscription !== false,
      // Virtual meeting info
      virtualMeetingPlatform: evt?.virtualMeetingInfo?.platform,
      virtualMeetingLink: evt?.virtualMeetingInfo?.meetingLink,
      virtualMeetingId: evt?.virtualMeetingInfo?.meetingId,
      virtualMeetingPasscode: evt?.virtualMeetingInfo?.passcode,
      virtualMeetingDialIn: evt?.virtualMeetingInfo?.dialInNumbers,
      virtualMeetingInstructions: evt?.virtualMeetingInfo?.additionalInstructions,
      isExternalProgram: false,
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    watch,
  } = methods;

  useEffect(() => {
    if (slug && evt) {
      setImage(evt.featuredImageUrl);
    }
  }, [evt, slug]);
  const [featuredImage, setFeaturedImage] = useState();
  const [image, setImage] = useState(null);

  // Watch form values to show/hide conditional fields
  const isConference = watch("isConference");
  const conferenceType = watch("conferenceType");
  const eventType = watch("eventType");
  const membersGroup = watch("membersGroup") || [];
  const useMultipleRegistrationPeriods = isConference && watch("isPaid");
  const isExternalProgram = watch("isExternalProgram");

  const handlePreview = (e) => {
    const file = e.target.files[0];
    setFeaturedImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.onabort = () => {};
    reader.onerror = (err) => console.log("Error: ", err);
    reader.readAsDataURL(file);
  };

  const onSubmit = (payload) => {
    if (payload.isExternalProgram) {
      payload = {
        ...payload,
        description: payload.description || payload.name || "External program",
        isConference: false,
        isPaid: false,
        paymentPlans: [],
        eventTags: payload.eventTags?.length ? payload.eventTags : ["Seminar"],
        membersGroup: payload.membersGroup?.length
          ? payload.membersGroup
          : ["Student", "Doctor_0_5_Years", "Doctor_Above_5_Years", "GlobalNetwork"],
        eventDateTime: payload.eventDateTime || new Date().toISOString(),
        additionalInformation: payload.additionalInformation || "External program",
        requiresSubscription: false,
      };
    }

    // Process payment plans for conferences
    let paymentPlans = [];
    const isPaid = payload.isPaid || false;

    if (isPaid && payload.paymentPlans) {
      if (useMultipleRegistrationPeriods) {
        // For conferences, handle regular and late registration plans
        paymentPlans = Object.entries(payload.paymentPlans).map(([key, value]) => {
          const [role, registrationPeriod] = key.includes("_") ? key.split("_") : [key, "Regular"];
          return { role, price: +value, registrationPeriod };
        });
      } else {
        // For regular events
        paymentPlans = Object.entries(payload.paymentPlans).map(([key, value]) => ({
          role: key,
          price: +value,
        }));
      }
    }

    // Clean up conference-specific fields based on conference type
    const cleanedPayload = { ...payload };

    // Only include conference fields if this is actually a conference
    if (cleanedPayload.isConference) {
      // Only include conferenceZone if it's a Zonal conference
      if (cleanedPayload.conferenceType !== "Zonal") {
        delete cleanedPayload.conferenceZone;
      }

      // Only include conferenceRegion if it's a Regional conference
      if (cleanedPayload.conferenceType !== "Regional") {
        delete cleanedPayload.conferenceRegion;
      }

      // Validate required fields based on conference type
      if (cleanedPayload.conferenceType === "Zonal" && !cleanedPayload.conferenceZone) {
        return toast.error("Conference zone is required for zonal conferences");
      }

      if (cleanedPayload.conferenceType === "Regional" && !cleanedPayload.conferenceRegion) {
        return toast.error("Conference region is required for regional conferences");
      }
    } else {
      // If not a conference, remove all conference-specific fields
      delete cleanedPayload.conferenceType;
      delete cleanedPayload.conferenceZone;
      delete cleanedPayload.conferenceRegion;
      delete cleanedPayload.regularRegistrationEndDate;
      delete cleanedPayload.lateRegistrationEndDate;
      delete cleanedPayload.paystackSplitCode;
      delete cleanedPayload.usePayPalForGlobal;
    }

    // Remove empty or undefined conference-specific fields
    Object.keys(cleanedPayload).forEach((key) => {
      if (
        key.startsWith("conference") ||
        key.includes("Registration") ||
        key === "paystackSplitCode" ||
        key === "usePayPalForGlobal"
      ) {
        if (cleanedPayload[key] === undefined || cleanedPayload[key] === null || cleanedPayload[key] === "") {
          delete cleanedPayload[key];
        }
      }
    });

    payload = {
      ...cleanedPayload,
      ...(!slug ? { featuredImage } : {}),
      isPaid,
      paymentPlans,
    };

    delete payload.isExternalProgram;

    // Debug: Log the final payload being sent
    console.log("Final payload being sent:", payload);

    const formData = new FormData();
    Object.entries(payload).forEach(([key, val]) => {
      // Skip undefined, null, or empty string values
      if (val === undefined || val === null || val === "") {
        return;
      }

      if (Array.isArray(val)) {
        if (key === "paymentPlans") {
          // Append each object in paymentPlans as a JSON string
          formData.append("paymentPlans", val.length ? JSON.stringify(val) : null);
        } else {
          // For other arrays, append each value individually with key[]
          val.forEach((v) => {
            formData.append(`${key}[]`, v);
          });
        }
      } else {
        formData.append(key, val);
      }
    });

    // Debug: Log the FormData entries
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    if (slug && evt) {
      updateEvent({ slug, body: formData })
        .unwrap()
        .then((res) => {
          toast.success("Event UPDATED ssuccessfully");
          navigate(`/events/${res.data.slug}`);
        });
    } else {
      if (!featuredImage) return toast.error("Featured image is required");
      createEvent(formData)
        .unwrap()
        .then((res) => {
          toast.success("Event CREATED ssuccessfully");
          navigate(`/events/${res.data.slug}`);
        });
    }
  };

  return (
    <div>
      <BackButton label="Back to Events List" to="/events" />{" "}
      <section className="bg-white rounded-2xl p-6 shadow mt-6">
        <h3 className="font-bold text-lg mb-4">
          {slug ? "Edit" : "Create"} {isConference ? "Conference" : "Event"}
        </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 gap-x-6">
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-1 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("isExternalProgram")}
                    className="form-checkbox h-4 w-4 text-primary"
                  />
                  <span className="font-medium">This is an External Program</span>
                </label>
                <span className="text-xs text-gray-600 ml-auto">
                  External mode disables conference and payment setup, but still allows audience and program settings.
                </span>
              </div>
            </div>

            {/* Conference Type Toggle */}
            <div className={`col-span-2 ${isExternalProgram ? "hidden" : ""}`}>
              <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register("isConference")} className="form-checkbox h-4 w-4 text-primary" />
                  <span className="font-medium">This is a Conference</span>
                </label>
              </div>
            </div>
            {/* Subscription Requirement Toggle */}
            <div className={`col-span-2 ${isExternalProgram ? "hidden" : ""}`}>
              <div className="flex items-center gap-4 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("requiresSubscription")}
                    className="form-checkbox h-4 w-4 text-primary"
                  />
                  <span className="font-medium">Require Active Subscription</span>
                </label>
                <span className="text-xs text-gray-600 ml-auto">
                  If checked, users must have an active subscription to register for this event
                </span>
              </div>
            </div>
            {/* Conference-specific fields */}
            {isConference && !isExternalProgram && (
              <>
                <Select
                  label="conferenceType"
                  title="Conference Type"
                  control={control}
                  options={conferenceTypes}
                  required={isConference}
                />

                {conferenceType === "Zonal" && (
                  <Select
                    label="conferenceZone"
                    title="Conference Zone"
                    control={control}
                    options={conferenceZones}
                    required={conferenceType === "Zonal"}
                  />
                )}

                {conferenceType === "Regional" && (
                  <Select
                    label="conferenceRegion"
                    title="Conference Region"
                    control={control}
                    options={conferenceRegions}
                    required={conferenceType === "Regional"}
                  />
                )}

                <TextInput
                  label="regularRegistrationEndDate"
                  title="Regular Registration End Date"
                  type="datetime-local"
                  register={register}
                  errors={errors}
                  required={isConference}
                />

                <TextInput
                  label="lateRegistrationEndDate"
                  title="Late Registration End Date"
                  type="datetime-local"
                  register={register}
                  errors={errors}
                  required={isConference}
                />

                <TextInput
                  label="paystackSplitCode"
                  title="Paystack Split Code (Optional)"
                  register={register}
                  errors={errors}
                  placeholder="SPL_xxxxxx"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("usePayPalForGlobal")}
                    className="form-checkbox h-4 w-4 text-primary"
                  />
                  <label className="text-sm font-medium">Use PayPal for Global Network</label>
                </div>
              </>
            )}
            <div className="col-span-2">
              <p className="text-sm font-semibold mb-1">
                Featured Image <span className="text-error">*</span>
              </p>
              <div className="inline-block">
                <label htmlFor="image" className="text-primary text-sm font-medium underline cursor-pointer">
                  {image ? (
                    <img src={image} alt="" className="h-40 w-auto rounded-xl" />
                  ) : (
                    <span className="h-40 w-60 bg-onPrimary rounded-xl inline-flex items-center justify-center text-5xl text-primary">
                      {icons.image}
                    </span>
                  )}
                </label>
                <input type="file" accept="image/*" hidden id="image" name="image" onChange={handlePreview} />
              </div>
            </div>
            <TextInput label="name" register={register} errors={errors} required divClassName="col-span-2" />
            {!isExternalProgram && (
              <TextArea label="description" register={register} errors={errors} divClassName="col-span-2" />
            )}
            <Select
              label="eventType"
              control={control}
              options={["Physical", "Virtual", "Hybrid"].map((v) => ({ label: v, value: v }))}
            />
            <TextInput
              label="linkOrLocation"
              title={eventType === "Physical" ? "Event Location" : "Event Link or Location"}
              register={register}
              errors={errors}
              required
            />
            <TextInput
              label="externalUrl"
              title="External URL (Optional)"
              register={register}
              errors={errors}
              placeholder="https://example.com"
            />
            <Select
              label="membersGroup"
              title="Member Groups"
              control={control}
              options={memberGroups}
              multiple
              required
            />
            <Select
              label="eventTags"
              control={control}
              options={["Webinar", "Seminar", "Conference", "Training"].map((v) => ({ label: v, value: v }))}
              multiple
            />

            {/* Dynamic Payment Plans Component */}
            {!isExternalProgram && (
              <DynamicPaymentPlans selectedMemberGroups={membersGroup} isConference={isConference} />
            )}
            <TextInput
              label="eventDateTime"
              title="Event Date & Time"
              type="datetime-local"
              register={register}
              errors={errors}
              required
            />

            {/* Virtual Meeting Info Section */}
            {!isExternalProgram && (watch("eventType") === "Virtual" || watch("eventType") === "Hybrid") && (
              <>
                <div className="col-span-2 mt-4 mb-2">
                  <h4 className="font-semibold text-base text-gray-700 border-b pb-2">Virtual Meeting Details</h4>
                  <p className="text-xs text-gray-500 mt-1">Provide structured meeting information for easy access</p>
                </div>
                <Select
                  label="virtualMeetingPlatform"
                  title="Meeting Platform"
                  control={control}
                  options={[
                    { label: "Zoom", value: "Zoom" },
                    { label: "Google Meet", value: "Google Meet" },
                    { label: "Microsoft Teams", value: "Microsoft Teams" },
                    { label: "Webex", value: "Webex" },
                    { label: "Other", value: "Other" },
                  ]}
                  required={false}
                />
                <TextInput
                  label="virtualMeetingLink"
                  title="Meeting Link"
                  register={register}
                  errors={errors}
                  placeholder="https://zoom.us/j/123456789"
                  required={false}
                />
                <TextInput
                  label="virtualMeetingId"
                  title="Meeting ID"
                  register={register}
                  errors={errors}
                  placeholder="123 456 789"
                  required={false}
                />
                <TextInput
                  label="virtualMeetingPasscode"
                  title="Passcode/Password"
                  register={register}
                  errors={errors}
                  placeholder="pass123"
                  required={false}
                />
                <TextInput
                  label="virtualMeetingDialIn"
                  title="Dial-In Numbers (Optional)"
                  register={register}
                  errors={errors}
                  placeholder="+1 234 567 8900"
                  required={false}
                  divClassName="col-span-2"
                />
                <TextArea
                  label="virtualMeetingInstructions"
                  title="Additional Instructions (Optional)"
                  register={register}
                  errors={errors}
                  placeholder="Please join 5 minutes early for audio check"
                  rows={2}
                  required={false}
                  divClassName="col-span-2"
                />
              </>
            )}
            <TextArea
              label="additionalInformation"
              errors={errors}
              register={register}
              rows={2}
              required={false}
              divClassName="col-span-2"
            />
            <div className="flex justify-end col-span-2">
              <Button
                label={slug ? "Save Changes" : "Submit"}
                type="submit"
                className="w-full md:w-1/3"
                large
                loading={isCreating || isUpdating}
              />
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
};

export default CreateEvent;
