require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const MongoStore = require("connect-mongo")(session);
// const flash = require("connect-flash");

//Definicion de la base de datos
mongoose
  .connect("mongodb://localhost/express-connect", { useNewUrlParser: true })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

// app.use(passport.initialize());
// app.use(passport.session());

// Express View engine setup

require("./passport")(app);

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);



app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

//middleware para usuario
app.use((req, res, next) => {
  res.locals.user = req.user;
  next()
})


// default value for title local
app.locals.title = "Express - Generated with IronGenerator";





//para ver si el usuario esta logueado o no logueado, esta en el index.js
// passport.serializeUser((user, callback) => {
//   callback(null, user._id);
// });

// passport.deserializeUser((id, callback) => {
//   User.findById(id)
//     .then(user => {
//       callback(null, user);
//     })
//     .catch(error => {
//       callback(error);
//     });
// });


//comprobamos que cuando se loguee el usuario existe, esta en el local.js
// passport.use(  
//   new LocalStrategy((username, password, callback) => {
//     User.findOne({ username })
//       .then(user => {
//         if (!user) {
//           return callback(null, false, { message: "Incorrect username" });
//         }
//         if (!bcrypt.compareSync(password, user.password)) {
//           return callback(null, false, { message: "incorrect password" });
//         }
//         app.locals.user = user //para sacar el usuario de la base de datos
//         callback(null, user);
//       })
//       .catch(error => {
//         callback(error);
//       });
//   })
// );
// Routes middleware goes here
const index = require("./routes/index");
app.use("/", index);
const passportRouter = require("./routes/passportRouter");
app.use("/", passportRouter);

module.exports = app;

//importante el orden de definicion de las rutas, el require("./passport")(app); siempre tiene que ir debajo de las sesiones
