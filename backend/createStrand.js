import Strand from './models/strandModel.js';
import Subject from './models/subjectModel.js';

const createPredefinedStrand = async () => {
    try {
        // Find the required subjects (ensure they exist)
        const mathSubject = await Subject.findOne({ code: 'MATH101' });
        const scienceSubject = await Subject.findOne({ code: 'SCI101' });

        if (!mathSubject || !scienceSubject) {
            console.log('Required subjects not found, please create them first');
            return;
        }

        // Create the predefined strand
        const strand = new Strand({
            name: 'STEM',  // Name of the strand
            description: 'Science, Technology, Engineering, and Mathematics',  // Optional description
            subjects: [mathSubject._id, scienceSubject._id],  // Assign subjects to the strand
        });

        await strand.save();
        console.log('Predefined strand created and subjects assigned');
    } catch (error) {
        console.error('Error creating predefined strand:', error);
    }
};

export default createPredefinedStrand();