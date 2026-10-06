import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({limit:"1mb"}));
app.use(express.static(__dirname));

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({apiKey: process.env.OPENAI_API_KEY})
  : null;

app.get("/api/health", (req,res) => {
  res.json({ok:true, llm:Boolean(client)});
});

const SYSTEM = `
Jsi AI simulátor pro fiktivní sandboxovou hru o české politice.
Nejsi politický poradce pro skutečné volby; pouze simuluj herní svět.
Dostaneš stav hry a přirozený příkaz hráče. Urči logické krátkodobé a mírné dlouhodobé důsledky.
Nikdy nevymýšlej změny mimo hranice rozumné simulace. Zachovej herní konzistenci.
Vrať POUZE JSON podle tohoto schématu:
{
  "effects": {
    "days": number,
    "support": number,
    "members": number,
    "budget": number,
    "influence": number,
    "regional": {"název kraje": number}
  },
  "event": {"title": string, "text": string},
  "ai_response": string
}
Dny jsou celé číslo. Support je změna v procentních bodech, ne nová hodnota.
Regional jsou změny v procentních bodech.
Budget je změna v Kč.
Nezasahuj přímo do počtu mandátů, pokud akce není volba nebo jasná parlamentní událost.
`;

app.post("/api/action", async (req,res) => {
  if (!client) {
    return res.status(503).json({error:"OPENAI_API_KEY není nastaven."});
  }

  const {action,state} = req.body || {};
  if (!action || !state) {
    return res.status(400).json({error:"Chybí action nebo state."});
  }

  const prompt = JSON.stringify({action,state}, null, 2);

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions: SYSTEM,
      input: prompt,
      text: {text: {
  format: {
    type: "json_schema",
    name: "political_action",
    strict: true,
    schema: {
      type: "object",
      properties: {
        effects: {
          type: "object",
          properties: {
            days: { type: "number" },
            support: { type: "number" },
            members: { type: "number" },
            budget: { type: "number" },
            influence: { type: "number" },
            regional: {
              type: "object",
              properties: {
                "Praha": { type: "number" },
                "Středočeský kraj": { type: "number" },
                "Jihočeský kraj": { type: "number" },
                "Plzeňský kraj": { type: "number" },
                "Karlovarský kraj": { type: "number" },
                "Ústecký kraj": { type: "number" },
                "Liberecký kraj": { type: "number" },
                "Královéhradecký kraj": { type: "number" },
                "Pardubický kraj": { type: "number" },
                "Kraj Vysočina": { type: "number" },
                "Jihomoravský kraj": { type: "number" },
                "Olomoucký kraj": { type: "number" },
                "Zlínský kraj": { type: "number" },
                "Moravskoslezský kraj": { type: "number" }
              },
              required: [
                "Praha",
                "Středočeský kraj",
                "Jihočeský kraj",
                "Plzeňský kraj",
                "Karlovarský kraj",
                "Ústecký kraj",
                "Liberecký kraj",
                "Královéhradecký kraj",
                "Pardubický kraj",
                "Kraj Vysočina",
                "Jihomoravský kraj",
                "Olomoucký kraj",
                "Zlínský kraj",
                "Moravskoslezský kraj"
              ],
              additionalProperties: false
            }
          },
          required: [
            "days",
            "support",
            "members",
            "budget",
            "influence",
            "regional"
          ],
          additionalProperties: false
        },
        event: {
          type: "object",
          properties: {
            title: { type: "string" },
            text: { type: "string" }
          },
          required: ["title", "text"],
          additionalProperties: false
        },
        ai_response: {
          type: "string"
        }
      },
      required: ["effects", "event", "ai_response"],
      additionalProperties: false
    }
  }
},
  format: {
    type: "json_schema",
    name: "political_action",
    strict: true,
    schema: {
      type: "object",
      properties: {
        effects: {
          type: "object",
          properties: {
            days: { type: "number" },
            support: { type: "number" },
            members: { type: "number" },
            budget: { type: "number" },
            influence: { type: "number" },
            regional: {
              type: "object",
              additionalProperties: { type: "number" }
            }
          },
          required: ["days", "support", "members", "budget", "influence", "regional"],
          additionalProperties: false
        },
        event: {
          type: "object",
          properties: {
            title: { type: "string" },
            text: { type: "string" }
          },
          required: ["title", "text"],
          additionalProperties: false
        },
        ai_response: { type: "string" }
      },
      required: ["effects", "event", "ai_response"],
      additionalProperties: false
    }
  }
},
      max_output_tokens: 900
    });

    const raw = response.output_text;
    const result = JSON.parse(raw);

    result.effects ??= {};
    result.event ??= {title:"Nová událost",text:"Akce byla vyhodnocena."};
    result.ai_response ??= "Akce byla zpracována.";
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({error:"LLM request failed", detail:err.message});
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Česká politická simulace V6 běží na http://localhost:${PORT}`);
});
