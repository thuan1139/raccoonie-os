import React, { useState, useMemo, useEffect, createContext, useContext } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area, RadialBarChart, RadialBar,
} from "recharts";
import {
  LayoutDashboard, Calendar, BookOpen, Megaphone, Package, Film, Kanban as KanbanIcon,
  BarChart3, Sparkles, Settings, Plus, X, ChevronDown, ChevronRight, TrendingUp,
  TrendingDown, AlertTriangle, Lightbulb, Target, Zap, Search, Bell, Send,
  ArrowRight, ShoppingCart, Users, Flame, Star, Clock, CheckCircle2, Circle,
  DollarSign, Rocket, Wand2, Heart, GitBranch, Layers, MessageSquare, Filter,
} from "lucide-react";

/* ============================================================================
   RACCOONIE OS v1.0 — Business Operating System (MVP prototype, mock data)
   Objective → Calendar → Event → Mission → Campaign → Project → Task → Analytics
   ========================================================================== */

const INDIGO = "#6366f1";
const VIOLET = "#8b5cf6";
const ACCENTS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9", "#f43f5e"];

/* ----------------------------- Formatting -------------------------------- */
const fmtVND = (n) => {
  if (n == null) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1) + " tỷ";
  if (n >= 1e6) return Math.round(n / 1e6) + "tr";
  if (n >= 1e3) return Math.round(n / 1e3) + "k";
  return String(n);
};
const fmtNum = (n) => (n == null ? "—" : n.toLocaleString("vi-VN"));
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const uid = (p = "id") => p + "_" + Math.random().toString(36).slice(2, 8);

/* ------------------------ Persistence (localStorage) --------------------- */
/* Bọc try/catch: chạy thật trên trình duyệt sẽ lưu & reload vẫn còn dữ liệu;
   trong môi trường sandbox (không có localStorage) sẽ tự bỏ qua, không lỗi.  */
const loadState = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const saveState = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* no-op */
  }
};
const LS = { objectives: "raccoonie:objectives" };

/* ------------------------------- Users ----------------------------------- */
const users = [
  { id: "u1", name: "Minh Anh", role: "CEO", department: "Leadership", avatar: "🦝", email: "ceo@raccoonie.vn", status: "online" },
  { id: "u2", name: "Bảo Trân", role: "Brand Manager", department: "Brand", avatar: "🐨", email: "brand@raccoonie.vn", status: "online" },
  { id: "u3", name: "Hà Vy", role: "Planner", department: "Planning", avatar: "🦊", email: "plan@raccoonie.vn", status: "online" },
  { id: "u4", name: "Đức Huy", role: "Product Research", department: "Product", avatar: "🐼", email: "product@raccoonie.vn", status: "away" },
  { id: "u5", name: "Gia Hân", role: "3D Designer", department: "Product", avatar: "🐰", email: "3d@raccoonie.vn", status: "online" },
  { id: "u6", name: "Tuấn Kiệt", role: "Content", department: "Creative", avatar: "🦁", email: "content@raccoonie.vn", status: "online" },
  { id: "u7", name: "Mỹ Linh", role: "Designer", department: "Creative", avatar: "🦋", email: "design@raccoonie.vn", status: "online" },
  { id: "u8", name: "Quốc Bảo", role: "Video Editor", department: "Creative", avatar: "🐧", email: "video@raccoonie.vn", status: "busy" },
  { id: "u9", name: "Thanh Thảo", role: "Ads", department: "Growth", avatar: "🦉", email: "ads@raccoonie.vn", status: "online" },
  { id: "u10", name: "Khánh Ngân", role: "Livestream", department: "Sales", avatar: "🐥", email: "live@raccoonie.vn", status: "online" },
  { id: "u11", name: "Phương Nam", role: "Affiliate", department: "Growth", avatar: "🐙", email: "aff@raccoonie.vn", status: "away" },
  { id: "u12", name: "Ngọc Mai", role: "Sale Admin", department: "Operation", avatar: "🐝", email: "sale@raccoonie.vn", status: "online" },
  { id: "u13", name: "Văn Toàn", role: "Warehouse", department: "Operation", avatar: "🦔", email: "wh@raccoonie.vn", status: "online" },
  { id: "u14", name: "Thu Hiền", role: "CSKH", department: "Operation", avatar: "🐹", email: "care@raccoonie.vn", status: "online" },
  { id: "u15", name: "Anh Dũng", role: "Finance", department: "Finance", avatar: "🦫", email: "fin@raccoonie.vn", status: "online" },
];
const userById = (id) => users.find((u) => u.id === id);
const ALL_ROLES = users.map((u) => u.role);

/* ---------------------------- Seed data ---------------------------------- */
const seedObjectives = [
  { id: "o1", title: "GMV Q4 đạt 3 tỷ", type: "GMV", ownerId: "u1", targetValue: 3e9, currentValue: 1.92e9, startDate: "2025-10-01", endDate: "2025-12-31", status: "In Progress" },
  { id: "o2", title: "Website chiếm 40% doanh thu", type: "Website Growth", ownerId: "u2", targetValue: 40, currentValue: 28, startDate: "2025-10-01", endDate: "2025-12-31", status: "At Risk" },
  { id: "o3", title: "ROAS trung bình đạt 8", type: "Profit", ownerId: "u9", targetValue: 8, currentValue: 6.4, startDate: "2025-10-01", endDate: "2025-12-31", status: "In Progress" },
  { id: "o4", title: "Ra mắt 50 SKU mới", type: "Product Development", ownerId: "u4", targetValue: 50, currentValue: 31, startDate: "2025-09-01", endDate: "2025-12-31", status: "In Progress" },
  { id: "o5", title: "Xây dựng brand đa nền tảng", type: "Brand Building", ownerId: "u2", targetValue: 100, currentValue: 62, startDate: "2025-08-01", endDate: "2025-12-31", status: "In Progress" },
];

const seedEvents = [
  { id: "e1", name: "Tết Nguyên Đán", month: 1, startDate: "2026-01-20", endDate: "2026-02-10", type: "Seasonal", status: "Planning", linkedMissionIds: ["m5"], ownerId: "u3" },
  { id: "e2", name: "Valentine", month: 2, startDate: "2026-02-08", endDate: "2026-02-14", type: "Seasonal", status: "Planning", linkedMissionIds: ["m4"], ownerId: "u3" },
  { id: "e3", name: "Quốc tế Phụ nữ 8/3", month: 3, startDate: "2026-03-01", endDate: "2026-03-08", type: "Seasonal", status: "Upcoming", linkedMissionIds: [], ownerId: "u3" },
  { id: "e4", name: "Ngày Nhà giáo VN 20/11", month: 11, startDate: "2025-11-10", endDate: "2025-11-20", type: "Seasonal", status: "In Progress", linkedMissionIds: [], ownerId: "u3" },
  { id: "e5", name: "Phụ nữ VN 20/10", month: 10, startDate: "2025-10-10", endDate: "2025-10-20", type: "Seasonal", status: "Completed", linkedMissionIds: ["m2"], ownerId: "u3" },
  { id: "e6", name: "Halloween", month: 10, startDate: "2025-10-25", endDate: "2025-10-31", type: "Branding", status: "Completed", linkedMissionIds: [], ownerId: "u3" },
  { id: "e7", name: "Black Friday", month: 11, startDate: "2025-11-24", endDate: "2025-11-30", type: "Mega Sale", status: "In Progress", linkedMissionIds: [], ownerId: "u3" },
  { id: "e8", name: "11.11 Mega Sale", month: 11, startDate: "2025-11-11", endDate: "2025-11-11", type: "Mega Sale", status: "Completed", linkedMissionIds: [], ownerId: "u3" },
  { id: "e9", name: "12.12 Mega Sale", month: 12, startDate: "2025-12-12", endDate: "2025-12-12", type: "Mega Sale", status: "Planning", linkedMissionIds: [], ownerId: "u3" },
  { id: "e10", name: "Christmas", month: 12, startDate: "2025-12-01", endDate: "2025-12-25", type: "Seasonal", status: "In Progress", linkedMissionIds: ["m1"], ownerId: "u3" },
  { id: "e11", name: "Sinh nhật / Kỷ niệm", month: 0, startDate: "2025-01-01", endDate: "2025-12-31", type: "Daily", status: "In Progress", linkedMissionIds: [], ownerId: "u3" },
];

const seedMissions = [
  { id: "m1", title: "Christmas Collection", objectiveId: "o1", eventId: "e10", ownerId: "u2", targetGMV: 800e6, currentGMV: 512e6, budget: 90e6, startDate: "2025-12-01", endDate: "2025-12-25", status: "In Progress" },
  { id: "m2", title: "20/10 Campaign", objectiveId: "o1", eventId: "e5", ownerId: "u2", targetGMV: 400e6, currentGMV: 430e6, budget: 50e6, startDate: "2025-10-10", endDate: "2025-10-20", status: "Completed" },
  { id: "m3", title: "Website Growth Q4", objectiveId: "o2", eventId: "e11", ownerId: "u2", targetGMV: 1.2e9, currentGMV: 0.62e9, budget: 120e6, startDate: "2025-10-01", endDate: "2025-12-31", status: "In Progress" },
  { id: "m4", title: "Valentine Gift Collection", objectiveId: "o1", eventId: "e2", ownerId: "u2", targetGMV: 350e6, currentGMV: 40e6, budget: 45e6, startDate: "2026-01-25", endDate: "2026-02-14", status: "Not Started" },
  { id: "m5", title: "Tết Nguyên Đán Gift Campaign", objectiveId: "o1", eventId: "e1", ownerId: "u2", targetGMV: 900e6, currentGMV: 0, budget: 110e6, startDate: "2025-12-28", endDate: "2026-02-10", status: "Not Started" },
];

const seedCampaigns = [
  { id: "c1", title: "TikTok Push Christmas", missionId: "m1", ownerId: "u6", channel: "TikTok Shop", targetGMV: 350e6, currentGMV: 268e6, budget: 45e6, spend: 31e6, roas: 8.6, startDate: "2025-12-01", endDate: "2025-12-25", status: "In Progress" },
  { id: "c2", title: "Website Conversion Christmas", missionId: "m1", ownerId: "u7", channel: "Website", targetGMV: 300e6, currentGMV: 158e6, budget: 30e6, spend: 24e6, roas: 6.6, startDate: "2025-12-01", endDate: "2025-12-25", status: "At Risk" },
  { id: "c3", title: "Shopee Mega Sale 20/10", missionId: "m2", ownerId: "u9", channel: "Shopee", targetGMV: 200e6, currentGMV: 224e6, budget: 25e6, spend: 22e6, roas: 10.2, startDate: "2025-10-10", endDate: "2025-10-20", status: "Completed" },
  { id: "c4", title: "Affiliate Push Valentine", missionId: "m4", ownerId: "u11", channel: "Affiliate", targetGMV: 150e6, currentGMV: 18e6, budget: 20e6, spend: 3e6, roas: 5.4, startDate: "2026-01-28", endDate: "2026-02-14", status: "In Progress" },
  { id: "c5", title: "Livestream Gift Week", missionId: "m1", ownerId: "u10", channel: "Livestream", targetGMV: 180e6, currentGMV: 96e6, budget: 18e6, spend: 12e6, roas: 8.0, startDate: "2025-12-08", endDate: "2025-12-15", status: "In Progress" },
];

