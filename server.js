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
      const passportPhoto =
        await uploadToCloudinary(
          req.files.passportPhoto[0].buffer
        );

      const verificationProof1 =
        await uploadToCloudinary(
          req.files.verificationProof1[0]
            .buffer
        );

      const verificationProof2 =
        await uploadToCloudinary(
          req.files.verificationProof2[0]
            .buffer
        );

      const studentDeclaration =
        await uploadToCloudinary(
          req.files.studentDeclaration[0]
            .buffer
        );

      const parentDeclaration =
        await uploadToCloudinary(
          req.files.parentDeclaration[0]
            .buffer
        );

      const data = new Registration({
        ...req.body,
        course: JSON.parse(req.body.course),

        passportPhoto,
        verificationProof1,
        verificationProof2,
        studentDeclaration,
        parentDeclaration,
      });

      await data.save();

      res.json({
        success: true,
        message: "Saved Successfully",
        data,
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
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