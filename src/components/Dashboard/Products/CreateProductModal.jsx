import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import icons from "~/assets/js/icons";
import Button from "~/components/Global/Button/Button";
import Select from "~/components/Global/FormElements/Select/Select";
import TextArea from "~/components/Global/FormElements/TextArea/TextArea";
import TextInput from "~/components/Global/FormElements/TextInput/TextInput";
import Modal from "~/components/Global/Modal/Modal";

const CreateProductModal = ({ isOpen, onClose, product, onSubmit, loading }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    control,
    reset,
  } = useForm({ mode: "all" });

  useEffect(() => {
    if (product) {
      ["name", "description", "price", "category", "stock", "brand"].forEach((key) => {
        setValue(key, product?.[key]);
      });
      setImage(product.featuredImageUrl);
    } else {
      reset();
      setImage(null);
    }
  }, [product, setValue, reset]);

  const [featuredImage, setFeaturedImage] = useState();
  const [image, setImage] = useState(null);

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

  const preSubmit = (payload) => {
    if (!product && !featuredImage) return toast.error("Featured image is required");
    onSubmit({ ...payload, featuredImage });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Edit Product" : "Create Product"}
      maxWidth={640}
      showCloseBtn
    >
      <form onSubmit={handleSubmit(preSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <p className="text-sm font-semibold mb-1">
            Featured Image <span className="text-error">*</span>
          </p>
          <div className="inline-block">
            <label htmlFor="image" className="text-primary text-sm font-medium underline cursor-pointer">
              {image ? (
                <img src={image} alt="" className="size-40 rounded-xl" />
              ) : (
                <span className="size-40 bg-onPrimary rounded-xl inline-flex items-center justify-center text-5xl text-primary">
                  {icons.image}
                </span>
              )}
            </label>
            <input type="file" accept="image/*" hidden id="image" name="image" onChange={handlePreview} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <TextInput label="name" register={register} required errors={errors} />
        </div>
        <div className="sm:col-span-2">
          <TextArea label="description" register={register} required errors={errors} rows={3} />
        </div>
        <TextInput label="price" type="number" register={register} required errors={errors} />
        <Select
          label="category"
          control={control}
          required
          errors={errors}
          options={["Book", "CD", "Fashion", "Others"].map((x) => ({ label: x, value: x }))}
        />
        <TextInput
          title="Available Quantity"
          label="stock"
          type="number"
          register={register}
          required
          errors={errors}
        />
        <TextInput label="brand" register={register} required errors={errors} />
        <div className="hidden sm:block" />
        <Button label="Submit" type="submit" loading={loading} className="mt-2" />
      </form>
    </Modal>
  );
};

export default CreateProductModal;
