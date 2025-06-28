import React, { useState, useContext } from "react";
import { Card, Button } from "react-bootstrap";
import { getAiBaseUrl } from "../utils/config";
import { getApiBaseUrl } from "../utils/config";
import Notes from "./Notes";
import Summary from "./Summary";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "./LanguageProvider";

const Home = () => {
  const [collapsed, setCollapsed] = useState({
    summary: false,
    notes: false,
    helper: false,
  });
    const { language, changeLanguage } = useContext(LanguageContext);
    const { t } = useTranslation();

  const toggleCollapse = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="mt-4">
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{t("items.home.summary.title")}</h5>
          <Button
            variant="outline-secondary"
            onClick={() => toggleCollapse("summary")}
          >
            <i
              className={`bi ${
                collapsed.summary ? "bi-chevron-down" : "bi-chevron-up"
              }`}
            ></i>
          </Button>
        </Card.Header>
        {!collapsed.summary && (
          <Card.Body>
            <p>{t}</p>
            <Summary/>
          </Card.Body>
        )}
      </Card>

      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{t("items.home.notes.title")}</h5>
          <Button
            variant="outline-secondary"
            onClick={() => toggleCollapse("notes")}
          >
            <i
              className={`bi ${
                collapsed.notes ? "bi-chevron-down" : "bi-chevron-up"
              }`}
            ></i>
          </Button>
        </Card.Header>
        {!collapsed.notes && (
          <Card.Body>
            <p>{t("items.home.notes.description")}</p>
            <Notes/>
          </Card.Body>
        )}
      </Card>

      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{t("Hobby Helper")}</h5>
          <Button
            variant="outline-secondary"
            onClick={() => toggleCollapse("helper")}
          >
            <i
              className={`bi ${
                collapsed.helper ? "bi-chevron-down" : "bi-chevron-up"
              }`}
            ></i>
          </Button>
        </Card.Header>
        {!collapsed.helper && (
          <Card.Body>
            <p>{t("items.home.helper.description")}</p>
          </Card.Body>
        )}
      </Card>
    </div>
  );
};

export default Home;
