var mysql = require("mysql");

// There's no default database in MYSQL, what do you connect to for the first time? Could make it manually before running app
var connection = mysql.createConnection({
  host: "mysql", // use container name as host
  user: "root",
  password: "example",
  database: "traveljournal",
});

const TRIP_TABLE_SQL = `create table if not exists trip(
  id int primary key auto_increment,
  title varchar(255),
  description varchar(255),
  startDate DATE,
  endDate DATE
)`;

const MARKER_TABLE_SQL = `create table if not exists marker(
  id int primary key auto_increment,
  title varchar(255),
  description varchar(255),
  latLng POINT not null,
  startDate DATE,
  endDate DATE,
  tripId int,
  FOREIGN KEY (tripId) REFERENCES trip(id)
)`;

// Move this to a setup script
const DAY_TABLE_SQL = `create table if not exists day(
  id int primary key auto_increment,
  description varchar(255),
  date DATE,
  markerId int,
  FOREIGN KEY (markerId) REFERENCES marker(id)
)`;

try {
  connection.connect(function (err) {
    if (err) {
      return console.error("error: " + err.message);
    }

    connection.query(TRIP_TABLE_SQL, function (err, results, fields) {
      if (err) {
        console.log(err.message);
      }
    });

    connection.query(MARKER_TABLE_SQL, function (err, results, fields) {
      if (err) {
        console.log(err.message);
      }
    });

    connection.query(DAY_TABLE_SQL, function (err, results, fields) {
      if (err) {
        console.log(err.message);
      }
    });

    /*
    connection.end(function (err) {
      if (err) {
        return console.log(err.message);
      }
    });
    */
  });
} catch (e) {
  console.log("err connecting to db");
}

// We never end the connection, so just return it
export default connection;