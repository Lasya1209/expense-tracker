import { useContext } from "react";
import { Navigate,Outlet,useLocation } from "react-router-dom";
import AuthContext from "./context/AuthContext.jsx";
function ProtectedRoute({ children }) {
    const { user } = useContext(AuthContext);
const location = useLocation();
    if (!user) {
        return(
      <Navigate
                to="/users/login"
                state={{ from: location }}   
                replace
            />
        );

    }
   
 return <Outlet />;
 }
export default ProtectedRoute;