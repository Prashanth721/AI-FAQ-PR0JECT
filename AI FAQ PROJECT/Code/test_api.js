/**
 * test_api.js
 *
 * Simple automated test script for the AI FAQ Assistant API.
 * Runs through every route in order: register -> login -> create FAQ ->
 * list FAQs -> search FAQs -> update FAQ -> AI generate -> AI ask -> delete FAQ
 *
 * HOW TO RUN:
 *   1. Make sure your server is running first (npm run dev) in another terminal
 *   2. In a NEW terminal, in the same project folder, run:
 *        node test_api.js
 *   3. Watch the console - each test prints PASS or FAIL with the response
 *
 * Requires Node 18+ (uses the built-in fetch, no extra install needed).
 */

const BASE_URL = "http://localhost:5000";

// A random-ish email each run so "user already exists" doesn't block re-runs
const randomTag = Date.now();
const testUser = {
  name: "Test User",
  email: `testuser${randomTag}@example.com`,
  password: "securepass123",
};

let token = null;
let createdFaqId = null;

// Small helper so every test prints in a consistent, readable way
async function runTest(label, fn) {
  try {
    const result = await fn();
    console.log(`\n✅ PASS - ${label}`);
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.log(`\n❌ FAIL - ${label}`);
    console.log(error.message);
    return null;
  }
}

// Wraps fetch + throws if the response isn't ok, so runTest can catch it
async function request(method, path, body, useAuth = false) {
  const headers = { "Content-Type": "application/json" };
  if (useAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(data)}`);
  }

  return data;
}

async function main() {
  console.log("Starting AI FAQ Assistant API tests...");
  console.log(`Target: ${BASE_URL}`);
  console.log(`Test user email: ${testUser.email}`);

  // 1. Register
  const registerResult = await runTest("Register new user", () =>
    request("POST", "/api/auth/register", testUser)
  );
  if (registerResult?.token) token = registerResult.token;

  // 2. Login (in case register didn't return a token for some reason)
  if (!token) {
    const loginResult = await runTest("Login", () =>
      request("POST", "/api/auth/login", {
        email: testUser.email,
        password: testUser.password,
      })
    );
    if (loginResult?.token) token = loginResult.token;
  }

  if (!token) {
    console.log("\n⚠️  No token obtained - stopping here, private routes will fail.");
    return;
  }

  // 3. Create an FAQ (private route)
  const createResult = await runTest("Create FAQ", () =>
    request(
      "POST",
      "/api/faqs",
      {
        question: "What is Node.js?",
        answer: "Node.js is a JavaScript runtime built on Chrome's V8 engine.",
        category: "Technology",
      },
      true
    )
  );
  if (createResult?._id) createdFaqId = createResult._id;

  // 4. List all FAQs (public route)
  await runTest("List all FAQs", () => request("GET", "/api/faqs"));

  // 5. Search FAQs by keyword (public route)
  await runTest("Search FAQs for 'node'", () =>
    request("GET", "/api/faqs/search?q=node")
  );

  // 6. Update the FAQ we just created (private route)
  if (createdFaqId) {
    await runTest("Update FAQ", () =>
      request(
        "PUT",
        `/api/faqs/${createdFaqId}`,
        { answer: "Node.js is an open-source, cross-platform JS runtime." },
        true
      )
    );
  }

  // 7. Ask the AI assistant a question, grounded in existing FAQs (public route)
  // NOTE: needs a valid GEMINI_API_KEY in your .env, or this will fail
  await runTest("AI: Ask a question", () =>
    request("POST", "/api/ai/ask", { question: "what is node.js?" })
  );

  // 8. Ask Gemini to generate a new FAQ draft from a topic (private route)
  // NOTE: needs a valid GEMINI_API_KEY in your .env, or this will fail
  await runTest("AI: Generate FAQ from topic", () =>
    request(
      "POST",
      "/api/ai/generate-faq",
      { topic: "how to reset a forgotten password" },
      true
    )
  );

  // 9. Delete the FAQ we created, to clean up after the test run
  if (createdFaqId) {
    await runTest("Delete FAQ", () =>
      request("DELETE", `/api/faqs/${createdFaqId}`, null, true)
    );
  }

  console.log("\nAll tests finished.");
}

main();
