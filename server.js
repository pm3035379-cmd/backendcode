const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb://pooja:poojaPassword@ac-tjhhzyu-shard-00-00.y0et2p5.mongodb.net:27017,ac-tjhhzyu-shard-00-01.y0et2p5.mongodb.net:27017,ac-tjhhzyu-shard-00-02.y0et2p5.mongodb.net:27017/?ssl=true&replicaSet=atlas-cwh60b-shard-0&authSource=admin&appName=Cluster0"
)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

cloudinary.config({
  cloud_name: "dai9nr20m",
  api_key: "767298313396433",
  api_secret: "fqm2v7FogzPtnkF7W3oSEP0hSEk",
});


const storage = multer.memoryStorage();
const upload = multer({ storage });

const registrationSchema = new mongoose.Schema({
  studentName: String,
  dob: String,
  gender: String,
  bloodGroup: String,
  maritalStatus: String,
  religion: String,
  caste: String,
  aadhaar: String,
  mobile: String,
  whatsapp: String,
  email: String,
  address: String,

  fatherName: String,
  fatherOccupation: String,
  motherName: String,
  motherOccupation: String,
  guardianName: String,
  guardianContact: String,

  qualification: String,
  schoolCollege: String,
  passingYear: String,
  marks: String,

  course: [String],
  academicYear: String,

  passportPhoto: String,
  verificationProof1: String,
  verificationProof2: String,
  studentDeclaration: String,
  parentDeclaration: String,
});

const Registration = mongoose.model(
  "Registration",
  registrationSchema
);

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "registration-form",
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
};


app.post(
  "/register",
  upload.fields([
    { name: "passportPhoto" },
    { name: "verificationProof1" },
    { name: "verificationProof2" },
    { name: "studentDeclaration" },
    { name: "parentDeclaration" },
  ]),
  async (req, res) => {
    try {
      console.log(req.files);
      console.log(req.body);

      const passportPhoto =
        req.files?.passportPhoto?.[0]
          ? await uploadToCloudinary(
              req.files.passportPhoto[0]
                .buffer
            )
          : null;

      const verificationProof1 =
        req.files?.verificationProof1?.[0]
          ? await uploadToCloudinary(
              req.files
                .verificationProof1[0]
                .buffer
            )
          : null;

      const verificationProof2 =
        req.files?.verificationProof2?.[0]
          ? await uploadToCloudinary(
              req.files
                .verificationProof2[0]
                .buffer
            )
          : null;

      const studentDeclaration =
        req.files?.studentDeclaration?.[0]
          ? await uploadToCloudinary(
              req.files
                .studentDeclaration[0]
                .buffer
            )
          : null;

      const parentDeclaration =
        req.files?.parentDeclaration?.[0]
          ? await uploadToCloudinary(
              req.files
                .parentDeclaration[0]
                .buffer
            )
          : null;

      const data =
        new Registration({
          ...req.body,
          course: req.body.course
            ? JSON.parse(req.body.course)
            : [],

          passportPhoto,
          verificationProof1,
          verificationProof2,
          studentDeclaration,
          parentDeclaration,
        });

      await data.save();

      res.json({
        success: true,
        message:
          "Saved Successfully",
        data,
      });
    } catch (err) {
      console.error(
        "REGISTER ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(3000, () => {
  console.log("Server Running");
});
