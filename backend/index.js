import express, { json } from "express";
import cors from "cors";
import { connect, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import multer  from "multer";
const { hash } = bcrypt;
import jwt from "jsonwebtoken";
const { sign, verify } = jwt;
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

const mongoURI = "mongodb+srv://himanshupersonal61:hQztzuIcIF20lO7y@nss.n8shh.mongodb.net/";

connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB: ", err);
  });


// const userSchema = new Schema({

//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },

// });

app.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // For local storage
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // For Cloudinary (uncomment if using cloud storage)
    // const result = await cloudinary.uploader.upload(req.file.path);
    // imageUrl = result.secure_url;
    // fs.unlinkSync(req.file.path); // Clean up local file

    // Return the response in specified format
    res.status(201).json({ 
      imageUrl: imageUrl 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});
app.delete('/delete-image/:filename', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});



const testSchema = new Schema({
  testTitle: String,
  duration: Number,
  start_time: Number,
  mark_question: Number,
  negative_mark: Boolean,
  examDate:String,
  subjects: [
    {
      name: String,
      questions: [
        {
          questionType: { type: String, enum: ["options", "integer","moptions"], default: "options" },
          question: String,
          options: [String],
          correctAnswer: String,
          integerRange: {
            min: Number,
            max: Number
          },
          image: String, 
          negativeMark: { type: Number, default: 1 } // Negative marks per question
        },
      ],
    },
  ],
  students: [
    {
      userId: String, // Or Schema.Types.ObjectId
      userName: String,
      marks: [
        {
          subjectName: String,
          mark: Number,
          totalQuestions: Number,
        },
      ],
      totalMarks: Number,
      studentAnswer: [[String]],
      
    },
  ],
  givenby: [{ type: String }]
});

const userSchema = new Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no two users can have the same email
    },
    id:{
      type:String,
      required:true
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tests: [
      {
        testId: String, 
        marks: [
          {
            subjectName: String,
            mark: Number,
            totalQuestions: Number,
          },
        ],
        totalMarks: Number,
      },
    ],
  });

  userSchema.methods.generateAuthToken=function(){
    const token=sign({_id:this._id},process.env.JWT,{expiresIn:"7d"});
    return token;
  }
  
  // // Create the user model
  // const User = mongoose.model('user', userSchema);  
  

const User = model("user", userSchema,"users");
const Test = model("test", testSchema, "tests");

// Sign up route
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;  
    const id = email;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        id
      });
      await newUser.save();
    const token = sign({ userId: newUser._id }, "himanshugauravgautamriteshpushkar", {
        expiresIn: "90d", 
      });
      
    res.status(201).json({
        message: "User created successfully",
        token,
        user: newUser,
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error: error.message });
    }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate a JWT token
    const token = sign({ userId: user._id }, "himanshugauravgautamriteshpushkar", {
      expiresIn: "90d",
    });

    // Return the token and user details
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

app.put('/update-test/:testId', async (req, res) => {
  const { testId } = req.params;
  const updatedTest = req.body;

  try {
    await Test.findByIdAndUpdate(testId, updatedTest);
    res.status(200).send({ message: 'Test updated successfully!' });
  } catch (error) {
    res.status(500).send({ error: 'Error updating test data' });
  }
});

app.get("/get-test/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Received Test ID:", id); // Debugging the ID received  
    try {
      const test = await Test.findById(id); // Use Mongoose to find the test by ID
      if (test) {
        console.log("Test Found:", test); // Debugging the test data fetched
        res.status(200).json(test);
      } else {
        console.log("Test Not Found");
        res.status(404).json({ message: "Test not found" });
      }
    } catch (error) {
      console.error("Error fetching test by ID:", error);
      res.status(500).json({ message: "Error fetching test data", error: error.message });
    }
});

app.post("/upload-test", async (req, res) => {
    const { testTitle, subjects,duration,  markingScheme,startTime,examDate } = req.body;
    console.log(examDate);
    try {
      const newTest = new Test({ testTitle: testTitle,subjects: subjects ,duration:duration,mark_question:markingScheme,start_time:startTime,examDate:examDate});
      await newTest.save();
      res.status(200).send({ message: "Test uploaded successfully!" });
    } catch (error) {
      res.status(500).send({ error: "Error uploading test data" });
    }
  });

app.get("/get-test", async (req, res) => {
    try {
        // Fetch tests from the "tests" collection in the "test" database
        const tests = await Test.find();
       // console.log("Fetched Tests:", tests); // Log the fetched tests to ensure the data is coming through
        res.status(200).json(tests);  // Send the data back to the frontend
    } catch (err) {
        console.error("Error fetching tests:", err);
        res.status(500).json({ message: "Error fetching tests", error: err });
    }
});


app.post("/test/:testId/result",async (req,res)=>{
 
  const { testId } = req.params;
  const { userId, userName, subjectMarks, totalMarks, selectedAnswers, 
    questionStatus,
    testQuestions  } = req.body;
 
  try {
    const test=await Test.findById(testId);
   
    if(test){
      const detailedanswers = test.subjects.map((subject, subjectIndex) => ({
        subjectName: subject.name,
        questions: subject.questions.map((question, questionIndex) => ({
          question: question.question,
          type: question.questionType,
          correctAnswer: question.correctAnswer,
          studentAnswer: selectedAnswers[subjectIndex][questionIndex],
          status: questionStatus[subjectIndex][questionIndex],
          options: question.options,
          integerRange: question.integerRange,
        })),
      }));
      console.log("fdbdtest");
      console.log(userId);
      console.log("fdbdtesduvdhst");
      console.log(detailedanswers);
  
      test.students.push({
        userId,
        userName,
        marks: subjectMarks, // Array of subject marks
        totalMarks,
        studentAnswer: selectedAnswers,
      });
      if (!test.givenby) {
        test.givenby = []; // Ensure givenby is an array before pushing
      }
      test.givenby.push(userId);
      console.log(444);
      await test.save(); // Save the updated test
      res.status(200).json({ message: "Result saved successfully" });
    }else{
      res.status(404).json({ message: "Test not found" });
    }

  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// app.post("/update-result-user",async (req,res)=>{
//   const {testId, id, subjectMarks, totalMarks } = req.body;
//   try {
//     const user=await User.findOne({id});
//     console.log('df');
//     console.log(id);
//     console.log(user);
//     console.log('df');
//     if(user){
//       console.log("horha hai")
//       user.tests.push({
//         testId,
//         marks:subjectMarks,
//         totalMarks
//       });
//       console.log(111);
//       await user.save(); // Save the updated test
//       res.status(200).json({ message: "User Detain in User Profile saved successfully" });
//     }else{
//       res.status(404).json({ message: "User not found" });

//     }
//   } catch (error) {
//     console.error("Error saving result:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization; // Get token from 'Authorization' header
  console.log(1);
  
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  console.log(1);
  
  try {
    console.log(2);
    const decoded = verify(token, 'himanshugauravgautamriteshpushkar'); // Verify the token
    req.userId = decoded.userId; // Store the userId in the request
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Route to get user data when accessing /home
app.get('/home', verifyToken, async (req, res) => {
  try {
    console.log(req.userId);
    const user = await User.findById(req.userId); // Find the user by ID
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user }); // Send back the user details
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});

app.listen(8000, "0.0.0.0", () => {
  console.log("Backend is running on http://0.0.0.0:8000");
});
