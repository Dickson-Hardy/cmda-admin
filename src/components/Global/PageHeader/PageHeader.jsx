import icons from "~/assets/js/icons";
import Button from "../Button/Button";

const PageHeader = ({ title, subtitle, action, actionIcon, actionLabel }) => {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
      <div className="min-w-0">
        <h2 className="font-bold text-lg">{title}</h2>
        {subtitle && <p className="text-gray text-sm">{subtitle}</p>}
      </div>
      {action && (
        <Button className="w-full sm:w-auto" icon={actionIcon || icons.plus} label={actionLabel} onClick={action} />
      )}
    </header>
  );
};

export default PageHeader;
