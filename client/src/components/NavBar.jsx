import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.jsx";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include"
      });
      setUser(null);
      navigate("/users/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/transactions")}
        >
          💰 ExpenseTracker
        </Typography>

        {/* Show links only when logged in */}
        {user && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" onClick={() => navigate("/transactions")}>
              Transactions
            </Button>
            <Button color="inherit" onClick={() => navigate("/transactions/new")}>
              New
            </Button>
            <Button color="inherit" onClick={() => navigate("/transactions/summary")}>
              Summary
            </Button>
            <Typography
              variant="body1"
              sx={{ alignSelf: "center", mx: 2, opacity: 0.8 }}
            >
              Hi, {user.username}
            </Typography>
            <Button color="inherit" variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}

        {/* Show login/signup when not logged in */}
        {!user && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" onClick={() => navigate("/users/login")}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate("/users/signup")}>
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;