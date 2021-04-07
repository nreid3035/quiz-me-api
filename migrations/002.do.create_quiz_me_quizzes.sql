CREATE TABLE quiz_me_quizzes (
    prime_quiz_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    quiz_name TEXT NOT NULL,
    username TEXT REFERENCES quiz_me_users(username) ON DELETE CASCADE NOT NULL
);