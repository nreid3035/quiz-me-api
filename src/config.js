module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://nreid_super:postyPass72@localhost/quiz_me_db",
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "https://quiz-me.vercel.app/api",
    CLIENT_ORIGIN: process.env.NODE_ENV === 'production' ? "https://quiz-me.vercel.app" : "http://localhost:3000",
    JWT_SECRET: process.env.JWT_SECRET
}