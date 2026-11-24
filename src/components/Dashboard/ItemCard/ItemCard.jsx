import { classNames } from "~/utilities/classNames";

const ItemCard = ({ title, category, dateTime, extraText, image }) => {
  return (
    <div
      className={classNames(
        "bg-white border p-3 rounded-2xl flex flex-col gap-2",
        "overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300"
      )}
    >
      <img src={image} className="bg-onPrimary object-cover h-36 w-full rounded-2xl" />
      <div className="space-y-2 text-xs text-gray mt-2">
        <span className="px-2 py-1 text-tertiary font-medium bg-onTertiary rounded-3xl">{category}</span>
        <h4 className="text-sm font-bold text-ink truncate">{title}</h4>
        <p>{dateTime}</p>
        {extraText && <p className="truncate">{extraText}</p>}
      </div>
    </div>
  );
};

export default ItemCard;
