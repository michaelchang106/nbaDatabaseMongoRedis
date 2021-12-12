const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const gamesRouter = require("./routes/games");
const editGameRouter = require("./routes/editGame");
const editTeamStatsRouter = require("./routes/editTeamStats");
const indexRouter = require("./routes/index");
const employeesRouter = require("../nbaDatabaseMongoRedis/routes/employees.js");
const teamStatsRouter = require("./routes/teamStats");
const playersStats = require("../nbaDatabaseMongoRedis/routes/playersStats.js");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

app.use("/games", gamesRouter);
app.use("/editGame", editGameRouter);
app.use("/editTeamStats", editTeamStatsRouter);
app.use("/employees", employeesRouter);
app.use("/teamStats", teamStatsRouter);
app.use("/playersStats", playersStats);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
