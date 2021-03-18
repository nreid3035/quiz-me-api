module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DB_URL || "postgresql://nreid_super:postyPass72@localhost/quiz_me_db",
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "https://quiz-me.vercel.app/api"
}