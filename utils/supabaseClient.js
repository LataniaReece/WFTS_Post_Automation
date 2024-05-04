import { createClient } from "@supabase/supabase-js";

const sbUrl = process.env.SUPABASE_URL;
const sbApiKey = process.env.SUPABASE_API_KEY;

const client = createClient(sbUrl, sbApiKey);

export default client;
