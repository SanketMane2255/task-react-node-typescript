
import mongoose, { Document, Schema } from "mongoose";

export interface IStudentPlain {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password: string;
}

export interface IStudent extends Document {
  fullName: string;       
  email: string;          
  phoneNumber: string;    
  dateOfBirth: string;    
  gender: string;         
  address: string;        
  courseEnrolled: string; 
  password: string;       
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema Definition ─────────────────────────────────────────────────────────

const StudentSchema = new Schema<IStudent>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    dateOfBirth: {
      type: String,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    courseEnrolled: {
      type: String,
      required: [true, "Course enrolled is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
  },
  {
    timestamps: true, // auto-manages createdAt & updatedAt
    versionKey: false,
  }
);

const Student = mongoose.model<IStudent>("Student", StudentSchema);
export default Student;
