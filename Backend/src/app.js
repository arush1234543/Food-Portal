import express from 'express'
import authRouter from './routes/auth.routes.js'
import { errorHandler } from './middleware/error.middleware.js'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import foodRouter from './routes/food.routes.js'
import orderRouter from './routes/order.routes.js'
import featureRouter from './routes/features.routes.js'

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use("/api/auth", authRouter)
app.use("/api/orders", orderRouter)
app.use("/api/food", foodRouter)
app.use("/api/feature", featureRouter)
app.use(errorHandler)

export default app