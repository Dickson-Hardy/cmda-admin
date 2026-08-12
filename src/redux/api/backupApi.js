import { api } from "./api";

export const backupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createBackup: builder.mutation({
      query: () => ({
        url: "/backup/create",
        method: "POST",
      }),
    }),
    listBackups: builder.query({
      query: () => "/backup/list",
    }),
    downloadBackup: builder.query({
      query: (filename) => ({
        url: `/backup/download/${filename}`,
        responseHandler: (response) => response.blob(),
      }),
    }),
    deleteBackup: builder.mutation({
      query: (filename) => ({
        url: `/backup/${filename}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { 
  useCreateBackupMutation, 
  useListBackupsQuery, 
  useDownloadBackupQuery,
  useLazyDownloadBackupQuery,
  useDeleteBackupMutation 
} = backupApi;
