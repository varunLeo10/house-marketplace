import { Navigate, Outlet } from "react-router-dom";
import useAuthStatus from "../useAuthStatus.js";
import Spinner from "./Spinner.jsx";
function PrivateRoute() {
  const { loggedIn, checkingStatus } = useAuthStatus();
  if (checkingStatus) {
    return <Spinner />
  }
  return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
}

export default PrivateRoute;
