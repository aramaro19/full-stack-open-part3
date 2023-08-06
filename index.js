const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
morgan.token('data', (request, response) => JSON.stringify(request.body))

app.use(express.json())
app.use(morgan(':method :status :res[content-length] - :response-time ms :data'))                                           
app.use(cors)

let persons = [
	{
		name: 'Arto Hellas',
		number: '040-123456',
		id: 1,
	},
	{
		name: 'Ada Lovelace',
		number: '39-44-5323523',
		id: 2,
	},
	{
		name: 'Dan Abramov',
		number: '12-43-234345',
		id: 3,
	},
	{
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
		id: 4,
	},
]

app.get('/', (request, response) => {
	response.send('<h1>Phonebook</h1>')
})

app.get('/info', (request, response) => {
	date = new Date()
	response.send(
		`Phonebook has info for ${persons.length} people
        <p>${date}</p>`
	)
})

app.get('/api/persons/', (request, response) => {
	response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find(p => p.id === id)
	if (person) {
		response.json(person)
		return
	} else {
		response.status(404).end()
	}
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter(person => person.id !== id)

	response.status(204).end()
})

app.post('/api/persons/', (request, response) => {
	const person = request.body
	if (!person.name || !person.number) {
		return response.status(400).json({
			error: 'content missing',
		})
	} else if (persons.find(p => p.name === person.name)) {
		return response.status(400).json({
			error: 'name must be unique',
		})
	}
	person.id = Math.floor(Math.random() * 10000)
	persons = persons.concat(person)
	response.json(person)
})

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
