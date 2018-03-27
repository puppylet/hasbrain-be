const mongoose = require('mongoose');
const Answer = mongoose.model('Answer')
const Question = mongoose.model('Question')

module.exports = {
  create: function (req, res) {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const body = req.body;
    const answer = new Answer(body)
    answer.project_id = project_id
    answer.created_at = new Date();

    answer.save()
      .then(doc => res.status(201).send(doc))
      .catch(err => res.status(500).send(err))
  },

  start: (req, res) => {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const skill_id = req.params.skill;
    const profile_id = req.params.profile;

    const params = {
      project_id,
      skill_id,
      profile_id
    }

    Answer.findOne(params)
      .then(ans => {
        if (!ans) {
          const questionParams = {
            project_id,
            skill_id,
            level: 1
          }
          Question.count(questionParams)
            .then(total => {
              const random = Math.floor(Math.random() * total)
              Question.findOne(questionParams).skip(random)
                .then(question => {
                  const newAnswer = {
                    project_id,
                    profile_id,
                    skill_id,
                    questions: [question._id.toString()],
                    answers: []
                  }

                  const answer = new Answer(newAnswer)
                  answer.save(newAnswer)
                    .then(doc => {
                      Question.findOne({_id: question._id})
                        .then(questionDetails => {
                          return res.status(201).send({
                            questions: [{
                              question: questionDetails.question,
                              options: questionDetails.options
                            }],
                            answers: [],
                            timeOut: questionDetails.timedOut
                          })
                        })
                    })
                    .catch(err => res.status(500).send(err))
                })
                .catch(err => res.status(500).send(err))
            })
            .catch(err => res.status(500).send(err));
        }
        else {
          const quiz = {
            questions: [],
            answers: ans.answers || [],
            timeOut: 0
          }

          Question.find({'_id': {$in: ans.questions}})
            .then(questions => {
              ans.questions.forEach(id => {
                const selectedQuestion = questions.filter(item => item._id.toString() === id)[0] || {}
                quiz.questions.push({
                  question: selectedQuestion.question,
                  options: selectedQuestion.options
                })
                quiz.timeOut = selectedQuestion.timedOut
              })
              return res.status(200).send(quiz)
            })
            .catch(err => res.status(500).send({error: err}));
        }
      })
      .catch(err => res.status(500).send({error: err}));
  },

  answer: (req, res) => {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();
    const {skill_id, profile_id, answer} = req.body

    const params = {
      skill_id,
      profile_id,
      project_id
    }

    Answer.findOne(params)
      .then(answerData => {
        if (!answerData) res.status(404).send({error: 'Answer does not exist'})
        else {
          const {questions} = answerData
          const question = questions[questions.length - 1]
          Question.findOne({_id: {$in: question}})
            .then(questionDetail => {
              if (!questionDetail) res.status(404).send({error: 'Question does not exist'})
              else {
                let {answers, currentLevel, questions} = answerData
                if (questions.length > answers.length) {
                  answers.push(answer)
                  if (answer === questionDetail.answer) currentLevel++
                  Answer.update({_id: answerData._id}, {answers, currentLevel})
                    .then(_ => res.status(200).send({result: questionDetail.answer}))
                    .catch(err => res.status(500).send(err))
                } else res.status(200).send({result: questionDetail.answer})

              }
            })
            .catch(err => res.status(500).send(err))
        }
      })
      .catch(err => res.status(500).send(err))
  },

  next: (req, res) => {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();
    const {skill_id, profile_id} = req.body

    const params = {
      skill_id,
      profile_id,
      project_id
    }

    Answer.findOne(params)
      .then(answer => {
        if (!answer) res.status(404).send({error: 'Answer does not exist'})
        else {
          let {currentLevel, questions} = answer
          Question.findOne({project_id, skill_id, level: {$gt: currentLevel - 1}, _id: {$nin: questions}})
            .then(doc => {
              if (!doc) res.status(500).send({result: false})
              else currentLevel = doc.level

              const questionParams = {
                project_id,
                skill_id,
                level: currentLevel
              }
              Question.count(questionParams)
                .then(total => {
                  const random = Math.floor(Math.random() * total)
                  Question.findOne(questionParams).skip(random)
                    .then(question => {
                      answer.questions = [...questions, question._id.toString()]
                      Answer.update({_id: answer._id}, {questions: answer.questions})
                        .then(doc => {
                          console.log(answer)
                          const quiz = {
                            questions: [],
                            answers: answer.answers || [],
                            timeOut: 0
                          }

                          Question.find({'_id': {$in: answer.questions}})
                            .then(questions => {
                              answer.questions.forEach(id => {
                                const selectedQuestion = questions.filter(item => item._id.toString() === id)[0] || {}
                                quiz.questions.push({
                                  question: selectedQuestion.question,
                                  options: selectedQuestion.options
                                })
                                quiz.timeOut = selectedQuestion.timedOut
                              })
                              return res.status(200).send(quiz)
                            })
                            .catch(err => res.status(500).send({error: err}));
                        })
                        .catch(err => res.status(500).send(err))
                    })
                    .catch(err => res.status(500).send(err))
                })
                .catch(err => res.status(500).send(err))

            })
            .catch(err => res.status(500).send(err))
        }
      })
      .catch(err => res.status(500).send(err))
  },

  findAll: function (req, res) {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const offset = (page - 1) * limit;
    const query = {project_id};
    let total;

    Answer.count(query)
      .then(total => Answer.find(query).limit(limit).skip(offset).sort({_id: -1})
        .then(docs => res.status(200).send({result: docs, total}))
        .catch(err => res.status(500).send(err)))
      .catch(err => res.status(500).send(err));
  },

  findOne: function (req, res) {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const _id = req.params.id;

    Answer.findOne({project_id, _id})
      .then(doc => !doc ? res.status(404).send({error: 'Answer does not exist'}) : res.status(200).send(doc))
      .catch(err => res.status(500).send({error: err}));
  },

  update: function (req, res) {
    const project_id = req.company.id;
    if (!project_id) return res.status(401).end();

    const _id = req.body.id || req.params.id;
    let body = req.body;
    body.updated_at = new Date();

    Answer.update({project_id, _id: {$in: _id}}, body)
      .then(doc => !doc
        ? res.status(404).send({error: 'Answer does not exist'})
        : res.status(200).send({status: true, message: "Deleted successfully"}))
      .catch(err => res.status(500).send({error: err}));
  },

  remove: function (req, res) {
    const project_id = req.company.id;
    if (!project_id) return res.status(401).end();

    const _id = req.body.id || req.params.id;
    let body = req.body;
    body.updated_at = new Date();

    Answer.remove({project_id, _id: {$in: _id}})
      .then(doc => !doc ? res.status(404).send({error: 'Answer does not exist'}) : res.status(200).send(doc))
      .catch(err => res.status(500).send({error: err}));
  }
}