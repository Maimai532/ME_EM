import api from '../../../shared/services/api'

export async function getRecentlyPlayed() {
  const res = await api.get('/recommendations/recently-played')
  return res.data
}

export async function getSuggestedSongs() {
  const res = await api.get('/recommendations/suggested')
  return res.data
}

export async function getNewReleases() {
  const res = await api.get('/recommendations/new-releases')
  return res.data
}

export async function getFeaturedArtists() {
  const res = await api.get('/recommendations/featured-artists')
  return res.data
}
export async function getFeaturedAlbums() {
  const res = await api.get('/recommendations/featured-albums')
  return res.data
}