import React, { useState } from "react";
import { Form, Button, Alert, Card, Container, Row, Col } from "react-bootstrap";
import { getApiBaseUrl } from "../utils/config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);

    try {
      const response = await fetch(`${getApiBaseUrl()}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Card.Header as="h5">Forgot Password</Card.Header>
            <Card.Body>
              {submitted && (
                <Alert variant="info">
                  If the email exists, you’ll receive a reset link shortly.
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Send Reset Link
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
