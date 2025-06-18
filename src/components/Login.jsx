import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { getApiBaseUrl } from "../utils/config";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(
        `${getApiBaseUrl()}/login`,
        new URLSearchParams({ username, password })
      );
      const token = response.data.access_token;
      localStorage.setItem("token", token);

      const decoded = parseJwt(token);
      if (decoded?.username) {
        localStorage.setItem("username", decoded.username);
      }

      navigate("/");
    } catch (err) {
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        navigate("/offline");
      } else if (err.response?.status === 403) {
        setError("Access denied.");
      } else {
        setError("Invalid username or password");
      }
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={5}>
          <Card>
            <Card.Header as="h5" className="text-center">
              Login
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                {error && <Alert variant="danger">{error}</Alert>}

                <Button variant="primary" type="submit" className="w-100 mb-2">
                  Login
                </Button>
                <Button
                  variant="danger"
                  className="w-100 mb-2"
                onClick={() => window.open(`${getApiBaseUrl()}/login/google`, "_self")}

                >
                  <i className="bi bi-google me-2"></i> Sign in with Google
                </Button>
                <Button
                  variant="dark"
                  className="w-100 mb-2"
                  disabled
                >
                  <i className="bi bi-github me-2"></i> Sign in with GitHub
                </Button>
                <Button
                  variant="primary"
                  className="w-100 mb-2"
                  disabled
                >
                  <i className="bi bi-facebook me-2"></i> Sign in with Facebook
                </Button>

                <div className="d-flex justify-content-between">
                  <Link to="/register">Create an account</Link>
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
