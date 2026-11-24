import Modal from "~/components/Global/Modal/Modal";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";
import { formatCurrency } from "~/utilities/formatCurrency";

const ViewProductModal = ({ isOpen, onClose, product }) => {
  const KEYS = ["name", "slug", "description", "price", "stock", "brand", "createdAt", "sizes"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" showCloseBtn>
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {KEYS.map((key) => (
            <div key={key} className={["description", "name", "slug"].includes(key) ? "sm:col-span-2" : "col-span-1"}>
              <h4 className="text-xs font-semibold text-gray-600 uppercase mb-1">
                {key === "stock" ? "Available Quantity" : convertToCapitalizedWords(key)}
              </h4>
              <p className={`text-sm font-medium ${key === "name" ? "capitalize" : ""}`}>
                {key === "price"
                  ? formatCurrency(product?.[key])
                  : key === "createdAt"
                    ? formatDate(product?.[key]).dateTime
                    : key === "sizes"
                      ? product?.[key].join(", ") || "N/A"
                      : product?.[key] || "N/A"}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <h5 className="text-sm font-medium mb-1">Featured Image</h5>
            <img src={product?.featuredImageUrl} alt="" className="h-28 w-full rounded-xl" />
          </div>
          {product?.additionalImages?.map((x) => (
            <div key={x.name}>
              <h5 className="text-sm font-medium mb-1">{x.name}</h5>
              <img src={x?.imageUrl} alt="" className="h-28 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ViewProductModal;
