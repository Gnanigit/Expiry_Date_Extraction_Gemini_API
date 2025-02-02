require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors({ origin: "*" }));

app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/extract-expiry-date", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded." });
  }

  try {
    const imagePath = req.file.path;
    const base64Image = fs.readFileSync(imagePath, { encoding: "base64" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Extract expiry date from the image" },
            { inlineData: { data: base64Image, mimeType: "image/png" } },
          ],
        },
      ],
    });
    const text = response.response.text();

    const datePattern = /\b(0?[1-9]|1[0-2])\/(\d{4})\b/;
    const match = text.match(datePattern);
    const extractedDate = match ? match[0] : "Not found";

    fs.unlinkSync(imagePath);
    console.log(extractedDate);
    console.log("Sending response:", { expiryDate: extractedDate });
    return res.status(201).json({ expiryDate: extractedDate });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to extract expiry date." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
