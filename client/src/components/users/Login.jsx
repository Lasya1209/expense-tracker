import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthContext.jsx";
import {
  Box, Card, CardContent, Typography,
  TextField, Button, Alert
} from "@mui/material";
const beUrl = import.meta.env.VITE_API_URL;
function Login() {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/transactions";
  const navigate = useNavigate();
  const { setUser: setAuthUser } = useContext(AuthContext);
  const [user, setUser] = useState({ username: "", password: "" });
  const [error, setError] = useState("");  // ← better than alert

  const handleChange = (event) => {
    setUser((curr) => ({ ...curr, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${beUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(user)
      });
      const data = await response.json();
      if (response.ok && data.success === true) {
        setAuthUser(data.user);
        navigate(from, { replace: true });
      } else {
        setError("Invalid username or password"); // ← inline error, no alert
      }
      setUser({ username: "", password: "" });
    } catch (err) {
      console.log(err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: "auto", mt: 10, p: 2 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>

          <Typography variant="h5" fontWeight={600} textAlign="center" mb={1}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Login to your account
          </Typography>

          {/* inline error instead of alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Username"
              name="username"
              value={user.username}
              onChange={handleChange}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={user.password}
              onChange={handleChange}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" fullWidth size="large">
              LOGIN
            </Button>
            <Button
              type="button"
              variant="text"
              fullWidth
              onClick={() => navigate("/users/signup")}
            >
              Don't have an account? Sign Up
            </Button>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;