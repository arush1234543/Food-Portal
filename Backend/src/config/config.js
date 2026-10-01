import dotenv from 'dotenv'
dotenv.config()

const defaultEmailFrom = 'StudySphere <onboarding@resend.dev>'

const config = {
    "MONGO_URI": process.env.MONGO_URI,
    "ACCESS_TOKEN_SECRET": process.env.ACCESS_TOKEN_SECRET,
    "REFRESH_TOKEN_SECRET": process.env.REFRESH_TOKEN_SECRET,
    "EMAIL_FROM": process.env.EMAIL_FROM,
    "RESEND_API_KEY": process.env.RESEND_API_KEY,
    "OPENROUTER_API_KEY": process.env.OPENROUTER_API_KEY
}

export default config;