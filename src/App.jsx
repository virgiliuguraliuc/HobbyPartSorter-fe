import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuNavbar from './components/MenuNavbar';
import ItemsList from './components/ItemList';
import Categories from './components/Categories';
import Locations from './components/Locations';
import Containers from './components/Containers';
import Projects from './components/Projects';
import Login from './components/Login';
import Register from './components/Register';
import InventoryOverview from './components/InventoryOverview';
import Storage from './components/Storage';
import ForgotPassword from './components/ForgotPassword';
import LanguageProvider from './components/LanguageProvider'; // Import the LanguageProvider

//ADAUGA CEVA P/ YEP AI UITAT
const App = () => {
    return (
        <LanguageProvider>
            <Router>
                <MenuNavbar />
                <div className="container">
                    <Routes>
                        
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/inventory" element={<InventoryOverview />} />
                        <Route path="/storage" element={<Storage />} />
                        <Route path="/items" element={<ItemsList />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/locations" element={<Locations />} />
                        <Route path="/containers" element={<Containers />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/" element={<h1>Welcome to Hobby Part Tracker</h1>} />
                    </Routes>
                </div>
                  <div className="floating-cogs">
        <i className="bi bi-gear-fill cog"></i>
        <i className="bi bi-gear-fill cog"></i>
        <i className="bi bi-gear-fill cog"></i>
        <i className="bi bi-gear-fill cog"></i>
      </div>
            </Router>
        </LanguageProvider>
    );
};

export default App;
