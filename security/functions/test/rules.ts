import {readFileSync} from "fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {doc, getDoc, setDoc} from "firebase/firestore";
import "mocha";

let testEnv: RulesTestEnvironment;
before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-test",
    firestore: {
      host: "localhost",
      port: 8080,
      rules: readFileSync("../firestore.rules", "utf8"),
    },
  });
});
after(async () => {
  await testEnv.cleanup();
});
beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Messages", () => {
  it("should not allow unauthenticated users to read messages", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(unauthedDb, "messages/id")));
  });

  it("should allow ONLY signed in users to read messages", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();

    // Setup: Create documents in DB for testing (bypassing Security Rules).
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "messages/id"), {text: "test"});
    });

    // Signed in user reading messages
    await assertSucceeds(getDoc(doc(aliceDb, "messages/id")));
  });

  it("should NOT allow users to write messages", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();

    // Signed in user writing messages
    await assertFails(
      setDoc(doc(aliceDb, "messages/id"), {
        name: "test",
      })
    );
  });
});

describe("Time entries", () => {
  it("should not allow unauthenticated requests to read time entries", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(unauthedDb, "times/id")));
  });

  it("should allow ONLY signed in users to read their own time entries", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();

    // Setup: Create documents in DB for testing (bypassing Security Rules).
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "times/id"), {user_id: "alice"});
      await setDoc(doc(db, "times/id-2"), {user_id: "bob"});
    });

    // Signed in user reading own's wishlist
    await assertSucceeds(getDoc(doc(aliceDb, "times/id")));

    // Signed in user reading others' wishlist
    await assertFails(getDoc(doc(aliceDb, "times/id-2")));
  });

  it("should allow ONLY signed in users to write their own time entries", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();

    // Signed in user writing own's time entries
    await assertSucceeds(
      setDoc(doc(aliceDb, "times/id"), {
        title: "test",
        time_seconds: 300,
        user_id: "alice",
      })
    );

    // Signed in user writing others' time entries
    await assertFails(
      setDoc(doc(aliceDb, "times/id-2"), {
        title: "test",
        time_seconds: 300,
        user_id: "bob",
      })
    );

    // Signed in user writing invalid time entry (no title property)
    await assertFails(
      setDoc(doc(aliceDb, "times/id"), {
        time_seconds: 300,
        user_id: "alice",
      })
    );

    // Signed in user writing invalid time entry (no time_seconds property)
    await assertFails(
      setDoc(doc(aliceDb, "times/id"), {
        title: "test",
        user_id: "alice",
      })
    );
  });
});
