import {useState, useEffect} from "react";
import {auth} from "./firebase";
import {onAuthStateChanged} from "firebase/auth";

import "./App.css";
import Home from "./pages/Home";
import Auth from "./pages/Auth";

function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setLoading(false);
      setSignedIn(!!user);
    });
  }, []);

  return (
    <div className="App">
      {loading ? (
        <span className="loader"></span>
      ) : signedIn ? (
        <Home />
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;
