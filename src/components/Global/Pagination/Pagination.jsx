import { useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { classNames } from "~/utilities/classNames";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  showInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  size = "medium", // small, medium, large
  variant = "primary", // primary, secondary
  className = "",
}) => {
  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];

    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push("...");
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  // Calculate display info
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Size classes
  const sizeClasses = {
    small: {
      button: "px-2 py-1 text-xs min-w-[28px] h-7",
      info: "text-xs",
      gap: "gap-1",
    },
    medium: {
      button: "px-3 py-2 text-sm min-w-[36px] h-9",
      info: "text-sm",
      gap: "gap-2",
    },
    large: {
      button: "px-4 py-3 text-base min-w-[44px] h-11",
      info: "text-base",
      gap: "gap-3",
    },
  };

  // Color variant classes
  const variantClasses = {
    primary: {
      active: "bg-primary text-white border-primary",
      inactive: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
      disabled: "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
    },
    secondary: {
      active: "bg-primary text-white border-primary",
      inactive: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
      disabled: "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
    },
  };

  const handlePageClick = (page) => {
    if (page !== "..." && page !== currentPage && onPageChange) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage !== 1 && onPageChange) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage !== totalPages && onPageChange) {
      onPageChange(totalPages);
    }
  };

  if (totalPages <= 1) {
    return showInfo && totalItems > 0 ? (
      <div className={classNames("flex justify-center items-center py-3", className)}>
        <span className={classNames("text-gray-600", sizeClasses[size].info)}>
          Showing {startItem} to {endItem} of {totalItems} results
        </span>
      </div>
    ) : null;
  }

  return (
    <div className={classNames("flex flex-col sm:flex-row items-center justify-between gap-4 py-3", className)}>
      {/* Results info */}
      {showInfo && (
        <div className="flex items-center">
          <span className={classNames("text-gray-600", sizeClasses[size].info)}>
            Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span>{" "}
            of <span className="font-medium">{totalItems}</span> results
          </span>
        </div>
      )}

      {/* Pagination controls */}
      <div className={classNames("flex items-center", sizeClasses[size].gap)}>
        {/* First page button */}
        {showFirstLast && (
          <button
            onClick={handleFirst}
            disabled={currentPage === 1}
            className={classNames(
              "flex items-center justify-center border rounded-md transition-colors duration-200",
              sizeClasses[size].button,
              currentPage === 1 ? variantClasses[variant].disabled : variantClasses[variant].inactive
            )}
            aria-label="Go to first page"
          >
            <span className="text-xs">First</span>
          </button>
        )}

        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={classNames(
            "flex items-center justify-center border rounded-md transition-colors duration-200",
            sizeClasses[size].button,
            currentPage === 1 ? variantClasses[variant].disabled : variantClasses[variant].inactive
          )}
          aria-label="Go to previous page"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className={classNames("flex items-center", sizeClasses[size].gap)}>
          {pageNumbers.map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              disabled={page === "..."}
              className={classNames(
                "flex items-center justify-center border rounded-md transition-colors duration-200",
                sizeClasses[size].button,
                page === "..."
                  ? "cursor-default border-transparent"
                  : page === currentPage
                    ? variantClasses[variant].active
                    : variantClasses[variant].inactive
              )}
              aria-label={page === "..." ? "More pages" : `Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={classNames(
            "flex items-center justify-center border rounded-md transition-colors duration-200",
            sizeClasses[size].button,
            currentPage === totalPages ? variantClasses[variant].disabled : variantClasses[variant].inactive
          )}
          aria-label="Go to next page"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>

        {/* Last page button */}
        {showFirstLast && (
          <button
            onClick={handleLast}
            disabled={currentPage === totalPages}
            className={classNames(
              "flex items-center justify-center border rounded-md transition-colors duration-200",
              sizeClasses[size].button,
              currentPage === totalPages ? variantClasses[variant].disabled : variantClasses[variant].inactive
            )}
            aria-label="Go to last page"
          >
            <span className="text-xs">Last</span>
          </button>
        )}
      </div>
    </div>
  );
};

export { Pagination };
export default Pagination;
