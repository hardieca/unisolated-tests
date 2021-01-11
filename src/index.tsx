/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import React from "react";
import ReactDOM from "react-dom";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import detector from "i18next-browser-languagedetector";
import { App } from "src/App";
import { CONSTANTS } from "src/constants";
import englishTranslations from "src/locales/en-CA.json";
import frenchTranslations from "src/locales/fr-CA.json";
import { config } from "src/config";
import { Amplify } from "aws-amplify";
import * as serviceWorker from "./serviceWorker";

Amplify.configure(config.amplifyConfig);

/**
 * The following starts our mock api server based on an env var
 *
 * IMPORANT NOTE: You need to explicitly set this var to false in your NPM
 * build script. Otherwise this logic fork will always be included in the bundle
 * along with our large mock data JSON files.
 */
if (process.env.REACT_APP_MOCK_API === "true") {
  /* eslint-disable import/no-extraneous-dependencies */
  const { setupWorker } = require("msw");
  const { handlers } = require("src/mockApi/serverHandlers");

  setupWorker(...handlers).start();
} else {
  serviceWorker.unregister();
}

const resources = {
  [CONSTANTS.ENGLISH_CODE]: {
    translation: englishTranslations,
  },
  [CONSTANTS.FRENCH_CODE]: {
    translation: frenchTranslations,
  },
};

i18next
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: CONSTANTS.ENGLISH_CODE,
  });

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root"),
);
