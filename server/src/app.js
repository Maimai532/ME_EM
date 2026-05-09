import cors from 'cors'
import express from 'express'

import healthRoutes from './routes/healthRoutes.js'
import songRoutes from "./routes/songRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";



const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRoutes)
app.use("/api/songs", songRoutes);
app.use("/api/sections", sectionRoutes);
export default app
