import React, { useContext } from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LanguageContext } from './LanguageProvider';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook

const MenuNavbar = () => {
    const { language, changeLanguage } = useContext(LanguageContext); // Access language and function to change it
    const { t } = useTranslation(); // Use the translation hook

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
            <Navbar.Brand as={Link} to="/">{t('menu.brand')}</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link as={Link} to="/items">
                        <i className="bi bi-box-seam"></i> {t('menu.items')}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/categories">
                        <i className="bi bi-tags"></i> {t('menu.categories')}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/locations">
                        <i className="bi bi-geo-alt"></i> {t('menu.locations')}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/containers">
                        <i className="bi bi-basket"></i> {t('menu.containers')}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/projects">
                        <i className="bi bi-folder"></i> {t('menu.projects')}
                    </Nav.Link>
                </Nav>
                <Dropdown align="end">
                    <Dropdown.Toggle variant="outline-light" id="dropdown-language-selector">
                        {language === 'en' ? 'English' : language === 'es' ? 'Español' : t(`languages.${language}`)}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => changeLanguage('en')}>English</Dropdown.Item>
                        <Dropdown.Item onClick={() => changeLanguage('es')}>Español</Dropdown.Item>
                        <Dropdown.Item onClick={() => changeLanguage('ro')}>Română</Dropdown.Item>
                        <Dropdown.Item onClick={() => changeLanguage('fr')}>Français</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default MenuNavbar;
