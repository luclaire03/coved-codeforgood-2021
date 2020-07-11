import React, { } from 'react';
import {
  BrowserRouter as Router, Switch, Route
} from 'react-router-dom';
import './App.css';
import HomePage from './pages/Home';
import ProfilePage from './pages/Profile';
import SignInPage from './pages/SignIn';
import Signin from './components/SignIn';
import { AuthProvider } from './providers/AuthProvider';

function App() {
  return (
    <AuthProvider fallback="loading">
      {/* Add Navbar component on this line */}
      <Router>
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Switch>
              <Route path="/" exact>
                <HomePage />
              </Route>
              <Route path="/profile">
                <ProfilePage />
              </Route>
              <Route path="/signin">
                <SignInPage/>
              </Route>
              <Route path="/sign-in" component={Signin}/>
            </Switch>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
