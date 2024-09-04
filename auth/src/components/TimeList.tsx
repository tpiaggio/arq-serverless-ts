import {useEffect, useState} from "react";
import {db, auth} from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

interface Time {
  id: string;
  title: string;
  time_seconds: number;
}

const TimeList = () => {
  const [times, setTimes] = useState<Time[]>([]);

  useEffect(() => {
    const timesQuery = query(
      collection(db, "times"),
      where("user_id", "==", auth.currentUser?.uid)
    );

    const unsubscribe = onSnapshot(timesQuery, (snapshot) => {
      if (!snapshot.docs.length) {
        setTimes([]);
        return;
      }
      const newTimes: Time[] = [];
      snapshot.forEach((doc) => {
        newTimes.push({
          id: doc.id,
          ...doc.data(),
        } as Time);
      });
      setTimes(newTimes);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (id: string) => {
    deleteDoc(doc(db, "times", id));
  };

  return (
    <div>
      <h2>Times List</h2>
      <ol>
        {times.map((time) => (
          <li key={time.id}>
            <div className="time-entry">
              {time.title}
              <code className="time">{time.time_seconds}</code>
              <button onClick={() => handleDelete(time.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default TimeList;
