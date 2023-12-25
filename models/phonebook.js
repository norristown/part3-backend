const mongoose = require("mongoose");

// const password = process.argv[2];
// const name = process.argv[3];
// const number = process.argv[4];

const url = process.env.MONGODB_URI;
console.log("connecting to", url);

mongoose.set("strictQuery", false);
mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, "Name must be at least 3 characters long"],
  },
  number: {
    type: String,
    minLength: 8,
    required: [true, "Phone number must be xx-xxxxxx format"],
    validate: {
      validator(v) {
        return /\d{2}-\d{6}/.test(v);
      },
    },
  },
});

phonebookSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Phonebook", phonebookSchema);
