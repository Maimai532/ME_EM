import { useState, useEffect } from 'react'
import { getSections } from '../services/sectionService'
import { artistService } from '../../../shared/services/artist.service'
import { getRecentlyPlayed, getSuggestedSongs, getNewReleases } from '../services/recommendationService'

function useSections() {
  const [sections, setSections] = useState([])
  const [autoSections, setAutoSections] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getSections(),
      artistService.getAll(),
      getRecentlyPlayed().catch(() => []),
      getSuggestedSongs().catch(() => []),
      getNewReleases().catch(() => []),
    ])
      .then(([sectionsData, artistsRes, recent, suggested, newReleases]) => {
        setSections(sectionsData)
        setArtists(artistsRes.data.map(a => ({ ...a, imageUrl: a.avatar })))
        setAutoSections([
          { _id: 'recent',    name: 'Nghe gần đây',  songs: recent,      type: 'song', layout: 'scroll' },
          { _id: 'suggested', name: 'Gợi ý cho bạn', songs: suggested,   type: 'song', layout: 'scroll' },
          { _id: 'new',       name: 'Mới phát hành', songs: newReleases, type: 'song', layout: 'grid'   },
        ].filter(s => s.songs.length > 0))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { sections, autoSections, artists, loading }
}

export default useSections