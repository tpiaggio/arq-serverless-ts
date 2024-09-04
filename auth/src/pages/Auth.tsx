import {FormEvent, useState} from "react";
import {auth} from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

const provider = new GoogleAuthProvider();

const Auth = () => {
  const [login, setLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const action = login
      ? signInWithEmailAndPassword
      : createUserWithEmailAndPassword;

    action(auth, email, password)
      .then(() => {
        setEmail("");
        setPassword("");
      })
      .catch((e) => {
        alert(e);
        console.log(e);
      });
  };

  const message = login ? "Log in" : "Sign up";

  return (
    <>
      <h1>Time Tracker</h1>
      <p>Please {message}:</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </div>
        <button>{message}</button>
        <hr />
        {login ? (
          <div>
            Don't have an account?
            <button type="button" onClick={() => setLogin(false)}>
              Sign up
            </button>
          </div>
        ) : (
          <div>
            Already have an account?
            <button type="button" onClick={() => setLogin(true)}>
              Log in
            </button>
          </div>
        )}
      </form>
      <br />
      <button onClick={() => signInWithPopup(auth, provider)}>
        Sign in with Google
      </button>
    </>
  );
};

export default Auth;
