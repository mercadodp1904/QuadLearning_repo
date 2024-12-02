import asyncHandler from 'express-async-handler';
import Semester from '../models/semesterModel.js';

// @desc    Get all semesters
// @route   GET /api/semesters
// @access  Private
const getSemesters = asyncHandler(async (req, res) => {
    const semesters = await Semester.find({}).sort({ startDate: -1 }).populate('strand');
    res.json(semesters);
});

export { getSemesters };