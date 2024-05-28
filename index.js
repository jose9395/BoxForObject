// const express = require("express");
// const multer = require("multer");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const sharp = require("sharp");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 3000; // Use port from .env or default to 3000
// const upload = multer();

// const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// app.post("/process-images", upload.array("pictures", 2), async (req, res) => {
//   const files = req.files;

//   if (files.length !== 2) {
//     return res.status(400).send("Please upload exactly two images: front view and top view.");
//   }

//   try {
//     const processedImages = [];
//     for (const file of files) {
//       const imagePart = await fileToGenerativePart(file.buffer, file.mimetype);
//       if (imagePart !== null) {
//         processedImages.push(imagePart);
//       }
//     }

//     if (processedImages.length !== 2) {
//       return res.status(500).send("Error processing one or both images.");
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
//     const prompt = "Given the provided front view and top view images of the object, calculate the dimensions of the smallest rectangular (cuboid) box that can contain the object. Ensure the dimensions are accurate and present them in the following format: length × breadth × depth";
//     const result = await model.generateContent([prompt, processedImages[0], processedImages[1]]);
//     const response = await result.response;
//     const text = await response.text();

//     res.send(text);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error processing images");
//   }

//   // Cleanup: No need to delete files when processing buffers in-memory
// });

// async function fileToGenerativePart(buffer, originalMimeType) {
//   const acceptedMimeTypes = [
//     "image/png",
//     "image/jpeg",
//     "image/webp",
//     "image/heic",
//     "image/heif",
//   ];
//   let mimeType = acceptedMimeTypes.includes(originalMimeType)
//     ? originalMimeType
//     : "image/jpeg";

//   try {
//     const imageBuffer = await sharp(buffer)
//       .toFormat("jpeg", { quality: 90 })
//       .toBuffer();

//     return {
//       inlineData: {
//         data: imageBuffer.toString("base64"),
//         mimeType: "image/jpeg",
//       },
//     };
//   } catch (error) {
//     console.error("Error processing file:", error);
//     return null;
//   }
// }

// app.listen(port, () => console.log(`Server running on port ${port}`));

const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Jimp = require("jimp");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000; // Use port from .env or default to 3000
const upload = multer();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post("/process-images", upload.array("pictures", 2), async (req, res) => {
  const files = req.files;

  if (files.length !== 2) {
    return res.status(400).send("Please upload exactly two images: front view and top view.");
  }

  try {
    const processedImages = [];
    for (const file of files) {
      const imagePart = await fileToGenerativePart(file.buffer);
      if (imagePart !== null) {
        processedImages.push(imagePart);
      }
    }

    if (processedImages.length !== 2) {
      return res.status(500).send("Error processing one or both images.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const prompt = "Given the provided front view and top view images of the object, calculate the dimensions of the smallest rectangular (cuboid) box that can contain the object. Ensure the dimensions are accurate and present them in the following format: length × breadth × depth in cm";
    const result = await model.generateContent([prompt, processedImages[0], processedImages[1]]);
    const response = await result.response;
    const text = await response.text();

    res.send(text);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing images");
  }

  // Cleanup: No need to delete files when processing buffers in-memory
});

async function fileToGenerativePart(buffer) {
  try {
    const image = await Jimp.read(buffer);
    const imageBuffer = await image.quality(90).getBufferAsync(Jimp.MIME_JPEG);

    return {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/jpeg",
      },
    };
  } catch (error) {
    console.error("Error processing file:", error);
    return null;
  }
}

app.listen(port, () => console.log(`Server running on port ${port}`));
