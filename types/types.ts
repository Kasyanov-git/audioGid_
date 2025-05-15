export type HistoryItem = {
    id: string;
    path: string;
    text: string;
    title: string;
    date: string;
    location?: string;
  };

  export type FavoriteItem = {
    id: string;
    audioId: string;
    dateAdded: string;
  };

  export type FavoriteWithAudio = FavoriteItem & HistoryItem;