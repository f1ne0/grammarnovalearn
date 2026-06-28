import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";
import { useSessionStore } from "../entities/session";

const LoginPage = lazy(() => import("../pages/login/ui/LoginPage"));
const RegisterPage = lazy(() => import("../pages/register/ui/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/ui/DashboardPage"));
const TopicDetailPage = lazy(
  () => import("../pages/topic-detail/ui/TopicDetailPage"),
);
const ExercisePlayerPage = lazy(
  () => import("../pages/exercise-player/ui/ExercisePlayerPage"),
);
const ProfilePage = lazy(() => import("../pages/profile/ui/ProfilePage"));
const SettingsPage = lazy(() => import("../pages/settings/ui/SettingsPage"));
const KitchenSinkPage = lazy(
  () => import("../pages/kitchen-sink/ui/KitchenSinkPage"),
);
const GrammarTrackPage = lazy(
  () => import("../pages/grammar/ui/GrammarTrackPage"),
);
const DrillSessionPage = lazy(
  () => import("../pages/grammar/ui/DrillSessionPage"),
);
const ReviewsPage = lazy(() => import("../pages/reviews/ui/ReviewsPage"));
const KnowledgeCheckPage = lazy(
  () => import("../pages/grammar/ui/KnowledgeCheckPage"),
);
const TeacherStudentsPage = lazy(
  () => import("../pages/teacher/ui/TeacherStudentsPage"),
);
const TeacherStudentDetailPage = lazy(
  () => import("../pages/teacher/ui/TeacherStudentDetailPage"),
);
const TeacherGeneratePage = lazy(
  () => import("../pages/teacher/ui/TeacherGeneratePage"),
);
const TeacherContentPage = lazy(
  () => import("../pages/teacher/ui/TeacherContentPage"),
);
const TeacherAnalyticsPage = lazy(
  () => import("../pages/teacher/ui/TeacherAnalyticsPage"),
);
const TeacherTestsPage = lazy(
  () => import("../pages/teacher/ui/TeacherTestsPage"),
);
const TeacherTestEditPage = lazy(
  () => import("../pages/teacher/ui/TeacherTestEditPage"),
);
const GroupDetailPage = lazy(
  () => import("../pages/teacher/ui/GroupDetailPage"),
);
const GroupsManagePage = lazy(
  () => import("../pages/teacher/ui/GroupsManagePage"),
);
const TestsPage = lazy(() => import("../pages/tests/ui/TestsPage"));
const TestTakePage = lazy(() => import("../pages/tests/ui/TestTakePage"));
const PracticeIndexPage = lazy(
  () => import("../pages/practice/ui/PracticeIndexPage"),
);
const AchievementsPage = lazy(
  () => import("../pages/achievements/ui/AchievementsPage"),
);
const GoalsPage = lazy(() => import("../pages/goals/ui/GoalsPage"));
const LeaderboardPage = lazy(
  () => import("../pages/leaderboard/ui/LeaderboardPage"),
);
const PracticeHubPage = lazy(
  () => import("../pages/practice/ui/PracticeHubPage"),
);

