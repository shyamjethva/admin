import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS
app.use(
  "/make-server-1f8e3111/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Generic CRUD factory for KV store
const createCrudRoutes = (prefix: string, storeKey: string) => {
  // Get all
  app.get(`/make-server-1f8e3111/${prefix}`, async (c) => {
    try {
      const data = await kv.get(storeKey);
      return c.json(data || []);
    } catch (err) {
      console.error(`Error fetching ${prefix}:`, err);
      return c.json({ error: 'Failed to fetch' }, 500);
    }
  });

  // Save/Update all (replaces the whole array for simplicity in this proto)
  app.post(`/make-server-1f8e3111/${prefix}`, async (c) => {
    try {
      const body = await c.req.json();
      await kv.set(storeKey, body);
      return c.json({ success: true });
    } catch (err) {
      console.error(`Error saving ${prefix}:`, err);
      return c.json({ error: 'Failed to save' }, 500);
    }
  });
};

// Initialize CRUD for all modules
const modules = [
  'employees', 'departments', 'designations', 'attendance', 'shifts', 
  'leaveRequests', 'leaveTypes', 'holidays', 'birthdays', 'jobPostings', 
  'candidates', 'interviews', 'payrollEntries', 'salaryComponents', 
  'announcements', 'chatMessages', 'tasks', 'clients', 'clockRecords', 'absences'
];

modules.forEach(mod => createCrudRoutes(mod, `data_${mod}`));

// Auth: Signup
app.post('/make-server-1f8e3111/signup', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  
  try {
    const { email, password, name, role } = await c.req.json();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    });
    
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ user: data.user });
  } catch (err) {
    return c.json({ error: 'Server error' }, 500);
  }
});

// Health check
app.get("/make-server-1f8e3111/health", (c) => c.json({ status: "ok" }));

Deno.serve(app.fetch);
