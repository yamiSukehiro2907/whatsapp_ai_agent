const { client, twilioPhoneNumber } = require("../config/twilio.config.js");
const { genAI, systemInstruction } = require("../config/llm.config.js");
const db = require("../database.js");

const chat = async (req, res) => {
  const userMessage = req.body.Body;
  const userPhone = req.body.From;

  let userId;
  let userProfile;
  let dbChatHistory;

  try {
    let user = db
      .prepare("SELECT * FROM Users WHERE phone_number = ?")
      .get(userPhone);

    if (!user) {
      const info = db
        .prepare(
          "INSERT INTO Users (phone_number, financial_profile) VALUES (?, ?)"
        )
        .run(userPhone, "{}");
      userId = info.lastInsertRowid;
      userProfile = {};
    } else {
      userId = user.user_id;
      userProfile = JSON.parse(user.financial_profile || "{}");
    }

    dbChatHistory = db
      .prepare(
        "SELECT sender_role, content FROM Messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 10"
      )
      .all(userId);

    const history = dbChatHistory.reverse().map((msg) => ({
      role: msg.sender_role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    let finalHistory = history;

    if (finalHistory.length > 0 && finalHistory[0].role !== "user") {
      const firstUserIndex = finalHistory.findIndex(
        (msg) => msg.role === "user"
      );

      if (firstUserIndex !== -1) {
        finalHistory = finalHistory.slice(firstUserIndex);
      } else {
        finalHistory = [];
      }
    }

    let conversationText = systemInstruction + "\n\n";

    if (Object.keys(userProfile).length > 0) {
      conversationText += "## Current User Profile:\n";
      conversationText += JSON.stringify(userProfile, null, 2) + "\n\n";
    }

    finalHistory.forEach((msg) => {
      conversationText += `${msg.role === "user" ? "User" : "Assistant"}: ${
        msg.parts[0].text
      }\n\n`;
    });

    conversationText += `User: ${userMessage}\n\nAssistant:`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: conversationText,
    });

    let aiResponse = result.text;

    const profileUpdates = parseProfileUpdates(aiResponse);
    if (profileUpdates && Object.keys(profileUpdates).length > 0) {
      userProfile = { ...userProfile, ...profileUpdates };
      db.prepare(
        "UPDATE Users SET financial_profile = ? WHERE user_id = ?"
      ).run(JSON.stringify(userProfile), userId);
    }

    aiResponse = cleanProfileMarkers(aiResponse);

    db.prepare(
      "INSERT INTO Messages (user_id, sender_role, content) VALUES (?, ?, ?)"
    ).run(userId, "user", userMessage);

    db.prepare(
      "INSERT INTO Messages (user_id, sender_role, content) VALUES (?, ?, ?)"
    ).run(userId, "ai", aiResponse);

    await client.messages.create({
      body: aiResponse,
      from: twilioPhoneNumber,
      to: userPhone,
    });
  } catch (error) {
    console.error(`Error:`, error);
    client.messages.create({
      body: "Sorry, I ran into an error. Please try again.",
      from: twilioPhoneNumber,
      to: userPhone,
    });
  }
  return res.status(200).send("<Response/>");
};

function parseProfileUpdates(aiResponse) {
  const updates = {};
  const profileUpdateRegex = /📝 PROFILE_UPDATE: (\w+)=([^\n]+)/g;

  let match;
  while ((match = profileUpdateRegex.exec(aiResponse)) !== null) {
    const key = match[1];
    const value = match[2].trim();
    updates[key] = value;
  }

  return updates;
}

function cleanProfileMarkers(text) {
  return text
    .split("\n")
    .filter((line) => !line.includes("📝 PROFILE_UPDATE:"))
    .join("\n")
    .trim()
    .replace(/\n{3,}/g, "\n\n");
}

module.exports = { chat };
