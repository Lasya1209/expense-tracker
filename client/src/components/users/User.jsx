import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext.jsx";
import {
  Box, Card, CardContent, Typography,
  Button, Divider
} from "@mui/material";

function User() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const goToLogout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",       // ← should be POST not GET
        credentials: "include"
      });
      setUser(null);          // ← clear auth context
      navigate("/users/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: "auto", mt: 10, p: 2 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>

          <Typography variant="h4" fontWeight={700} textAlign="center" mb={1}>
         ExpenseTracker
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
            Track your income and expenses with ease
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate("/users/login")}
            >
              Login
            </Button>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => navigate("/users/signup")}
            >
              New User? Sign Up
            </Button>

            <Divider sx={{ my: 1 }} />

            <Button
              variant="text"
              color="error"
              fullWidth
              onClick={goToLogout}
            >
              Logout
            </Button>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}

export default User;