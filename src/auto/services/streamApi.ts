import { StreamApiResponse, HealthApiResponse, MediaMetadata } from "../types";

const BASE_API = "/api/stream";
const TMDB_PROXY = "https://proxy.tmdb.sumanonline.com/3";

export function buildWsrvArtworkUrl(
  imagePathOrUrl?: string,
  size: "w500" | "w780" | "original" = "w500",
  width?: number
): string {
  if (!imagePathOrUrl) return "";
  const trimmed = imagePathOrUrl.trim();
  if (!trimmed) return "";

  let fullUrl = trimmed;
  if (trimmed.startsWith("/")) {
    fullUrl = `https://image.tmdb.org/t/p/${size}${trimmed}`;
  } else if (trimmed.startsWith("//")) {
    fullUrl = `https:${trimmed}`;
  }

  const w = width ? `&w=${width}` : (size === "w500" ? "&w=500" : size === "w780" ? "&w=780" : "&w=1280");
  return `https://wsrv.nl/?url=${encodeURIComponent(fullUrl)}${w}&output=webp`;
}

const metaCache = new Map<string, MediaMetadata>();

const CURATED_METADATA: Record<string, Partial<MediaMetadata>> = {
  "1236045": {
    title: "Animals",
    year: "2026",
    duration: "1h 46m",
    rating: 7.1,
    ratingCount: "400+ votes",
    genres: ["Thriller", "Drama"],
    contentRating: "R",
    overview: "When the son of an L.A. mayoral candidate is kidnapped, he and his wife have a few hours to come up with the ransom payment. With most of their money spent on his political campaign, they have to get their hands dirty and expose a side of their lives they never intended to see the light of day.",
    posterUrl: buildWsrvArtworkUrl("/iISM36voS1E8gX9BM0DVK0kgi3E.jpg", "w500", 500),
    backdropUrl: buildWsrvArtworkUrl("/tzoarEu7TsG959upiELyYPm5kO9.jpg", "original", 1280)
  },
  "94997": {
    title: "House of the Dragon",
    year: "2022-Present",
    duration: "2 Seasons (18 Episodes)",
    rating: 8.4,
    ratingCount: "385k votes",
    genres: ["Sci-Fi & Fantasy", "Drama", "Action & Adventure"],
    contentRating: "TV-MA",
    overview: "The Targaryen dynasty is at the height of its power with more than 15 dragons under their control. But kingdoms fall when the civil war known as the Dance of the Dragons erupts.",
    posterUrl: buildWsrvArtworkUrl("/7V0Ebks0GgpKvQ7QbLAIdX5dos4.jpg", "w500", 500),
    backdropUrl: buildWsrvArtworkUrl("/577eXC8wFQT0eUrJcgznSiFPRmk.jpg", "original", 1280)
  },
  "558449": {
    title: "Gladiator II",
    year: "2024",
    duration: "2h 28m",
    rating: 6.6,
    ratingCount: "4.8k votes",
    genres: ["Action", "Adventure", "Drama"],
    contentRating: "R",
    overview: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.",
    posterUrl: buildWsrvArtworkUrl("/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg", "w500", 500),
    backdropUrl: buildWsrvArtworkUrl("/tOqIwliWMovSIZ9DyvHcHI7p2im.jpg", "original", 1280)
  },
  "66732": {
    title: "Stranger Things",
    year: "2016-2025",
    duration: "4 Seasons (34 Episodes)",
    rating: 8.6,
    ratingCount: "17k votes",
    genres: ["Sci-Fi & Fantasy", "Drama", "Mystery"],
    contentRating: "TV-14",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    posterUrl: buildWsrvArtworkUrl("/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", "w500", 500),
    backdropUrl: buildWsrvArtworkUrl("/56v2KjBlU4XaOv9rVYEQypROD7P.jpg", "original", 1280)
  },
  "27205": {
    title: "Inception",
    year: "2010",
    duration: "2h 28m",
    rating: 8.4,
    ratingCount: "36k votes",
    genres: ["Action", "Science Fiction", "Adventure"],
    contentRating: "PG-13",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    posterUrl: buildWsrvArtworkUrl("/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", "w500", 500),
    backdropUrl: buildWsrvArtworkUrl("/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", "original", 1280)
  },
  "tt1375666": {
    title: "Inception",
    year: "2010",
    duration: "2h 28m",
    rating: 8.4,
    ratingCount: "36k votes",
    genres: ["Action", "Science Fiction", "Adventure"],
    contentRating: "PG-13",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    posterUrl: buildWsrvArtworkUrl("/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", "w500", 500),
    backdropUrl: buildWsrvArtworkUrl("/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", "original", 1280)
  },
  "1396": {
    title: "Breaking Bad",
    year: "2008-2013",
    duration: "5 Seasons (62 Episodes)",
    rating: 8.9,
    ratingCount: "18.8k votes",
    genres: ["Drama", "Crime"],
    contentRating: "TV-MA",
    overview: "Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost as he enters the dangerous world of drugs and crime.",
    posterUrl: buildWsrvArtworkUrl("/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg", "w500", 500),
    backdropUrl: buildWsrvArtworkUrl("/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg", "original", 1280)
  }
};

