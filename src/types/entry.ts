export interface BaseEntry {
  id: string;
  image: string;
  text: string;
  isPublic: boolean;
  latitude: number;
  longitude: number;
  date: string;
  weather: string;
  weatherId: number;
  temperature: number;
  tags: string[];
  isBookmarked?: boolean;
}

export interface Entry extends BaseEntry {
  user: {
    userName: string;
    displayName: string;
    userImage: string;
  };
}

export interface ArchiveEntry extends BaseEntry {
}

export interface BookmarkEntry extends BaseEntry {
  user: {
    userName: string;
    displayName: string;
    userImage: string;
  };
}

export interface StreamEntry extends Entry {
  user: {
    userName: string;
    displayName: string;
    userImage: string;
  };
}
