import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./features/public/Landing";
import Login from "./features/public/Login";
import Register from "./features/public/Register";

import DashboardLayout from "./layouts/DashboardLayout";
import Courses from "./features/courses/Courses";
import CourseView from "./features/courses/CourseView";
import ChapterView from "./features/chapters/ChapterView";
import Analytics from "./features/analytics/Analytics";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseView />}>
          <Route path=":chapterId" element={<ChapterView />} />
        </Route>
        <Route path="analytics" element={<Analytics />} />
        <Route index element={<Navigate to="courses" replace />} />
      </Route>

    </Routes>
  );
}

export default App;