import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2";
import multer from "multer";
import fileUpload from "express-fileupload";
import path from "path";
import crypto from "crypto";

const app = express();
// const port = 8000;
const db = mysql.createPool({
  // host: "localhost",
  // user: "root",
  // password: "Darigul250268",
  // database: "car_data",
  host: process.env.DB_HOST, 
  user: process.env.DB_USERNAME, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
const PORT = 3306

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.resolve("static")));

app.get("/api/get", (req, res) => {
  console.log('get api')

  const sqlGet = "SELECT * FROM car_db";
  db.query(sqlGet, (error, result) => {
    res.send(result);
  });
});

app.get("/api/get/:id", (req, res) => {
  const { id } = req.params;
  const sqlGet = "SELECT * FROM car_db WHERE id = ?";
  db.query(sqlGet, id, (error, result) => {
    if (error) {
      console.log(error);
    }
    res.send(result);
  });
});

app.put("/api/update/:id", (req, res) => {
  const { id } = req.params;
  const {
    name,
    year,
    color,
    price,
    driving,
    image,
    mainimage,
    secondimage,
    thirdimage,
    country,
    mileage,
    description,
    equipment,
  } = req.body;
  const sqlUpdate =
    "UPDATE car_db SET name = ?, year = ?, color = ?, price = ?, driving = ?, image = ? WHERE id = ?,mainimage = ?, secondimage = ?, thirdimage = ?, country = ?, mileage = ?, description = ?, equipment = ?";
  db.query(
    sqlUpdate,
    [
      name,
      year,
      color,
      price,
      driving,
      image,
      id,
      mainimage,
      secondimage,
      thirdimage,
      country,
      mileage,
      description,
      equipment,
    ],
    (error, result) => {
      if (error) {
        console.log(error);
      }
      res.send(result);
    }
  );
});

app.delete("/api/remove/:id", (req, res) => {
  const { id } = req.params;
  const sqlRemove = "DELETE FROM car_db WHERE id = ?";
  db.query(sqlRemove, id, (error, result) => {
    if (error) {
      console.log(error);
    }
  });
});

// app.post("/api/post", (req, res) => {
//   const {
//     name,
//     year,
//     color,
//     price,
//     driving,
//     image,
//     mainimage,
//     secondimage,
//     thirdimage,
//     country,
//     mileage,
//     description,
//     equipment,
//   } = req.body;
//   const sqlInsert =
//     "INSERT INTO car_db (name, year, color, price, driving, image, mainimage, secondimage, thirdimage, country, mileage, description, equipment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//   db.query(
//     sqlInsert,
//     [
//       name,
//       year,
//       color,
//       price,
//       driving,
//       image,
//       mainimage,
//       secondimage,
//       thirdimage,
//       country,
//       mileage,
//       description,
//       equipment,
//     ],
//     (error, result) => {
//       if (error) {
//         console.log(error);
//       }
//     }
//   );
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./static");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

app.post("/api/post", (req, res) => {
  const {
    name,
    year,
    color,
    price,
    driving,
    mainimage,
    secondimage,
    thirdimage,
    country,
    mileage,
    description,
    equipment,
  } = req.body;
  const { image } = req.files;
  console.log(req.files);

  if (!image) {
    res.status(400).json({ error: "No file was uploaded" });
    return;
  }
  console.log(image);
  let fileName = crypto.randomUUID() + "." + image.mimetype.split("/")[1];

  image.mv(path.resolve("static", fileName));


  const sqlInsert =
    "INSERT INTO car_db (name, year, color, price, driving, image, mainimage, secondimage, thirdimage, country, mileage, description, equipment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sqlInsert,
    [
      name,
      year,
      color,
      price,
      driving,
      fileName,
      mainimage,
      secondimage,
      thirdimage,
      country,
      mileage,
      description,
      equipment,
    ],
    (error, result) => {
      if (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to insert data into database" });
      } else {
        res.status(200).json({ message: "Data inserted successfully" });
      }
    }
  );
});
app.get("/", (req, res) => {
  console.log('hi')
});

app.listen(PORT, () =>
  console.log(`server is listening on port: http://localhost:${PORT}`)
);
