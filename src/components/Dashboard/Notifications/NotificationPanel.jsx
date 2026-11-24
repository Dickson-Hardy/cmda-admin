import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import Button from "~/components/Global/Button/Button";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import TextArea from "~/components/Global/FormElements/TextArea/TextArea";
import Select from "~/components/Global/FormElements/Select/Select";
import { useSendAdminNotificationMutation } from "~/redux/api/adminNotificationsApi";
import { classNames } from "~/utilities/classNames";
import { studentChapterOptions, doctorsRegionLists, globalRegionsData } from "~/constants/regions";

const NOTIFICATION_TYPES = [
  { label: "Announcement", value: "announcement" },
  { label: "Event Reminder", value: "event_reminder" },
  { label: "Payment Reminder", value: "payment_reminder" },
  { label: "Custom", value: "custom" },
];

const TARGET_TYPES = [
  { label: "All Users", value: "all" },
  { label: "By Role", value: "role" },
  { label: "By Region", value: "region" },
  { label: "Specific User", value: "user" },
];

const ROLE_OPTIONS = [
  { label: "Student", value: "Student" },
  { label: "Doctor", value: "Doctor" },
  { label: "Global Network", value: "GlobalNetwork" },
];

// Combine all regions for the region dropdown
const ALL_REGIONS = [
  ...studentChapterOptions.map((r) => ({ label: r, value: r })),
  ...doctorsRegionLists.map((r) => ({ label: r, value: r })),
  ...globalRegionsData.map((r) => ({ label: r, value: r })),
];

const TITLE_MAX_LENGTH = 50;
const BODY_MAX_LENGTH = 200;

const NotificationPanel = ({ onSuccess }) => {
  const [sendNotification, { isLoading }] = useSendAdminNotificationMutation();
  const [enableScheduling, setEnableScheduling] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      title: "",
      body: "",
      type: "announcement",
      targetType: "all",
      targetValue: "",
      scheduledAt: "",
    },
  });

  const titleValue = watch("title") || "";
  const bodyValue = watch("body") || "";
  const targetType = watch("targetType");

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        body: data.body,
        type: data.type,
        targetType: data.targetType,
      };

      // Add targetValue if not targeting all users
      if (data.targetType !== "all" && data.targetValue) {
        payload.targetValue = data.targetValue;
      }

      // Add scheduled time if enabled
      if (enableScheduling && data.scheduledAt) {
        payload.scheduledAt = new Date(data.scheduledAt).toISOString();
      }

      await sendNotification(payload).unwrap();
      toast.success(
        enableScheduling && data.scheduledAt
          ? "Notification scheduled successfully"
          : "Notification sent successfully"
      );
      reset();
      setEnableScheduling(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send notification");
    }
  };

  // Get target value options based on target type
  const getTargetValueOptions = () => {
    switch (targetType) {
      case "role":
        return ROLE_OPTIONS;
      case "region":
        return ALL_REGIONS;
      default:
        return [];
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-bold text-lg">Send Push Notification</h3>
      <p className="text-sm text-muted mb-4">
        Compose a push notification and choose who receives it on the mobile app.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Notification Type */}
        <Select
          label="type"
          title="Notification Type"
          control={control}
          options={NOTIFICATION_TYPES}
          errors={errors}
          required
        />

        {/* Title with character count */}
        <div>
          <TextInput
            label="title"
            title="Title"
            register={register}
            errors={errors}
            required
            rules={{
              maxLength: {
                value: TITLE_MAX_LENGTH,
                message: `Title must be ${TITLE_MAX_LENGTH} characters or less`,
              },
            }}
            placeholder="Enter notification title"
          />
          <div className="flex justify-end mt-1">
            <span
              className={classNames(
                "text-xs",
                titleValue.length > TITLE_MAX_LENGTH ? "text-error" : "text-gray"
              )}
            >
              {titleValue.length}/{TITLE_MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* Body with character count */}
        <div>
          <TextArea
            label="body"
            title="Message Body"
            register={register}
            errors={errors}
            required
            rows={4}
            rules={{
              maxLength: {
                value: BODY_MAX_LENGTH,
                message: `Body must be ${BODY_MAX_LENGTH} characters or less`,
              },
            }}
            placeholder="Enter notification message"
          />
          <div className="flex justify-end mt-1">
            <span
              className={classNames(
                "text-xs",
                bodyValue.length > BODY_MAX_LENGTH ? "text-error" : "text-gray"
              )}
            >
              {bodyValue.length}/{BODY_MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* Target Type */}
        <Select
          label="targetType"
          title="Target Audience"
          control={control}
          options={TARGET_TYPES}
          errors={errors}
          required
        />

        {/* Target Value - shown when not targeting all users */}
        {targetType === "role" && (
          <Select
            label="targetValue"
            title="Select Role"
            control={control}
            options={getTargetValueOptions()}
            errors={errors}
            required="Please select a role"
          />
        )}

        {targetType === "region" && (
          <Select
            label="targetValue"
            title="Select Region"
            control={control}
            options={getTargetValueOptions()}
            errors={errors}
            required="Please select a region"
          />
        )}

        {targetType === "user" && (
          <TextInput
            label="targetValue"
            title="User ID or Email"
            register={register}
            errors={errors}
            required="Please enter a user ID or email"
            placeholder="Enter user ID or email"
          />
        )}

        {/* Scheduling Toggle */}
        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id="enableScheduling"
            checked={enableScheduling}
            onChange={(e) => setEnableScheduling(e.target.checked)}
            className="h-4 w-4 accent-primary cursor-pointer"
          />
          <label htmlFor="enableScheduling" className="text-sm font-medium cursor-pointer">
            Schedule for later
          </label>
        </div>

        {/* Scheduled Date/Time */}
        {enableScheduling && (
          <TextInput
            type="datetime-local"
            label="scheduledAt"
            title="Scheduled Date & Time"
            register={register}
            errors={errors}
            required={enableScheduling ? "Please select a date and time" : false}
            min={new Date().toISOString().slice(0, 16)}
          />
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            label={enableScheduling ? "Schedule Notification" : "Send Notification"}
            loading={isLoading}
            className="w-full sm:w-auto"
          />
        </div>
      </form>
    </div>
  );
};

export default NotificationPanel;
