import { PlusSmIcon } from "@heroicons/react/outline";
import { useSession } from "next-auth/react";
import { useMemo, useRef } from "react";
import colors from "tailwindcss/colors";
import { useNotes } from "~/hooks/useNotes";
import { useStableCallback } from "~/hooks/useStableCallback";
import { isTmpId, tmpId } from "~/utils/id";
import { randomInt, sample } from "~/utils/random";
import { Note } from "~/components/Note";

const defaultColorOptions = [
  colors.yellow["200"],
  colors.stone["200"],
  colors.slate["200"],
  colors.red["200"],
  colors.orange["200"],
  colors.amber["200"],
  colors.lime["200"],
  colors.green["200"],
  colors.emerald["200"],
  colors.teal["200"],
  colors.cyan["200"],
  colors.sky["200"],
  colors.blue["200"],
  colors.indigo["200"],
  colors.violet["200"],
  colors.purple["200"],
  colors.fuchsia["200"],
  colors.pink["200"],
  colors.rose["200"],
];

export interface NoteContainerProps {
  minNoteWidth?: number;
  minNoteHeight?: number;
  padding?: number;
  colorOptions?: string[];
}

export const NoteContainer = ({
  minNoteHeight = 200,
  minNoteWidth = 200,
  padding = 16,
  colorOptions = defaultColorOptions,
}: NoteContainerProps) => {
  const session = useSession();
  const notes = useNotes();
  const userId = session.data?.user?.id;
  const noteContainerRef = useRef<HTMLDivElement | null>(null);

  const maxOrder = useMemo(() => {
    const notesData = notes.data;

    if (!notesData || notesData?.length < 1) return 0;

    return Math.max(...notesData.map((n) => n.order));
  }, [notes.data]);

  const handleCreateNote = useStableCallback(() => {
    if (!userId) throw new Error("Missing userId");

    const width = minNoteWidth;
    const height = minNoteHeight;
    const maxTop = noteContainerRef.current!.clientHeight - height - padding;
    const maxLeft = noteContainerRef.current!.clientWidth - width - padding;

    notes.create({
      id: tmpId(),
      title: "",
      body: "",
      top: randomInt(padding, maxTop),
      left: randomInt(padding, maxLeft),
      width,
      height,
      color: sample(colorOptions),
      order: maxOrder + 1,
      userId,
    });
  });

  if (notes.isLoading) return null;

  return (
    <div className="relative flex-1 overflow-auto flex" ref={noteContainerRef}>
      {(notes.data?.length ?? 0) < 1 && (
        <>
          <h1 className="m-auto text-xl">You don&apos;t have any notes yet!</h1>
        </>
      )}

      {notes.data?.map((note) => (
        <Note
          key={note.id}
          containerRef={noteContainerRef}
          note={note}
          minWidth={minNoteWidth}
          minHeight={minNoteHeight}
          maxOrder={maxOrder}
          disabled={isTmpId(note.id)}
          onChange={notes.update}
          onDelete={notes.delete}
        />
      ))}

      <button
        className="absolute bottom-4 right-4 inline-flex items-center p-3 border border-transparent rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={handleCreateNote}
        type="button"
        style={{ zIndex: Number.MAX_SAFE_INTEGER }}
      >
        <PlusSmIcon className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
};
