import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItem, login, logout } from "../GlobalSlice";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const loggedIn = sessionStorage.getItem("LoggedIn");

  const handleLogOut = () => {
    sessionStorage.clear();
    dispatch(logout());
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error("Invalid server response: " + text);
      }

      const result = await res.json();
      if (!res.ok) {
        setErrorMsg(result.message || "Login failed.");
        return;
      }

      dispatch(login({ role: result.role }));
      setShowLoginSuccess(true);

      setTimeout(() => {
        sessionStorage.setItem("LoggedIn", true);
        sessionStorage.setItem("role", result.role);
        sessionStorage.setItem("JWT", result.token);

        if (result?.role === "Admin") {
          navigate("/admin");
        } else if (result?.role === "RestaurantManager") {
          navigate("/manager");
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    }
  };

  return (
 <Box
  sx={{
    minHeight: "calc(100vh - 64px)",
    paddingTop: "64px",
    backgroundImage: `url("/background.png")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>

      <Container maxWidth="xs">
        <Box
          sx={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            borderRadius: 3,
            p: 4,
            boxShadow: 5,
            zIndex: 10,
          }}
        >
          {!loggedIn ? (
            <>
              <Typography variant="h5" align="center" gutterBottom>
                Login
              </Typography>
              {errorMsg && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorMsg}
                </Alert>
              )}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Login
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h5" align="center" gutterBottom>
                You are already logged in!
              </Typography>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleLogOut}
              >
                Logout
              </Button>
            </>
          )}
        </Box>

        <Snackbar
          open={showLoginSuccess}
          autoHideDuration={2000}
          onClose={() => setShowLoginSuccess(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowLoginSuccess(false)}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Login successful!
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Login;