const seedProjects = [
  { id: "p1", title: "Christmas Product Set", campaignId: "c1", type: "Product", ownerId: "u4", progress: 80, status: "In Progress" },
  { id: "p2", title: "TikTok Content Batch", campaignId: "c1", type: "Creative", ownerId: "u6", progress: 65, status: "In Progress" },
  { id: "p3", title: "Website UX Optimize", campaignId: "c2", type: "Growth", ownerId: "u7", progress: 40, status: "At Risk" },
  { id: "p4", title: "Shopee Sale Ops", campaignId: "c3", type: "Operation", ownerId: "u12", progress: 100, status: "Completed" },
  { id: "p5", title: "Live Selling Setup", campaignId: "c5", type: "Sales", ownerId: "u10", progress: 55, status: "In Progress" },
];

const PRIOS = ["Low", "Medium", "High", "Critical"];
const seedTasks = [
  { id: "t1", title: "Quay 5 video đèn ngủ Galaxy", projectId: "p2", assigneeId: "u6", role: "Content", priority: "High", status: "Doing", dueDate: "2025-12-10", description: "Batch quay hook 3s + demo ánh sáng phòng tối.", campaignId: "c1", productId: "pr2" },
  { id: "t2", title: "Edit 5 video TikTok", projectId: "p2", assigneeId: "u8", role: "Video Editor", priority: "High", status: "Todo", dueDate: "2025-12-12", description: "Cut 15-30s, sub tiếng Việt, nhạc trend.", campaignId: "c1", creativeId: "cr1" },
  { id: "t3", title: "Thiết kế banner Christmas", projectId: "p2", assigneeId: "u7", role: "Designer", priority: "Medium", status: "Review", dueDate: "2025-12-08", description: "3 size cho Website hero + Facebook.", campaignId: "c1" },
  { id: "t4", title: "Fix trang thanh toán Website", projectId: "p3", assigneeId: "u7", role: "Designer", priority: "Critical", status: "Doing", dueDate: "2025-12-09", description: "Conversion tụt 11%, kiểm tra checkout flow.", campaignId: "c2" },
  { id: "t5", title: "Setup kịch bản Livestream", projectId: "p5", assigneeId: "u10", role: "Livestream", priority: "High", status: "Todo", dueDate: "2025-12-11", description: "Rundown 90 phút + combo quà.", campaignId: "c5" },
  { id: "t6", title: "Scale Ads video #182 viral", projectId: "p2", assigneeId: "u9", role: "Ads", priority: "Critical", status: "Doing", dueDate: "2025-12-09", description: "Tăng budget x3, tách camp winning.", campaignId: "c1" },
  { id: "t7", title: "Nhập kho đèn ngủ Galaxy", projectId: "p1", assigneeId: "u13", role: "Warehouse", priority: "Critical", status: "Todo", dueDate: "2025-12-10", description: "Tồn 3 ngày — cần nhập gấp 500 pcs.", campaignId: "c1", productId: "pr2" },
  { id: "t8", title: "Duyệt script Valentine", projectId: "p2", assigneeId: "u2", role: "Brand Manager", priority: "Medium", status: "Review", dueDate: "2025-12-15", description: "Review angle couple gift.", campaignId: "c4" },
  { id: "t9", title: "Trả lời 40 ticket CSKH", projectId: "p4", assigneeId: "u14", role: "CSKH", priority: "Medium", status: "Done", dueDate: "2025-12-06", description: "SLA < 2h.", campaignId: "c3" },
  { id: "t10", title: "Chốt margin combo Tết", projectId: "p1", assigneeId: "u15", role: "Finance", priority: "High", status: "Todo", dueDate: "2025-12-20", description: "Đảm bảo margin > 45%.", campaignId: "c1" },
  { id: "t11", title: "Research 10 SKU quà Tết", projectId: "p1", assigneeId: "u4", role: "Product Research", priority: "Medium", status: "Doing", dueDate: "2025-12-18", description: "Trend quà lì xì cá nhân hoá.", campaignId: "c1" },
  { id: "t12", title: "Model 3D móc khóa couple", projectId: "p1", assigneeId: "u5", role: "3D Designer", priority: "Medium", status: "Review", dueDate: "2025-12-14", description: "File in 3D + preview render.", campaignId: "c4", productId: "pr5" },
];

const LIFECYCLE = ["Idea", "Research", "Validation", "Design", "Prototype", "Testing", "Media", "Listing", "Live", "Scale", "Retired"];
const seedProducts = [
  { id: "pr1", name: "Đèn ngủ cá nhân hóa", sku: "DN-001", category: "Đèn ngủ", campaignIds: ["c1"], lifecycle: "Scale", cost: 62000, price: 199000, margin: 46, productScore: 92, isPersonalized: true, isHeroProduct: true, isSeasonal: false, targetCustomer: "Gen Z tặng quà", gmv: 412e6, orders: 2070, status: "Live" },
  { id: "pr2", name: "Đèn ngủ Galaxy", sku: "DN-002", category: "Đèn ngủ", campaignIds: ["c1", "c5"], lifecycle: "Live", cost: 78000, price: 249000, margin: 44, productScore: 88, isPersonalized: false, isHeroProduct: true, isSeasonal: true, targetCustomer: "Gen Z trang trí phòng", gmv: 318e6, orders: 1277, status: "Live" },
  { id: "pr3", name: "Đèn ngủ mini cute", sku: "DN-003", category: "Đèn ngủ", campaignIds: [], lifecycle: "Testing", cost: 35000, price: 99000, margin: 51, productScore: 71, isPersonalized: false, isHeroProduct: false, isSeasonal: false, targetCustomer: "Quà rẻ vô tri", gmv: 41e6, orders: 414, status: "In Progress" },
  { id: "pr4", name: "Móc khóa tên cá nhân hóa", sku: "MK-001", category: "Móc khóa", campaignIds: ["c3"], lifecycle: "Live", cost: 12000, price: 59000, margin: 62, productScore: 84, isPersonalized: true, isHeroProduct: false, isSeasonal: false, targetCustomer: "Quà nhóm bạn", gmv: 138e6, orders: 2339, status: "Live" },
  { id: "pr5", name: "Móc khóa couple", sku: "MK-002", category: "Móc khóa", campaignIds: ["c4"], lifecycle: "Design", cost: 18000, price: 89000, margin: 55, productScore: 66, isPersonalized: true, isHeroProduct: false, isSeasonal: true, targetCustomer: "Couple Valentine", gmv: 0, orders: 0, status: "In Progress" },
  { id: "pr6", name: "Quà tặng sinh nhật cá nhân hóa", sku: "QT-001", category: "Quà tặng cá nhân hóa", campaignIds: [], lifecycle: "Media", cost: 95000, price: 299000, margin: 48, productScore: 79, isPersonalized: true, isHeroProduct: false, isSeasonal: false, targetCustomer: "Tặng người yêu/bạn thân", gmv: 88e6, orders: 294, status: "In Progress" },
  { id: "pr7", name: "Quà kỷ niệm vui nhộn", sku: "QT-002", category: "Quà tặng cá nhân hóa", campaignIds: [], lifecycle: "Idea", cost: 0, price: 0, margin: 0, productScore: 40, isPersonalized: true, isHeroProduct: false, isSeasonal: false, targetCustomer: "Quà troll gây cười", gmv: 0, orders: 0, status: "Not Started" },
];

const CREATIVE_STAGES = ["Idea", "Script", "Production", "Editing", "Review", "Published", "Performance"];
const seedCreatives = [
  { id: "cr1", title: "Video TikTok đèn ngủ #001", campaignId: "c1", productId: "pr2", type: "TikTok Video", creatorId: "u6", editorId: "u8", reviewerId: "u2", status: "Performance", platform: "TikTok Shop", hook: "POV: phòng bạn tối thui cho tới khi...", contentAngle: "Aesthetic phòng ngủ", publishDate: "2025-12-02", views: 1240000, orders: 892, gmv: 178e6, performanceScore: 94 },
  { id: "cr2", title: "Video TikTok móc khóa #002", campaignId: "c3", productId: "pr4", type: "TikTok Video", creatorId: "u6", editorId: "u8", reviewerId: "u2", status: "Published", platform: "TikTok Shop", hook: "Tặng cả nhóm mà chỉ 59k", contentAngle: "Quà nhóm bạn", publishDate: "2025-12-04", views: 420000, orders: 310, gmv: 18e6, performanceScore: 72 },
  { id: "cr3", title: "Reel quà tặng sinh nhật #003", campaignId: "c1", productId: "pr6", type: "Instagram Reel", creatorId: "u7", editorId: "u8", reviewerId: "u2", status: "Review", platform: "Instagram", hook: "Unbox quà sinh nhật khắc tên", contentAngle: "Cảm xúc / gift reveal", publishDate: "", views: 0, orders: 0, gmv: 0, performanceScore: 0 },
  { id: "cr4", title: "Banner Website 20/10", campaignId: "c3", productId: "pr4", type: "Banner", creatorId: "u7", editorId: "u7", reviewerId: "u2", status: "Published", platform: "Website", hook: "Sale 20/10 — quà cho phái đẹp", contentAngle: "Seasonal sale", publishDate: "2025-10-11", views: 96000, orders: 210, gmv: 42e6, performanceScore: 68 },
  { id: "cr5", title: "Landing Page Christmas", campaignId: "c2", productId: "pr1", type: "Landing Page", creatorId: "u7", editorId: "u7", reviewerId: "u2", status: "Editing", platform: "Website", hook: "Bộ sưu tập quà Giáng Sinh", contentAngle: "Collection storytelling", publishDate: "", views: 0, orders: 0, gmv: 0, performanceScore: 0 },
  { id: "cr6", title: "Livestream Cut #001", campaignId: "c5", productId: "pr2", type: "Livestream Cut", creatorId: "u10", editorId: "u8", reviewerId: "u2", status: "Script", platform: "TikTok Shop", hook: "Chốt đơn đèn Galaxy giá sốc", contentAngle: "Live highlight", publishDate: "", views: 0, orders: 0, gmv: 0, performanceScore: 0 },
];

