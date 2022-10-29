import axios from 'axios';

export const getTopTrackFromLastfm = async () => {
    const client = axios.create()
    const params = new URLSearchParams()
    params.append("method", "user.getWeeklyTrackChart")
    params.append("user", process.env.LASTFM_USER_ID ?? "")
    params.append("limit", "1")
    params.append("api_key", process.env.LASTFM_API_KEY ?? "")
    params.append("format", "json")
    const result = await client.get<WeeklytrackchartResponse.RootObject>('https://ws.audioscrobbler.com/2.0/?' + params.toString()).then(({data}) => {
        if(!data || !data.weeklytrackchart) return undefined
        return data.weeklytrackchart.track[0]
    })
    return result
}

declare module WeeklytrackchartResponse {

    export interface Artist {
        mbid: string;
        '#text': string;
    }

    export interface Image {
        size: string;
        '#text': string;
    }

    export interface Attr {
        rank: string;
    }

    export interface Track {
        artist: Artist;
        image: Image[];
        mbid: string;
        url: string;
        name: string;
        '@attr': Attr;
        playcount: string;
    }

    export interface Attr2 {
        from: string;
        user: string;
        to: string;
    }

    export interface Weeklytrackchart {
        track: Track[];
        '@attr': Attr2;
    }

    export interface RootObject {
        weeklytrackchart: Weeklytrackchart;
    }
}
