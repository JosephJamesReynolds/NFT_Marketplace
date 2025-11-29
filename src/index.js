import { createRoot } from "react-dom/client";
import "./frontend/components/index.css";

import App from "./frontend/components/App";
import * as serviceWorker from "./serviceWorker";

import { Provider } from "react-redux";
import { store } from "./frontend/components/store/store";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
