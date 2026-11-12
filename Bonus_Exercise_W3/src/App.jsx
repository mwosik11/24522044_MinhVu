
import { SituationshipAnalyzer } from "./components/SituationshipAnalyzer.jsx";

function App() {
  return (
    <>
      <a className="sa-skip-link" href="#main-content">
        Skip to main content
      </a>

      <main id="main-content" className="sa-app-main">
        <SituationshipAnalyzer />
      </main>
    </>
  );
}

export default App;
