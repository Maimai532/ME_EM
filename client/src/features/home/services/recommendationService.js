import axios from 'axios'
import { API_URL } from '../../../shared/constants/api'

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export async function getRecentlyPlayed() {
  const res = await axios.get(`${API_URL}/recommendations/recently-played`, getConfig())
  return res.data
}

export async function getSuggestedSongs() {
  const res = await axios.get(`${API_URL}/recommendations/suggested`, getConfig())
  return res.data
}

export async function getNewReleases() {
  const res = await axios.get(`${API_URL}/recommendations/new-releases`)
  return res.data
}