import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

export type TodoInput = {
  title?: string;
  done?: boolean;
  priority?: string;
  assignee?: string | null;
};

const SEED: TodoInput[] = [
  { title: "Service the Harbor Dental HVAC unit", priority: "high", assignee: "Dana" },
  { title: "Order replacement compressor for Nova Fitness", priority: "high", assignee: "Omar" },
  { title: "Inspect walk-in cooler at Cedar House Café", priority: "medium", assignee: "Dana" },
  { title: "Prep thermostats for Brightline install", priority: "medium", assignee: "Maya" },
  { title: "File refrigeration audit for Summit Grocers", priority: "low", assignee: "Maya", done: true },
];

@Injectable()
export class TodosService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  // Seed a few rows the first time the DB is empty so the demo has content.
  async onModuleInit() {
    const count = await this.prisma.todo.count();
    if (count === 0) {
      for (const t of SEED) {
        await this.prisma.todo.create({
          data: {
            title: t.title!,
            priority: t.priority ?? "medium",
            assignee: t.assignee ?? null,
            done: t.done ?? false,
          },
        });
      }
    }
  }

  list() {
    return this.prisma.todo.findMany({ orderBy: [{ done: "asc" }, { createdAt: "desc" }] });
  }

  create(input: TodoInput) {
    return this.prisma.todo.create({
      data: {
        title: (input.title ?? "").trim() || "Untitled task",
        priority: input.priority ?? "medium",
        assignee: input.assignee ?? null,
        done: input.done ?? false,
      },
    });
  }

  update(id: number, input: TodoInput) {
    return this.prisma.todo.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.done !== undefined ? { done: input.done } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.assignee !== undefined ? { assignee: input.assignee } : {}),
      },
    });
  }

  remove(id: number) {
    return this.prisma.todo.delete({ where: { id } });
  }
}
