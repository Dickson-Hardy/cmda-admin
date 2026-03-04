import { useMemo } from "react";
import { useGetAllChaptersQuery } from "~/redux/api/chaptersApi";

/**
 * Custom hook to fetch and format chapters from the API
 * @param {string} type - Chapter type: 'Student', 'Doctor', or 'GlobalNetwork'
 * @returns {Object} { chapters, isLoading, error }
 */
export const useChapters = (type) => {
  const { data, isLoading, error } = useGetAllChaptersQuery(
    { type },
    {
      refetchOnMountOrArgChange: true,
      skip: !type, // Skip query if no type provided
    }
  );

  const chapters = useMemo(() => {
    if (!data?.items) return [];
    
    return data.items.map((chapter) => ({
      label: chapter.name,
      value: chapter.name,
    }));
  }, [data]);

  return {
    chapters,
    isLoading,
    error,
    totalCount: data?.meta?.totalItems || 0,
  };
};

/**
 * Hook to get all chapters (no filtering)
 */
export const useAllChapters = () => {
  const { data, isLoading, error } = useGetAllChaptersQuery({}, {
    refetchOnMountOrArgChange: true,
  });

  const chapters = useMemo(() => {
    if (!data?.items) return [];
    
    return data.items.map((chapter) => ({
      label: chapter.name,
      value: chapter.name,
      type: chapter.type,
    }));
  }, [data]);

  return {
    chapters,
    isLoading,
    error,
    totalCount: data?.meta?.totalItems || 0,
  };
};
