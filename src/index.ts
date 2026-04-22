import express from "express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const app = express();
const PORT = Number(process.env.PORT ?? 8081);
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";
const DYNAMO_TABLE = process.env.DYNAMO_TABLE;

if (!DYNAMO_TABLE) {
  throw new Error("Falta configurar DYNAMO_TABLE.");
}

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }));

function log(level: "INFO" | "ERROR", message: string, meta?: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      level,
      service: "receptor",
      message,
      timestamp: new Date().toISOString(),
      ...(meta ?? {}),
    })
  );
}

app.get("/boletines/:boletinID", async (req, res) => {
  try {
    const boletinID = String(req.params.boletinID ?? "").trim();
    const correo = String(req.query.correoElectronico ?? req.query["correoElectrónico"] ?? "").trim();

    if (!boletinID || !correo) {
      return res.status(400).send("Faltan parámetros: boletinID y correoElectronico.");
    }

    const result = await ddbClient.send(
      new GetCommand({
        TableName: DYNAMO_TABLE,
        Key: { boletinID },
      })
    );

    if (!result.Item) {
      return res.status(404).send("Boletín no encontrado.");
    }

    if (result.Item.correoElectronico !== correo) {
      return res.status(403).send("Correo no autorizado para consultar este boletín.");
    }

    await ddbClient.send(
      new UpdateCommand({
        TableName: DYNAMO_TABLE,
        Key: { boletinID },
        UpdateExpression: "SET leido = :leido, leidoEn = :leidoEn",
        ExpressionAttributeValues: {
          ":leido": true,
          ":leidoEn": new Date().toISOString(),
        },
      })
    );

    const archivoUrl = String(result.Item.archivoUrl ?? "").trim();
    const contenido = String(result.Item.contenido ?? "");

    const html = `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Boletín ${boletinID}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; line-height: 1.5; }
          .contenedor { max-width: 760px; margin: 0 auto; }
          img { max-width: 100%; border-radius: 8px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="contenedor">
          <h1>Boletín</h1>
          <p>${contenido}</p>
          <p><a href="${archivoUrl}" target="_blank" rel="noopener noreferrer">Abrir archivo en S3</a></p>
          <img src="${archivoUrl}" alt="Imagen del boletín" />
        </div>
      </body>
    </html>
    `;

    log("INFO", "Boletin consultado", { boletinID });

    return res.status(200).send(html);
  } catch (error: any) {
    log("ERROR", "Error consultando boletin", { error: String(error?.message ?? error) });
    return res.status(500).send(`Error consultando boletín: ${error?.message ?? "desconocido"}`);
  }
});

const server = app.listen(PORT, () => {
  log("INFO", "Mostrador escuchando", { port: PORT });
});

function shutdown(signal: string) {
  log("INFO", "Recibida senal de apagado", { signal });
  server.close((error?: Error) => {
    if (error) {
      log("ERROR", "Error durante cierre del servidor", { error: String(error.message) });
      process.exit(1);
    }
    log("INFO", "Servidor detenido correctamente");
    process.exit(0);
  });

  setTimeout(() => {
    log("ERROR", "Cierre forzado por timeout");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));