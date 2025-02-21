export interface ChessProfile {
  avatar: string;
  player_id: number;
  '@id': string;
  url: string;
  name: string;
  username: string;
  followers: number;
  country: string;
  location: string;
  last_online: number;
  joined: number;
  status: string;
  is_streamer: boolean;
  verified: boolean;
  league: string;
  streaming_platforms: string[];
}

export interface ChessGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  white: {
    username: string;
    rating: number;
    result: string;
  };
  black: {
    username: string;
    rating: number;
    result: string;
  };
}