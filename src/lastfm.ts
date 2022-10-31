import axios from 'axios';

export const getTopTrackFromLastfm = async () => {
    const client = axios.create()
    const params = new URLSearchParams()
    params.append("method", "user.getTopTracks")
    params.append("user", process.env.LASTFM_USER_ID ?? "")
    params.append("limit", "1")
    params.append("api_key", process.env.LASTFM_API_KEY ?? "")
    params.append("format", "json")
    const result = await client.get<ToptracksResnponse.RootObject>('https://ws.audioscrobbler.com/2.0/?' + params.toString()).then(({data}) => {
        if(!data || !data.toptracks) return undefined
        return data.toptracks.track[0]
    })
    return result
}

declare module ToptracksResnponse {

    export interface Streamable {
        fulltrack: string;
        '#text': string;
    }

    export interface Image {
        size: string;
        '#text': string;
    }

    export interface Artist {
        url: string;
        name: string;
        mbid: string;
    }

    export interface Attr {
        rank: string;
    }

    export interface Track {
        streamable: Streamable;
        mbid: string;
        name: string;
        image: Image[];
        artist: Artist;
        url: string;
        duration: string;
        '@attr': Attr;
        playcount: string;
    }

    export interface Attr2 {
        user: string;
        totalPages: string;
        page: string;
        perPage: string;
        total: string;
    }

    export interface Toptracks {
        track: Track[];
        '@attr': Attr2;
    }

    export interface RootObject {
        toptracks: Toptracks;
    }

}