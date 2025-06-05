// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Card, Container, Row, Col } from "react-bootstrap";
import { getApiBaseUrl } from "../utils/config";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ success: false, error: null });

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ success: false, error: "Passwords do not match" });
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      if (response.ok) {
        setStatus({ success: true, error: null });
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const data = await response.json();
        setStatus({ success: false, error: data.detail || "Reset failed" });
      }
    } catch (err) {
      setStatus({ success: false, error: "Network error" });
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Card.Header as="h5">Reset Password</Card.Header>
            <Card.Body>
              {status.success && (
                <Alert variant="success">Password reset! Redirecting to login…</Alert>
              )}
              {status.error && <Alert variant="danger">{status.error}</Alert>}

              <Form onSubmit={handleReset}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="warning">
                  Reset Password
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
