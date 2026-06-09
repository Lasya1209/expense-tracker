import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography,
  TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Alert
} from "@mui/material";
const beUrl = import.meta.env.VITE_API_URL;
function SignUp() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "", email: "", password: "",
    occupation: "", ageGroup: ""
  });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setUser((curr) => ({ ...curr, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      console.log(beUrl);
      let response = await fetch(`${beUrl}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(user)
      });
      let data = await response.json();
      if (response.ok && data.success) {
        setSuccess("Account created! Redirecting...");
        setTimeout(() => navigate("/transactions"), 1000);
      } else {
        setError(data.message || "Signup failed. Try again.");
      }
      setUser({ username: "", email: "", password: "", occupation: "", ageGroup: "" });
    } catch (err) {
      console.log(err);
      setError("Something went wrong. Try again.");
    }
  };

  const occupations = [
    "IT", "Banking", "Healthcare", "Education",
    "Private Employee", "Government Employee",
    "Business Owner", "Self Employed",
    "Manufacturing", "Retail",
    "Student", "Retired", "Homemaker", "Other"
  ];

  const ageGroups = ["18-25", "26-35", "36-45", "46+"];

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", mt: 6, p: 2 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>

          <Typography variant="h5" fontWeight={600} textAlign="center" mb={1}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Start tracking your expenses
          </Typography>

          {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Username" name="username"
              value={user.username} onChange={handleChange}
              required fullWidth autoFocus
            />
            <TextField
              label="Email" name="email" type="email"
              value={user.email} onChange={handleChange}
              required fullWidth
            />
            <TextField
              label="Password" name="password" type="password"
              value={user.password} onChange={handleChange}
              required fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Occupation</InputLabel>
              <Select
                name="occupation" value={user.occupation}
                label="Occupation" onChange={handleChange}
              >
                <MenuItem value="">Select Occupation</MenuItem>
                {occupations.map(o => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Age Group</InputLabel>
              <Select
                name="ageGroup" value={user.ageGroup}
                label="Age Group" onChange={handleChange}
              >
                <MenuItem value="">Select Age Group</MenuItem>
                {ageGroups.map(a => (
                  <MenuItem key={a} value={a}>{a}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button type="submit" variant="contained" fullWidth size="large">
              SIGN UP
            </Button>
            <Button
              type="button" variant="text" fullWidth
              onClick={() => navigate("/users/login")}
            >
              Already have an account? Login
            </Button>

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SignUp;