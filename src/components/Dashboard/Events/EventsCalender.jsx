import icons from "~/assets/js/icons";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const EventsCalender = ({ showNotifications = true }) => {
  const [value, onChange] = useState(new Date());
  return (
    <div className="sticky top-0">
      <div className="bg-white rounded-xl p-4 h-80 shadow event-calender">
        <Calendar onChange={onChange} value={value} className="w-full h-full" />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Today, 8</h3>
        <ul className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <li key={i} className="bg-white border rounded-xl p-4 space-y-4">
              <div>
                <p className="text-gray-dark text-xs mb-2 truncate flex items-center gap-2">
                  <span>{icons.clockCounter}</span> 10:00 AM - 10:30AM
                </p>
                <h4 className="text-sm font-bold truncate">Medical Problems in West Africa</h4>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showNotifications && (
        <div className="mt-4">
          <div className="flex justify-between items-center text-sm mb-2 py-2">
            <p className="font-semibold text-[#333333] ">Notifications</p>
            <span className="text-primary font-medium underline underline-offset-2 cursor-pointer">See all</span>
          </div>

          <ul className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <li key={i} className=" p-1 gap-x-4 flex items-start">
                <span className="p-1 rounded-lg bg-onSecondary flex justify-center items-center text-2xl">
                  {icons.file}
                </span>
                <div>
                  <p className="text-[#1c1c1c] text-sm leading-5 ">New User Registered</p>
                  <p className="text-xs leading-4 text-[rgba(28,28,28,0.40)] mt-[2px]">59 minutes ago</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EventsCalender;
