import * as z from "zod";

// Import the Genkit core libraries and plugins.
import {generate} from "@genkit-ai/ai";
import {configureGenkit} from "@genkit-ai/core";
import {firebase} from "@genkit-ai/firebase";
import {googleAI, gemini15Flash} from "@genkit-ai/googleai";

// From the Firebase plugin, import the functions needed to deploy flows using
// Cloud Functions.
import {firebaseAuth} from "@genkit-ai/firebase/auth";
import {onFlow} from "@genkit-ai/firebase/functions";

import {defineSecret} from "firebase-functions/params";
const googleAIapiKey = defineSecret("GOOGLE_GENAI_API_KEY");

import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";

export const makeUpperCase = onDocumentCreated(
  "/times/{documentId}",
  (event) => {
    const title = event.data?.data().title as string;

    logger.log("Uppercasing", event.params.documentId, title);

    const uppercase =
      title.length > 0 ? [...title][0].toUpperCase() + title.slice(1) : title;
    return event.data?.ref.set({title: uppercase}, {merge: true});
  }
);

configureGenkit({
  plugins: [
    // Load the Firebase plugin, which provides integrations with several
    // Firebase services.
    firebase(),
    // Load the Google AI plugin. You can optionally specify your API key
    // by passing in a config object; if you don't, the Google AI plugin uses
    // the value from the GOOGLE_GENAI_API_KEY environment variable, which is
    // the recommended practice.
    googleAI(),
  ],
  // Log debug output to tbe console.
  logLevel: "debug",
  // Perform OpenTelemetry instrumentation and enable trace collection.
  enableTracingAndMetrics: true,
});

export const todosDescriptionFlow = onFlow(
  {
    name: "todosDescriptionFlow",
    httpsOptions: {
      secrets: [googleAIapiKey],
      cors: "*",
    },
    inputSchema: z.array(z.string()),
    outputSchema: z.string(),
    authPolicy: firebaseAuth((user) => {
      if (!user) {
        throw new Error("User required to run flow");
      }
    }),
  },
  async (subject) => {
    const prompt =
      "This is a web application that helps you manage your tasks. " +
      "Please provide a description of the following tasks, " +
      "taking no longer than 200 characters: " +
      subject.join(", ");
    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    return llmResponse.text();
  }
);
