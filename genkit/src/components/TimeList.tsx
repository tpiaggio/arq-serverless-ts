import {useEffect, useState} from "react";
import {db, auth, storage, functions} from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {ref, deleteObject, getDownloadURL} from "firebase/storage";
import {httpsCallable} from "firebase/functions";

interface Time {
  id: string;
  title: string;
  time_seconds: number;
  image_url: string;
}

const DEFAULT_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpmt9q7BG9cE0Kal0STBlblRQK7jP70uNAvA&s";

const TimeList = () => {
  const [times, setTimes] = useState<Time[]>([]);
  const [description, setDescription] = useState<string>("");

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
      snapshot.forEach(async (doc) => {
        newTimes.push({
          id: doc.id,
          ...doc.data(),
        } as Time);
      });
      setTimes(newTimes);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (id: string, url: string) => {
    deleteDoc(doc(db, "times", id)).then(() => {
      if (!url) return;
      const imageRef = ref(storage, id);
      return deleteObject(imageRef);
    });
  };

  const handleGenerateDescription = async () => {
    const generateDescription = httpsCallable<string[], string>(
      functions,
      "todosDescriptionFlow"
    );
    const titles = times.map((time) => time.title);
    generateDescription(titles).then((result) => {
      const data = result.data;
      setDescription(data);
    });
  };

  return (
    <div>
      <h2>Times List</h2>
      <ol>
        {times.map((time) => (
          <li key={time.id}>
            <div className="time-entry">
              <span>
                <img
                  height="50"
                  width="50"
                  src={time.image_url || DEFAULT_IMAGE}
                />
              </span>
              <span>{time.title}</span>
              <code className="time">{time.time_seconds}</code>
              <button onClick={() => handleDelete(time.id, time.image_url)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ol>
      <h3>Times description</h3>
      <textarea
        placeholder="Generate a description of your times"
        rows={9}
        cols={83}
        disabled
        value={description}
      ></textarea>
      <br />
      <button onClick={() => handleGenerateDescription()}>Generate</button>
    </div>
  );
};

export default TimeList;
