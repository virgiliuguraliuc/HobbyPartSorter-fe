import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { getApiBaseUrl } from '../utils/config';

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '', email: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await axios.post(`${getApiBaseUrl()}/register`, form);
            setSuccess('User registered successfully. You can now login.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={5}>
                    <Card>
                        <Card.Header as="h5" className="text-center">Create Account</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control name="username" value={form.username} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control name="email" type="email" value={form.email} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control name="password" type="password" value={form.password} onChange={handleChange} required />
                                </Form.Group>
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}
                                <Button type="submit" className="w-100">Register</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;
