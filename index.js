require("dotenv").config();
const express = require("express");

const Phonebook = require("./models/phonebook");

const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(cors());
app.use(express.static("dist"));

// let phonebook = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];

// app.get("/", (request, response) => {
//   response.send(phonebook);
// });

app.get("/api/persons", (request, response) => {
  Phonebook.find({}).then((person) => {
    response.json(person);
  });
});

app.get("/info", (request, response) => {
  const time = new Date();
  Phonebook.find({}).then((persons) =>
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p><br/>
    <p>${time}</p>`
    )
  );
});

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/persons/:id", (request, response, next) => {
  Phonebook.findById(request.params.id)
    .then((item) => {
      if (item) {
        response.json(item);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
  // const id = Number(request.params.id);
  // const person = phonebook.find((person) => person.id === id);
  // if (person) {
  //   response.json(person);
  // } else {
  //   response.status(404).end();
  // }
});

app.delete("/api/persons/:id", (request, response, next) => {
  // const { id } = request.params;
  // phonebook = phonebook.filter((person) => person.id !== Number(id));

  // response.status(204).end();
  Phonebook.findByIdAndDelete(request.params.id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error));
});

app.use(express.json());
morgan.token("content", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(requestLogger);

app.post("/api/persons", (request, response, next) => {
  const { body } = request;
  Phonebook.findOne({ name: body.name })
    .then((findDuplicate) => {
      if (!body.name || !body.number) {
        return response.status(400).json({
          error: "content missing",
        });
      }
      if (findDuplicate) {
        return response.status(400).json({
          error: "name must be unique",
        });
      }

      const person = new Phonebook({
        name: body.name,
        number: body.number,
      });

      return person.save();
    })
    // .then((savedPerson) => savedPerson.toJSON())
    .then((formattedPerson) => response.json(formattedPerson))
    .catch((error) => next(error));

  // const person = {
  //   id: Math.floor(Math.random() * 100 + 1),
  //   name: body.name,
  //   number: body.number,
  // };

  // phonebook = phonebook.concat(person);
  // response.json(phonebook);
});

app.put("/api/persons/:id", (request, response, next) => {
  const { body } = request;
  const person = {
    name: body.name,
    number: body.number,
  };

  Phonebook.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);