function Protected({ children }: { children: ReactNode }) {
  const token = useSessionStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function TeacherOnly({ children }: { children: ReactNode }) {
  const { accessToken, user } = useSessionStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  if (user?.role !== "TEACHER") return <Navigate to="/" replace />;
  return <>{children}</>;
}

// /grammar/:slug is now unified into the canonical topic page.
function GrammarTopicRedirect() {
  const { slug = "" } = useParams();
  return <Navigate to={`/topics/${slug}`} replace />;
}

// The per-student analytics page is unified into /teacher/students/:id.
function StudentInsightRedirect() {
  const { studentId = "" } = useParams();
  return <Navigate to={`/teacher/students/${studentId}`} replace />;
}

// Home: teachers land on their workspace, students on the learner dashboard.
function Home() {
  const role = useSessionStore((s) => s.user?.role);
  if (role === "TEACHER") return <Navigate to="/teacher" replace />;
  return <DashboardPage />;
}

function Fallback() {
  return (
    <Box
      minH="100vh"
      bg="bg"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner size="lg" color="accent" />
    </Box>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <Protected>
                <Home />
              </Protected>
            }
          />
          <Route
            path="/topics/:slug"
            element={
              <Protected>
                <TopicDetailPage />
              </Protected>
            }
          />
          <Route
            path="/topics/:slug/exercises/:exerciseId"
            element={
              <Protected>
                <ExercisePlayerPage />
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <ProfilePage />
              </Protected>
            }
          />
          <Route
            path="/settings"
            element={
              <Protected>
                <SettingsPage />
              </Protected>
            }
          />
          <Route
            path="/grammar"
            element={
              <Protected>
                <GrammarTrackPage />
              </Protected>
            }
          />
          <Route
            path="/grammar/:slug"
            element={
              <Protected>
                <GrammarTopicRedirect />
              </Protected>
            }
          />
          <Route
            path="/topics/:slug/drill"
            element={
              <Protected>
                <DrillSessionPage />
              </Protected>
            }
          />
          <Route
            path="/topics/:slug/check"
            element={
              <Protected>
                <KnowledgeCheckPage />
              </Protected>
            }
          />
          <Route
            path="/reviews"
            element={
              <Protected>
                <ReviewsPage />
              </Protected>
            }
          />
          <Route
            path="/tests"
            element={
              <Protected>
                <TestsPage />
              </Protected>
            }
          />
          <Route
            path="/tests/:testId"
            element={
              <Protected>
                <TestTakePage />
              </Protected>
            }
          />
          <Route
            path="/practice"
            element={
              <Protected>
                <PracticeIndexPage />
              </Protected>
            }
          />
          <Route
            path="/practice/:skill"
            element={
              <Protected>
                <PracticeHubPage />
              </Protected>
            }
          />
          <Route
            path="/achievements"
            element={
              <Protected>
                <AchievementsPage />
              </Protected>
            }
          />
          <Route
            path="/goals"
            element={
              <Protected>
                <GoalsPage />
              </Protected>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <Protected>
                <LeaderboardPage />
              </Protected>
            }
          />
          <Route
            path="/teacher"
            element={
              <TeacherOnly>
                <TeacherStudentsPage />
              </TeacherOnly>
            }
          />
          <Route
            path="/teacher/students/:studentId"
            element={
              <TeacherOnly>
                <TeacherStudentDetailPage />
              </TeacherOnly>
            }
          />
          <Route
            path="/teacher/generate"
            element={
              <TeacherOnly>
                <TeacherGeneratePage />
              </TeacherOnly>
            }
          />
          <Route
            path="/teacher/content"
            element={
              <TeacherOnly>
                <TeacherContentPage />
              </TeacherOnly>
            }
          />
          <Route
            path="/teacher/analytics"
            element={
              <TeacherOnly>
                <TeacherAnalyticsPage />
              </TeacherOnly>
            }
          />
          <Route
            path="/teacher/analytics/groups/:groupId"
            element={
              <TeacherOnly>
                <GroupDetailPage />
              </TeacherOnly>
            }
          />
          <Route
            path="/teacher/analytics/students/:studentId"
            element={
              <TeacherOnly>
                <StudentInsightRedirect />
              </TeacherOnly>
            }
          />
          <Route
            path="/teacher/groups"
            element={
              <TeacherOnly>
                <GroupsManagePage />
              </TeacherOnly>
            }
          />
          <Route
            path="/teacher/tests"
            element={
              <TeacherOnly>
                <TeacherTestsPage />
              </TeacherOnly>
            }
          />
          <Route
            path="/teacher/tests/:testId"
            element={
              <TeacherOnly>
                <TeacherTestEditPage />
              </TeacherOnly>
            }
          />
          <Route
            path="/kitchen-sink"
            element={
              <Protected>
                <KitchenSinkPage />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
