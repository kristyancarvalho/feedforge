import type { NewsItem } from "../api/types";
import { NewsCard } from "./NewsCard";

type Props = {
  items: NewsItem[];
  onSave: (item: NewsItem) => void;
  onUnsave: (item: NewsItem) => void;
  busyId?: string | null;
};

export function NewsGrid({ items, onSave, onUnsave, busyId }: Props) {
  return (
    <div className="news-grid">
      {items.map((item) => (
        <NewsCard
          key={item.id}
          item={item}
          onSave={onSave}
          onUnsave={onUnsave}
          busy={busyId === item.id}
        />
      ))}
    </div>
  );
}