const seedPlaybooks = [
  { id: "pb1", title: "Christmas Playbook", type: "Campaign", description: "Bộ khung chạy mùa Giáng Sinh đa kênh cho brand quà tặng.", timeline: "6 tuần (T-6 → launch → T+2 review)", checklist: ["Chốt collection & hero product", "Chuẩn kho + forecast tồn", "Batch 15 video TikTok", "Landing page Christmas", "Setup Livestream Gift Week", "Ads warmup + scale winning"], kpi: ["GMV 800tr", "ROAS ≥ 8", "Website share ≥ 35%"], taskTemplates: ["Quay video hero", "Thiết kế banner 3 size", "Setup camp Ads", "Rundown livestream"], lessons: ["Video aesthetic phòng ngủ convert cao nhất năm ngoái", "Nên nhập kho sớm 3 tuần"], assets: ["Moodboard Xmas", "Template caption", "Nhạc trend list"] },
  { id: "pb2", title: "Valentine Playbook", type: "Campaign", description: "Đẩy quà couple & cá nhân hóa dịp 14/2.", timeline: "4 tuần", checklist: ["Chốt combo couple", "Angle content cảm xúc", "Affiliate push", "Pre-order sớm"], kpi: ["GMV 350tr", "AOV +20%"], taskTemplates: ["Model 3D móc khóa couple", "Reel gift reveal", "Kịch bản affiliate"], lessons: ["Pre-order từ 25/1 giúp không cháy kho"], assets: ["Moodboard hồng", "Hook list couple"] },
  { id: "pb3", title: "20/10 Playbook", type: "Campaign", description: "Ngày Phụ nữ VN — quà tặng phái đẹp.", timeline: "3 tuần", checklist: ["Shopee Mega Sale setup", "Banner phái đẹp", "Voucher 20/10"], kpi: ["GMV 400tr", "ROAS ≥ 9"], taskTemplates: ["Setup sale Shopee", "Banner sale"], lessons: ["Shopee mega sale ROAS tốt hơn TikTok dịp này"], assets: ["Voucher template"] },
  { id: "pb4", title: "TikTok Video Playbook", type: "Creative", description: "Công thức sản xuất video TikTok bán quà tặng.", timeline: "Lặp lại hàng tuần", checklist: ["Hook 3s", "Demo sản phẩm", "CTA rõ ràng", "Sub tiếng Việt", "Nhạc trend"], kpi: ["View ≥ 200k", "CTR shop ≥ 3%"], taskTemplates: ["Viết hook", "Quay demo", "Edit + sub"], lessons: ["POV hook giữ chân tốt nhất", "3s đầu quyết định 80%"], assets: ["Hook bank", "Nhạc trend", "Overlay template"] },
  { id: "pb5", title: "Product Launch Playbook", type: "Product", description: "Đưa 1 SKU từ Idea → Scale.", timeline: "8 tuần", checklist: ["Research demand", "Validate mẫu", "Design + prototype", "Test market nhỏ", "Media + listing", "Scale khi ROAS ổn"], kpi: ["Product score ≥ 80", "Margin ≥ 45%"], taskTemplates: ["Research SKU", "Model 3D", "Chụp media", "Viết listing"], lessons: ["Test 100 đơn đầu trước khi scale Ads"], assets: ["Product DNA template", "Cost sheet"] },
  { id: "pb6", title: "Website Growth Playbook", type: "Growth", description: "Tăng tỉ trọng doanh thu từ Website.", timeline: "Cả quý", checklist: ["Tối ưu tốc độ", "Fix checkout", "Email/retention", "SEO landing"], kpi: ["Website share 40%", "CVR ≥ 2.5%"], taskTemplates: ["Audit checkout", "Setup email flow"], lessons: ["Checkout 1 bước tăng CVR rõ rệt"], assets: ["Checklist UX"] },
  { id: "pb7", title: "Operation Playbook", type: "Operation", description: "Vận hành kho + CSKH mùa sale.", timeline: "Theo sự kiện", checklist: ["Forecast tồn", "Chuẩn nhân sự đóng gói", "SLA CSKH < 2h", "Xử lý hoàn/hủy"], kpi: ["Giao đúng hạn ≥ 97%", "SLA CSKH < 2h"], taskTemplates: ["Forecast kho", "Lịch đóng gói"], lessons: ["Buffer safety stock x1.5 mùa sale"], assets: ["Bảng forecast"] },
];

const seedDecisions = [
  { id: "d1", title: "Đèn ngủ Galaxy còn tồn kho 3 ngày", type: "Critical", description: "Tốc độ bán hiện tại sẽ hết hàng trong ~3 ngày.", recommendation: "Nhập gấp 500 pcs hoặc tạm giảm Ads để không cháy kho.", relatedObjectiveId: "o1", relatedCampaignId: "c1", priority: "Critical", status: "Open", createdAt: "2025-12-08" },
  { id: "d2", title: "Website Conversion giảm 11% so với tuần trước", type: "Warning", description: "CVR Website tụt, ảnh hưởng mục tiêu Website 40%.", recommendation: "Audit lại checkout flow, ưu tiên task fix thanh toán.", relatedObjectiveId: "o2", relatedCampaignId: "c2", priority: "High", status: "Open", createdAt: "2025-12-08" },
  { id: "d3", title: "Video TikTok #182 đang viral", type: "Opportunity", description: "Video đạt 1.2M view, CTR shop cao bất thường.", recommendation: "Scale Ads x3 vào camp winning ngay hôm nay.", relatedObjectiveId: "o1", relatedCampaignId: "c1", priority: "Critical", status: "Open", createdAt: "2025-12-07" },
  { id: "d4", title: "Campaign 20/10 chậm 12% so với timeline", type: "Warning", description: "Tiến độ dưới kế hoạch, rủi ro trễ mục tiêu GMV.", recommendation: "Dồn lực affiliate + livestream tuần này.", relatedObjectiveId: "o1", relatedCampaignId: "c4", priority: "Medium", status: "Open", createdAt: "2025-12-06" },
  { id: "d5", title: "Dự báo GMV Q4 chạm 2.85 tỷ", type: "Forecast", description: "Theo đà hiện tại, GMV Q4 ~2.85 tỷ (95% mục tiêu).", recommendation: "Tăng ngân sách Christmas + đẩy Tết pre-order sớm.", relatedObjectiveId: "o1", relatedCampaignId: null, priority: "Medium", status: "Open", createdAt: "2025-12-05" },
];

const seedSales = (() => {
  const days = ["01/12", "02/12", "03/12", "04/12", "05/12", "06/12", "07/12", "08/12"];
  const base = [180, 210, 195, 240, 268, 252, 290, 312];
  return days.map((d, i) => ({
    date: d,
    gmv: base[i] * 1e6,
    orders: Math.round(base[i] * 4.1),
    website: Math.round(base[i] * 0.28 * 1e6),
    tiktok: Math.round(base[i] * 0.44 * 1e6),
    shopee: Math.round(base[i] * 0.18 * 1e6),
    live: Math.round(base[i] * 0.1 * 1e6),
    roas: (6 + i * 0.12).toFixed(1),
  }));
})();

const seedInventory = [
  { id: "iv1", productId: "pr2", stock: 118, safetyStock: 200, forecastDaysLeft: 3, status: "Low Stock" },
  { id: "iv2", productId: "pr1", stock: 640, safetyStock: 300, forecastDaysLeft: 14, status: "OK" },
  { id: "iv3", productId: "pr4", stock: 1200, safetyStock: 400, forecastDaysLeft: 21, status: "OK" },
  { id: "iv4", productId: "pr3", stock: 0, safetyStock: 100, forecastDaysLeft: 0, status: "Out of Stock" },
  { id: "iv5", productId: "pr6", stock: 85, safetyStock: 120, forecastDaysLeft: 6, status: "Low Stock" },
];

/* -------------------------- Role → screens ------------------------------- */
const roleScreens = {
  CEO: ["ceo", "analytics", "campaign", "calendar", "knowledge", "settings"],
  "Brand Manager": ["campaign", "product", "creative", "tasks", "analytics", "calendar", "settings"],
  Planner: ["calendar", "playbook", "campaign", "tasks", "settings"],
  "Product Research": ["product", "tasks", "knowledge", "settings"],
  "3D Designer": ["product", "tasks", "settings"],
  Content: ["creative", "tasks", "knowledge", "settings"],
  Designer: ["creative", "tasks", "settings"],
  "Video Editor": ["creative", "tasks", "settings"],
  Ads: ["analytics", "campaign", "tasks", "settings"],
  Livestream: ["analytics", "campaign", "tasks", "settings"],
  Affiliate: ["analytics", "campaign", "tasks", "settings"],
  "Sale Admin": ["tasks", "analytics", "settings"],
  Warehouse: ["tasks", "product", "settings"],
  CSKH: ["tasks", "settings"],
  Finance: ["analytics", "campaign", "settings"],
};

const NAV = [
  { id: "ceo", label: "CEO Desk", icon: LayoutDashboard },
  { id: "calendar", label: "Business Calendar", icon: Calendar },
  { id: "playbook", label: "Playbook Engine", icon: BookOpen },
  { id: "campaign", label: "Campaign Workspace", icon: Megaphone },
  { id: "product", label: "Product Pipeline", icon: Package },
  { id: "creative", label: "Creative Pipeline", icon: Film },
  { id: "tasks", label: "Task Board", icon: KanbanIcon },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "knowledge", label: "AI Copilot", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings },
];

/* ----------------------------- Store ctx --------------------------------- */
const Store = createContext(null);
const useStore = () => useContext(Store);

/* ============================ UI PRIMITIVES ============================== */
const cx = (...a) => a.filter(Boolean).join(" ");

