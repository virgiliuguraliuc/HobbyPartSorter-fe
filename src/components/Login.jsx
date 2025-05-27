import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/login', new URLSearchParams({
                username,
                password
            }));
            localStorage.setItem('token', response.data.access_token);
            navigate('/items');
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={5}>
                    <Card>
                        <Card.Header as="h5" className="text-center">Login</Card.Header>
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
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                {error && <Alert variant="danger">{error}</Alert>}

                                <Button variant="primary" type="submit" className="w-100">
                                    Login
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
