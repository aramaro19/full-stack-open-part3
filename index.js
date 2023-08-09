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

app.get('/info/', (request, response) => {
	Person.find({})
		.then(people => {
			const amountOfPeople = people.length
			const date = new Date()
			response.send(`<p>PhoneBook has info for ${amountOfPeople} people </p>
	<p>${date}</p>`)
		})
	
})

app.get('/api/persons/', (request, response) => {
	Person.find({}).then(people => {
		response.json(people);
	});
});

const unknownEndpoint = (error, request, response, next) => {
	response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then(person => {
			if (person) {
				response.json(person);
			} else {
				response.status(404).end();
			}
		})
		.catch(error => next(error));
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

app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body;
	const person = {
		name: body.name,
		number: body.number,
	};
	Person.findByIdAndUpdate(request.params.id, person, { new: true })
		.then(updatedNote => {
			response.json(updatedNote);
		})
		.catch(error => next(error));
});

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' });
	}

	next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
