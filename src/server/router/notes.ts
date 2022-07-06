import { TRPCError } from "@trpc/server";
import z from "zod";
import { createRouter } from "./context";

const NoteIDDTO = z.object({ id: z.string() });

export type NoteDeleteDTO = z.infer<typeof NoteIDDTO>;

const NoteDTO = z
  .object({
    title: z.string(),
    body: z.string(),
    top: z.number(),
    left: z.number(),
    width: z.number(),
    height: z.number(),
    userId: z.string(),
    order: z.number(),
    color: z.string(),
  })
  .merge(NoteIDDTO);

export type NoteDTO = z.infer<typeof NoteDTO>;

const NoteUpdateDTO = NoteDTO.deepPartial().merge(NoteIDDTO);

export type NoteUpdateDTO = z.infer<typeof NoteUpdateDTO>;

export const noteRouter = createRouter()
  .query("getNotes", {
    resolve: ({ ctx }) => {
      const userId = ctx.session?.user?.id;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.prisma.note.findMany({
        where: {
          userId,
        },
      });
    },
  })
  .mutation("updateNote", {
    input: NoteUpdateDTO,
    resolve: ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.prisma.note.updateMany({
        where: {
          id: input.id,
          userId,
        },
        data: {
          ...input,
          userId,
        },
      });
    },
  })
  .mutation("createNote", {
    input: NoteDTO,
    resolve: ({ ctx, input }) => {
      const { id, ...data } = input;
      const userId = ctx.session?.user?.id;

      if (!userId || userId !== input.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.prisma.note.create({ data });
    },
  })
  .mutation("deleteNote", {
    input: NoteIDDTO,
    resolve: ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.prisma.note.deleteMany({
        where: {
          id: input.id,
          userId,
        },
      });
    },
  });
