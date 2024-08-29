import {useEffect, useState} from "react";
import {db} from "../firebase";
import {ref, onValue, remove, off} from "firebase/database";

interface Time {
  id: string;
  title: string;
  time_seconds: number;
}

const TimeList = () => {
  const [times, setTimes] = useState<Time[]>([]);

  useEffect(() => {
    const timesRef = ref(db, "times");

    onValue(timesRef, (snapshot) => {
      if (!snapshot.val()) {
        setTimes([]);
        return;
      }
      const newTimes: Time[] = [];
      snapshot.forEach((child) => {
        newTimes.push({
          id: child.key,
          ...child.val(),
        });
      });
      setTimes(newTimes);
    });

    return () => off(timesRef);
  }, []);

  const handleDelete = (id: string) => {
    remove(ref(db, `times/${id}`));
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
