import React from 'react';
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import './App.css';
import {HomePage} from "./pages/homepage/HomePage";
import {GamePage} from "./pages/gamepage/GamePage";
function App() {
  return (
      <Router>
          <div className={"backgroud-grey"}>
              <Routes>
                  <Route path="/" element={<HomePage/>} />
                  <Route path="/game/:id" element={<GamePage/>} />
              </Routes>
          </div>
      </Router>
  );
}

export default App;
