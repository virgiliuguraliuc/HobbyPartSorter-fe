import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MenuNavbar = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
            <Navbar.Brand as={Link} to="/">Hobby Part Tracker</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link as={Link} to="/items">
                        <i className="bi bi-box-seam"></i> Items
                    </Nav.Link>
                    <Nav.Link as={Link} to="/categories">
                        <i className="bi bi-tags"></i> Categories
                    </Nav.Link>
                    <Nav.Link as={Link} to="/locations">
                        <i className="bi bi-geo-alt"></i> Locations
                    </Nav.Link>
                    <Nav.Link as={Link} to="/containers">
                        <i className="bi bi-basket"></i> Containers
                    </Nav.Link>
                    <Nav.Link as={Link} to="/projects">
                        <i className="bi bi-folder"></i> Projects
                    </Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default MenuNavbar;
