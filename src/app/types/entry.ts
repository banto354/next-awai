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

export interface Entry {
  id: string;
  image: string;
  text: string;
  isPublic: boolean;
  latitude: number;
  longitude: number;
  date: string;
  weatherId: number;
  temperature: number;
  tags: string[];
  isBookmarked?: boolean;
  user: {
    userName: string;
    displayName: string;
    userImage: string;
  };
}