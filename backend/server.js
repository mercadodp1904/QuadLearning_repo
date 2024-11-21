import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import superadminRoutes from './routes/superadminRoutes.js';
import { createPredefinedSuperAdmin } from './createSAdmin.js';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';


import { createPredefinedStudents } from './createStudent.js';
import { createPredefinedSemester } from './createSemester.js'; 
import { createPredefinedTeachers } from './createTeacher.js'; 
import { createPredefinedSubjects } from './createSubject.js';
import { createPredefinedSection } from './createSection.js';
import { createPredefinedAdmin } from './createAdmin.js';
import { createPredefinedRStudent } from './createRStudent.js';


dotenv.config(); // Load environment variables
const port = process.env.PORT || 5000;

const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // Middleware for parsing cookies

// Connect to the database
connectDB()
    .then(() => {
        console.log('Connected to MongoDB');



        // Create the predefined accounts (uncomment if needed)
        // createPredefinedSuperAdmin();
        // createPredefinedStudents();
        // createPredefinedSemester();
        // createPredefinedTeachers();
        // createPredefinedSubjects();
        // createPredefinedSection();
        // createPredefinedAdmin();
        // createPredefinedRStudent();


        // Start the server
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit if the server cannot start
    });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);

// Basic route
app.get('/', (req, res) => res.send('Server is ready'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);