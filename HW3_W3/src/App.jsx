
import CrateClaimCard from "./components/CrateClaimCard.jsx";

import { mockCrateDrops } from "./data/pubgMockData.js";

import "./App.css";

function App() {
  return (
    <main className="arena">
      <header className="arena__header">
        <div className="arena__brand">
          <span className="arena__eyebrow">
            PUBG VIETNAM SERIES
          </span>

          <h1>KRAFTON Airdrop Arena</h1>

          <p>
            Championship Tickets & G-Coin Supply Drops
          </p>
        </div>

        <span className="arena__live-indicator">
          ARENA SYSTEM ONLINE
        </span>
      </header>

      <section
        className="arena__section"
        aria-labelledby="drops-heading"
      >
        <div className="arena__section-header">
          <div>
            <span className="arena__eyebrow">
              LIMITED-TIME OFFERS
            </span>

            <h2 id="drops-heading">
              Airdrop & Ticket Center
            </h2>
          </div>

          <span className="arena__count">
            {mockCrateDrops.length} DROPS
          </span>
        </div>

        <div className="arena__grid">
          {mockCrateDrops.map((drop) => (
            <CrateClaimCard
              key={drop.id}
              drop={drop}
            />
          ))}
        </div>
      </section>

      <footer className="arena__footer">
        Development simulation · Mock PUBG Vietnam data
      </footer>
    </main>
  );
}

export default App;
