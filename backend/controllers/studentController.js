import asyncHandler from 'express-async-handler';
import Grade from '../models/gradeModel.js';
import User from '../models/userModel.js';
import Student from '../models/studentModel.js'; 
import Subject from '../models/subjectModel.js'; // Import Subject model
import Teacher from '../models/teacherModel.js'; // Import Teacher model

// @desc    Get logged-in student's grades
// @route   GET /api/students/grades
// @access  Private/Student
const viewGrades = asyncHandler(async (req, res) => {
  // Fetch grades associated with the logged-in student
  const grades = await Grade.find({ studentId: req.user._id })
    .populate({
      path: 'subject',
      model: Subject,
      populate: {
        path: 'teacher', // Assuming you have a teacher reference in the subject
        model: Teacher,
      },
    });

  if (grades) {
    // Format the grades data to include necessary details
    const formattedGrades = grades.map(grade => ({
      subject: grade.subject.name, // Assuming subject has a name field
      teacher: grade.subject.teacher.name, // Assuming teacher has a name field
      midterm: grade.midterm, // Adjust if midterm field is named differently
      finals: grade.finals, // Adjust if finals field is named differently
    }));

    res.json(formattedGrades);
  } else {
    res.status(404).json({ message: 'Grades not found' });
  }
});