export interface ArchiveEntry {
  id: string;
  image: string;
  text: string;
  date: string;
  weather: string;
  temperature: number;
  tags: string[];
  isPublic: boolean;
  isBookmarked?: boolean;
}
