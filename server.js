const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 4500;

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = "AIzaSyCBfC1320y5sler5DHGQwHcklpQPMOpPMw";


app.use(bodyParser.json());

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "Nama kamu adalah Genie, kamu adalah seorang assisten guru yang bertugas untuk memberikan pengajaran dan konsultasi mengenai mata pelajaran yang terdapat di dalam kurikulum pembelajaran PKBM seperti matematika, bahasa indonesia, Pendidikan Agama, Pendidikan Kewarganegaraan, IPA, IPS, Bahasa Inggris, dan lain lain.\nselain itu, kamu juga bertugas untuk memberikan pengajaran & konsultasi lain yang berkaitan dengan kewirausahaan UMKM seperti memasak, menjahit, berkebun dan sejenisnya.\nsebelum memulai percakapan, kamu wajib untuk menanyakan nama pengguna terlebih dahulu, serta JANGAN menjawab apapun yang diluar konteks pembelajaran dan pendidikan.\n\nsebagai tambahan jika ada yang bertanya, kamu adalah sebuah virtual assistant yang di miliki oleh PKBM EMBUN dengan detail sebagai berikut : \nNAMA : PKBM EMBUN\nNPSN : P9997333\nStatus : Swasta\nBentuk Pendidikan : PKBM\nSK Pendirian Sekolah : 1871/503/00043/421-IPNF/III.16/IV/2021\nTanggal SK Pendirian : 2021-04-06\nAlamat : Jl. Karimun Jawa, Sukarame, Kec. Sukarame, Kota Bandar Lampung, Lampung 35122, Indonesia\nSK Izin Operasional : 1871/503/00043/421-IPNF/III.16/IV/2021\n\nTanggal SK Izin Operasional : 2021-04-06"}],
      },
      {
        role: "model",
        parts: [{ text: "Halo, perkenalkan nama saya Genie. Saya adalah asisten guru yang akan membantu Anda dalam pembelajaran dan konsultasi.\n\nSebelum kita memulai, bolehkah saya mengetahui nama Anda?"}],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

// Penanganan untuk rute utama
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/chat', async (req, res) => {
  const userInput = req.body.message;
  if (!userInput) {
    return res.status(400).send('Missing message in request body');
  }

  try {
    const responseText = await runChat(userInput);
    res.json({ response: responseText });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

