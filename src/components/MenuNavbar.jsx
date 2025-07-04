import React, { useContext } from "react";
import { Navbar, Nav, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { LanguageContext } from "./LanguageProvider";
import { useTranslation } from "react-i18next";
import ItemSearch from "./ItemSearch";

const MenuNavbar = () => {
  const { language, changeLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const username = localStorage.getItem("username") || "Guest";

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 px-3">
      <Navbar.Brand  as={Link} to="/">
        <i className="bi bi-house-door me-2"></i>
        {t("menu.brand")}
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav p-0">
   
          {isLoggedIn && (
              <Nav className="ms-auto mt-1 align-items-center">
              <Nav.Link className="ms-auto me-1" as={Link} to="/projects">
                <i className="bi bi-folder"></i> {t("menu.projects")}
              </Nav.Link>
              <Nav.Link className="ms-auto me-1" as={Link} to="/storage">
                <i className="bi bi-geo-alt"></i> {t("menu.storage")}
              </Nav.Link>
              <Nav.Link className="ms-auto me-1" as={Link} to="/inventory">
                <i className="bi bi-layout-text-window-reverse"></i>{" "}
                {t("menu.inventory")}
              </Nav.Link>
              <Nav.Link className="ms-auto me-1" as={Link} to="/quick-actions">
              <i className="bi bi-lightning"></i>{"Quick Actions"}
              </Nav.Link>
              <div className="ms-auto me-1 med"><ItemSearch /> </div>
               </Nav>
          )}
          {/* {isLoggedIn && } */}
        <Nav>
          <Dropdown className="ms-auto mt-1 align-items-center" align="end">
            <Dropdown.Toggle className="login med" variant="outline-light" id="settings-dropdown">
              <i className=" bi bi-gear"></i>{" "}
            <span className=""> {isLoggedIn ? username : t("menu.login")}</span>  
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {isLoggedIn ? (
                <>
                 <Dropdown.Item as={Link} to="/settings">
                    <i className="bi bi-sliders me-2"></i>
                    {t("menu.settings", "Settings")}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    {t("menu.logout")}
                  </Dropdown.Item>
                </>
              ) : (
                <Dropdown.Item className="small" as={Link} to="/login">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  <span className="small">{t("menu.login")} </span>
                </Dropdown.Item>
              )}
              <Dropdown.Divider />
              <Dropdown.Header>{t("menu.language")}</Dropdown.Header>
              <Dropdown.Item onClick={() => changeLanguage("en")}>English</Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage("es")}>Español</Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage("ro")}>Română</Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage("fr")}>Français</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default MenuNavbar;
