import z from "zod";
import { authMiddleware } from "./auth";
import { t } from "../trpc";

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

const proc = t.procedure.use(authMiddleware);

export const notesRouter = t.router({
  getNotes: proc.query(({ ctx }) => {
    return ctx.prisma.note.findMany({
      where: {
        userId: ctx.userId,
      },
    });
  }),
  updateNote: proc.input(NoteUpdateDTO).mutation(({ ctx, input }) => {
    return ctx.prisma.note.updateMany({
      where: {
        id: input.id,
        userId: ctx.userId,
      },
      data: input,
    });
  }),
  createNote: proc.input(NoteDTO).mutation(({ ctx, input }) => {
    const { id, ...data } = input;

    return ctx.prisma.note.create({ data });
  }),
  deleteNote: proc.input(NoteIDDTO).mutation(({ ctx, input }) => {
    return ctx.prisma.note.deleteMany({
      where: {
        id: input.id,
        userId: ctx.userId,
      },
    });
  }),
});
