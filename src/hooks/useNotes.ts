import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";

export const useNotes = () => {
  const session = useSession();
  const { getQueryData, setQueryData } = trpc.useContext();

  const getNotesQuery = trpc.useQuery(["note.getNotes"], {
    enabled: session.status === "authenticated",
  });

  const createNoteMutation = trpc.useMutation(["note.createNote"], {
    onMutate: (note) => {
      const prevNotes = getQueryData(["note.getNotes"]) ?? [];
      const nextNotes = [...prevNotes, note];

      setQueryData(["note.getNotes"], nextNotes);

      return prevNotes;
    },
    onSuccess: (response, input) => {
      const prevNotes = getQueryData(["note.getNotes"]) ?? [];
      const nextNotes = prevNotes.map((note) => {
        if (note.id !== input.id) return note;

        return response;
      });

      setQueryData(["note.getNotes"], nextNotes);
    },
    onError: (err, input, ctx) => {
      setQueryData(["note.getNotes"], ctx ?? []);
    },
  });
  const updateNoteMutation = trpc.useMutation(["note.updateNote"], {
    onMutate: (update) => {
      const prevNotes = getQueryData(["note.getNotes"]) ?? [];
      const nextNotes = prevNotes.map((note) => {
        if (note.id !== update.id) return note;

        return {
          ...note,
          ...update,
        };
      });

      setQueryData(["note.getNotes"], nextNotes);

      return prevNotes;
    },
    onError: (err, input, ctx) => {
      setQueryData(["note.getNotes"], ctx ?? []);
    },
  });

  const deleteNoteMutation = trpc.useMutation(["note.deleteNote"], {
    onMutate: ({ id }) => {
      const prevNotes = getQueryData(["note.getNotes"]) ?? [];
      const nextNotes = prevNotes.filter((n) => n.id !== id);

      setQueryData(["note.getNotes"], nextNotes);

      return prevNotes;
    },
    onError: (err, input, ctx) => {
      setQueryData(["note.getNotes"], ctx ?? []);
    },
  });

  return {
    isLoading: getNotesQuery.isLoading,
    data: getNotesQuery.data,
    create: createNoteMutation.mutate,
    update: updateNoteMutation.mutate,
    delete: deleteNoteMutation.mutate,
  };
};
