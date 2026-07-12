import express from 'express'
import { getRecentlyPlayed, getSuggested, getNewReleases, getFeaturedArtists, getFeaturedAlbums } from './recommendation.controller.js'
import { protect } from '../../shared/middleware/authMiddleware.js'



const router = express.Router()

router.get('/recently-played', protect, getRecentlyPlayed)
router.get('/suggested', protect, getSuggested)
router.get('/new-releases', getNewReleases)
router.get('/featured-artists', getFeaturedArtists)
router.get('/featured-albums', getFeaturedAlbums)
export default router