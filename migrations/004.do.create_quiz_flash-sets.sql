CREATE TABLE quiz_flash_sets (
    set_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    quiz_id INTEGER REFERENCES quiz_me_quizzes(prime_quiz_id) ON DELETE CASCADE NOT NULL,
    flash_id INTEGER REFERENCES quiz_me_flashcards(flashcard_id) ON DELETE CASCADE NOT NULL
);