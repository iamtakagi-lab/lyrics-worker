process.env.TZ = "Asia/Tokyo";

import { getTopTrackFromLastfm } from "./lastfm.js"
import { getTrackFromSpotify } from "./spotify.js"
import { getLyricsFromSpotify } from "./lyrics.js"
import { database } from "./supabase.js"
import { postTweet, updateAccountProfile } from "./twitter.js"
import moment from "moment";
import "moment/locale/ja.js";

export const handleMain = async () => {
    // 直近のトップソングを取得
    const topTrack = await getTopTrackFromLastfm()
    if(!topTrack) return

    // Spotify で曲を検索
    const spotifyTrack = await getTrackFromSpotify(topTrack.name, topTrack.artist.name)
    if(!spotifyTrack) return

    // Spotify から歌詞を取得
    const lyrics = await getLyricsFromSpotify(spotifyTrack.id)

    let l: string [] = []
    
    if(lyrics) {
       l = lyrics[Math.floor(Math.random()*lyrics.length)]
    }
 
    // 重複阻止
    const { data, error, status } = await database.from('songs').select("date").filter("date", 'eq', moment().format('YYYY/MM/DD'))
    if(data && data.length || error) return //既にデータがあったらリターン

    database.from('songs').insert({
        date: moment().format('YYYY/MM/DD'),
        name: topTrack.name,
        artist: topTrack.artist.name,
        imageUrl: spotifyTrack.album.images[0].url,
        spotifyId: spotifyTrack.id,
        lyrics: l
    }).then(async ({ data, error, status }) => { 
        if (error) {
            console.log(error)
            return false
        }
        const dateUrl = `https://${process.env.SITE_DOMAIN ?? ''}/${moment().format('YYYY/MM/DD')}`
        Promise.all([
            await updateAccountProfile(`${l ? l.join(" ") : "歌詞情報がありません "} ${dateUrl}`),
            await postTweet(dateUrl)
        ])
    });
}

(async () => {
    await handleMain();
})();