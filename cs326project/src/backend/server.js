import * as http from "http";
import * as url from "url";
import { saveUser, loadUser, updateUserData, deleteUser, findUserByEmail } from "./database.js";

const HOSTNAME = "localhost";
const PORT = 3260;
const headerFields = { "Content-Type": "application/json" };

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method.toUpperCase();

  if (parsedUrl.pathname === "/signup" && method === "POST") {
    await handleSignup(req, res);
  } else if (parsedUrl.pathname === "/signin" && method === "POST") {
    await handleSignin(req, res);
  } else if (parsedUrl.pathname === "/saveAvailability" && method === "POST") {
    await handleSaveAvailability(req, res);
  } else if (parsedUrl.pathname === "/saveInterests" && method === "POST") {
    await handleSaveInterests(req, res);
  } else if (parsedUrl.pathname === "/subscribe" && method === "POST") {
    await handleSubscribe(req, res);
  } else if (parsedUrl.pathname === "/loadUser" && method === "GET") {
    await handleLoadUser(req, res);
  } else if (parsedUrl.pathname === "/deleteUser" && method === "DELETE") {
    await handleDeleteUser(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server is running at http://${HOSTNAME}:${PORT}/`);
});

async function handleSignup(req, res) {
  let body = "";
  req.on("data", chunk => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    const user = JSON.parse(body);
    try {
      const existingUser = await findUserByEmail(user.email);
      if (existingUser) {
        res.writeHead(400, headerFields);
        res.end(JSON.stringify({ message: "User already exists" }));
        return;
      }
      const newUser = await saveUser(
        user.preferredName,
        user.username,
        user.password,
        user.email,
        user.major,
        user.academicYear,
        user.location,
        user.interests
      );
      res.writeHead(201, headerFields);
      res.end(JSON.stringify({ user: newUser }));
    } catch (error) {
      console.error("Error creating user:", error);
      res.writeHead(500, headerFields);
      res.end(JSON.stringify({ message: "Error creating user" }));
    }
  });
}

async function handleSignin(req, res) {
  let body = "";
  req.on("data", chunk => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    const { email, password } = JSON.parse(body);
    try {
      const user = await findUserByEmail(email);
      if (!user || user.password !== password) {
        res.writeHead(401, headerFields);
        res.end(JSON.stringify({ message: "Invalid email or password" }));
        return;
      }
      res.writeHead(200, headerFields);
      res.end(JSON.stringify({ user }));
    } catch (error) {
      console.error("Error signing in:", error);
      res.writeHead(500, headerFields);
      res.end(JSON.stringify({ message: "Error signing in" }));
    }
  });
}

async function handleSaveAvailability(req, res) {
  let body = "";
  req.on("data", chunk => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    const { availability, currentUser } = JSON.parse(body);
    if (!currentUser) {
      res.writeHead(401, headerFields);
      res.end(JSON.stringify({ message: "Please sign in first" }));
      return;
    }
    try {
      const user = await findUserByEmail(currentUser.email);
      user.availability = availability;
      await updateUserData(user);
      res.writeHead(200, headerFields);
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      console.error("Error saving availability:", error);
      res.writeHead(500, headerFields);
      res.end(JSON.stringify({ success: false, message: "Error saving availability" }));
    }
  });
}

async function handleSaveInterests(req, res) {
  let body = "";
  req.on("data", chunk => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    const { interests, currentUser } = JSON.parse(body);
    if (!currentUser) {
      res.writeHead(401, headerFields);
      res.end(JSON.stringify({ message: "Please sign in first" }));
      return;
    }
    try {
      const user = await findUserByEmail(currentUser.email);
      user.interests = interests;
      await updateUserData(user);
      res.writeHead(200, headerFields);
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      console.error("Error saving interests:", error);
      res.writeHead(500, headerFields);
      res.end(JSON.stringify({ success: false, message: "Error saving interests" }));
    }
  });
}

async function handleSubscribe(req, res) {
  let body = "";
  req.on("data", chunk => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    const { email, event } = JSON.parse(body);
    try {
      const user = await findUserByEmail(email);
      user.subscriptions.push(event);
      await updateUserData(user);
      res.writeHead(200, headerFields);
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      console.error("Error subscribing to event:", error);
      res.writeHead(500, headerFields);
      res.end(JSON.stringify({ success: false, message: "Error subscribing to event" }));
    }
  });
}

async function handleLoadUser(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const { email } = parsedUrl.query;
  try {
    const user = await loadUser(email);
    res.writeHead(200, headerFields);
    res.end(JSON.stringify({ user }));
  } catch (error) {
    console.error("Error loading user:", error);
    res.writeHead(500, headerFields);
    res.end(JSON.stringify({ message: "Error loading user" }));
  }
}

async function handleDeleteUser(req, res) {
  let body = "";
  req.on("data", chunk => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    const { email } = JSON.parse(body);
    try {
      await deleteUser(email);
      res.writeHead(200, headerFields);
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      console.error("Error deleting user:", error);
      res.writeHead(500, headerFields);
      res.end(JSON.stringify({ success: false, message: "Error deleting user" }));
    }
  });
}
