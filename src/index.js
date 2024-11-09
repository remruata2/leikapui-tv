/* global ENACT_PACK_ISOMORPHIC */
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import AppView from "./App";
import SpotlightRootDecorator from "@enact/spotlight/SpotlightRootDecorator";

const App = SpotlightRootDecorator(AppView);

import reportWebVitals from "./reportWebVitals";

const appElement = (
  <Router>
    <App />
  </Router>
);

// In a browser environment, render instead of exporting
if (typeof window !== "undefined") {
  if (ENACT_PACK_ISOMORPHIC) {
    hydrateRoot(document.getElementById("root"), appElement);
  } else {
    createRoot(document.getElementById("root")).render(appElement);
  }
}

export default appElement;

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint.
// Learn more: https://github.com/enactjs/cli/blob/master/docs/measuring-performance.md
reportWebVitals();
