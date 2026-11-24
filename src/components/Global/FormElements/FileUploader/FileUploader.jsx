import { useEffect } from "react";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import { useFileUpload } from "~/hooks/useFileUpload";
import icons from "~/assets/js/icons";
import FormError from "../FormError";

const FileUploader = ({
  title,
  label, // important
  register, // important --> from useForm
  errors, // important --> from useForm
  setValue, // important --> from useForm
  allowedTypes = ["text/csv"], // array of upload file types allowed - CSV in this case
  allowedSize = 2, // size in MB
  placeholderText = "Supported type: .csv", // a text telling the user what file types the uploader accepts
  required,
}) => {
  const { handleBrowseFiles, handleDragOver, handleDrop, uploadedFile, setUploadedFile, errMsg } = useFileUpload({
    allowedTypes,
    allowedSize,
  });

  useEffect(() => {
    if (uploadedFile) {
      setValue(label, uploadedFile);
    }
  }, [uploadedFile, setValue, label]);

  return (
    <div>
      <label htmlFor={label} className="block mb-1 text-sm font-medium text-ink">
        {title || convertToCapitalizedWords(label)}
        {required ? <span className="text-error ml-px">*</span> : null}
      </label>
      <div
        className="w-full border-2 border-dashed border-gray text-center px-4 py-6 rounded-lg bg-onPrimary h-36 flex flex-col justify-center items-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {uploadedFile && uploadedFile.name ? (
          <>
            <div className="flex justify-center mb-2">
              <span className="text-2xl text-primary">
                {uploadedFile.type.includes("pdf")
                  ? icons.pdfAlt
                  : uploadedFile.type.includes("msword") || uploadedFile.type.includes("officedocument")
                    ? icons.doc
                    : icons.image}
              </span>
            </div>
            <div className="inline-flex items-center gap-4">
              <h4 className="text-sm font-medium">{uploadedFile.name}</h4>
              <button type="button" className="text-error" onClick={() => setUploadedFile(null)}>
                {icons.delete}
              </button>
            </div>
          </>
        ) : (
          <label htmlFor={label} className="flex flex-col items-center gap-2 cursor-pointer">
            <span className="text-2xl animate-pulse text-primary bg-primary/10 p-3 rounded-full">{icons.file}</span>
            <div className="text-xs text-gray-dark">
              <p className="font-medium mb-0.5">
                Drag & drop file here or <span className="text-primary">click to browse ({allowedSize}MB Max)</span>
              </p>
              <p>{placeholderText}</p>
            </div>
          </label>
        )}
      </div>
      <input
        type="file"
        id={label}
        {...register(label, {
          required: required ? "This field is required." : false,
        })}
        accept={allowedTypes.join(", ")}
        onChange={handleBrowseFiles}
        style={{ display: "none" }}
      />
      <FormError error={errors?.[label]?.message || errMsg} />
    </div>
  );
};

export default FileUploader;
