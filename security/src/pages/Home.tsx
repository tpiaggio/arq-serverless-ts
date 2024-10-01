import {auth} from "../firebase";

import TimeList from "../components/TimeList";
import TimeForm from "../components/TimeForm";

const Home = () => {
  const name = auth.currentUser?.displayName
    ? ", " + auth.currentUser?.displayName
    : "!";
  return (
    <>
      <div className="header">
        <h1>Welcome to Time Tracker{name}</h1>
        <button onClick={() => auth.signOut()}>Sign out</button>
      </div>
      <TimeList />
      <TimeForm />
    </>
  );
};

export default Home;
