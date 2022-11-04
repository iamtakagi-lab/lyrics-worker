import axios from "axios"
import querystring from "node:querystring"

const getAccessToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID ?? ""
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET ?? ""
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN ?? ""
  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
  }
  const data = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  }
  try {
    const response = await axios.post<SpotifyAccessTokenResponse>(
      "https://accounts.spotify.com/api/token",
      querystring.stringify(data),
      config
    )
    return response.data.access_token
  } catch (error) {
    console.log(error)
  }
}

export const getTrackFromSpotify = async (track: string, artist: string) => {
  const accessToken = await getAccessToken()
  if (!accessToken) return
  const client = axios.create({
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const params = new URLSearchParams()
  params.append("q", `remaster%20track:${track}%20artist:${artist}`)
  params.append("type", "track")
  params.append("market", "JP")
  params.append("limit", "1")

  const result = await client
    .get<SpotifySearchTrackResponse.RootObject>(
      "https://api.spotify.com/v1/search?" + params.toString()
    )
    .then(({ data }) => {
      if (!data || !data.tracks || !data.tracks.items) return undefined
      return data.tracks.items[0]
    })
  return result
}

interface SpotifyAccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

declare module SpotifySearchTrackResponse {
  export interface ExternalUrls {
    spotify: string
  }

  export interface Artist {
    external_urls: ExternalUrls
    href: string
    id: string
    name: string
    type: string
    uri: string
  }

  export interface Image {
    height: number
    url: string
    width: number
  }

  export interface Album {
    album_type: string
    artists: Artist[]
    external_urls: ExternalUrls
    href: string
    id: string
    images: Image[]
    name: string
    release_date: string
    release_date_precision: string
    total_tracks: number
    type: string
    uri: string
  }

  export interface ExternalIds {
    isrc: string
  }

  export interface Item {
    album: Album
    artists: Artist[]
    disc_number: number
    duration_ms: number
    explicit: boolean
    external_ids: ExternalIds
    external_urls: ExternalUrls
    href: string
    id: string
    is_local: boolean
    is_playable: boolean
    name: string
    popularity: number
    preview_url: string
    track_number: number
    type: string
    uri: string
  }

  export interface Tracks {
    href: string
    items: Item[]
    limit: number
    next: string
    offset: number
    previous?: any
    total: number
  }

  export interface RootObject {
    tracks: Tracks
  }
}
