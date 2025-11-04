import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./Pages/Layout";

import Signup from "./Pages/Authentication/Signup";
import Login from "./Pages/Authentication/Login";
import UpdatePassword from "./Pages/Authentication/UpdatePassword";
import ResetPassword from "./Pages/Authentication/ResetPassword";
import ChangePassword from "./Pages/Authentication/ChangePassword";

import RequestActivation from "./Pages/Authentication/RequestActivation";
import AccountActivation from "./Pages/Authentication/AccountActivation";

import Community from "./Pages/Community/Community";

import CreateClub from "./Pages/Community/CreateClub";
import MyClubs from "./Pages/Club/MyClubs";
import ClubDetailPage from "./Pages/Club/ClubDetailPage";

import CreateProject from "./Pages/Community/CreateProject";
import MyProjects from "./Pages/Project/MyProjects";
import ProjectDetailPage from "./Pages/Project/ProjectDetailPage";

import NotFound from "./Pages/NotFound";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:RESET_TOKEN" element={<UpdatePassword />} />
        <Route path="/activate-account" element={<RequestActivation />} />
        <Route path="/activate/:ACTIVATION_TOKEN" element={<AccountActivation />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />} >
            <Route path="/" element={<></>} />
            
            <Route path="/change-password" element={<ChangePassword />} />

            <Route path="/community" element={<Community />} />

            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/create-club" element={<CreateClub />} />
            <Route path="/clubs" element={<MyClubs />} />
            <Route path="/clubs/:clubId" element={<ClubDetailPage />} />

            <Route path="/projects" element={<MyProjects />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
