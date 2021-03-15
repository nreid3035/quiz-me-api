const makeFlashArray = () => {
    return [
        {
            id: 1,
            userid: 1,
            question: 'HTML?',
            answer: 'Hypertext Markup Language'
        },
        {
            id: 2,
            userid: 1,
            question: 'CRUD?',
            answer: 'Create, Read, Update, Delete'
        },
        {
            id: 3,
            userid: 2,
            question: 'Who won the 2009 World Series?',
            answer: 'New York Yankees'
        },
        {
            id: 4,
            userid: 4,
            question: 'Who am I?',
            answer: 'I am me',
        },
        {
            id: 5,
            userid: 4,
            question: 'Who was the 16th president of the United States?',
            answer: 'Abraham Lincoln'
        }
    ]
}

module.exports = {
    makeFlashArray
}