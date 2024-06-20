import React from 'react';
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import './App.css';
import {HomePage} from "./pages/homepage/HomePage";
import {GamePage} from "./pages/gamepage/GamePage";
function App() {
  return (
      <Router>
          <div className={"background-grey height-100vh"}>
              <Routes>
                  <Route path="/game/:id" element={<GamePage/>} />
                  <Route path="/*" element={<HomePage/>} />
              </Routes>
          </div>
      </Router>
  );
}

export default App;
