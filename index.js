require("dotenv").config();
const express = require("express");

const Phonebook = require("./models/phonebook");

const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(cors());
app.use(express.static("dist"));

let phonebook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send(phonebook);
});

app.get("/api/persons", (request, response) => {
  Phonebook.find({}).then((person) => {
    response.json(person);
  });
});

// app.get("/info", (request, response) => {
//   const time = new Date();
//   response.send(
//     `<p>Phonebook has info for ${Phonebook} people</p><br/>
//     <p>${time}</p>`
//   );
// });

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/persons/:id", (request, response) => {
  const person = Phonebook.findById(request.params.id).then((item) => {
    response.json(item);
  });
  // const id = Number(request.params.id);
  // const person = phonebook.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const { id } = request.params;
  phonebook = phonebook.filter((person) => person.id !== Number(id));

  response.status(204).end();
});

app.use(express.json());
morgan.token("content", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);

app.post("/api/persons", (request, response) => {
  const { body } = request;
  const findDuplicate = phonebook.find((person) => person.name === body.name);

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

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });

  // const person = {
  //   id: Math.floor(Math.random() * 100 + 1),
  //   name: body.name,
  //   number: body.number,
  // };

  // phonebook = phonebook.concat(person);
  // response.json(phonebook);
});
