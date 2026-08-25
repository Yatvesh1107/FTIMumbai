import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// Public Pages
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Placements from "./pages/Placements";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";

// Layout & Dashboard Pages
import DashboardLayout from "./layouts/DashboardLayout";

// Admin & Receptionist Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdmissionDesk from "./pages/admin/AdmissionDesk";
import AdmissionsList from "./pages/admin/AdmissionsList";
import CoursesManagement from "./pages/admin/CoursesManagement";
import BatchManagement from "./pages/admin/batches/BatchManagement";
import FeeManagement from "./pages/admin/FeeManagement";
import LMSManagement from "./pages/admin/LMSManagement";
import UploadVideoLecture from "./pages/admin/lms/UploadVideoLecture";
import StudyNotesList from "./pages/admin/notes/StudyNotesList";
import UploadStudyNotes from "./pages/admin/notes/UploadStudyNotes";
import StudyNoteStudentTracking from "./pages/admin/notes/StudyNoteStudentTracking";
import AssignmentsList from "./pages/admin/assignments/AssignmentsList";
import AddAssignment from "./pages/admin/assignments/AddAssignment";
import AssignmentSubmissions from "./pages/admin/assignments/AssignmentSubmissions";
import ExamManagement from "./pages/admin/ExamManagement";
import UploadQuestionBank from "./pages/admin/exams/UploadQuestionBank";
import ScheduleExamForm from "./pages/admin/exams/ScheduleExamForm";
import CertificatesManagement from "./pages/admin/CertificatesManagement";

// Student Portal Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import ClassroomCourses from "./pages/student/classroom/ClassroomCourses";
import ClassroomVideos from "./pages/student/classroom/ClassroomVideos";
import ClassroomWatch from "./pages/student/classroom/ClassroomWatch";
import StudentStudyNotes from "./pages/student/StudentStudyNotes";
import StudyNoteDetail from "./pages/student/StudyNoteDetail";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentLiveClasses from "./pages/student/StudentLiveClasses";
import StudentExams from "./pages/student/StudentExams";
import StudentCertificates from "./pages/student/StudentCertificates";
import StudentFees from "./pages/student/StudentFees";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Website Routes with Navbar & Footer */}
          <Route
            path="/"
            element={
              <div className="flex min-h-svh flex-col">
                <Navbar />
                <div className="flex-1">
                  <Home />
                </div>
                <Footer />
              </div>
            }
          />
          <Route
            path="/courses"
            element={
              <div className="flex min-h-svh flex-col">
                <Navbar />
                <div className="flex-1">
                  <Courses />
                </div>
                <Footer />
              </div>
            }
          />
          <Route
            path="/coursedetails"
            element={
              <div className="flex min-h-svh flex-col">
                <Navbar />
                <div className="flex-1">
                  <CourseDetails />
                </div>
                <Footer />
              </div>
            }
          />
          <Route
            path="/placement"
            element={
              <div className="flex min-h-svh flex-col">
                <Navbar />
                <div className="flex-1">
                  <Placements />
                </div>
                <Footer />
              </div>
            }
          />
          <Route
            path="/contactus"
            element={
              <div className="flex min-h-svh flex-col">
                <Navbar />
                <div className="flex-1">
                  <ContactUs />
                </div>
                <Footer />
              </div>
            }
          />

          {/* Login Screen */}
          <Route path="/login" element={<Login />} />

          {/* Admin & Receptionist Protected Portal */}
          <Route
            path="/admin"
            element={<DashboardLayout allowedRoles={["admin", "receptionist"]} />}
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="admissions/new" element={<AdmissionDesk />} />
            <Route path="admissions" element={<AdmissionsList />} />
            <Route path="courses" element={<CoursesManagement />} />
            <Route path="batches" element={<BatchManagement />} />
            <Route path="fees" element={<FeeManagement />} />
            <Route path="lms" element={<LMSManagement />} />
            <Route path="lms/upload" element={<UploadVideoLecture />} />
            <Route path="lms/videos/edit/:id" element={<UploadVideoLecture />} />
            
            {/* Notes Routes */}
            <Route path="notes" element={<StudyNotesList />} />
            <Route path="notes/upload" element={<UploadStudyNotes />} />
            <Route path="notes/tracking/:id" element={<StudyNoteStudentTracking />} />
            
            {/* Assignments Routes */}
            <Route path="assignments" element={<AssignmentsList />} />
            <Route path="assignments/new" element={<AddAssignment />} />
            <Route path="assignments/:id/submissions" element={<AssignmentSubmissions />} />

            {/* Exams Routes */}
            <Route path="exams" element={<ExamManagement />} />
            <Route path="exams/upload" element={<UploadQuestionBank />} />
            <Route path="exams/schedule" element={<ScheduleExamForm />} />

            <Route path="certificates" element={<CertificatesManagement />} />
          </Route>

          {/* Student Protected Portal */}
          <Route
            path="/student"
            element={<DashboardLayout allowedRoles={["student"]} />}
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="classroom" element={<ClassroomCourses />} />
            <Route path="classroom/course/:courseId" element={<ClassroomVideos />} />
            <Route path="classroom/watch/:courseId/:videoId" element={<ClassroomWatch />} />
            <Route path="notes" element={<StudentStudyNotes />} />
            <Route path="notes/:id" element={<StudyNoteDetail />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="live-classes" element={<StudentLiveClasses />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="certificates" element={<StudentCertificates />} />
            <Route path="fees" element={<StudentFees />} />
          </Route>

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="py-32 text-center">
                <h1 className="font-display text-5xl font-extrabold text-[#0b3c68]">404</h1>
                <p className="mt-3 text-slate-600">Page not found.</p>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
