import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-50b341de/health", (c) => {
  return c.json({ status: "ok" });
});

// Parking endpoints

// Get all parking data
app.get("/make-server-50b341de/parking", async (c) => {
  try {
    const parkingData = await kv.getByPrefix("parking:");
    // Sort by timestamp descending (newest first)
    const sorted = parkingData.sort((a, b) => {
      return new Date(b.waktuMasuk).getTime() - new Date(a.waktuMasuk).getTime();
    });
    return c.json({ data: sorted });
  } catch (error) {
    console.log("Error fetching parking data:", error);
    return c.json({ error: "Failed to fetch parking data", details: String(error) }, 500);
  }
});

// Create new parking entry
app.post("/make-server-50b341de/parking", async (c) => {
  try {
    const body = await c.req.json();
    const { platNomor } = body;

    if (!platNomor) {
      return c.json({ error: "Plat nomor is required" }, 400);
    }

    const id = Date.now().toString();
    const parkingData = {
      id,
      platNomor: platNomor.toUpperCase(),
      waktuMasuk: new Date().toISOString(),
      status: "pending"
    };

    await kv.set(`parking:${id}`, parkingData);
    return c.json({ data: parkingData });
  } catch (error) {
    console.log("Error creating parking entry:", error);
    return c.json({ error: "Failed to create parking entry", details: String(error) }, 500);
  }
});

// Update parking status
app.put("/make-server-50b341de/parking/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    const existingData = await kv.get(`parking:${id}`);
    if (!existingData) {
      return c.json({ error: "Parking entry not found" }, 404);
    }

    const updatedData = {
      ...existingData,
      status
    };

    await kv.set(`parking:${id}`, updatedData);
    return c.json({ data: updatedData });
  } catch (error) {
    console.log("Error updating parking entry:", error);
    return c.json({ error: "Failed to update parking entry", details: String(error) }, 500);
  }
});

// Delete parking entry
app.delete("/make-server-50b341de/parking/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`parking:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting parking entry:", error);
    return c.json({ error: "Failed to delete parking entry", details: String(error) }, 500);
  }
});

// Delete all parking entries
app.delete("/make-server-50b341de/parking", async (c) => {
  try {
    const parkingData = await kv.getByPrefix("parking:");
    const keys = parkingData.map((item) => `parking:${item.id}`);
    if (keys.length > 0) {
      await kv.mdel(keys);
    }
    return c.json({ success: true, deleted: keys.length });
  } catch (error) {
    console.log("Error deleting all parking entries:", error);
    return c.json({ error: "Failed to delete all parking entries", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);