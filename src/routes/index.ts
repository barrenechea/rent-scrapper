import express from "express";
import { db } from "../server/db/index.js";
import { seenRecords } from "../server/db/schema.js";
import PortalInmobiliario from "../server/portalinmobiliario-fetch.js";
import TelegramBot from "../server/telegram.js";

export const router = express.Router();

const bot = new TelegramBot();

const userIds = process.env.TELEGRAM_IDS?.split(",") ?? [];

const clpFormat = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

router.get("/", async (req, res) => {
  const auth = req.headers.authorization;

  if (process.env.AUTH_TOKEN && auth !== process.env.AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) {
    return res.status(400).json({ error: "Missing url" });
  }

  const data = await PortalInmobiliario(url);

  const existingIds = (await db.query.seenRecords.findMany()).map(
    (record) => record.meliId
  );

  const newRecords = data.filter((record) => !existingIds.includes(record.id));

  for (const record of newRecords) {
    const price =
      record.price.currency_id === "CLP"
        ? clpFormat.format(record.price.amount)
        : `UF ${record.price.amount}`;

    const message = `<a href="${record.permalink}">${record.sub_title}</a>
      Precio: ${price} / mes`;
    await Promise.all(userIds.map((userId) => bot.sendResult(userId, message)));
  }

  if (newRecords.length > 0) {
    console.log(`Storing ${newRecords.length} new records`);
    await db
      .insert(seenRecords)
      .values(newRecords.map((record) => ({ meliId: record.id })));
  }

  return res.json({ newRecords });
});
