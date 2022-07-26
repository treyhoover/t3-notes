import { useSession } from "next-auth/react";
import { trpc } from "~/utils/trpc";

export const useNotes = () => {
  const session = useSession();
  const utils = trpc.proxy.useContext();

  const getNotesQuery = trpc.proxy.notes.getNotes.useQuery(undefined, {
    enabled: session.status === "authenticated",
  });

  const createNoteMutation = trpc.proxy.notes.createNote.useMutation({
    onMutate: (note) => {
      const prevNotes = utils.notes.getNotes.getData() ?? [];
      const nextNotes = [...prevNotes, note];

      utils.notes.getNotes.setData(nextNotes);

      return prevNotes;
    },
    onSuccess: (response, input) => {
      const prevNotes = utils.notes.getNotes.getData() ?? [];
      const nextNotes = prevNotes.map((note) => {
        if (note.id !== input.id) return note;

        return response;
      });

      utils.notes.getNotes.setData(nextNotes);
    },
    onError: (err, input, ctx) => {
      utils.notes.getNotes.setData(ctx ?? []);
    },
  });

  const updateNoteMutation = trpc.proxy.notes.updateNote.useMutation({
    onMutate: (update) => {
      const prevNotes = utils.notes.getNotes.getData() ?? [];
      const nextNotes = prevNotes.map((note) => {
        if (note.id !== update.id) return note;

        return {
          ...note,
          ...update,
        };
      });

      utils.notes.getNotes.setData(nextNotes);

      return prevNotes;
    },
    onError: (err, input, ctx) => {
      utils.notes.getNotes.setData(ctx ?? []);
    },
  });

  const deleteNoteMutation = trpc.proxy.notes.deleteNote.useMutation({
    onMutate: ({ id }) => {
      const prevNotes = utils.notes.getNotes.getData() ?? [];
      const nextNotes = prevNotes.filter((n) => n.id !== id);

      utils.notes.getNotes.setData(nextNotes);

      return prevNotes;
    },
    onError: (err, input, ctx) => {
      utils.notes.getNotes.setData(ctx ?? []);
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
