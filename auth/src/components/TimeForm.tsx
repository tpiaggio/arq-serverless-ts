import {FormEvent, useState} from "react";
import {db, auth} from "../firebase";
import {collection, addDoc} from "firebase/firestore";

const TimeForm = () => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    addDoc(collection(db, "times"), {
      title: title,
      time_seconds: parseInt(time),
      user_id: auth.currentUser?.uid,
    })
      .then(() => {
        setTitle("");
        setTime("");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Add Time Entry</h4>
      <div>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
      </div>
      <div>
        <label>Time</label>
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(e.currentTarget.value)}
        />
      </div>
      <button>Add Time Entry</button>
    </form>
  );
};

export default TimeForm;
