import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Alert,
  CardHeader,
  CardBody,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useTheme } from "../contexts/ThemeContext";
import { authFetch } from "../utils/authFetch";

const Settings = () => {
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    theme: theme,
    notifications: true,
    apiBaseUrl: "",
    aiBaseUrl: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    passwordChanged: false,
    passwordError: null,
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [saved, setSaved] = useState(false);
  const [serverSaved, setServerSaved] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, theme }));
  }, [theme]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      apiBaseUrl:
        localStorage.getItem("api_base_url") ||
        import.meta.env.VITE_API_BASE_URL,
      aiBaseUrl:
        localStorage.getItem("ai_base_url") ||
        import.meta.env.VITE_AI_BASE_URL,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
      passwordChanged: false,
      passwordError: null,
    });
    setSaved(false);
    setServerSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.theme !== theme) {
      setTheme(formData.theme);
    }
    setSaved(true);
  };

  const updateApiBaseUrl = () => {
    localStorage.setItem("api_base_url", formData.apiBaseUrl);
    setServerSaved(true);
  };

  const updateAiBaseUrl = () => {
    localStorage.setItem("ai_base_url", formData.aiBaseUrl);
    setServerSaved(true);
  };

  const resetServerUrls = () => {
    localStorage.removeItem("api_base_url");
    localStorage.removeItem("ai_base_url");
    setFormData((prev) => ({
      ...prev,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      aiBaseUrl: import.meta.env.VITE_AI_BASE_URL,
    }));
    setServerSaved(true);
  };

  const toggleShow = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await authFetch(
        `${formData.apiBaseUrl}/change-password`,
        {
          method: "POST",
          body: JSON.stringify({
            old_password: formData.oldPassword,
            new_password: formData.newPassword,
          }),
        }
      );

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
          passwordChanged: true,
          passwordError: null,
        }));
      } else {
        const error = await response.json();
        setFormData((prev) => ({
          ...prev,
          passwordError: error.detail || "Failed to change password",
        }));
      }
    } catch (err) {
      setFormData((prev) => ({
        ...prev,
        passwordError: "Network error",
      }));
    }
  };

  const isPasswordValid =
    formData.newPassword.length >= 10 &&
    formData.newPassword === formData.confirmPassword;

  return (
    <div className="mt-4">
      <Card className="mb-4">
        <Card.Header>
          <h5>User Settings</h5>
        </Card.Header>
        <Card.Body>
          {saved && (
            <Alert variant="success">Settings saved successfully.</Alert>
          )}
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Theme</Form.Label>
              <Form.Select
                name="theme"
                value={formData.theme}
                onChange={handleChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="notifications"
                checked={formData.notifications}
                onChange={handleChange}
                label="Enable Notifications"
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              Save Settings
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* <Card className="mt-2">
        <Card.Header>
          <h5>Server Configuration</h5>
        </Card.Header>
        <Card.Body>
          {serverSaved && (
            <Alert variant="success">Server settings updated.</Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Backend Server Address</Form.Label>
            <Row className="g-2">
              <Col xs={9}>
                <Form.Control
                  type="text"
                  name="apiBaseUrl"
                  value={formData.apiBaseUrl}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={3}>
                <Button
                  variant="outline-primary"
                  className="w-100"
                  onClick={updateApiBaseUrl}
                >
                  Update
                </Button>
              </Col>
            </Row>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>AI Server Address</Form.Label>
            <Row className="g-2">
              <Col xs={9}>
                <Form.Control
                  type="text"
                  name="aiBaseUrl"
                  value={formData.aiBaseUrl}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={3}>
                <Button
                  variant="outline-primary"
                  className="w-100"
                  onClick={updateAiBaseUrl}
                >
                  Update
                </Button>
              </Col>
            </Row>
          </Form.Group>

          <div className="text-end">
            <Button variant="danger" onClick={resetServerUrls}>
              Reset to Defaults
            </Button>
          </div>
        </Card.Body>
      </Card> */}

      <Card className="mt-4">
        <Card.Header>
          <h5>Change Password</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleChangePassword}>
            <Form.Group className="mb-3">
              <Form.Label>Old Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword.old ? "text" : "password"}
                  name="oldPassword"
                  placeholder="old password"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => toggleShow("old")}
                >
                  <i
                    className={`bi ${
                      showPassword.old ? "bi-eye-slash" : "bi-eye"
                    }`}
                  />
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword.new ? "text" : "password"}
                  placeholder="at least 10 characters"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => toggleShow("new")}
                >
                  <i
                    className={`bi ${
                      showPassword.new ? "bi-eye-slash" : "bi-eye"
                    }`}
                  />
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword.confirm ? "text" : "password"}
                        placeholder="at least 10 characters"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => toggleShow("confirm")}
                >
                  <i
                    className={`bi ${
                      showPassword.confirm ? "bi-eye-slash" : "bi-eye"
                    }`}
                  />
                </Button>
              </InputGroup>
            </Form.Group>

            {formData.passwordChanged && (
              <Alert variant="success">Password changed successfully.</Alert>
            )}
            {formData.passwordError && (
              <Alert variant="danger">{formData.passwordError}</Alert>
            )}

            <Button
              variant="warning"
              type="submit"
              disabled={!isPasswordValid}
            >
              Change Password
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Settings;
