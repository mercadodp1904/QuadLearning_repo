import asyncHandler from 'express-async-handler';
import Semester from '../models/semesterModel.js';

// @desc    Get all semesters
// @route   GET /api/semesters
// @access  Private
// semesterController.js or in your existing route file
// In your semesterController or routes file
// controllers/semesterController.js
const getSemesters = asyncHandler(async (req, res) => {
    try {
        const semesters = await Semester.find({})
            .populate({
                path: 'strand',
                select: 'name'
            })
            .populate({
                path: 'yearLevel',
                select: 'name'
            })
            .lean();

        const formattedSemesters = semesters.map(semester => ({
            _id: semester._id,
            name: semester.name,
            strand: semester.strand ? { 
                _id: semester.strand._id, 
                name: semester.strand.name 
            } : null,
            yearLevel: semester.yearLevel ? {
                _id: semester.yearLevel._id,
                name: semester.yearLevel.name
            } : null
        }));

        res.status(200).json(formattedSemesters);
    } catch (error) {
        console.error('Semester Fetch Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching semesters',
            error: error.message
        });
    }
});

export { getSemesters };