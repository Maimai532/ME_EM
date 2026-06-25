import { useState, useEffect } from 'react'
import { getSections } from '../services/sectionService'
import { artistService } from '../../../shared/services/artist.service'

function useSections() {
  const [sections, setSections] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSections(), artistService.getAll()])
      .then(([sectionsData, artistsRes]) => {
        setSections(sectionsData)
        setArtists(artistsRes.data.map(a => ({ ...a, imageUrl: a.avatar })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { sections, artists, loading }
}

export default useSections