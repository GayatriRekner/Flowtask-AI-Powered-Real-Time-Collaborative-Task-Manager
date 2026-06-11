import {
Routes,
Route,
Navigate
} from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Board from "./pages/Board"
import DashboardLayout from "./layouts/DashboardLayout"
import MyTasks from "./pages/MyTasks"
import Team from "./pages/Team"
import Register from "./pages/Register"
import Activity from "./pages/Activity"

function ProtectedRoute({ children }) {

const token = localStorage.getItem("token")

if (!token) {
return <Navigate to="/" />
}

return children
}

export default function App() {

return (

  <Routes>

    <Route
      path="/"
      element={<Login />}
    />
    <Route
  path="/register"
  element={<Register />}
/>

    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/tasks"
        element={<MyTasks />}
      />

      <Route
        path="/team"
        element={<Team />}
      />
      <Route
  path="/activity"
  element={<Activity />}
/>

      <Route
        path="/workspace/:id"
        element={<Board />}
      />

    </Route>

  </Routes>


)
}