const statusStyle = {
  // generic
  "In Progress": { bg: "#eef2ff", fg: "#4338ca", dot: INDIGO },
  "Not Started": { bg: "#f1f5f9", fg: "#475569", dot: "#94a3b8" },
  "At Risk": { bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444" },
  Completed: { bg: "#ecfdf5", fg: "#047857", dot: "#10b981" },
  Upcoming: { bg: "#f1f5f9", fg: "#475569", dot: "#94a3b8" },
  Planning: { bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b" },
  Open: { bg: "#eef2ff", fg: "#4338ca", dot: INDIGO },
  Live: { bg: "#ecfdf5", fg: "#047857", dot: "#10b981" },
  // decisions
  Critical: { bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444" },
  Warning: { bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b" },
  Opportunity: { bg: "#ecfdf5", fg: "#047857", dot: "#10b981" },
  Forecast: { bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6" },
  // priorities
  Low: { bg: "#f1f5f9", fg: "#475569", dot: "#94a3b8" },
  Medium: { bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6" },
  High: { bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b" },
  // inventory
  OK: { bg: "#ecfdf5", fg: "#047857", dot: "#10b981" },
  "Low Stock": { bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b" },
  "Out of Stock": { bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444" },
};

function Badge({ children, value }) {
  const s = statusStyle[value] || { bg: "#f1f5f9", fg: "#475569", dot: "#94a3b8" };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: s.bg, color: s.fg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {children ?? value}
    </span>
  );
}

function Progress({ value, color = INDIGO, height = 6 }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-slate-100" style={{ height }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  );
}

function Card({ children, className = "", onClick, hover, style }) {
  return (
    <div onClick={onClick} style={style} className={cx("rounded-2xl border border-slate-200 bg-white shadow-sm", hover && "cursor-pointer transition hover:shadow-md hover:border-slate-300", className)}>
      {children}
    </div>
  );
}

function Avatar({ id, size = 28 }) {
  const u = userById(id);
  if (!u) return null;
  return (
    <span title={u.name + " · " + u.role} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50" style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {u.avatar}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, trend, tint = INDIGO }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: tint + "1a", color: tint }}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {(sub || trend != null) && (
        <div className="mt-1 flex items-center gap-1 text-xs">
          {trend != null && (
            <span className={cx("flex items-center gap-0.5 font-medium", trend >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {Math.abs(trend)}%
            </span>
          )}
          <span className="text-slate-400">{sub}</span>
        </div>
      )}
    </Card>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</h3>
      {action}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, type = "button" }) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition select-none";
  const sizes = { sm: "px-2.5 py-1 text-xs", md: "px-3.5 py-2 text-sm" };
  const variants = {
    primary: "text-white shadow-sm hover:opacity-90",
    ghost: "text-slate-600 hover:bg-slate-100",
    outline: "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50",
    subtle: "text-indigo-700 hover:bg-indigo-50",
  };
  const style = variant === "primary" ? { background: INDIGO } : undefined;
  return (
    <button type={type} onClick={onClick} className={cx(base, sizes[size], variants[variant])} style={style}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

/* --------------------------- Modal + Drawer ------------------------------ */
function Modal({ open, onClose, title, children, footer, width = 520 }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.4)" }} onClick={onClose}>
      <div className="w-full rounded-2xl bg-white shadow-2xl" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: "70vh" }}>{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

function Drawer({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(15,23,42,0.4)" }} onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------- Generic form modal ---------------------------- */
function FormModal({ open, onClose, title, fields, onSubmit, submitLabel = "Tạo" }) {
  const init = useMemo(() => Object.fromEntries((fields || []).map((f) => [f.key, f.default ?? ""])), [fields]);
  const [form, setForm] = useState(init);
  const [errors, setErrors] = useState({});
  useEffect(() => { setForm(init); setErrors({}); }, [init, open]);
  if (!open) return null;

  const set = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };

  const handleSubmit = () => {
    const errs = {};
    fields.forEach((f) => {
      const val = form[f.key];
      if (f.required && (val === "" || val == null)) errs[f.key] = "Trường này bắt buộc";
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<>
        <Btn variant="outline" onClick={onClose}>Hủy</Btn>
        <Btn onClick={handleSubmit} icon={CheckCircle2}>{submitLabel}</Btn>
      </>}>
      <div className="space-y-4">
        {fields.map((f) => {
          const bad = !!errors[f.key];
          const border = bad ? "border-rose-300" : "border-slate-200";
          return (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {f.label}{f.required && <span className="text-rose-500"> *</span>}
              </label>
              {f.type === "select" ? (
                <select value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} className={cx("w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-400", border)}>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea rows={3} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className={cx("w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-400", border)} />
              ) : (
                <input type={f.type || "text"} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className={cx("w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-400", border)} />
              )}
              {bad && <p className="mt-1 text-xs text-rose-500">{errors[f.key]}</p>}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/* ============================== KANBAN =================================== */
function Kanban({ stages, items, groupKey, colorByStage, onMove, renderCard, onOpen }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const col = items.filter((it) => it[groupKey] === stage);
        const color = (colorByStage && colorByStage[stage]) || INDIGO;
        return (
          <div key={stage} className="flex w-72 flex-shrink-0 flex-col rounded-2xl bg-slate-50/70 p-2">
            <div className="mb-2 flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span className="text-sm font-semibold text-slate-700">{stage}</span>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm">{col.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {col.map((it) => (
                <div key={it.id} className="group">
                  {renderCard(it, onOpen)}
                  <div className="mt-1 flex items-center gap-1 px-1 opacity-0 transition group-hover:opacity-100">
                    <span className="text-xs text-slate-400">Chuyển →</span>
                    <select
                      value={it[groupKey]}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onMove(it, e.target.value)}
                      className="flex-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-600 outline-none"
                    >
                      {stages.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              {col.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-300">Trống</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================= CEO DESK ================================== */
function CEODesk() {
  const { objectives, missions, decisions, sales, setScreen, openAsk, addObjective } = useStore();
  const [objOpen, setObjOpen] = useState(false);
  const gmvToday = sales[sales.length - 1].gmv;
  const gmvYest = sales[sales.length - 2].gmv;
  const ordersToday = sales[sales.length - 1].orders;
  const profitToday = Math.round(gmvToday * 0.32);
  const health = 78;
  const todayMissions = missions.filter((m) => m.status === "In Progress");

  const decIcon = { Critical: AlertTriangle, Warning: AlertTriangle, Opportunity: Lightbulb, Forecast: TrendingUp };

  const objectiveFields = [
    { key: "title", label: "Tên Objective", placeholder: "VD: GMV Q1 đạt 4 tỷ", required: true },
    { key: "type", label: "Loại Objective", type: "select", options: ["GMV", "Profit", "Website Growth", "Brand Building", "Product Development"], default: "GMV" },
    { key: "targetValue", label: "Target Value", type: "number", placeholder: "VD: 4000000000", required: true },
    { key: "currentValue", label: "Current Value", type: "number", default: 0 },
    { key: "startDate", label: "Start Date", type: "date", required: true },
    { key: "endDate", label: "End Date", type: "date", required: true },
    { key: "ownerId", label: "Owner", type: "select", options: users.map((u) => u.name), default: users[0].name },
    { key: "status", label: "Status", type: "select", options: ["Not Started", "In Progress", "At Risk", "Completed"], default: "Not Started" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between" style={{ background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})` }}>
        <div>
          <p className="text-sm text-indigo-100">Chào buổi sáng, Minh Anh 🦝</p>
          <h1 className="mt-1 text-2xl font-semibold">Tổng quan Raccoonie hôm nay</h1>
          <p className="mt-1 text-sm text-indigo-100">Thứ Hai, 08/12/2025 · Christmas Collection đang chạy</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="outline" size="sm" icon={Target} onClick={() => setObjOpen(true)}>Tạo Objective</Btn>
          <Btn variant="outline" size="sm" icon={Rocket} onClick={() => setScreen("campaign")}>Xem Campaign</Btn>
          <Btn variant="outline" size="sm" icon={Sparkles} onClick={openAsk}>Hỏi AI</Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="GMV hôm nay" value={fmtVND(gmvToday)} trend={pct(gmvToday - gmvYest, gmvYest)} sub="vs hôm qua" icon={DollarSign} />
        <StatCard label="Lợi nhuận hôm nay" value={fmtVND(profitToday)} sub="margin ~32%" icon={TrendingUp} tint="#10b981" />
        <StatCard label="Đơn hàng hôm nay" value={fmtNum(ordersToday)} trend={7} icon={ShoppingCart} tint="#8b5cf6" />
        <StatCard label="Brand Health" value={health + "/100"} sub="Tốt" icon={Heart} tint="#ec4899" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <SectionTitle action={<Btn variant="subtle" size="sm" onClick={() => setScreen("analytics")} icon={ArrowRight}>Chi tiết</Btn>}>Tiến độ Objectives</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {objectives.map((o) => {
                const p = o.type === "Website Growth" || o.type === "Brand Building" || o.type === "Profit" ? pct(o.currentValue, o.targetValue) : pct(o.currentValue, o.targetValue);
                return (
                  <Card key={o.id} className="p-4" hover>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800">{o.title}</span>
                      <Badge value={o.status} />
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <span className="text-xs text-slate-400">{o.type}</span>
                      <span className="text-sm font-semibold text-slate-700">{p}%</span>
                    </div>
                    <div className="mt-1.5"><Progress value={p} color={o.status === "At Risk" ? "#ef4444" : INDIGO} /></div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <SectionTitle>Missions hôm nay</SectionTitle>
            <Card className="divide-y divide-slate-100">
              {todayMissions.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-4">
                  <Avatar id={m.ownerId} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{m.title}</p>
                    <p className="text-xs text-slate-400">{fmtVND(m.currentGMV)} / {fmtVND(m.targetGMV)} GMV</p>
                  </div>
                  <div className="w-28"><Progress value={pct(m.currentGMV, m.targetGMV)} /></div>
                  <span className="w-10 text-right text-sm font-semibold text-slate-600">{pct(m.currentGMV, m.targetGMV)}%</span>
                </div>
              ))}
            </Card>
          </div>
        </div>

        <div>
          <SectionTitle action={<span className="flex items-center gap-1 text-xs text-indigo-600"><Sparkles size={13} /> AI</span>}>Decision Feed</SectionTitle>
          <div className="space-y-3">
            {decisions.map((d) => {
              const Ic = decIcon[d.type] || Lightbulb;
              const s = statusStyle[d.type];
              return (
                <Card key={d.id} className="p-4" hover onClick={openAsk}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: s.bg, color: s.fg }}><Ic size={15} /></span>
                    <Badge value={d.type} />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-800">{d.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">💡 {d.recommendation}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <FormModal
        open={objOpen}
        onClose={() => setObjOpen(false)}
        title="Tạo Objective mới"
        submitLabel="Lưu Objective"
        fields={objectiveFields}
        onSubmit={(f) => addObjective(f)}
      />
    </div>
  );
}

/* ========================= BUSINESS CALENDAR ============================= */
const MONTHS = ["Cả năm", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
function BusinessCalendar() {
  const { events, missions, addEvent } = useStore();
  const [month, setMonth] = useState(12);
  const [form, setForm] = useState(false);
  const filtered = month === 0 ? events : events.filter((e) => e.month === month || e.month === 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Business Calendar</h1>
          <p className="text-sm text-slate-500">Lịch sự kiện & mùa vụ theo năm 2025–2026</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"><option>2025–2026</option></select>
          <Btn icon={Plus} onClick={() => setForm(true)}>New Event</Btn>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {MONTHS.map((m, i) => (
          <button key={m} onClick={() => setMonth(i)} className={cx("rounded-lg px-3 py-1.5 text-sm font-medium transition", month === i ? "text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")} style={month === i ? { background: INDIGO } : undefined}>{m}</button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ev) => {
          const linked = missions.filter((m) => ev.linkedMissionIds.includes(m.id));
          return (
            <Card key={ev.id} className="p-4" hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-900">{ev.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{ev.startDate} → {ev.endDate}</p>
                </div>
                <Badge value={ev.status} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{ev.type}</span>
                <Avatar id={ev.ownerId} size={24} />
              </div>
              {linked.length > 0 ? (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {linked.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <GitBranch size={13} className="text-indigo-400" />
                      <span className="flex-1 truncate text-xs text-slate-600">{m.title}</span>
                      <span className="text-xs font-medium text-slate-500">{pct(m.currentGMV, m.targetGMV)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <Btn variant="subtle" size="sm" icon={Wand2}>Generate Mission from Playbook</Btn>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <FormModal open={form} onClose={() => setForm(false)} title="Tạo Business Event"
        fields={[
          { key: "name", label: "Tên sự kiện", placeholder: "VD: Tết Thiếu nhi 1/6" },
          { key: "type", label: "Loại", type: "select", options: ["Seasonal", "Mega Sale", "Daily", "Product Launch", "Branding"], default: "Seasonal" },
          { key: "startDate", label: "Bắt đầu", type: "date" },
          { key: "endDate", label: "Kết thúc", type: "date" },
        ]}
        onSubmit={(f) => addEvent(f)} />
    </div>
  );
}

/* ========================== PLAYBOOK ENGINE ============================= */
function PlaybookEngine() {
  const { playbooks, usefPlaybook } = useStore();
  const [type, setType] = useState("All");
  const [open, setOpen] = useState(null);
  const types = ["All", "Campaign", "Product", "Creative", "Growth", "Operation"];
  const list = type === "All" ? playbooks : playbooks.filter((p) => p.type === type);
  const pb = open ? playbooks.find((p) => p.id === open) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Playbook Engine</h1>
          <p className="text-sm text-slate-500">Thư viện quy trình tái sử dụng cho toàn brand</p>
        </div>
        <div className="flex gap-1.5">
          {types.map((t) => (
            <button key={t} onClick={() => setType(t)} className={cx("rounded-lg px-3 py-1.5 text-sm font-medium transition", type === t ? "text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")} style={type === t ? { background: INDIGO } : undefined}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Card key={p.id} className="flex flex-col p-5" hover onClick={() => setOpen(p.id)}>
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: INDIGO + "1a", color: INDIGO }}><BookOpen size={18} /></span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{p.type}</span>
            </div>
            <p className="mt-3 text-base font-semibold text-slate-900">{p.title}</p>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-500">{p.description}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Clock size={12} /> {p.timeline}</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {p.checklist.length} steps</span>
            </div>
          </Card>
        ))}
      </div>

      <Drawer open={!!pb} onClose={() => setOpen(null)} title={pb?.title} subtitle={pb ? pb.type + " Playbook" : ""}>
        {pb && (
          <div className="space-y-6">
            <p className="text-sm text-slate-600">{pb.description}</p>
            <Btn icon={Wand2} onClick={() => { usefPlaybook(pb); setOpen(null); }}>Use this Playbook → tạo Mission</Btn>

            <div>
              <SectionTitle>Timeline</SectionTitle>
              <p className="text-sm text-slate-600">{pb.timeline}</p>
            </div>
            <div>
              <SectionTitle>Checklist</SectionTitle>
              <div className="space-y-2">
                {pb.checklist.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700"><Circle size={14} className="text-slate-300" />{c}</div>
                ))}
              </div>
            </div>
            <div>
              <SectionTitle>KPI</SectionTitle>
              <div className="flex flex-wrap gap-2">{pb.kpi.map((k, i) => <span key={i} className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">{k}</span>)}</div>
            </div>
            <div>
              <SectionTitle>Task Templates</SectionTitle>
              <div className="flex flex-wrap gap-2">{pb.taskTemplates.map((k, i) => <span key={i} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{k}</span>)}</div>
            </div>
            <div>
              <SectionTitle>Lessons learned</SectionTitle>
              <div className="space-y-2">{pb.lessons.map((k, i) => <div key={i} className="flex gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800"><Lightbulb size={14} className="mt-0.5 flex-shrink-0" />{k}</div>)}</div>
            </div>
            <div>
              <SectionTitle>Assets</SectionTitle>
              <div className="flex flex-wrap gap-2">{pb.assets.map((k, i) => <span key={i} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600">📎 {k}</span>)}</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/* ======================== CAMPAIGN WORKSPACE ============================ */
function CampaignWorkspace() {
  const { campaigns, missions, projects, tasks, creatives, addCampaign } = useStore();
  const [open, setOpen] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [form, setForm] = useState(false);
  const c = open ? campaigns.find((x) => x.id === open) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Campaign Workspace</h1>
          <p className="text-sm text-slate-500">Mission → Campaign → Project → Task</p>
        </div>
        <Btn icon={Plus} onClick={() => setForm(true)}>New Campaign</Btn>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {campaigns.map((cp) => {
          const m = missions.find((x) => x.id === cp.missionId);
          const projCount = projects.filter((p) => p.campaignId === cp.id).length;
          const taskCount = tasks.filter((t) => t.campaignId === cp.id).length;
          return (
            <Card key={cp.id} className="p-5" hover onClick={() => { setOpen(cp.id); setTab("Overview"); }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-slate-900">{cp.title}</p>
                    <Badge value={cp.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{cp.channel} · Mission: {m?.title}</p>
                </div>
                <Avatar id={cp.ownerId} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div><p className="text-xs text-slate-400">GMV</p><p className="text-sm font-semibold text-slate-800">{fmtVND(cp.currentGMV)}<span className="text-slate-400"> / {fmtVND(cp.targetGMV)}</span></p></div>
                <div><p className="text-xs text-slate-400">ROAS</p><p className="text-sm font-semibold text-slate-800">{cp.roas}x</p></div>
                <div><p className="text-xs text-slate-400">Budget</p><p className="text-sm font-semibold text-slate-800">{fmtVND(cp.spend)}<span className="text-slate-400"> / {fmtVND(cp.budget)}</span></p></div>
              </div>
              <div className="mt-3"><Progress value={pct(cp.currentGMV, cp.targetGMV)} color={cp.status === "At Risk" ? "#ef4444" : INDIGO} /></div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Layers size={12} /> {projCount} projects</span>
                <span className="flex items-center gap-1"><KanbanIcon size={12} /> {taskCount} tasks</span>
              </div>
            </Card>
          );
        })}
      </div>

      <Drawer open={!!c} onClose={() => setOpen(null)} title={c?.title} subtitle={c ? c.channel + " · " + missions.find((m) => m.id === c.missionId)?.title : ""}>
        {c && (
          <div>
            <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-100">
              {["Overview", "Projects", "Tasks", "Budget", "Performance", "Assets"].map((t) => (
                <button key={t} onClick={() => setTab(t)} className={cx("whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium", tab === t ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>{t}</button>
              ))}
            </div>

            {tab === "Overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="GMV" value={fmtVND(c.currentGMV)} sub={"mục tiêu " + fmtVND(c.targetGMV)} icon={DollarSign} />
                  <StatCard label="ROAS" value={c.roas + "x"} sub={"spend " + fmtVND(c.spend)} icon={Zap} tint="#10b981" />
                </div>
                <div><p className="mb-1 text-sm text-slate-500">Tiến độ GMV</p><Progress value={pct(c.currentGMV, c.targetGMV)} height={8} /></div>
                <p className="text-sm text-slate-500">Thời gian: {c.startDate} → {c.endDate}</p>
              </div>
            )}
            {tab === "Projects" && (
              <div className="space-y-2">
                {projects.filter((p) => p.campaignId === c.id).map((p) => (
                  <Card key={p.id} className="flex items-center gap-3 p-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{p.type}</span>
                    <span className="flex-1 text-sm text-slate-700">{p.title}</span>
                    <div className="w-20"><Progress value={p.progress} /></div>
                    <Badge value={p.status} />
                  </Card>
                ))}
              </div>
            )}
            {tab === "Tasks" && (
              <div className="space-y-2">
                {tasks.filter((t) => t.campaignId === c.id).map((t) => (
                  <Card key={t.id} className="flex items-center gap-3 p-3">
                    <Avatar id={t.assigneeId} size={22} />
                    <span className="flex-1 text-sm text-slate-700">{t.title}</span>
                    <Badge value={t.priority} />
                    <Badge value={t.status} />
                  </Card>
                ))}
              </div>
            )}
            {tab === "Budget" && (
              <div className="space-y-3">
                <StatCard label="Budget đã chi" value={fmtVND(c.spend)} sub={"trên " + fmtVND(c.budget)} icon={DollarSign} />
                <Progress value={pct(c.spend, c.budget)} height={8} color="#f59e0b" />
                <p className="text-sm text-slate-500">Còn lại: {fmtVND(c.budget - c.spend)} · ROAS {c.roas}x</p>
              </div>
            )}
            {tab === "Performance" && (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={seedSales}>
                    <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={INDIGO} stopOpacity={0.3} /><stop offset="100%" stopColor={INDIGO} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tickFormatter={fmtVND} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => fmtVND(v)} />
                    <Area type="monotone" dataKey="tiktok" stroke={INDIGO} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            {tab === "Assets" && (
              <div className="space-y-2">
                {creatives.filter((cr) => cr.campaignId === c.id).map((cr) => (
                  <Card key={cr.id} className="flex items-center gap-3 p-3"><Film size={16} className="text-indigo-400" /><span className="flex-1 text-sm text-slate-700">{cr.title}</span><Badge value={cr.status} /></Card>
                ))}
                {creatives.filter((cr) => cr.campaignId === c.id).length === 0 && <p className="text-sm text-slate-400">Chưa có asset.</p>}
              </div>
            )}
          </div>
        )}
      </Drawer>

      <FormModal open={form} onClose={() => setForm(false)} title="Tạo Campaign"
        fields={[
          { key: "title", label: "Tên campaign", placeholder: "VD: TikTok Push Tết" },
          { key: "missionId", label: "Mission", type: "select", options: missions.map((m) => m.title), default: missions[0].title },
          { key: "channel", label: "Kênh", type: "select", options: ["Website", "TikTok Shop", "Shopee", "Facebook", "Instagram", "Affiliate", "Livestream", "Multi-channel"], default: "TikTok Shop" },
          { key: "targetGMV", label: "Target GMV (VND)", type: "number", default: 200000000 },
          { key: "budget", label: "Budget (VND)", type: "number", default: 30000000 },
        ]}
        onSubmit={(f) => addCampaign(f)} />
    </div>
  );
}

/* ========================= PRODUCT PIPELINE ============================= */
function ProductPipeline() {
  const { products, moveProduct, addProduct } = useStore();
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState(false);
  const pr = open ? products.find((p) => p.id === open) : null;
  const colColor = { Idea: "#94a3b8", Research: "#8b5cf6", Validation: "#8b5cf6", Design: "#6366f1", Prototype: "#6366f1", Testing: "#f59e0b", Media: "#ec4899", Listing: "#0ea5e9", Live: "#10b981", Scale: "#10b981", Retired: "#cbd5e1" };

  const card = (p, onOpen) => (
    <Card className="p-3" hover onClick={() => onOpen(p.id)}>
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-lg">💡</div>
        <div className="flex items-center gap-1">
          {p.isHeroProduct && <span title="Hero" className="text-amber-500"><Star size={13} fill="#f59e0b" /></span>}
          {p.isPersonalized && <span title="Cá nhân hóa" className="rounded bg-indigo-50 px-1 text-xs font-medium text-indigo-600">Custom</span>}
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-800">{p.name}</p>
      <p className="text-xs text-slate-400">{p.category} · {p.sku}</p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-medium text-slate-600"><Flame size={12} className="text-orange-400" /> {p.productScore}</span>
        <span className="text-slate-500">margin {p.margin}%</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
        <span>GMV {fmtVND(p.gmv)}</span>
        {p.campaignIds.length > 0 && <span className="rounded bg-slate-100 px-1.5 text-slate-500">{p.campaignIds.length} camp</span>}
      </div>
    </Card>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Product Pipeline</h1>
          <p className="text-sm text-slate-500">Vòng đời sản phẩm: Idea → Scale</p>
        </div>
        <Btn icon={Plus} onClick={() => setForm(true)}>New Product</Btn>
      </div>

      <Kanban stages={LIFECYCLE} items={products} groupKey="lifecycle" colorByStage={colColor}
        onMove={(it, s) => moveProduct(it.id, s)} onOpen={setOpen} renderCard={card} />

      <Drawer open={!!pr} onClose={() => setOpen(null)} title={pr?.name} subtitle={pr ? pr.category + " · " + pr.sku : ""}>
        {pr && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge value={pr.lifecycle} />
              {pr.isHeroProduct && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">⭐ Hero Product</span>}
              {pr.isPersonalized && <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">Cá nhân hóa</span>}
              {pr.isSeasonal && <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-pink-700">Seasonal</span>}
            </div>
            <div>
              <SectionTitle>Product DNA</SectionTitle>
              <p className="text-sm text-slate-600">Khách mục tiêu: {pr.targetCustomer}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Giá vốn" value={fmtVND(pr.cost)} />
              <StatCard label="Giá bán" value={fmtVND(pr.price)} />
              <StatCard label="Margin" value={pr.margin + "%"} tint="#10b981" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Product Score" value={pr.productScore} icon={Flame} tint="#f59e0b" />
              <StatCard label="GMV" value={fmtVND(pr.gmv)} />
              <StatCard label="Đơn" value={fmtNum(pr.orders)} />
            </div>
            <Card className="flex gap-2 p-3">
              <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-indigo-500" />
              <p className="text-sm text-slate-600">{pr.productScore >= 85 ? "AI: Product score cao & margin tốt — ưu tiên scale Ads và giữ tồn kho an toàn." : pr.lifecycle === "Idea" ? "AI: Cần validate demand trước khi đầu tư design." : "AI: Test thêm 100 đơn đầu, tối ưu hook content trước khi scale."}</p>
            </Card>
          </div>
        )}
      </Drawer>

      <FormModal open={form} onClose={() => setForm(false)} title="Tạo Product"
        fields={[
          { key: "name", label: "Tên sản phẩm", placeholder: "VD: Đèn ngủ nấm cute" },
          { key: "category", label: "Danh mục", type: "select", options: ["Đèn ngủ", "Móc khóa", "Quà tặng cá nhân hóa"], default: "Đèn ngủ" },
          { key: "cost", label: "Giá vốn (VND)", type: "number", default: 50000 },
          { key: "price", label: "Giá bán (VND)", type: "number", default: 149000 },
          { key: "targetCustomer", label: "Khách mục tiêu", placeholder: "VD: Gen Z tặng quà" },
        ]}
        onSubmit={(f) => addProduct(f)} />
    </div>
  );
}

/* ========================= CREATIVE PIPELINE =========================== */
function CreativePipeline() {
  const { creatives, products, campaigns, moveCreative, addCreative } = useStore();
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState(false);
  const cr = open ? creatives.find((c) => c.id === open) : null;
  const colColor = { Idea: "#94a3b8", Script: "#8b5cf6", Production: "#6366f1", Editing: "#0ea5e9", Review: "#f59e0b", Published: "#10b981", Performance: "#ec4899" };

  const card = (c, onOpen) => {
    const pr = products.find((p) => p.id === c.productId);
    return (
      <Card className="p-3" hover onClick={() => onOpen(c.id)}>
        <div className="flex items-center justify-between">
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{c.platform}</span>
          {c.performanceScore > 0 && <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600"><Flame size={11} /> {c.performanceScore}</span>}
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-800">{c.title}</p>
        <p className="text-xs italic text-slate-400">"{c.hook}"</p>
        <p className="mt-1 text-xs text-slate-500">{pr?.name}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex -space-x-1">{[c.creatorId, c.editorId].map((id, i) => <span key={i} className="rounded-full ring-2 ring-white"><Avatar id={id} size={20} /></span>)}</div>
          {c.views > 0 && <span className="text-xs text-slate-400">{(c.views / 1e6 >= 1 ? (c.views / 1e6).toFixed(1) + "M" : Math.round(c.views / 1e3) + "k")} view</span>}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Creative Pipeline</h1>
          <p className="text-sm text-slate-500">Content workflow: Idea → Performance</p>
        </div>
        <Btn icon={Plus} onClick={() => setForm(true)}>New Creative</Btn>
      </div>

      <Kanban stages={CREATIVE_STAGES} items={creatives} groupKey="status" colorByStage={colColor}
        onMove={(it, s) => moveCreative(it.id, s)} onOpen={setOpen} renderCard={card} />

      <Drawer open={!!cr} onClose={() => setOpen(null)} title={cr?.title} subtitle={cr ? cr.type + " · " + cr.platform : ""}>
        {cr && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2"><Badge value={cr.status} /><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{products.find((p) => p.id === cr.productId)?.name}</span></div>
            <div><SectionTitle>Hook</SectionTitle><p className="rounded-lg bg-indigo-50 p-3 text-sm italic text-indigo-800">"{cr.hook}"</p></div>
            <div><SectionTitle>Content Angle</SectionTitle><p className="text-sm text-slate-600">{cr.contentAngle}</p></div>
            <div>
              <SectionTitle>Team</SectionTitle>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><Avatar id={cr.creatorId} size={22} /> Creator · {userById(cr.creatorId)?.name}</div>
                <div className="flex items-center gap-2"><Avatar id={cr.editorId} size={22} /> Editor · {userById(cr.editorId)?.name}</div>
                <div className="flex items-center gap-2"><Avatar id={cr.reviewerId} size={22} /> Reviewer · {userById(cr.reviewerId)?.name}</div>
              </div>
            </div>
            {cr.views > 0 && (
              <div>
                <SectionTitle>Performance</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Views" value={cr.views >= 1e6 ? (cr.views / 1e6).toFixed(1) + "M" : Math.round(cr.views / 1e3) + "k"} />
                  <StatCard label="Đơn" value={fmtNum(cr.orders)} />
                  <StatCard label="GMV" value={fmtVND(cr.gmv)} tint="#10b981" />
                </div>
              </div>
            )}
            <Card className="flex gap-2 p-3"><Sparkles size={16} className="mt-0.5 flex-shrink-0 text-indigo-500" /><p className="text-sm text-slate-600">{cr.performanceScore >= 85 ? "AI: Video winning — nên scale Ads và nhân bản angle này." : "AI: Thử A/B hook 3s đầu để tăng retention."}</p></Card>
          </div>
        )}
      </Drawer>

      <FormModal open={form} onClose={() => setForm(false)} title="Tạo Creative"
        fields={[
          { key: "title", label: "Tiêu đề", placeholder: "VD: Video TikTok đèn Galaxy #010" },
          { key: "type", label: "Loại", type: "select", options: ["TikTok Video", "Facebook Reel", "Instagram Reel", "Banner", "Landing Page", "Livestream Cut", "UGC"], default: "TikTok Video" },
          { key: "productId", label: "Sản phẩm", type: "select", options: products.map((p) => p.name), default: products[0].name },
          { key: "hook", label: "Hook", placeholder: "3 giây đầu..." },
          { key: "contentAngle", label: "Content angle", placeholder: "VD: Aesthetic phòng ngủ" },
        ]}
        onSubmit={(f) => addCreative(f)} />
    </div>
  );
}

/* ============================= TASK BOARD =============================== */
const TASK_STAGES = ["Todo", "Doing", "Review", "Done"];
function TaskBoard() {
  const { tasks, campaigns, products, moveTask, addTask, role } = useStore();
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState(false);
  const [fRole, setFRole] = useState("All");
  const [fPrio, setFPrio] = useState("All");
  const t = open ? tasks.find((x) => x.id === open) : null;
  const colColor = { Todo: "#94a3b8", Doing: "#6366f1", Review: "#f59e0b", Done: "#10b981" };

  let list = tasks;
  if (fRole !== "All") list = list.filter((x) => x.role === fRole);
  if (fPrio !== "All") list = list.filter((x) => x.priority === fPrio);

  const card = (tk, onOpen) => (
    <Card className="p-3" hover onClick={() => onOpen(tk.id)}>
      <div className="flex items-center justify-between">
        <Badge value={tk.priority} />
        <span className="text-xs text-slate-400">{tk.dueDate?.slice(5)}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-800">{tk.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{tk.role}</span>
        <Avatar id={tk.assigneeId} size={22} />
      </div>
    </Card>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Task Board</h1>
          <p className="text-sm text-slate-500">Đang xem theo vai trò: <span className="font-medium text-indigo-600">{role}</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select value={fRole} onChange={(e) => setFRole(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none">
            <option value="All">Mọi vai trò</option>
            {[...new Set(tasks.map((x) => x.role))].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={fPrio} onChange={(e) => setFPrio(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none">
            <option value="All">Mọi mức ưu tiên</option>
            {PRIOS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <Btn icon={Plus} onClick={() => setForm(true)}>New Task</Btn>
        </div>
      </div>

      <Kanban stages={TASK_STAGES} items={list} groupKey="status" colorByStage={colColor}
        onMove={(it, s) => moveTask(it.id, s)} onOpen={setOpen} renderCard={card} />

      <Drawer open={!!t} onClose={() => setOpen(null)} title={t?.title} subtitle={t ? t.role : ""}>
        {t && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2"><Badge value={t.status} /><Badge value={t.priority} /></div>
            <div><SectionTitle>Mô tả</SectionTitle><p className="text-sm text-slate-600">{t.description}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-slate-400">Assignee</p><div className="mt-1 flex items-center gap-2 text-sm text-slate-700"><Avatar id={t.assigneeId} size={22} />{userById(t.assigneeId)?.name}</div></div>
              <div><p className="text-xs text-slate-400">Deadline</p><p className="mt-1 text-sm text-slate-700">{t.dueDate}</p></div>
              <div><p className="text-xs text-slate-400">Campaign</p><p className="mt-1 text-sm text-slate-700">{campaigns.find((c) => c.id === t.campaignId)?.title || "—"}</p></div>
              <div><p className="text-xs text-slate-400">Sản phẩm</p><p className="mt-1 text-sm text-slate-700">{products.find((p) => p.id === t.productId)?.name || "—"}</p></div>
            </div>
            <div>
              <SectionTitle>Activity log</SectionTitle>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex gap-2"><Clock size={13} className="mt-0.5 text-slate-300" /> Tạo task · 3 ngày trước</div>
                <div className="flex gap-2"><ArrowRight size={13} className="mt-0.5 text-slate-300" /> Chuyển sang {t.status} · hôm nay</div>
                <div className="flex gap-2"><MessageSquare size={13} className="mt-0.5 text-slate-300" /> {userById(t.assigneeId)?.name}: "Đang xử lý, sẽ xong đúng hạn."</div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <FormModal open={form} onClose={() => setForm(false)} title="Tạo Task"
        fields={[
          { key: "title", label: "Tên task", placeholder: "VD: Quay 3 video hook mới" },
          { key: "role", label: "Vai trò", type: "select", options: [...new Set(users.map((u) => u.role))], default: role },
          { key: "priority", label: "Ưu tiên", type: "select", options: PRIOS, default: "Medium" },
          { key: "dueDate", label: "Deadline", type: "date" },
          { key: "campaignId", label: "Campaign", type: "select", options: campaigns.map((c) => c.title), default: campaigns[0].title },
          { key: "description", label: "Mô tả", type: "textarea" },
        ]}
        onSubmit={(f) => addTask(f)} />
    </div>
  );
}

/* ============================== ANALYTICS ============================== */
function ChartCard({ title, children, sub, h = 240 }) {
  return (
    <Card className="p-5">
      <div className="mb-4"><h3 className="text-sm font-semibold text-slate-800">{title}</h3>{sub && <p className="text-xs text-slate-400">{sub}</p>}</div>
      <div style={{ height: h }}>{children}</div>
    </Card>
  );
}
function Analytics() {
  const { sales, products, creatives, campaigns } = useStore();
  const channelData = [
    { name: "TikTok Shop", value: sales.reduce((s, d) => s + d.tiktok, 0) },
    { name: "Website", value: sales.reduce((s, d) => s + d.website, 0) },
    { name: "Shopee", value: sales.reduce((s, d) => s + d.shopee, 0) },
    { name: "Livestream", value: sales.reduce((s, d) => s + d.live, 0) },
  ];
  const totalGmv = channelData.reduce((s, d) => s + d.value, 0);
  const webShare = pct(channelData[1].value, totalGmv);
  const topProducts = [...products].sort((a, b) => b.gmv - a.gmv).slice(0, 5);
  const topCreatives = [...creatives].filter((c) => c.gmv > 0).sort((a, b) => b.gmv - a.gmv).slice(0, 5);

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-semibold text-slate-900">Analytics</h1><p className="text-sm text-slate-500">Hiệu suất brand 8 ngày gần nhất</p></div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="GMV tuần" value={fmtVND(totalGmv)} trend={12} icon={DollarSign} />
        <StatCard label="Website share" value={webShare + "%"} sub="mục tiêu 40%" icon={TrendingUp} tint="#8b5cf6" />
        <StatCard label="ROAS TB" value="6.4x" sub="mục tiêu 8x" icon={Zap} tint="#10b981" />
        <StatCard label="Đơn tuần" value={fmtNum(sales.reduce((s, d) => s + d.orders, 0))} trend={9} icon={ShoppingCart} tint="#ec4899" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="GMV trend theo kênh" sub="triệu VND / ngày">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales}>
                <defs>
                  <linearGradient id="ct" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={INDIGO} stopOpacity={0.35} /><stop offset="100%" stopColor={INDIGO} stopOpacity={0} /></linearGradient>
                  <linearGradient id="cw" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={VIOLET} stopOpacity={0.3} /><stop offset="100%" stopColor={VIOLET} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tickFormatter={fmtVND} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmtVND(v)} />
                <Legend />
                <Area type="monotone" name="TikTok" dataKey="tiktok" stroke={INDIGO} fill="url(#ct)" />
                <Area type="monotone" name="Website" dataKey="website" stroke={VIOLET} fill="url(#cw)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <ChartCard title="Phân bổ theo kênh">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={channelData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {channelData.map((_, i) => <Cell key={i} fill={ACCENTS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmtVND(v)} /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Campaign comparison — GMV vs Target" h={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaigns.map((c) => ({ name: c.title.split(" ").slice(0, 2).join(" "), GMV: c.currentGMV, Target: c.targetGMV }))} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tickFormatter={fmtVND} tick={{ fontSize: 10 }} /><YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => fmtVND(v)} />
              <Bar dataKey="Target" fill="#e2e8f0" radius={[0, 4, 4, 0]} /><Bar dataKey="GMV" fill={INDIGO} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Product score ranking" h={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...products].sort((a, b) => b.productScore - a.productScore).slice(0, 6).map((p) => ({ name: p.name.split(" ").slice(0, 2).join(" "), score: p.productScore }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} /><YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip /><Bar dataKey="score" fill={VIOLET} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle>Top sản phẩm theo GMV</SectionTitle>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-5 text-sm font-semibold text-slate-400">{i + 1}</span>
                <span className="flex-1 text-sm text-slate-700">{p.name}</span>
                <span className="text-sm font-medium text-slate-800">{fmtVND(p.gmv)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle>Top creative theo GMV</SectionTitle>
          <div className="space-y-2">
            {topCreatives.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-5 text-sm font-semibold text-slate-400">{i + 1}</span>
                <span className="flex-1 truncate text-sm text-slate-700">{c.title}</span>
                <span className="text-sm font-medium text-slate-800">{fmtVND(c.gmv)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ======================= KNOWLEDGE / AI COPILOT ======================== */
function aiAnswer(q, store) {
  const s = q.toLowerCase();
  const { decisions, products, creatives, campaigns } = store;
  if (s.includes("vấn đề") || s.includes("hôm nay"))
    return "Hôm nay có 2 điểm cần chú ý: (1) Đèn ngủ Galaxy chỉ còn tồn ~3 ngày — nên nhập gấp; (2) Website Conversion giảm 11% — ưu tiên task fix checkout. Tin vui: video TikTok #182 đang viral (1.2M view), nên scale Ads x3.";
  if (s.includes("rủi ro") || s.includes("chậm") || s.includes("risk"))
    return "Campaign rủi ro: 'Website Conversion Christmas' đang At Risk (mới đạt " + pct(campaigns[1].currentGMV, campaigns[1].targetGMV) + "% target, CVR giảm 11%). 'Affiliate Push Valentine' chậm 12% so timeline. Đề xuất: dồn lực fix Website UX và đẩy affiliate tuần này.";
  if (s.includes("scale") || s.includes("sản phẩm nào"))
    return "Nên scale: 'Đèn ngủ cá nhân hóa' (score 92, margin 46%, GMV 412tr) và 'Đèn ngủ Galaxy' (score 88) — nhưng phải nhập kho trước vì Galaxy sắp cháy hàng.";
  if (s.includes("video") || s.includes("hiệu quả"))
    return "Video hiệu quả nhất: 'Video TikTok đèn ngủ #001' — 1.2M view, 892 đơn, GMV 178tr, performance score 94. Angle 'aesthetic phòng ngủ' + hook POV đang convert tốt nhất. Nên nhân bản angle này.";
  if (s.includes("website"))
    return "Website đang chiếm ~28% doanh thu (mục tiêu 40%) → đang At Risk. CVR giảm 11% tuần này do checkout flow. Ưu tiên: fix trang thanh toán (task Critical) + setup email retention.";
  return "Mình đã ghi nhận câu hỏi. Dựa trên dữ liệu hiện tại, brand đang đạt ~64% mục tiêu GMV Q4. Bạn có thể hỏi cụ thể: 'Campaign nào rủi ro?', 'Sản phẩm nào nên scale?', 'Video nào hiệu quả nhất?'.";
}
const SUGGESTED = ["Hôm nay brand có vấn đề gì?", "Campaign nào đang rủi ro?", "Sản phẩm nào nên scale?", "Video nào hiệu quả nhất?", "Website đang tăng trưởng thế nào?"];

function KnowledgeBase() {
  const store = useStore();
  const [tab, setTab] = useState("chat");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([{ role: "ai", text: "Chào bạn 🦝 Mình là Raccoonie AI Copilot. Hỏi mình về tình hình brand, campaign, sản phẩm hay content nhé!" }]);
  const ask = (q) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { role: "user", text: q }, { role: "ai", text: aiAnswer(q, store) }]);
    setInput("");
  };
  const tabs = [["chat", "AI Copilot"], ["playbooks", "Playbooks"], ["products", "Winning Products"], ["videos", "Winning Videos"], ["hooks", "Winning Hooks"], ["lessons", "Lessons Learned"]];
  const winProducts = [...store.products].sort((a, b) => b.productScore - a.productScore).slice(0, 4);
  const winVideos = [...store.creatives].filter((c) => c.performanceScore > 0).sort((a, b) => b.performanceScore - a.performanceScore);

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-semibold text-slate-900">Knowledge Base & AI Copilot</h1><p className="text-sm text-slate-500">Bộ não của Raccoonie — insight + bài học tích luỹ</p></div>

      <div className="flex flex-wrap gap-1.5 border-b border-slate-100">
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cx("border-b-2 px-3 py-2 text-sm font-medium", tab === id ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>{label}</button>
        ))}
      </div>

      {tab === "chat" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="flex flex-col lg:col-span-2" style={{ height: 460 }}>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div key={i} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cx("rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "text-white" : "bg-slate-100 text-slate-700")} style={{ maxWidth: "80%", ...(m.role === "user" ? { background: INDIGO } : {}) }}>
                    {m.role === "ai" && <span className="mr-1">🦝</span>}{m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 p-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(input)} placeholder="Hỏi Raccoonie AI..." className="flex-1 text-sm outline-none" />
                <button onClick={() => ask(input)} className="rounded-lg p-1.5 text-white" style={{ background: INDIGO }}><Send size={15} /></button>
              </div>
            </div>
          </Card>
          <div className="space-y-2">
            <SectionTitle>Gợi ý câu hỏi</SectionTitle>
            {SUGGESTED.map((q) => (
              <button key={q} onClick={() => ask(q)} className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50">
                <Sparkles size={14} className="text-indigo-400" /> {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {winProducts.map((p) => (
            <Card key={p.id} className="p-4"><div className="flex items-center justify-between"><p className="font-medium text-slate-800">{p.name}</p><span className="flex items-center gap-1 text-sm font-semibold text-emerald-600"><Flame size={14} /> {p.productScore}</span></div><p className="mt-1 text-xs text-slate-500">Margin {p.margin}% · GMV {fmtVND(p.gmv)} · {p.orders} đơn</p></Card>
          ))}
        </div>
      )}
      {tab === "videos" && (
        <div className="space-y-2">{winVideos.map((c) => (<Card key={c.id} className="flex items-center gap-3 p-4"><Film size={16} className="text-indigo-400" /><div className="flex-1"><p className="text-sm font-medium text-slate-800">{c.title}</p><p className="text-xs italic text-slate-400">"{c.hook}"</p></div><span className="text-sm font-semibold text-emerald-600">{c.performanceScore}</span></Card>))}</div>
      )}
      {tab === "hooks" && (
        <div className="grid gap-3 sm:grid-cols-2">{store.creatives.map((c) => (<Card key={c.id} className="p-4"><p className="text-sm italic text-slate-700">"{c.hook}"</p><p className="mt-2 text-xs text-slate-400">{c.contentAngle} · {c.platform}</p></Card>))}</div>
      )}
      {tab === "playbooks" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{store.playbooks.map((p) => (<Card key={p.id} className="p-4"><div className="flex items-center gap-2"><BookOpen size={16} className="text-indigo-400" /><p className="text-sm font-medium text-slate-800">{p.title}</p></div><p className="mt-1 text-xs text-slate-500">{p.description}</p></Card>))}</div>
      )}
      {tab === "lessons" && (
        <div className="space-y-2">{store.playbooks.flatMap((p) => p.lessons.map((l, i) => ({ pb: p.title, l, k: p.id + i }))).map((x) => (<Card key={x.k} className="flex gap-3 p-4"><Lightbulb size={16} className="mt-0.5 flex-shrink-0 text-amber-500" /><div><p className="text-sm text-slate-700">{x.l}</p><p className="mt-0.5 text-xs text-slate-400">từ {x.pb}</p></div></Card>))}</div>
      )}
    </div>
  );
}

/* ============================== SETTINGS ============================== */
function SettingsScreen() {
  const { role, setRole } = useStore();
  const grouped = useMemo(() => {
    const g = {};
    users.forEach((u) => { (g[u.department] = g[u.department] || []).push(u); });
    return g;
  }, []);
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold text-slate-900">Settings · Role Switcher</h1><p className="text-sm text-slate-500">Chọn vai trò để xem workspace phù hợp (MVP: phân quyền dạng visual)</p></div>
      <Card className="p-5">
        <div className="flex items-center gap-2"><Users size={16} className="text-indigo-500" /><span className="text-sm font-medium text-slate-700">Vai trò hiện tại: <span className="text-indigo-600">{role}</span></span></div>
      </Card>
      {Object.entries(grouped).map(([dept, us]) => (
        <div key={dept}>
          <SectionTitle>{dept}</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {us.map((u) => (
              <Card key={u.id} className={cx("flex items-center gap-3 p-3", role === u.role && "ring-2 ring-indigo-400")} hover onClick={() => setRole(u.role)}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg">{u.avatar}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{u.role}</p><p className="truncate text-xs text-slate-400">{u.name}</p></div>
                {role === u.role && <CheckCircle2 size={16} className="text-indigo-500" />}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================== APP SHELL ============================== */
const SCREENS = {
  ceo: CEODesk, calendar: BusinessCalendar, playbook: PlaybookEngine, campaign: CampaignWorkspace,
  product: ProductPipeline, creative: CreativePipeline, tasks: TaskBoard, analytics: Analytics,
  knowledge: KnowledgeBase, settings: SettingsScreen,
};

function Sidebar({ screen, setScreen, allowed }) {
  const nav = NAV.filter((n) => allowed.includes(n.id));
  return (
    <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4 lg:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-white shadow-sm" style={{ background: `linear-gradient(135deg,${INDIGO},${VIOLET})` }}>🦝</span>
        <div><p className="text-sm font-semibold text-slate-900">Raccoonie OS</p><p className="text-xs text-slate-400">Business OS v1.0</p></div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5">
        {nav.map((n) => {
          const Ic = n.icon; const active = screen === n.id;
          return (
            <button key={n.id} onClick={() => setScreen(n.id)} className={cx("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition", active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50")}>
              <Ic size={17} className={active ? "text-indigo-600" : "text-slate-400"} /> {n.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-2 rounded-xl bg-slate-50 p-3">
        <p className="text-xs font-medium text-slate-500">MVP · Mock data</p>
        <p className="mt-0.5 text-xs text-slate-400">Đổi vai trò ở góc phải trên để xem workspace khác.</p>
      </div>
    </aside>
  );
}

function Topbar({ role, setRole, screen, setScreen, allowed }) {
  const [open, setOpen] = useState(false);
  const u = users.find((x) => x.role === role) || users[0];
  const title = NAV.find((n) => n.id === screen)?.label || "";
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white lg:hidden" style={{ background: INDIGO }}>🦝</span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <div className="flex gap-1 lg:hidden">
            <select value={screen} onChange={(e) => setScreen(e.target.value)} className="mt-0.5 rounded border border-slate-200 px-1 py-0.5 text-xs">
              {NAV.filter((n) => allowed.includes(n.id)).map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-400 sm:flex"><Search size={15} /> Tìm kiếm...</div>
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" /></button>
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 hover:bg-slate-50">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">{u.avatar}</span>
            <div className="hidden text-left sm:block"><p className="text-xs font-medium leading-tight text-slate-800">{u.name}</p><p className="text-xs leading-tight text-indigo-600">{role}</p></div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {open && (
            <div className="absolute right-0 top-full z-40 mt-1 max-h-80 w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <p className="px-3 py-1.5 text-xs font-semibold uppercase text-slate-400">Chuyển vai trò</p>
              {ALL_ROLES.map((r) => (
                <button key={r} onClick={() => { setRole(r); setOpen(false); }} className={cx("flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-slate-50", r === role && "text-indigo-600")}>
                  <span>{users.find((x) => x.role === r)?.avatar}</span> {r}{r === role && <CheckCircle2 size={13} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============================= ROOT APP ============================== */
export default function RaccoonieOS() {
  const [role, setRoleState] = useState("CEO");
  const [screen, setScreen] = useState("ceo");
  const [ask, setAsk] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [objectives, setObjectives] = useState(() => loadState(LS.objectives, seedObjectives));
  const [events, setEvents] = useState(seedEvents);
  const [missions, setMissions] = useState(seedMissions);
  const [campaigns, setCampaigns] = useState(seedCampaigns);
  const [projects] = useState(seedProjects);
  const [tasks, setTasks] = useState(seedTasks);
  const [products, setProducts] = useState(seedProducts);
  const [creatives, setCreatives] = useState(seedCreatives);
  const [playbooks] = useState(seedPlaybooks);
  const [decisions] = useState(seedDecisions);
  const [sales] = useState(seedSales);
  const [inventory] = useState(seedInventory);

  const allowed = roleScreens[role] || ["settings"];

  // Persist objectives → reload trang vẫn còn dữ liệu
  useEffect(() => { saveState(LS.objectives, objectives); }, [objectives]);

  const toast = (msg, tone = "success") => {
    const id = uid("toast");
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  };

  const setRole = (r) => {
    setRoleState(r);
    const a = roleScreens[r] || ["settings"];
    if (!a.includes(screen)) setScreen(a[0]);
  };

  const store = {
    role, setRole, screen, setScreen, toast,
    objectives, events, missions, campaigns, projects, tasks, products, creatives, playbooks, decisions, sales, inventory,
    openAsk: () => { setScreen("knowledge"); },
    addObjective: (f) => {
      const owner = users.find((u) => u.name === f.ownerId) || users[0];
      const targetValue = Number(f.targetValue) || 0;
      const currentValue = Number(f.currentValue) || 0;
      const progress = targetValue ? Math.round((currentValue / targetValue) * 100) : 0;
      const obj = {
        id: uid("o"),
        title: f.title.trim(),
        type: f.type,
        ownerId: owner.id,
        targetValue,
        currentValue,
        progress,
        startDate: f.startDate,
        endDate: f.endDate,
        status: f.status || "Not Started",
      };
      setObjectives((s) => [...s, obj]);
      toast("Đã tạo Objective thành công");
    },
    addEvent: (f) => setEvents((s) => [...s, { id: uid("e"), name: f.name, month: Number((f.startDate || "2025-12").split("-")[1]) || 12, startDate: f.startDate, endDate: f.endDate, type: f.type, status: "Upcoming", linkedMissionIds: [], ownerId: "u3" }]),
    addCampaign: (f) => {
      const m = missions.find((x) => x.title === f.missionId) || missions[0];
      setCampaigns((s) => [...s, { id: uid("c"), title: f.title, missionId: m.id, ownerId: "u2", channel: f.channel, targetGMV: Number(f.targetGMV) || 0, currentGMV: 0, budget: Number(f.budget) || 0, spend: 0, roas: 0, startDate: "2025-12-08", endDate: "2025-12-31", status: "Not Started" }]);
    },
    addProduct: (f) => setProducts((s) => [{ id: uid("pr"), name: f.name, sku: "NEW-" + Math.floor(Math.random() * 900 + 100), category: f.category, campaignIds: [], lifecycle: "Idea", cost: Number(f.cost) || 0, price: Number(f.price) || 0, margin: f.price ? Math.round((1 - f.cost / f.price) * 100) : 0, productScore: 50, isPersonalized: true, isHeroProduct: false, isSeasonal: false, targetCustomer: f.targetCustomer, gmv: 0, orders: 0, status: "Not Started" }, ...s]),
    moveProduct: (id, lc) => setProducts((s) => s.map((p) => (p.id === id ? { ...p, lifecycle: lc, status: lc === "Live" || lc === "Scale" ? "Live" : p.status } : p))),
    addCreative: (f) => { const pr = products.find((p) => p.name === f.productId); setCreatives((s) => [{ id: uid("cr"), title: f.title, campaignId: campaigns[0].id, productId: pr?.id, type: f.type, creatorId: "u6", editorId: "u8", reviewerId: "u2", status: "Idea", platform: f.type.includes("TikTok") ? "TikTok Shop" : "Website", hook: f.hook, contentAngle: f.contentAngle, publishDate: "", views: 0, orders: 0, gmv: 0, performanceScore: 0 }, ...s]); },
    moveCreative: (id, st) => setCreatives((s) => s.map((c) => (c.id === id ? { ...c, status: st } : c))),
    addTask: (f) => { const c = campaigns.find((x) => x.title === f.campaignId); setTasks((s) => [{ id: uid("t"), title: f.title, projectId: "p2", assigneeId: (users.find((u) => u.role === f.role) || users[0]).id, role: f.role, priority: f.priority, status: "Todo", dueDate: f.dueDate, description: f.description, campaignId: c?.id }, ...s]); },
    moveTask: (id, st) => setTasks((s) => s.map((t) => (t.id === id ? { ...t, status: st } : t))),
    usefPlaybook: (pb) => {
      const nm = { id: uid("m"), title: pb.title.replace(" Playbook", "") + " (from playbook)", objectiveId: "o1", eventId: "e10", ownerId: "u2", targetGMV: 300e6, currentGMV: 0, budget: 40e6, startDate: "2025-12-08", endDate: "2025-12-31", status: "Not Started" };
      setMissions((s) => [...s, nm]);
      setScreen("campaign");
    },
  };

  const Screen = SCREENS[allowed.includes(screen) ? screen : allowed[0]];

  return (
    <Store.Provider value={store}>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
        <Sidebar screen={screen} setScreen={setScreen} allowed={allowed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar role={role} setRole={setRole} screen={screen} setScreen={setScreen} allowed={allowed} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Screen />
          </main>
        </div>
      </div>

      {/* Toast stack */}
      <div className="pointer-events-none fixed bottom-5 right-5 flex flex-col gap-2" style={{ zIndex: 60 }}>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-lg">
            <CheckCircle2 size={18} className="text-emerald-500" />
            {t.msg}
          </div>
        ))}
      </div>
    </Store.Provider>
  );
}
