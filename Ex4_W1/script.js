const componentState = document.querySelector("#component-state");

function showLiveData() {
    componentState.innerHTML = `
        <section class="live-state" aria-labelledby="live-title">

            <header class="data-header">
                <h2 id="live-title">Project Data</h2>

                <section class="metadata">
                    <span class="metadata-badge">
                        Status: Live
                    </span>

                    <span class="metadata-badge">
                        Projects: 3
                    </span>

                    <span class="metadata-badge">
                        Updated: Just now
                    </span>
                </section>
            </header>

            <ul class="data-grid">

                <li class="data-item">
                    <h3>Distributed State Engine</h3>
                    <p>
                        Lightweight event bus built without external libraries.
                    </p>
                </li>

                <li class="data-item">
                    <h3>Analytics Dashboard</h3>
                    <p>
                        Responsive dashboard for monitoring business metrics.
                    </p>
                </li>

                <li class="data-item">
                    <h3>Portfolio System</h3>
                    <p>
                        Accessible portfolio architecture with reusable components.
                    </p>
                </li>

            </ul>

        </section>
    `;
}

setTimeout(showLiveData, 1500);