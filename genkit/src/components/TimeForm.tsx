import {FormEvent, useState} from "react";
import {db, auth, storage} from "../firebase";
import {collection, addDoc, updateDoc} from "firebase/firestore";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";

const TimeForm = () => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [file, setFile] = useState<File>();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    addDoc(collection(db, "times"), {
      title: title,
      time_seconds: parseInt(time),
      user_id: auth.currentUser?.uid,
    })
      .then((docRef) => {
        setTitle("");
        setTime("");
        if (!file) return;
        const imageRef = ref(storage, docRef.id);
        return uploadBytes(imageRef, file).then((snapshot) => {
          return getDownloadURL(ref(storage, docRef.id)).then(async (url) => {
            return updateDoc(docRef, {
              image_url: url,
            });
          });
        });
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
      <div>
        <label>Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files![0])}
        />
      </div>
      <button>Add Time Entry</button>
    </form>
  );
};

export default TimeForm;
