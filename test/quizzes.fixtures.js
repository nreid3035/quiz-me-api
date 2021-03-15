const makeQuizzesArray = () => {
    return [
        {
            id: 1,
            card_ids: [1, 2],
            userid: 1,
            quiz_name: 'Dev Quiz',
        },
        {
            id: 2,
            card_ids: [4, 5],
            userid: 4,
            quiz_name: 'My Quiz', 
        }
    ]
}

module.exports = {
    makeQuizzesArray
}