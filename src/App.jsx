import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuNavbar from './components/MenuNavbar';
import ItemsList from './components/ItemList';
import Categories from './components/Categories';
import Locations from './components/Locations';
import Containers from './components/Containers';
import Projects from './components/Projects';
import LanguageProvider from './components/LanguageProvider'; // Import the LanguageProvider

const App = () => {
    return (
        <LanguageProvider>
            <Router>
                <MenuNavbar />
                <div className="container">
                    <Routes>
                        <Route path="/items" element={<ItemsList />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/locations" element={<Locations />} />
                        <Route path="/containers" element={<Containers />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/" element={<h1>Welcome to Hobby Part Tracker</h1>} />
                    </Routes>
                </div>
            </Router>
        </LanguageProvider>
    );
};

export default App;
