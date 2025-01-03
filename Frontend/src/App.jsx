import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import Auth from "./pages/Auth";
import UserProtectWrapper from "./components/userProtectWrapper";
import AuthRedirectWrapper from "./components/AuthRedirectWrapper"; 

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <AuthRedirectWrapper>
                <Auth />
              </AuthRedirectWrapper>
            }
          />

          <Route
            path="/home"
            element={
              <UserProtectWrapper>
                <Home />
              </UserProtectWrapper>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
