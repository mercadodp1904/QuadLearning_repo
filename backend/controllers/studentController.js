import asyncHandler from 'express-async-handler';
import Grade from '../models/gradeModel.js';
import User from '../models/userModel.js';
 

// @desc    Get logged-in student's grades
// @route   GET /api/students/grades
// @access  Private/Student
const viewGrades = asyncHandler(async (req, res) => {
  // Assuming grades are stored in a separate Grade model and linked to student ID
  const grades = await Grade.find({ studentId: req.user._id });

  if (grades) {
    res.json(grades);
  } else {
    res.status(404).json({ message: 'Grades not found' });
  }
});

// @desc    Update logged-in student's profile
// @route   PUT /api/students/profile
// @access  Private/Student
const updateProfile = asyncHandler(async (req, res) => {
  const { name, age, address, contactNumber, additionalInfo } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    user.name = name || user.name;
    user.age = age || user.age;
    user.gender = age || user.gender;
    user.address = address || user.address;
    user.contactNumber = contactNumber || user.contactNumber;
   

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      age: updatedUser.age,
      address: updatedUser.address,
      contactNumber: updatedUser.contactNumber,
      additionalInfo: updatedUser.additionalInfo,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = {
  viewGrades,
  updateProfile,
};