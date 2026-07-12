import History from '../../shared/models/history.model.js'
import Song from '../../shared/models/Song.js'
import Album from '../../shared/models/album.model.js'
import Artist from '../../shared/models/artist.model.js'
import { resolveAlbumCover } from '../song/song.controller.js' // import hàm có sẵn

async function enrichSongs(songs) {
  const albumIds = [...new Set(songs.filter(s => s.albumId).map(s => s.albumId.toString()))]
  const albums = await Album.find({ _id: { $in: albumIds } }).select('coverImage').lean()
  const albumCoverMap = new Map(albums.map(a => [a._id.toString(), a.coverImage]))

  return Promise.all(songs.map(async (song) => {
    const s = song.toObject ? song.toObject() : { ...song }
    let coverUrl = s.imageUrl || null
    if (!coverUrl && s.albumId) {
      coverUrl = albumCoverMap.get(s.albumId.toString()) || null
    }
    if (!coverUrl && s.album) {
      coverUrl = await resolveAlbumCover(s)
    }
    return { ...s, coverUrl }
  }))
}

export async function getRecentlyPlayed(req, res) {
  try {
    const userId = req.user._id
    const histories = await History.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('song')
      .limit(50)

    const seen = new Set()
    const rawSongs = []
    for (const h of histories) {
      if (!h.song) continue
      const id = h.song._id.toString()
      if (!seen.has(id)) {
        seen.add(id)
        rawSongs.push(h.song)
      }
      if (rawSongs.length >= 10) break
    }

    res.json(await enrichSongs(rawSongs))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function getSuggested(req, res) {
  try {
    const userId = req.user._id
    const histories = await History.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('song')
      .limit(20)

    let rawSongs = []

    if (histories.length === 0) {
      rawSongs = await Song.find().sort({ createdAt: -1 }).limit(10).lean()
    } else {
      const genreCount = {}
      const listenedIds = new Set()
      for (const h of histories) {
        if (!h.song) continue
        listenedIds.add(h.song._id.toString())
        const genre = h.song.genre
        if (genre) genreCount[genre] = (genreCount[genre] || 0) + 1
      }

      const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0]

      if (topGenre) {
        rawSongs = await Song.find({ genre: topGenre, _id: { $nin: [...listenedIds] } }).limit(10).lean()
      }

      if (rawSongs.length < 5) {
        const fallback = await Song.find({ _id: { $nin: [...listenedIds] } }).sort({ createdAt: -1 }).limit(10).lean()
        rawSongs = [...rawSongs, ...fallback].slice(0, 10)
      }
    }

    res.json(await enrichSongs(rawSongs))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function getNewReleases(req, res) {
  try {
    const rawSongs = await Song.find().sort({ createdAt: -1 }).limit(10).lean()
    res.json(await enrichSongs(rawSongs))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function getFeaturedArtists(req, res) {
  try {
    const count = await Artist.countDocuments()
    const randomSkip = Math.max(0, Math.floor(Math.random() * (count - 10)))
    const artists = await Artist.find().skip(randomSkip).limit(10).lean()
    res.json(artists)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}