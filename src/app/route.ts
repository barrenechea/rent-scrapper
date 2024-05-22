import { env } from "~/env";
import { db } from "~/server/db";
import { seenRecords } from "~/server/db/schema";
import PortalInmobiliario from "~/server/portalinmobiliario-fetch";
import TelegramBot from "~/server/telegram";

const bot = new TelegramBot();

const userIds = [
  "743185645", // Seba
  "7105537351", // Fran
];

const clpFormat = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");

  if (env.AUTH_TOKEN && auth !== env.AUTH_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) {
    return Response.json({ error: "Missing url" }, { status: 400 });
  }

  const data = await PortalInmobiliario(url);

  const existingIds = (await db.query.seenRecords.findMany()).map(
    (record) => record.meliId
  );

  const newRecords = data.filter((record) => !existingIds.includes(record.id));

  if (newRecords.length > 0) {
    console.log("New records found", newRecords.length);
    await db
      .insert(seenRecords)
      .values(newRecords.map((record) => ({ meliId: record.id })));
  }

  for (const record of newRecords) {
    const price =
      record.price.currency_id === "CLP"
        ? clpFormat.format(record.price.amount)
        : `UF ${record.price.amount}`;

    const message = `[${record.sub_title}](${record.permalink})
    Precio: ${price} / mes`;
    for (const userId of userIds.filter(Boolean)) {
      await bot.sendResult(userId, message.replace(/\./g, "\\."));
    }
  }

  return Response.json({ newRecords });
}
