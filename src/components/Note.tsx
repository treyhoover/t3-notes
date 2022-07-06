import { XIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { NoteDeleteDTO, NoteDTO, NoteUpdateDTO } from "../server/router/notes";
import { Rnd } from "react-rnd";
import { clamp } from "../utils/number";
import { useStableCallback } from "../hooks/useStableCallback";

export interface NoteProps {
  note: NoteDTO;
  className?: string;
  disabled?: boolean;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  maxOrder: number;
  minWidth: number;
  minHeight: number;
  minTop?: number;
  minLeft?: number;
  onChange: (update: NoteUpdateDTO) => void;
  onDelete: (deletion: NoteDeleteDTO) => void;
}

export const Note = React.memo(function Note({
  note,
  disabled,
  className,
  containerRef,
  minWidth,
  minHeight,
  maxOrder,
  minTop = 0,
  minLeft = 0,
  onChange,
  onDelete,
  ...props
}: NoteProps) {
  const noteRef = useRef(null);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const { id, color, top, left, width, height } = note;
  const [isDragging, setIsDragging] = useState(false);
  const maxTop = (containerRef.current?.clientHeight ?? height) - height;
  const maxLeft = (containerRef.current?.clientWidth ?? width) - width;

  const updateAndBringToTop = useStableCallback((update: NoteUpdateDTO) => {
    onChange({
      ...update,
      order: maxOrder + 1,
    });
  });

  const onDebouncedChange = useMemo(
    () => debounce(updateAndBringToTop, 200),
    [updateAndBringToTop]
  );

  useEffect(() => onDebouncedChange.flush, [onDebouncedChange.flush]);

  const handleChange = useStableCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      const update = {
        id,
        title,
        body,
        order: maxOrder + 1,
        [name]: value,
      };

      if (name === "title") {
        setTitle(value);
        onDebouncedChange(update);
      } else if (name === "body") {
        setBody(value);
        onDebouncedChange(update);
      } else {
        updateAndBringToTop(update);
      }
    }
  );

  const handleDelete = useStableCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    onDelete({ id });
  });

  return (
    <Rnd
      className={clsx("shadow-lg", {
        "opacity-50": disabled,
      })}
      size={{ width, height }}
      minWidth={minWidth}
      minHeight={minHeight}
      position={{ x: left, y: top }}
      style={{
        zIndex: isDragging ? maxOrder + 1 : note.order,
        backgroundColor: color,
      }}
      onDragStart={() => {
        setIsDragging(true);
      }}
      onDragStop={(e, d) => {
        setIsDragging(false);

        updateAndBringToTop({
          id,
          top: clamp(d.y, minTop, maxTop),
          left: clamp(d.x, minLeft, maxLeft),
        });
      }}
      enableResizing={{
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateAndBringToTop({
          id,
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
        });
      }}
    >
      <div
        {...props}
        ref={noteRef}
        className={"p-4 flex h-full flex-col gap-2"}
      >
        <div className="flex items-center gap-2">
          <input
            disabled={disabled}
            className="w-full bg-transparent px-2 py-1 text-gray-600 outline-none text-xl"
            value={title}
            name="title"
            onChange={handleChange}
          />
          <button onClick={handleDelete}>
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <textarea
          disabled={disabled}
          className="w-full resize-none bg-transparent px-2 py-1 flex-1 text-gray-600 outline-none"
          value={body}
          name="body"
          onChange={handleChange}
        />
      </div>
    </Rnd>
  );
});
