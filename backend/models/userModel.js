import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true, 
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin', 'superadmin'],
        required: true,
    },
    profileCompleted: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
        required: function () {
            return this.profileCompleted;
        },
    },
    age: {
        type: Number,
        required: function () {
            return this.profileCompleted;
        },
    },
    gender: {
        type: String,
        required: function () {
            return this.profileCompleted;
        },
    },
    yearLevel: {
        type: String,
        required: function () {
            return this.profileCompleted && (this.role === 'student' || this.role === 'teacher');
        },
    },
    address: {
        type: String,
    },
    contactNumber: {
        type: String,
    },
    birthdate: {
        type: Date,
        required: function () {
            return this.profileCompleted && (this.role === 'student' || this.role === 'teacher');
        },
    },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual property to calculate age
userSchema.virtual('calculatedAge').get(function() {
    if (this.birthdate) {
        const today = new Date();
        const birthDate = new Date(this.birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    return null; // Return null if birthdate is not set
});

const User = mongoose.model('User', userSchema);

export default User;