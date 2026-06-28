import type { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/errors";
import { NewsRepository } from "../news/news.repository";
import { serializeNews, type NewsDTO } from "../news/news.service";
import {
  DEFAULT_SAVED_STATUS,
  isValidSavedStatus,
  type SavedStatus
} from "./saved-status";

export class SavedNewsService {
  private readonly repository: NewsRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.repository = new NewsRepository(prisma);
  }

  private async ensureNewsItem(id: string): Promise<void> {
    const exists = await this.prisma.newsItem.findUnique({
      where: { id },
      select: { id: true }
    });
    if (!exists) {
      throw new AppError("NEWS_ITEM_NOT_FOUND", "News item not found.", 404, { id });
    }
  }

  private async present(id: string): Promise<NewsDTO> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new AppError("NEWS_ITEM_NOT_FOUND", "News item not found.", 404, { id });
    }
    return serializeNews(item, { includeContent: true });
  }

  async save(id: string): Promise<NewsDTO> {
    await this.ensureNewsItem(id);

    const existing = await this.prisma.savedNews.findUnique({ where: { newsItemId: id } });
    if (!existing) {
      await this.prisma.savedNews.create({
        data: { newsItemId: id, status: DEFAULT_SAVED_STATUS, notes: "" }
      });
    }

    return this.present(id);
  }

  async unsave(id: string): Promise<NewsDTO> {
    await this.ensureNewsItem(id);

    await this.prisma.savedNews.deleteMany({ where: { newsItemId: id } });

    return this.present(id);
  }

  async updateStatus(
    id: string,
    status: unknown,
    notes: unknown
  ): Promise<NewsDTO> {
    if (!isValidSavedStatus(status)) {
      throw new AppError("INVALID_STATUS", "Invalid saved status.", 400, {
        status
      });
    }

    await this.ensureNewsItem(id);

    const nextStatus: SavedStatus = status;
    const hasNotes = typeof notes === "string";

    const existing = await this.prisma.savedNews.findUnique({ where: { newsItemId: id } });

    if (!existing) {
      await this.prisma.savedNews.create({
        data: {
          newsItemId: id,
          status: nextStatus,
          notes: hasNotes ? (notes as string) : ""
        }
      });
    } else {
      await this.prisma.savedNews.update({
        where: { newsItemId: id },
        data: {
          status: nextStatus,
          ...(hasNotes ? { notes: notes as string } : {})
        }
      });
    }

    return this.present(id);
  }
}
