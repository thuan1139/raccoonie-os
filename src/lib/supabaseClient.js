import { createClient } from "@supabase/supabase-js";

// Đọc từ biến môi trường (Vite yêu cầu prefix VITE_)
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Nếu chưa cấu hình Supabase, app vẫn chạy bằng mock data (client = null)
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

/*
  Ví dụ cách đọc dữ liệu thật thay cho seed data:

  import { supabase } from "./lib/supabaseClient";

  async function loadProducts() {
    if (!supabase) return null;            // fallback về mock
    const { data, error } = await supabase.from("products").select("*");
    if (error) { console.error(error); return null; }
    return data;
  }

  // Ghi:
  // await supabase.from("tasks").update({ status: "Done" }).eq("id", id);
  // await supabase.from("products").insert({ name, category, cost, price });
*/
