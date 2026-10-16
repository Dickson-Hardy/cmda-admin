import { useState } from "react";
import icons from "~/assets/js/icons";
import { classNames } from "~/utilities/classNames";

const SearchBar = ({
  placeholder = "Search...",
  className,
  onSearch = console.log, // function to handle the search, it contains inputValue as a params
}) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(inputValue);
      }}
      className={classNames("w-full min-w-0 max-w-md", className)}
    >
      <div className="relative w-full">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-500">
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="text"
          id="search-input"
          value={inputValue}
          className={classNames(
            "h-12 border border-gray-300 text-black placeholder:text-gray-400",
            "text-sm rounded-lg block w-full ps-8 pe-8 py-3 px-4",
            "focus:ring focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
          )}
          placeholder={placeholder}
          required={false}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              onSearch("");
            }}
            className="absolute inset-y-0 end-0 flex items-center pe-3 cursor-pointer text-gray-500"
          >
            {icons.close}
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
