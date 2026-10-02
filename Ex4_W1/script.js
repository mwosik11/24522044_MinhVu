const componentState = document.querySelector("#component-state");

const states = {
    LOADING: "loading",
    LIVE: "live",
    EMPTY: "empty",
    ERROR: "error"
};

function renderLoading() {
    componentState.innerHTML = `
        <section
            class="loading-state"
            aria-label="Loading project data"
        >
            <span class="skeleton-item"></span>
            <span class="skeleton-item"></span>
            <span class="skeleton-item"></span>
        </section>
    `;
}

function renderLive() {
    componentState.innerHTML = `
        <section
            class="live-state"
            aria-labelledby="live-title"
        >
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

function renderEmpty() {
    componentState.innerHTML = `
        <section
            class="empty-state"
            aria-labelledby="empty-title"
        >
            <h2 id="empty-title">No projects found</h2>

            <p>
                There is currently no project data available.
            </p>

            <button
                type="button"
                class="retry-button"
                id="retry-button"
            >
                Retry
            </button>
        </section>
    `;

    document
        .querySelector("#retry-button")
        .addEventListener("click", handleRetry);
}

function renderError() {
    componentState.innerHTML = `
        <section
            class="error-state"
            aria-labelledby="error-title"
        >
            <h2 id="error-title">Unable to load projects</h2>

            <p>
                Something went wrong while loading the project data.
            </p>

            <button
                type="button"
                class="retry-button"
                id="retry-button"
            >
                Retry
            </button>
        </section>
    `;

    document
        .querySelector("#retry-button")
        .addEventListener("click", handleRetry);
}

function transitionTo(state) {
    switch (state) {
        case states.LOADING:
            renderLoading();
            break;

        case states.LIVE:
            renderLive();
            break;

        case states.EMPTY:
            renderEmpty();
            break;

        case states.ERROR:
            renderError();
            break;

        default:
            renderError();
    }
}

function handleRetry() {
    transitionTo(states.LOADING);

    setTimeout(() => {
        transitionTo(states.LIVE);
    }, 1500);
}

transitionTo(states.LOADING);

setTimeout(() => {
    transitionTo(states.LIVE);
}, 1500);