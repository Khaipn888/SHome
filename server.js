const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require("passport");
const cookieSession = require("cookie-session");
require("./utils/passport");
const cors = require('cors');
require('dotenv').config();

const initRouter = require('./routers/index');

const app = express();

// app.use(express.static(path.join(__dirname, 'public')));

app.use(
	cookieSession({
		name: "session",
		keys: ["cyberwolve"],
		maxAge: 24 * 60 * 60 * 100,
	})
);

app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.DATABASE_MONGODB)
  .then(() => console.log('DB connection successfully!'));

const corsOptions = {
  origin: ['http://localhost:8080'],
  methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
  credentials: true,
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOptions));


initRouter(app);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
