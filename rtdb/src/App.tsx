import "./App.css";
import TimeForm from "./components/TimeForm";
import TimeList from "./components/TimeList";

function App() {
  return (
    <div className="App">
      <h1>Time entries</h1>
      <TimeList />
      <TimeForm />
    </div>
  );
}

export default App;
