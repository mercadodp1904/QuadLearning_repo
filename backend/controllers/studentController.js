import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Student from '../models/studentModel.js'; 
import Subject from '../models/subjectModel.js'; // Import Subject model
import Section from '../models/sectionModel.js';
import Strand from '../models/strandModel.js';




// @desc    Get logged-in student's profile
// @route   GET /api/student/profile
// @access  Private/Student
const viewStudentProfile = asyncHandler(async (req, res) => {
  try {
      // Debug logs
      console.log('User ID:', req.user._id);
      
      // Find student by user ID
      const student = await Student.findOne({ user: req.user._id })
          .populate('section')
          .populate('strand')
          .populate('yearLevel')
          .lean();

      console.log('Raw student data:', student); // Add this debug log

      if (!student) {
          return res.status(404).json({
              success: false,
              message: 'Student profile not found'
          });
      }

      // Check if student data exists but is empty
      if (Object.keys(student).length === 0) {
          return res.status(404).json({
              success: false,
              message: 'Student data is empty'
          });
      }

      const formattedData = {
          success: true,
          data: {
              firstName: student.firstName || '',
              lastName: student.lastName || '',
              middleInitial: student.middleInitial || '',
              gender: student.gender || '',
              birthdate: student.birthdate ? new Date(student.birthdate).toISOString().split('T')[0] : '',
              contactNumber: student.contactNumber || '',
              birthplace: {
                  province: student.birthplace?.province || '',
                  municipality: student.birthplace?.municipality || '',
                  barrio: student.birthplace?.barrio || ''
              },
              address: student.address || '',
              guardian: {
                  name: student.guardian?.name || '',
                  occupation: student.guardian?.occupation || ''
              },
              yearLevel: student.yearLevel?.name || '',
              section: student.section?.name || '',
              strand: student.strand?.name || '',
              school: {
                  name: 'Tropical Village National Highschool',
                  year: student.school?.year || ''
              }
          }
      };

      console.log('Formatted data:', formattedData); // Add this debug log
      res.status(200).json(formattedData);

  } catch (error) {
      console.error('Error in viewStudentProfile:', error);
      res.status(500).json({
          success: false,
          message: 'Error fetching student profile',
          error: error.message
      });
  }
});

// @desc    Get student grades
// @route   GET /api/student/grades
// @access  Private/Student
const viewStudentGrades = asyncHandler(async (req, res) => {
  try {
      console.log('User ID:', req.user._id);

      // Find the student and populate necessary fields
      const student = await Student.findOne({ user: req.user._id })
          .select('grades')
          .populate({
              path: 'grades.subjects.subject',
              select: 'name code'
          })
          .populate({
              path: 'grades.semester',
              select: 'name'
          })
          .populate('strand', 'name')
          .lean();

      console.log('Found student:', student); // Debug log

      if (!student) {
          return res.status(404).json({
              success: false,
              message: 'Student not found'
          });
      }

      // Check if grades exist
      if (!student.grades || student.grades.length === 0) {
          return res.status(200).json({
              success: true,
              data: [],
              message: 'No grades available'
          });
      }

      // Format grades by semester
      const formattedGrades = student.grades.map(grade => ({
          name: grade.semester?.name || 'Unknown Semester',
          strand: student.strand?.name || 'Unknown Strand',
          subjects: grade.subjects.map(subj => ({
              name: subj.subject?.name || 'Unknown Subject',
              code: subj.subject?.code || 'N/A',
              midterm: subj.midterm,
              finals: subj.finals,
              finalRating: subj.finalRating
          }))
      }));

      console.log('Formatted grades:', formattedGrades); // Debug log

      res.status(200).json({
          success: true,
          data: formattedGrades
      });

  } catch (error) {
      console.error('Detailed error in viewStudentGrades:', error);
      res.status(500).json({
          success: false,
          message: 'Error fetching grades',
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
  }
});


export { viewStudentProfile, viewStudentGrades };
