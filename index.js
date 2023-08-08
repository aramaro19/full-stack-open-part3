require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
morgan.token('data', (request, response) => JSON.stringify(request.body));
const Person = require('./models/person');

app.use(express.json());
app.use(morgan(':method :status :res[content-length] - :response-time ms :data'));
app.use(cors());

app.get('/', (request, response) => {
	response.send('<h1>Phonebook</h1>');
});

app.get('/api/persons/', (request, response) => {
	Person.find({}).then(people => {
		response.json(people);
	});
});

app.get('/api/persons/:id', (request, response) => {
	Person.findById(request.params.id).then(person => {
		response.json(person);
	});
});

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(response.status(204).end())
		.catch(error => next(error));
});

app.post('/api/persons/', (request, response) => {
	const body = request.body;
	if (!body.name || !body.number) {
		return response.status(400).json({
			error: 'content missing',
		});
	}

	const person = new Person({
		name: body.name,
		number: body.number,
	});

	person.save().then(savedPerson => {
		response.json(savedPerson);
	});
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
