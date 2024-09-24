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
