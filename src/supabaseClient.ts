import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlwqexqrnldmvjkbqmex.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sd3FleHFybmxkbXZqa2JxbWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTcxMTMsImV4cCI6MjA2NjA3MzExM30.vh7ogQX4nV7vjXifGIRj_Lk-YRm3UYC_O42pkbfhMbw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
