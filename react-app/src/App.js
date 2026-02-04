import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 DevOps Auto Deploy Working ✅</h1>

        <p>
          Deployed via <b>GitHub Actions → EC2 → Docker Compose</b>
        </p>

        <p style={{ fontSize: "18px", marginTop: "15px" }}>
          Updated by: <b>Dharmendra (DC)</b> 😎🔥
        </p>

        <p style={{ fontSize: "14px", marginTop: "20px", opacity: 0.8 }}>
          Time: {new Date().toLocaleString()}
        </p>

        <a
          className="App-link"
          href="https://github.com/DharmendraChakrawarti/DevOps_Project"
          target="_blank"
          rel="noopener noreferrer"
        >
          View GitHub Repo
        </a>
      </header>
    </div>
  );
}

export default App;
