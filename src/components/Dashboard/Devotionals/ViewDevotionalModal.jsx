import Button from "~/components/Global/Button/Button";
import Modal from "~/components/Global/Modal/Modal";
import convertToCapitalizedWords from "~/utilities/convertToCapitalizedWords";
import formatDate from "~/utilities/fomartDate";

const ViewDevotionalModal = ({ isOpen, onClose, onUpdate, devotional, onDelete }) => {
  const KEYS = ["title", "keyVerse", "keyVerseContent", "content", "prayerPoints", "scheduledFor"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Devotional Details" showCloseBtn>
      <div className="space-y-4 max-h-[440px] overflow-y-auto">
        {KEYS.map((key) => (
          <div key={key}>
            <h4 className="text-sm font-semibold">{convertToCapitalizedWords(key)}</h4>
            <p className="text-sm">
              {key === "scheduledFor"
                ? formatDate(devotional?.scheduledFor || devotional?.createdAt).dateTime
                : devotional?.[key]}
            </p>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4 border-t pt-4 mt-4">
        <Button label="Delete" variant="outlined" onClick={onDelete} />
        <Button label="Update" onClick={onUpdate} />
      </div>
    </Modal>
  );
};

export default ViewDevotionalModal;
