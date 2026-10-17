import { StreamApiResponse, HealthApiResponse, MediaMetadata } from "../types";

const BASE_API = "https://api.thugtv.online/api/stream";

const CURATED_METADATA: Record<string, Partial<MediaMetadata>> = {
  "1236045": {
    title: "Animals",
    year: "2026",
    duration: "1h 48m",
    rating: 7.9,
    ratingCount: "14.2k",
    genres: ["Crime", "Drama", "Thriller"],
    contentRating: "R",
    overview: "When the son of a mayoral candidate is kidnapped, the candidate and his wife must work with two street cops to solve the mystery amidst a web of deception.",
    posterUrl: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg"
  },
  "123542": {
    title: "House of the Dragon",
    year: "2022-2026",
    duration: "Season 1 (10 Episodes)",
    rating: 8.4,
    ratingCount: "385k",
    genres: ["Action", "Adventure", "Drama", "Fantasy"],
    contentRating: "TV-MA",
    overview: "The Targaryen dynasty is at the height of its power with more than 15 dragons under their control. But kingdoms fall when the civil war known as the Dance of the Dragons erupts.",
    posterUrl: "https://image.tmdb.org/t/p/w500/t9Xke5724fqW3429IOP40931tmm.jpg"
  },
  "933260": {
    title: "Gladiator II",
    year: "2024",
    duration: "2h 28m",
    rating: 7.2,
    ratingCount: "89k",
    genres: ["Action", "Adventure", "Drama"],
    contentRating: "R",
    overview: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.",
    posterUrl: "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg"
  },
  "66732": {
    title: "Stranger Things",
    year: "2016-2025",
    duration: "4 Seasons (34 Episodes)",
    rating: 8.7,
    ratingCount: "1.2M",
    genres: ["Drama", "Fantasy", "Horror", "Mystery", "Sci-Fi"],
    contentRating: "TV-14",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    posterUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg"
  },
  "27205": {
    title: "Inception",
    year: "2010",
    duration: "2h 28m",
    rating: 8.8,
    ratingCount: "2.5M",
    genres: ["Action", "Adventure", "Sci-Fi"],
    contentRating: "PG-13",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterUrl: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg"
  },
  "tt1375666": {
    title: "Inception",
    year: "2010",
    duration: "2h 28m",
    rating: 8.8,
    ratingCount: "2.5M",
    genres: ["Action", "Adventure", "Sci-Fi"],
    contentRating: "PG-13",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterUrl: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg"
  },
  "1396": {
    title: "Breaking Bad",
    year: "2008-2013",
    duration: "5 Seasons (62 Episodes)",
    rating: 9.5,
    ratingCount: "2.1M",
    genres: ["Crime", "Drama", "Thriller"],
    contentRating: "TV-MA",
    overview: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's future.",
    posterUrl: "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg"
  }
};

export async function fetchStreamSources(
  type: "movie" | "tv",
  id: string,
  season?: number,
  episode?: number
): Promise<StreamApiResponse> {
  const path = type === "tv" && season && episode ? `tv/${id}/${season}/${episode}` : `movie/${id}`;
  const url = `${BASE_API}/${path}`;

  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) {
      throw new Error(`Stream API error: ${res.status}`);
    }
    const data: StreamApiResponse = await res.json();
    return data;
  } catch {
    return { sources: [], pending: false };
  }
}

export async function fetchStreamHealth(
  type: "movie" | "tv",
  id: string,
  season?: number,
  episode?: number
): Promise<HealthApiResponse> {
  const path = type === "tv" && season && episode ? `health/tv/${id}/${season}/${episode}` : `health/movie/${id}`;
  const url = `${BASE_API}/${path}`;

  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) {
      return { results: [] };
    }
    const data: HealthApiResponse = await res.json();
    return data;
  } catch {
    return { results: [] };
  }
}

export async function fetchMediaDetails(
  type: "movie" | "tv",
  id: string
): Promise<MediaMetadata> {
  const cleanId = id.trim();

  if (CURATED_METADATA[cleanId]) {
    const curated = CURATED_METADATA[cleanId];
    return {
      title: curated.title || (type === "movie" ? "Featured Movie" : "Featured Series"),
      year: curated.year || "2026",
      duration: curated.duration || (type === "tv" ? "45m" : "1h 50m"),
      rating: curated.rating || 8.0,
      ratingCount: curated.ratingCount || "10k+",
      genres: curated.genres || ["Action", "Drama"],
      contentRating: curated.contentRating || (type === "tv" ? "TV-MA" : "PG-13"),
      overview: curated.overview || "High-speed multi-server streaming source ready for instant playback.",
      posterUrl: curated.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80"
    };
  }

  if (cleanId.startsWith("tt")) {
    try {
      const cinemetaType = type === "tv" ? "series" : "movie";
      const res = await fetch(`https://v3-cinemeta.strem.io/meta/${cinemetaType}/${cleanId}.json`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.meta) {
          const m = data.meta;
          const ratingVal = m.imdbRating ? parseFloat(m.imdbRating) : 8.2;
          return {
            title: m.name || (type === "movie" ? "Movie" : "Series"),
            year: m.year ? String(m.year) : "2026",
            duration: m.runtime || (type === "tv" ? "45m" : "1h 52m"),
            rating: isNaN(ratingVal) ? 8.0 : ratingVal,
            ratingCount: "IMDb Verified",
            genres: Array.isArray(m.genres) && m.genres.length > 0 ? m.genres : ["Drama", "Action"],
            contentRating: type === "tv" ? "TV-MA" : "PG-13",
            overview: m.description || "Stream resolved across high-speed edge CDN nodes with adaptive bitrate selection.",
            posterUrl: m.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80",
            imdbId: cleanId
          };
        }
      }
    } catch {}
  }

  const params = new URLSearchParams(window.location.search);
  const qTitle = params.get("title");
  if (qTitle) {
    return {
      title: qTitle,
      year: params.get("year") || "2026",
      duration: params.get("duration") || (type === "tv" ? "45m" : "1h 50m"),
      rating: 8.1,
      ratingCount: "Active Stream",
      genres: ["Cinema", "Stream"],
      contentRating: type === "tv" ? "TV-14" : "PG-13",
      overview: "High-speed multi-server stream resolved via distributed edge nodes.",
      posterUrl: params.get("poster") || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80"
    };
  }

  return {
    title: type === "movie" ? `Movie (${cleanId})` : `TV Series (${cleanId})`,
    year: "2026",
    duration: type === "tv" ? "45m / ep" : "1h 55m",
    rating: 8.0,
    ratingCount: "Multi-Server",
    genres: ["Stream", "HLS"],
    contentRating: type === "tv" ? "TV-14" : "PG-13",
    overview: "Multi-source streaming pipeline with automated health verification and adaptive playback.",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80"
  };
}
