require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/user');
const passport = require('passport'); // Modifier cette ligne
const flash = require('express-flash');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to the database!"));

require('./passport.js')(passport); // Déplacer cette ligne après la déclaration de passport

app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: false
}));

app.set("view engine", "ejs");

app.use(passport.initialize());
app.use(passport.session());

app.use("", require("./routes/routes"));

app.get('/', (req, res)=>{
    res.render('login');
});

app.listen(PORT, ()=>{
    console.log(`Server Running at http://localhost:${PORT}`);
});
