export interface QualityVariant {
  label: string;
  url: string;
}

export interface AudioStream {
  id?: string;
  lang: string;
  label: string;
  url?: string;
}

export interface SubtitleTrack {
  lang: string;
  label: string;
  url: string;
}

export interface StreamSource {
  id: string;
  name: string;
  label: string;
  type: "hls" | "embed";
  url: string;
  quality?: string;
  qualityVariants?: QualityVariant[];
  audioStreams?: AudioStream[];
  subtitles?: SubtitleTrack[];
  resolvePath?: string;
}

export interface HealthResult {
  id: string;
  reachable: boolean;
  latencyMs: number;
  status: number;
  playable: boolean | null;
  reason?: string;
}

export interface StreamApiResponse {
  sources: StreamSource[];
  pending?: boolean;
}

export interface HealthApiResponse {
  results: HealthResult[];
}

export interface MediaMetadata {
  title: string;
  year?: string;
  duration?: string;
  overview?: string;
  backdropUrl?: string;
  posterUrl?: string;
  rating?: number;
  ratingCount?: string;
  genres?: string[];
  contentRating?: string;
  seasonCount?: number;
  episodesCount?: number;
  imdbId?: string;
}

export interface AutoPlayerConfig {
  type: "movie" | "tv";
  id: string;
  season?: number;
  episode?: number;
  title?: string;
  brand?: string;
  color?: string;
  autoplay?: boolean;
  muted?: boolean;
  server?: string;
  fit?: "contain" | "cover" | "fill";
  onServerChange?: (source: StreamSource) => void;
}
