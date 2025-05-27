import React, { useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await axios.post('http://localhost:5000/forgot-password', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error sending reset instructions');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={5}>
                    <Card>
                        <Card.Header as="h5" className="text-center">Forgot Password</Card.Header>
                        <Card.Body>
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
                                {error && <Alert variant="danger">{error}</Alert>}
                                {message && <Alert variant="success">{message}</Alert>}
                                <Button type="submit" className="w-100">Send Reset Instructions</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPassword;