export function sanitizeSourceBrand(url: string, brand: string = "SumanMovies"): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("brand") || /vidrift\.in/i.test(parsed.hostname)) {
      parsed.searchParams.set("brand", brand);
      return parsed.toString();
    }
  } catch {
    return url.replace(/brand=thug[s]?tv/gi, `brand=${encodeURIComponent(brand)}`);
  }
  return url;
}

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
    if (data && Array.isArray(data.sources)) {
      data.sources = data.sources.map((s) => {
        if (s.url) {
          s.url = sanitizeSourceBrand(s.url);
        }
        return s;
      });
    }
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
  id: string,
  season?: number,
  episode?: number
): Promise<MediaMetadata> {
  const cleanId = id.trim();
  const cacheKey = `${type}:${cleanId}:${season || ""}:${episode || ""}`;

  if (metaCache.has(cacheKey)) {
    return metaCache.get(cacheKey)!;
  }

  try {
    let resolvedType = type;
    let tmdbId = cleanId;

    if (cleanId.startsWith("tt")) {
      const findRes = await fetch(`${TMDB_PROXY}/find/${cleanId}?external_source=imdb_id`);
      if (findRes.ok) {
        const findData = await findRes.json();
        if (findData.movie_results && findData.movie_results.length > 0) {
          tmdbId = String(findData.movie_results[0].id);
          resolvedType = "movie";
        } else if (findData.tv_results && findData.tv_results.length > 0) {
          tmdbId = String(findData.tv_results[0].id);
          resolvedType = "tv";
        }
      }
    }

    const endpoint = resolvedType === "tv" ? `${TMDB_PROXY}/tv/${tmdbId}` : `${TMDB_PROXY}/movie/${tmdbId}`;
    const res = await fetch(endpoint);

    if (res.ok) {
      const data = await res.json();

      let epData: any = null;
      if (resolvedType === "tv" && season && episode) {
        try {
          const epRes = await fetch(`${TMDB_PROXY}/tv/${tmdbId}/season/${season}/episode/${episode}`);
          if (epRes.ok) {
            epData = await epRes.json();
          }
        } catch {}
      }

      let title = "";
      if (resolvedType === "movie") {
        title = data.title || data.original_title || "Movie";
      } else {
        const showName = data.name || data.original_name || "TV Series";
        if (epData && epData.name) {
          title = `${showName}: S${season} E${episode} "${epData.name}"`;
        } else if (season && episode) {
          title = `${showName} (S${season}:E${episode})`;
        } else {
          title = showName;
        }
      }

      let year = "2026";
      if (resolvedType === "movie" && data.release_date) {
        year = data.release_date.slice(0, 4);
      } else if (resolvedType === "tv" && data.first_air_date) {
        const startYear = data.first_air_date.slice(0, 4);
        const endYear = data.status === "Ended" && data.last_air_date ? data.last_air_date.slice(0, 4) : (data.in_production ? "Present" : startYear);
        year = startYear === endYear ? startYear : `${startYear}-${endYear}`;
      }

      let duration = "";
      if (resolvedType === "movie") {
        duration = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : "1h 50m";
      } else if (epData?.runtime) {
        duration = `${epData.runtime}m`;
      } else if (data.number_of_seasons) {
        duration = `${data.number_of_seasons} Season${data.number_of_seasons > 1 ? "s" : ""} (${data.number_of_episodes || 0} Ep)`;
      } else {
        duration = "45m";
      }

      const rating = data.vote_average ? Number(data.vote_average.toFixed(1)) : 8.0;
      const ratingCount = data.vote_count ? (data.vote_count >= 1000 ? `${(data.vote_count / 1000).toFixed(1)}k` : `${data.vote_count}`) : "1k+";
      const genres = Array.isArray(data.genres) && data.genres.length > 0 ? data.genres.map((g: any) => g.name) : ["Action", "Drama"];
      const contentRating = data.adult ? "R" : (resolvedType === "tv" ? "TV-MA" : "PG-13");
      const overview = epData?.overview || data.overview || "High-speed multi-server streaming source ready for instant playback.";
      const posterPath = data.poster_path;
      const backdropPath = epData?.still_path || data.backdrop_path;

      const meta: MediaMetadata = {
        title,
        year,
        duration,
        rating,
        ratingCount,
        genres,
        contentRating,
        overview,
        posterUrl: buildWsrvArtworkUrl(posterPath, "w500", 500),
        backdropUrl: buildWsrvArtworkUrl(backdropPath, "original", 1280),
        seasonCount: data.number_of_seasons,
        episodesCount: data.number_of_episodes,
        imdbId: data.imdb_id || (cleanId.startsWith("tt") ? cleanId : undefined)
      };

      metaCache.set(cacheKey, meta);
      return meta;
    }
  } catch {}

  if (CURATED_METADATA[cleanId]) {
    const curated = CURATED_METADATA[cleanId];
    const meta: MediaMetadata = {
      title: curated.title || (type === "movie" ? "Featured Movie" : "Featured Series"),
      year: curated.year || "2026",
      duration: curated.duration || (type === "tv" ? "45m" : "1h 50m"),
      rating: curated.rating || 8.0,
      ratingCount: curated.ratingCount || "10k+",
      genres: curated.genres || ["Action", "Drama"],
      contentRating: curated.contentRating || (type === "tv" ? "TV-MA" : "PG-13"),
      overview: curated.overview || "High-speed multi-server streaming source ready for instant playback.",
      posterUrl: curated.posterUrl || buildWsrvArtworkUrl("/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", "w500", 500),
      backdropUrl: curated.backdropUrl || buildWsrvArtworkUrl("/tzoarEu7TsG959upiELyYPm5kO9.jpg", "original", 1280)
    };
    metaCache.set(cacheKey, meta);
    return meta;
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
          const meta: MediaMetadata = {
            title: m.name || (type === "movie" ? "Movie" : "Series"),
            year: m.year ? String(m.year) : "2026",
            duration: m.runtime || (type === "tv" ? "45m" : "1h 52m"),
            rating: isNaN(ratingVal) ? 8.0 : ratingVal,
            ratingCount: "IMDb Verified",
            genres: Array.isArray(m.genres) && m.genres.length > 0 ? m.genres : ["Drama", "Action"],
            contentRating: type === "tv" ? "TV-MA" : "PG-13",
            overview: m.description || "Stream resolved across high-speed edge CDN nodes with adaptive bitrate selection.",
            posterUrl: buildWsrvArtworkUrl(m.poster, "w500", 500),
            backdropUrl: buildWsrvArtworkUrl(m.background, "original", 1280),
            imdbId: cleanId
          };
          metaCache.set(cacheKey, meta);
          return meta;
        }
      }
    } catch {}
  }

  const params = new URLSearchParams(window.location.search);
  const qTitle = params.get("title");
  if (qTitle) {
    const meta: MediaMetadata = {
      title: qTitle,
      year: params.get("year") || "2026",
      duration: params.get("duration") || (type === "tv" ? "45m" : "1h 50m"),
      rating: 8.1,
      ratingCount: "Active Stream",
      genres: ["Cinema", "Stream"],
      contentRating: type === "tv" ? "TV-14" : "PG-13",
      overview: "High-speed multi-server stream resolved via distributed edge nodes.",
      posterUrl: buildWsrvArtworkUrl(params.get("poster") || "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", "w500", 500)
    };
    metaCache.set(cacheKey, meta);
    return meta;
  }

  const fallback: MediaMetadata = {
    title: type === "movie" ? `Movie (${cleanId})` : `TV Series (${cleanId})`,
    year: "2026",
    duration: type === "tv" ? "45m / ep" : "1h 55m",
    rating: 8.0,
    ratingCount: "Multi-Server",
    genres: ["Stream", "HLS"],
    contentRating: type === "tv" ? "TV-14" : "PG-13",
    overview: "Multi-source streaming pipeline with automated health verification and adaptive playback.",
    posterUrl: buildWsrvArtworkUrl("/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", "w500", 500)
  };
  metaCache.set(cacheKey, fallback);
  return fallback;
}
