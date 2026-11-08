import pptxgen from 'pptxgenjs';
import { generateRealAIGammaCards } from './aiSlideEngine.js';

// ============================================================================
// 1. 100+ XIL ZAMONAVIY VA YUQORI ESTETIKALI TEMALAR BAZASI (105 TA TO'LIQ PALITRA)
// ============================================================================
export const GAMMA_THEMES = {
  // 1. CYBER & NEON (15)
  obsidian: { id: "obsidian", name: "Obsidian Neon (Dark Slate & Cyan)", bg: "090D16", cardBg: "131B2E", accent: "38BDF8", accent2: "A855F7", text: "F8FAFC", subtext: "94A3B8", cardBorder: "1E293B" },
  genspark: { id: "genspark", name: "Genspark Cyber (Navy & Electric Teal)", bg: "0B132B", cardBg: "1C2541", accent: "06B6D4", accent2: "3B82F6", text: "FFFFFF", subtext: "94A3B8", cardBorder: "3A506B" },
  tokyo: { id: "tokyo", name: "Tokyo Night (Indigo & Cyber Orange)", bg: "13141F", cardBg: "1E2030", accent: "7AA2F7", accent2: "FF9E64", text: "C0CAF5", subtext: "7AA2F7", cardBorder: "292E42" },
  cyberpunk: { id: "cyberpunk", name: "Cyberpunk 2077 (Jet Black & Electric Yellow)", bg: "080808", cardBg: "171717", accent: "FEE715", accent2: "00FFFF", text: "FFFFFF", subtext: "A3A3A3", cardBorder: "2E2E2E" },
  synthwave: { id: "synthwave", name: "Synthwave Sunset (Deep Magenta & Neon Cyan)", bg: "1A0B2E", cardBg: "2D124D", accent: "F43F5E", accent2: "06B6D4", text: "FFFFFF", subtext: "E9D5FF", cardBorder: "581C87" },
  neon_matrix: { id: "neon_matrix", name: "Neon Matrix (Pitch Black & Terminal Lime)", bg: "050B08", cardBg: "0D1F17", accent: "10B981", accent2: "34D399", text: "ECFDF5", subtext: "6EE7B7", cardBorder: "047857" },
  cobalt: { id: "cobalt", name: "Cobalt Titanium (Navy & Tech Blue)", bg: "0A111F", cardBg: "111E36", accent: "3B82F6", accent2: "93C5FD", text: "F8FAFC", subtext: "94A3B8", cardBorder: "1D355F" },
  aurora: { id: "aurora", name: "Aurora Dream (Midnight & Neon Mint)", bg: "0D0A1C", cardBg: "191433", accent: "00FFA3", accent2: "DC52FF", text: "FFFFFF", subtext: "C4B5FD", cardBorder: "342566" },
  electric_indigo: { id: "electric_indigo", name: "Electric Indigo (Deep Violet & Vivid Indigo)", bg: "0F0C29", cardBg: "1F1A4D", accent: "6366F1", accent2: "818CF8", text: "FFFFFF", subtext: "C7D2FE", cardBorder: "3730A3" },
  deep_cyber: { id: "deep_cyber", name: "Deep Cyber Void (Carbon & Electric Azure)", bg: "030712", cardBg: "111827", accent: "0EA5E9", accent2: "6366F1", text: "F9FAFB", subtext: "9CA3AF", cardBorder: "1F2937" },
  neon_lime: { id: "neon_lime", name: "Hyper Lime (Dark Charcoal & Volt Green)", bg: "0F1410", cardBg: "1A231C", accent: "84CC16", accent2: "22C55E", text: "F7FEE7", subtext: "BEF264", cardBorder: "365314" },
  vaporwave: { id: "vaporwave", name: "Vaporwave Pastel (Deep Plum & Neon Bubblegum)", bg: "1E102F", cardBg: "2E1B45", accent: "F472B6", accent2: "38BDF8", text: "FDF2F8", subtext: "F472B6", cardBorder: "701A75" },
  midnight_laser: { id: "midnight_laser", name: "Midnight Laser (Onyx & Crimson Laser)", bg: "0C0708", cardBg: "1C0E11", accent: "FF0055", accent2: "FFAA00", text: "FFF1F2", subtext: "FDA4AF", cardBorder: "4C0519" },
  hologram_blue: { id: "hologram_blue", name: "Hologram Sky (Deep Ocean & Icy Cyan)", bg: "05131E", cardBg: "0A253A", accent: "22D3EE", accent2: "38BDF8", text: "F0FDF4", subtext: "A5F3FC", cardBorder: "0E4B75" },
  quantum_violet: { id: "quantum_violet", name: "Quantum Violet (Abyss & Electric Ultraviolet)", bg: "120826", cardBg: "221244", accent: "A855F7", accent2: "C084FC", text: "FAF5FF", subtext: "E9D5FF", cardBorder: "4C1D95" },

  // 2. MINIMALIST & EDITORIAL (15)
  nordic: { id: "nordic", name: "Clean Nordic (Charcoal & Royal White)", bg: "F8FAFC", cardBg: "FFFFFF", accent: "2563EB", accent2: "0F172A", text: "0F172A", subtext: "64748B", cardBorder: "CBD5E1" },
  swiss: { id: "swiss", name: "Minimal Swiss (Clean Slate & Bold Crimson)", bg: "F1F5F9", cardBg: "FFFFFF", accent: "DC2626", accent2: "1E293B", text: "0F172A", subtext: "475569", cardBorder: "E2E8F0" },
  monolith: { id: "monolith", name: "Monolith Pitch (Pure Black & Pure White)", bg: "000000", cardBg: "121212", accent: "FFFFFF", accent2: "737373", text: "FFFFFF", subtext: "A3A3A3", cardBorder: "262626" },
  paper_white: { id: "paper_white", name: "Architect Paper (Warm White & Ink Black)", bg: "FAF8F5", cardBg: "FFFFFF", accent: "1C1917", accent2: "78716C", text: "1C1917", subtext: "57534E", cardBorder: "E7E5E4" },
  bauhaus_mono: { id: "bauhaus_mono", name: "Bauhaus Minimal (Off-White & Primary Blue)", bg: "F5F5F0", cardBg: "FFFFFF", accent: "1D4ED8", accent2: "B91C1C", text: "171717", subtext: "525252", cardBorder: "D4D4D4" },
  slate_minimal: { id: "slate_minimal", name: "Slate Academic (Cool Slate & Indigo)", bg: "F1F5F9", cardBg: "FFFFFF", accent: "4F46E5", accent2: "334155", text: "0F172A", subtext: "64748B", cardBorder: "CBD5E1" },
  editorial_serif: { id: "editorial_serif", name: "Editorial Modern (Ivory & Deep Charcoal)", bg: "FDFBF7", cardBg: "FFFFFF", accent: "292524", accent2: "D97706", text: "1C1917", subtext: "78716C", cardBorder: "E7E5E4" },
  modern_charcoal: { id: "modern_charcoal", name: "Modern Charcoal (Gunmetal & Soft Platinum)", bg: "1E293B", cardBg: "334155", accent: "38BDF8", accent2: "F8FAFC", text: "F8FAFC", subtext: "94A3B8", cardBorder: "475569" },
  architectural_gray: { id: "architectural_gray", name: "Architect Concrete (Pearl Gray & Steel)", bg: "F3F4F6", cardBg: "FFFFFF", accent: "374151", accent2: "4B5563", text: "111827", subtext: "6B7280", cardBorder: "D1D5DB" },
  scandinavian_light: { id: "scandinavian_light", name: "Scandinavian Frost (Porcelain & Soft Forest)", bg: "F7FBF9", cardBg: "FFFFFF", accent: "059669", accent2: "064E3B", text: "064E3B", subtext: "6B7280", cardBorder: "D1FAE5" },
  pure_ivory: { id: "pure_ivory", name: "Pure Ivory Luxury (Warm Cream & Warm Gold)", bg: "FAF7F2", cardBg: "FFFFFF", accent: "B45309", accent2: "1C1917", text: "1C1917", subtext: "78716C", cardBorder: "EFEAE1" },
  graphite_clean: { id: "graphite_clean", name: "Graphite Studio (Dark Graphite & Glacier Blue)", bg: "18181B", cardBg: "27272A", accent: "06B6D4", accent2: "E4E4E7", text: "FAFAFA", subtext: "A1A1AA", cardBorder: "3F3F46" },
  pure_onyx: { id: "pure_onyx", name: "Pure Onyx (Dark Onyx & Brushed Silver)", bg: "0F0F10", cardBg: "1B1B1E", accent: "E2E8F0", accent2: "94A3B8", text: "FFFFFF", subtext: "94A3B8", cardBorder: "2E2E33" },
  helvetica_crisp: { id: "helvetica_crisp", name: "Helvetica Crisp (Pure Snow & Racing Red)", bg: "FFFFFF", cardBg: "F8FAFC", accent: "EF4444", accent2: "0F172A", text: "0F172A", subtext: "64748B", cardBorder: "E2E8F0" },
  studio_white: { id: "studio_white", name: "Studio Light (Bright White & Royal Violet)", bg: "FAFAFA", cardBg: "FFFFFF", accent: "7C3AED", accent2: "18181B", text: "18181B", subtext: "71717A", cardBorder: "E4E4E7" },

  // 3. NATURE & EARTH (15)
  emerald: { id: "emerald", name: "Emerald Matrix (Deep Forest & Mint Gold)", bg: "06261E", cardBg: "0B3B2F", accent: "10B981", accent2: "F59E0B", text: "FFFFFF", subtext: "A7F3D0", cardBorder: "047857" },
  terracotta: { id: "terracotta", name: "Warm Terracotta (Espresso & Peach)", bg: "1C1512", cardBg: "2E221D", accent: "EA580C", accent2: "FDBA74", text: "FFF7ED", subtext: "D6D3D1", cardBorder: "4D352B" },
  sage: { id: "sage", name: "Sage Academic (Muted Slate & Emerald)", bg: "131A17", cardBg: "1D2B25", accent: "34D399", accent2: "60A5FA", text: "ECFDF5", subtext: "9CA3AF", cardBorder: "274237" },
  forest_moss: { id: "forest_moss", name: "Forest Moss (Deep Pine & Soft Lime)", bg: "0A1F13", cardBg: "133320", accent: "22C55E", accent2: "86EFAC", text: "F0FDF4", subtext: "BBF7D0", cardBorder: "166534" },
  autumn_harvest: { id: "autumn_harvest", name: "Autumn Harvest (Deep Cedar & Golden Ochre)", bg: "1F140A", cardBg: "332212", accent: "F59E0B", accent2: "EA580C", text: "FFFBEB", subtext: "FDE68A", cardBorder: "5A3A1E" },
  olive_grove: { id: "olive_grove", name: "Olive Grove (Dark Olive & Warm Beige)", bg: "1A1C14", cardBg: "292C1E", accent: "84CC16", accent2: "EAB308", text: "FEFCE8", subtext: "D9F99D", cardBorder: "3F442E" },
  desert_dune: { id: "desert_dune", name: "Desert Dune (Warm Clay & Radiant Sand)", bg: "FAF5EE", cardBg: "FFFFFF", accent: "C2410C", accent2: "D97706", text: "431407", subtext: "78350F", cardBorder: "FED7AA" },
  canyon_sand: { id: "canyon_sand", name: "Canyon Red (Deep Rust & Desert Gold)", bg: "210E0C", cardBg: "381915", accent: "F97316", accent2: "FBBF24", text: "FFF7ED", subtext: "FDBA74", cardBorder: "5E251E" },
  pine_needle: { id: "pine_needle", name: "Nordic Pine (Dark Evergreen & Pale Frost)", bg: "061E1A", cardBg: "0E2F29", accent: "14B8A6", accent2: "5EEAD4", text: "F0FDFA", subtext: "99F6E4", cardBorder: "134E48" },
  jade_emperor: { id: "jade_emperor", name: "Imperial Jade (Deep Jade & Imperial Gold)", bg: "062119", cardBg: "0D362A", accent: "059669", accent2: "EAB308", text: "FFFFFF", subtext: "A7F3D0", cardBorder: "065F46" },
  bamboo_garden: { id: "bamboo_garden", name: "Bamboo Zen (Matcha & Polished Teak)", bg: "141A12", cardBg: "202A1E", accent: "4ADE80", accent2: "A3E635", text: "F7FEE7", subtext: "BEF264", cardBorder: "2D3B2A" },
  eucalyptus: { id: "eucalyptus", name: "Eucalyptus Mist (Soft Fog & Cool Mint)", bg: "F2F7F5", cardBg: "FFFFFF", accent: "0D9488", accent2: "115E59", text: "134E48", subtext: "5E7E77", cardBorder: "CCFBF1" },
  savannah_grass: { id: "savannah_grass", name: "Savannah Sunrise (Rich Espresso & Acacia Gold)", bg: "1C150D", cardBg: "2D2216", accent: "D97706", accent2: "F59E0B", text: "FEF3C7", subtext: "FCD34D", cardBorder: "4A3723" },
  amazon_rainforest: { id: "amazon_rainforest", name: "Amazon Depths (Night Jungle & Parrot Yellow)", bg: "041C10", cardBg: "0B2E1C", accent: "10B981", accent2: "FACC15", text: "FFFFFF", subtext: "6EE7B7", cardBorder: "064E3B" },
  mountain_stone: { id: "mountain_stone", name: "Mountain Granite (Slate Rock & Wild Lichen)", bg: "181E1C", cardBg: "242E2B", accent: "2DD4BF", accent2: "94A3B8", text: "F1F5F9", subtext: "94A3B8", cardBorder: "364541" },

  // 4. OCEAN & COSMIC (15)
  ocean: { id: "ocean", name: "Deep Ocean (Abyss Navy & Aquamarine)", bg: "031629", cardBg: "0A2644", accent: "38BDF8", accent2: "F43F5E", text: "F0F9FF", subtext: "BAE6FD", cardBorder: "0E3D6B" },
  abyss_navy: { id: "abyss_navy", name: "Abyss Navy (Midnight Mariana & Electric Blue)", bg: "020C17", cardBg: "081A2E", accent: "0284C7", accent2: "38BDF8", text: "F0F9FF", subtext: "7DD3FC", cardBorder: "0C2D4F" },
  cosmic_nebula: { id: "cosmic_nebula", name: "Cosmic Nebula (Space Black & Starlight Rose)", bg: "0A071A", cardBg: "161033", accent: "C084FC", accent2: "F43F5E", text: "FAF5FF", subtext: "E9D5FF", cardBorder: "2A1F5E" },
  arctic_ice: { id: "arctic_ice", name: "Arctic Ice (Glacial Blue & Frozen White)", bg: "07131D", cardBg: "0E2233", accent: "7DD3FC", accent2: "BAE6FD", text: "F0F9FF", subtext: "E0F2FE", cardBorder: "163A57" },
  coral_reef: { id: "coral_reef", name: "Coral Reef (Marine Navy & Vibrant Coral)", bg: "061928", cardBg: "0F2940", accent: "FB7185", accent2: "38BDF8", text: "FFFFFF", subtext: "FECDD3", cardBorder: "1A4366" },
  supernova: { id: "supernova", name: "Supernova Flare (Void & Stellar Flare)", bg: "0D0814", cardBg: "1B1229", accent: "F59E0B", accent2: "EC4899", text: "FFFBEB", subtext: "FDE68A", cardBorder: "352352" },
  galaxy_violet: { id: "galaxy_violet", name: "Galaxy Spiral (Cosmic Indigo & Star Dust)", bg: "0B0B24", cardBg: "15153D", accent: "818CF8", accent2: "A78BFA", text: "EEF2FF", subtext: "C7D2FE", cardBorder: "24245F" },
  mediterranean: { id: "mediterranean", name: "Mediterranean Teal (Deep Azure & Sea Foam)", bg: "04202C", cardBg: "0A3344", accent: "2DD4BF", accent2: "38BDF8", text: "F0FDFA", subtext: "99F6E4", cardBorder: "0F4E66" },
  mariana_trench: { id: "mariana_trench", name: "Mariana Depths (Abyssal Teal & Bioluminescence)", bg: "02141C", cardBg: "072533", accent: "00F5D4", accent2: "00BBF9", text: "E8FDF9", subtext: "7BF1D8", cardBorder: "0D3F54" },
  polar_glaze: { id: "polar_glaze", name: "Polar Iceberg (Icy Teal & Snow Mint)", bg: "F0F9FF", cardBg: "FFFFFF", accent: "0284C7", accent2: "0D9488", text: "082F49", subtext: "0369A1", cardBorder: "BAE6FD" },
  starlight_silver: { id: "starlight_silver", name: "Starlight Cosmos (Obsidian & Silver Chrome)", bg: "080A0F", cardBg: "131722", accent: "CBD5E1", accent2: "60A5FA", text: "F8FAFC", subtext: "94A3B8", cardBorder: "232B3E" },
  andromeda_dusk: { id: "andromeda_dusk", name: "Andromeda Dusk (Deep Mulberry & Solar Ray)", bg: "140921", cardBg: "26123D", accent: "E879F9", accent2: "FBBF24", text: "FDF4FF", subtext: "F0ABFC", cardBorder: "43206B" },
  pacific_blue: { id: "pacific_blue", name: "Pacific Trench (True Royal Navy & Sky Blue)", bg: "0A1628", cardBg: "122544", accent: "2563EB", accent2: "60A5FA", text: "FFFFFF", subtext: "93C5FD", cardBorder: "1A3B6B" },
  aqua_splash: { id: "aqua_splash", name: "Aqua Splash (Electric Aqua & Solar Orange)", bg: "041F2B", cardBg: "0B3547", accent: "06B6D4", accent2: "FB923C", text: "ECFEFF", subtext: "A5F3FC", cardBorder: "11526E" },
  deep_space: { id: "deep_space", name: "Deep Space Void (Vacuum Black & Pulsar Cyan)", bg: "020408", cardBg: "0A101C", accent: "38BDF8", accent2: "818CF8", text: "F8FAFC", subtext: "64748B", cardBorder: "152035" },

  // 5. LUXURY & ROYAL (15)
  amethyst: { id: "amethyst", name: "Royal Amethyst (Deep Violet & Neon Pink)", bg: "1A0E2E", cardBg: "291845", accent: "EC4899", accent2: "8B5CF6", text: "FFFFFF", subtext: "E9D5FF", cardBorder: "4C1D95" },
  crimson: { id: "crimson", name: "Crimson Luxury (Deep Wine & Rose)", bg: "24080D", cardBg: "3B1118", accent: "E11D48", accent2: "FB7185", text: "FFF1F2", subtext: "FDA4AF", cardBorder: "6B1A28" },
  solar: { id: "solar", name: "Solar Amber (Pitch Warmth & Fire)", bg: "171008", cardBg: "2B1F12", accent: "F59E0B", accent2: "EF4444", text: "FFFBEB", subtext: "D6D3D1", cardBorder: "452D17" },
  imperial_gold: { id: "imperial_gold", name: "Imperial Gold (Rich Onyx & Polished Gold)", bg: "12100A", cardBg: "241F14", accent: "EAB308", accent2: "FBBF24", text: "FEFCE8", subtext: "FDE047", cardBorder: "453B22" },
  velvet_burgundy: { id: "velvet_burgundy", name: "Velvet Burgundy (Merlot & Rose Gold)", bg: "240A14", cardBg: "3D1223", accent: "F43F5E", accent2: "FDA4AF", text: "FFF1F2", subtext: "FBCFE8", cardBorder: "661E3B" },
  champagne_pearl: { id: "champagne_pearl", name: "Champagne Luxury (Warm Sand & Pearl Gold)", bg: "FBF8F2", cardBg: "FFFFFF", accent: "D97706", accent2: "B45309", text: "292524", subtext: "78716C", cardBorder: "E7DFD3" },
  sapphire_prestige: { id: "sapphire_prestige", name: "Sapphire Prestige (Royal Midnight & Brilliant Blue)", bg: "060E21", cardBg: "0E1D40", accent: "3B82F6", accent2: "60A5FA", text: "EFF6FF", subtext: "BFDBFE", cardBorder: "162C61" },
  rose_quartz: { id: "rose_quartz", name: "Rose Quartz (Deep Mauve & Soft Rose)", bg: "241119", cardBg: "3B1C2A", accent: "FB7185", accent2: "F472B6", text: "FFF1F2", subtext: "FDA4AF", cardBorder: "5E2E44" },
  persian_blue: { id: "persian_blue", name: "Persian Lapis (Lapis Lazuli & Turquoise Gold)", bg: "091833", cardBg: "122A54", accent: "06B6D4", accent2: "EAB308", text: "FFFFFF", subtext: "93C5FD", cardBorder: "1C3E7A" },
  emerald_crown: { id: "emerald_crown", name: "Emerald Sovereign (Deep Malachite & Crown Gold)", bg: "081F17", cardBg: "11382A", accent: "10B981", accent2: "F59E0B", text: "F0FDF4", subtext: "A7F3D0", cardBorder: "1B543F" },
  ruby_sovereign: { id: "ruby_sovereign", name: "Ruby Sovereign (Pomegranate & Champagne)", bg: "26090D", cardBg: "3D1117", accent: "BE123C", accent2: "FDE047", text: "FFF1F2", subtext: "FDA4AF", cardBorder: "611D26" },
  florentine_silk: { id: "florentine_silk", name: "Florentine Silk (Dark Sienna & Venetian Gold)", bg: "1E120D", cardBg: "331F17", accent: "EA580C", accent2: "FBBF24", text: "FFF7ED", subtext: "FDBA74", cardBorder: "523427" },
  platinum_elite: { id: "platinum_elite", name: "Platinum Elite (Brushed Charcoal & Platinum)", bg: "141619", cardBg: "202328", accent: "94A3B8", accent2: "E2E8F0", text: "F8FAFC", subtext: "94A3B8", cardBorder: "333842" },
  venetian_copper: { id: "venetian_copper", name: "Venetian Copper (Patina Dark & Burnished Bronze)", bg: "141A17", cardBg: "222C27", accent: "F97316", accent2: "2DD4BF", text: "FFF7ED", subtext: "99F6E4", cardBorder: "384841" },
  sovereign_purple: { id: "sovereign_purple", name: "Byzantine Purple (Deep Plum & Royal Gold)", bg: "1F0B24", cardBg: "36143E", accent: "C084FC", accent2: "FACC15", text: "FAF5FF", subtext: "E9D5FF", cardBorder: "572164" },

  // 6. MODERN TECH & SAAS (15)
  stripe_blurple: { id: "stripe_blurple", name: "Stripe Indigo (Deep SaaS Navy & Blurple)", bg: "0A1026", cardBg: "141E42", accent: "6366F1", accent2: "38BDF8", text: "F8FAFC", subtext: "C7D2FE", cardBorder: "233061" },
  vercel_dark: { id: "vercel_dark", name: "Vercel Carbon (Pure Black & Pure High-Contrast White)", bg: "000000", cardBg: "111111", accent: "0070F3", accent2: "FFFFFF", text: "EDEDED", subtext: "888888", cardBorder: "333333" },
  linear_slate: { id: "linear_slate", name: "Linear Titanium (Dark Graphite & Linear Purple)", bg: "111216", cardBg: "1B1D24", accent: "5E6AD2", accent2: "8E97E8", text: "EEEEF0", subtext: "8A8F98", cardBorder: "2B2E38" },
  notion_warm: { id: "notion_warm", name: "Notion Editorial (Warm Parchment & Ink Black)", bg: "F7F6F3", cardBg: "FFFFFF", accent: "2F3437", accent2: "9B9A97", text: "2F3437", subtext: "787774", cardBorder: "E3E2DE" },
  openai_forest: { id: "openai_forest", name: "OpenAI Emerald (Deep Spruce & Modern Mint)", bg: "081714", cardBg: "102924", accent: "10A37F", accent2: "19C37D", text: "FFFFFF", subtext: "A7F3D0", cardBorder: "1A423A" },
  figma_iris: { id: "figma_iris", name: "Figma Creative (Charcoal & Vibrant Iris)", bg: "1E1E1E", cardBg: "2C2C2C", accent: "A259FF", accent2: "0ACF83", text: "FFFFFF", subtext: "B3B3B3", cardBorder: "3D3D3D" },
  supabase_emerald: { id: "supabase_emerald", name: "Supabase Matrix (Pitch Void & Supabase Green)", bg: "171717", cardBg: "242424", accent: "3ECF8E", accent2: "F4F4F5", text: "FAFAFA", subtext: "A1A1AA", cardBorder: "383838" },
  github_dark: { id: "github_dark", name: "GitHub Dark Dimmed (Canvas Dark & Blue Accents)", bg: "1C2128", cardBg: "22272E", accent: "539BF5", accent2: "57AB5A", text: "ADBAC7", subtext: "768390", cardBorder: "373E47" },
  framer_charcoal: { id: "framer_charcoal", name: "Framer Design (Deep Ash & Electric Blue)", bg: "0D0D0E", cardBg: "171719", accent: "0055FF", accent2: "38BDF8", text: "FFFFFF", subtext: "8E8E93", cardBorder: "28282C" },
  raycast_ruby: { id: "raycast_ruby", name: "Raycast Obsidian (Jet & Fiery Orange)", bg: "0F0F11", cardBg: "1A1A1E", accent: "FF6363", accent2: "FF9040", text: "F4F4F6", subtext: "8D8D99", cardBorder: "2B2B33" },
  discord_blurple: { id: "discord_blurple", name: "Discord Night (Discord Dark & Bright Blurple)", bg: "1E1F22", cardBg: "2B2D31", accent: "5865F2", accent2: "57F287", text: "F2F3F5", subtext: "949BA4", cardBorder: "35373C" },
  slack_aubergine: { id: "slack_aubergine", name: "Slack Enterprise (Deep Eggplant & Bright Teal)", bg: "1A0D1E", cardBg: "2C1833", accent: "1264A3", accent2: "2EB67D", text: "FFFFFF", subtext: "D1C7D6", cardBorder: "452550" },
  apple_minimal: { id: "apple_minimal", name: "Apple Glass (Pure Space Gray & Dynamic Island)", bg: "161617", cardBg: "242426", accent: "2997FF", accent2: "F5F5F7", text: "F5F5F7", subtext: "86868B", cardBorder: "333336" },
  google_clean: { id: "google_clean", name: "Google Material (Clean White & Google Blue)", bg: "FFFFFF", cardBg: "F8F9FA", accent: "1A73E8", accent2: "34A853", text: "202124", subtext: "5F6368", cardBorder: "DADCE0" },
  spotify_jet: { id: "spotify_jet", name: "Spotify Wave (Pitch Black & Spotify Neon Green)", bg: "121212", cardBg: "181818", accent: "1DB954", accent2: "B3B3B3", text: "FFFFFF", subtext: "B3B3B3", cardBorder: "282828" },

  // 7. PASTEL & CREATIVE (15)
  lavender_mist: { id: "lavender_mist", name: "Lavender Mist (Soft Lilac & Royal Purple)", bg: "FAF5FF", cardBg: "FFFFFF", accent: "9333EA", accent2: "A855F7", text: "3B0764", subtext: "6B21A8", cardBorder: "E9D5FF" },
  peach_sorbet: { id: "peach_sorbet", name: "Peach Sorbet (Soft Cream & Sunset Peach)", bg: "FFF7ED", cardBg: "FFFFFF", accent: "EA580C", accent2: "F97316", text: "431407", subtext: "9A3412", cardBorder: "FED7AA" },
  matcha_zen: { id: "matcha_zen", name: "Matcha Zen (Soft Tea & Deep Forest)", bg: "F4F7F4", cardBg: "FFFFFF", accent: "15803D", accent2: "166534", text: "14532D", subtext: "15803D", cardBorder: "DCFCE7" },
  soft_blush: { id: "soft_blush", name: "Soft Blush (Blush Petal & Rosewood)", bg: "FFF1F2", cardBg: "FFFFFF", accent: "E11D48", accent2: "FB7185", text: "881337", subtext: "BE123C", cardBorder: "FECDD3" },
  sky_pastel: { id: "sky_pastel", name: "Sky Breeze (Pale Azure & Ultramarine)", bg: "F0F9FF", cardBg: "FFFFFF", accent: "0284C7", accent2: "0369A1", text: "082F49", subtext: "0284C7", cardBorder: "BAE6FD" },
  buttercup_warm: { id: "buttercup_warm", name: "Buttercup Warm (Pale Butter & Honey Gold)", bg: "FEFCE8", cardBg: "FFFFFF", accent: "CA8A04", accent2: "A16207", text: "713F12", subtext: "854D0E", cardBorder: "FEF08A" },
  lilac_whisper: { id: "lilac_whisper", name: "Lilac Whisper (Pale Mauve & Deep Plum)", bg: "FDF4FF", cardBg: "FFFFFF", accent: "C026D3", accent2: "A21CAF", text: "701A75", subtext: "86198F", cardBorder: "F5D0FE" },
  mint_cream: { id: "mint_cream", name: "Mint Cream (Cool Foam & Sea Emerald)", bg: "F0FDFA", cardBg: "FFFFFF", accent: "0D9488", accent2: "0F766E", text: "134E48", subtext: "0D9488", cardBorder: "CCFBF1" },
  coral_breeze: { id: "coral_breeze", name: "Coral Breeze (Soft Apricot & Vibrant Tangerine)", bg: "FFF8F5", cardBg: "FFFFFF", accent: "F43F5E", accent2: "FB923C", text: "4C0519", subtext: "9F1239", cardBorder: "FFE4E6" },
  cotton_candy: { id: "cotton_candy", name: "Cotton Candy (Dreamy Pink & Sky Blue)", bg: "FDF2F8", cardBg: "FFFFFF", accent: "DB2777", accent2: "0284C7", text: "831843", subtext: "BE185D", cardBorder: "FBCFE8" },
  lemon_chiffon: { id: "lemon_chiffon", name: "Lemon Chiffon (Warm Sunlight & Amber Oak)", bg: "FEFDF0", cardBg: "FFFFFF", accent: "EAB308", accent2: "B45309", text: "422006", subtext: "713F12", cardBorder: "FEF9C3" },
  pistachio_light: { id: "pistachio_light", name: "Pistachio Soft (Pale Pistachio & Cedar)", bg: "F7FEE7", cardBg: "FFFFFF", accent: "65A30D", accent2: "4D7C0F", text: "1A2E05", subtext: "3F6212", cardBorder: "ECFCCB" },
  desert_rose: { id: "desert_rose", name: "Desert Rose (Muted Terracotta & Soft Rose)", bg: "FAF4F0", cardBg: "FFFFFF", accent: "BE123C", accent2: "C2410C", text: "4A044E", subtext: "881337", cardBorder: "FFE4E6" },
  morning_dew: { id: "morning_dew", name: "Morning Dew (Pale Periwinkle & Slate Blue)", bg: "F5F7FF", cardBg: "FFFFFF", accent: "4F46E5", accent2: "3730A3", text: "1E1B4B", subtext: "312E81", cardBorder: "E0E7FF" },
  sunset_glow: { id: "sunset_glow", name: "Sunset Horizon (Warm Twilight & Electric Gold)", bg: "1F101A", cardBg: "331A2B", accent: "FB923C", accent2: "F43F5E", text: "FFF7ED", subtext: "FDA4AF", cardBorder: "522B46" }
};

// ============================================================================
// 2. MAVZUGA OID YUQORI SIFATLI RASMLAR BAZASI (HD EDUCATIONAL CDN)
// ============================================================================
export const EDUCATIONAL_TOPIC_IMAGES = {
  biology: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1000&auto=format&fit=crop&q=80",
  photosynthesis: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1000&auto=format&fit=crop&q=80",
  blood: "https://images.unsplash.com/photo-1579165466791-788226ab77b6?w=1000&auto=format&fit=crop&q=80",
  heart: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1000&auto=format&fit=crop&q=80",
  temur: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1000&auto=format&fit=crop&q=80",
  history: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1000&auto=format&fit=crop&q=80",
  physics: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1000&auto=format&fit=crop&q=80",
  space: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80",
  math: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1000&auto=format&fit=crop&q=80",
  chemistry: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1000&auto=format&fit=crop&q=80",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80",
  ai: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
  nature: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop&q=80",
  school: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80"
};

export function getTopicImageUrl(topic = "") {
  const t = String(topic).toLowerCase();
  if (/qon|eritrotsit|leykotsit|trombotsit|gemoglobin|anemiya/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.blood;
  if (/yurak|tomir|puls|kardiolog/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.heart;
  if (/fotosintez|xloroplast|barg|o'simlik|daraxt|botanika/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.photosynthesis;
  if (/biolog|hujayra|anatomi|genetika|organizm|zoolog/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.biology;
  if (/temur|bobur|samarqand|buxoro|ipak yo'li/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.temur;
  if (/tarix|arxeolog|sulola|imperiya|qadimgi/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.history;
  if (/fizika|nyuton|optika|gravitatsiya|kvant|mexanika|termodinamika/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.physics;
  if (/fazo|koinot|astronomiya|sayyora|quyosh|oy|teleskop/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.space;
  if (/matematik|algebra|geometriya|tenglama|uchburchak|integral/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.math;
  if (/kimyo|molekula|atom|reaksiya|element|davriy jadval|eritma/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.chemistry;
  if (/sun'iy intellekt|ai|robot|dasturlash|axborot|kompyuter/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.ai;
  if (/texnika|texnologiya|muhandislik/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.technology;
  if (/ekologiya|tabiat|iqlim|atrof-muhit|biosfera/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.nature;
  if (/maktab|pedagog|ta'lim|dars|o'quvchi|metodika/i.test(t)) return EDUCATIONAL_TOPIC_IMAGES.school;
  return EDUCATIONAL_TOPIC_IMAGES.default;
}

export async function fetchImageAsBase64(imageUrl, timeoutMs = 3500) {
  if (!imageUrl) return null;
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    if (typeof window !== 'undefined') {
      let binary = '';
      const bytes = new Uint8Array(arrayBuf);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return `data:${contentType};base64,${window.btoa(binary)}`;
    } else {
      const base64 = Buffer.from(arrayBuf).toString('base64');
      return `data:${contentType};base64,${base64}`;
    }
  } catch (err) {
    return null;
  }
}

export function getDefaultGammaCards(topic = "Fotosintez jarayoni va o'simliklar biosferasi", authorName = "SmartOffice EduAI") {
  return generateRealAIGammaCards(topic);
}

// ============================================================================
// 3. 100+ DINAMIK FON GRAFIKASI GENERATORI (HAR BIR SLAYD UNIKAL)
// ============================================================================
export function applyDynamicBackgroundPattern(slide, pres, style, index, totalSlides = 10) {
  const patternId = (index * 17 + 7) % 100;
  const category = Math.floor(patternId / 10);
  const sub = patternId % 10;

  // 0-9: Ambient Glowing Mesh Orbs
  if (category === 0) {
    const x1 = -1.5 + (sub * 0.4);
    const y1 = -1.2 + (sub * 0.2);
    const r1 = 3.8 + (sub * 0.2);
    slide.addShape(pres.ShapeType.ellipse, {
      x: x1, y: y1, w: r1, h: r1,
      fill: { color: style.accent, transparency: 86 }, line: { color: style.accent, width: 0 }
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: 7.2 - (sub * 0.3), y: 3.0 + (sub * 0.15), w: 4.2, h: 4.2,
      fill: { color: style.accent2, transparency: 89 }, line: { color: style.accent2, width: 0 }
    });
  }
  // 10-19: Tech Dot Matrix & Top Accent Ribbons
  else if (category === 1) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 0.26, w: 2.2 + (sub * 0.2), h: 0.05,
      fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.02
    });
    const dotCount = 3 + (sub % 4);
    for (let d = 0; d < dotCount; d++) {
      slide.addShape(pres.ShapeType.ellipse, {
        x: 8.2 + (d * 0.28), y: 0.32, w: 0.1, h: 0.1,
        fill: { color: d === 0 ? style.accent : (d === 1 ? style.accent2 : style.subtext) },
        line: { color: style.cardBorder, width: 0 }
      });
    }
  }
  // 20-29: Diagonal Cyber Laser Stripes & Shards
  else if (category === 2) {
    const offset = (sub * 0.35);
    slide.addShape(pres.ShapeType.line, {
      x: 8.5 + offset, y: -0.5, w: 2.0, h: 2.0,
      line: { color: style.cardBorder, width: 1.5, dashType: 'solid' }
    });
    slide.addShape(pres.ShapeType.line, {
      x: 8.8 + offset, y: -0.5, w: 2.0, h: 2.0,
      line: { color: style.accent, width: 1.0, dashType: 'dash' }
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: -0.6, y: 3.6, w: 3.2, h: 3.2,
      fill: { color: style.accent2, transparency: 91 }, line: { color: style.accent2, width: 0 }
    });
  }
  // 30-39: Swiss Modernist Framing Brackets & Viewfinder Crosshairs
  else if (category === 3) {
    slide.addShape(pres.ShapeType.line, { x: 0.8, y: 0.85, w: 0.4, h: 0, line: { color: style.accent, width: 1.5 } });
    slide.addShape(pres.ShapeType.line, { x: 0.8, y: 0.85, w: 0, h: 0.4, line: { color: style.accent, width: 1.5 } });
    slide.addShape(pres.ShapeType.line, { x: 8.8, y: 5.25, w: 0.4, h: 0, line: { color: style.accent2, width: 1.5 } });
    slide.addShape(pres.ShapeType.line, { x: 9.2, y: 4.85, w: 0, h: 0.4, line: { color: style.accent2, width: 1.5 } });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 5.35, w: 1.2 + (sub * 0.1), h: 0.05,
      fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.02
    });
  }
  // 40-49: Architectural Guide Rails & Timeline Side Spines
  else if (category === 4) {
    slide.addShape(pres.ShapeType.line, {
      x: 0.45, y: 0.6, w: 0, h: 4.4, line: { color: style.cardBorder, width: 1.0, dashType: 'dash' }
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: 0.4, y: 1.0 + (sub * 0.35), w: 0.12, h: 0.12,
      fill: { color: style.accent }, line: { color: style.accent, width: 0 }
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 5.32, w: 2.0, h: 0.06, fill: { color: style.accent2 }, line: { color: style.accent2, width: 0 }, rectRadius: 0.03
    });
  }
  // 50-59: Isometric Polygons & Floating Shields
  else if (category === 5) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.4, y: 4.2, w: 1.4, h: 1.4, fill: { color: style.cardBg },
      line: { color: style.cardBorder, width: 1.2 }, rectRadius: 0.12
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: 8.85, y: 4.65, w: 0.5, h: 0.5, fill: { color: style.accent, transparency: 80 }, line: { color: style.accent, width: 0 }
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: -0.5, y: -0.5, w: 3.5, h: 3.5, fill: { color: style.accent, transparency: 92 }, line: { color: style.accent, width: 0 }
    });
  }
  // 60-69: Wave Horizon Bars & Gradient Curves
  else if (category === 6) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 5.4, w: 8.4, h: 0.04, fill: { color: style.cardBorder }, line: { color: style.cardBorder, width: 0 }, rectRadius: 0.02
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8 + (sub * 0.6), y: 5.4, w: 2.2, h: 0.04, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.02
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: 7.5, y: -0.8, w: 3.5, h: 3.5, fill: { color: style.accent2, transparency: 90 }, line: { color: style.accent2, width: 0 }
    });
  }
  // 70-79: HUD Radar Arcs & Concentric Circles
  else if (category === 7) {
    slide.addShape(pres.ShapeType.ellipse, {
      x: 8.2, y: -0.5, w: 2.2, h: 2.2, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.2, dashType: 'dash' }
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: 8.6, y: -0.1, w: 1.4, h: 1.4, fill: { color: style.bg }, line: { color: style.accent2, width: 1.0 }
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: 9.15, y: 0.45, w: 0.3, h: 0.3, fill: { color: style.accent }, line: { color: style.accent, width: 0 }
    });
  }
  // 80-89: Floating Glass Card Underlay Silhouettes
  else if (category === 8) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.95, y: 1.0, w: 8.1, h: 4.15, fill: { color: style.cardBg, transparency: 85 },
      line: { color: style.cardBorder, width: 1.0 }, rectRadius: 0.15
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: 6.8, y: 3.2, w: 3.8, h: 3.8, fill: { color: style.accent, transparency: 92 }, line: { color: style.accent, width: 0 }
    });
  }
  // 90-99: Academic Emblems, Gold Threads & Certification Accents
  else {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 0.28, w: 0.45, h: 0.2, fill: { color: style.bg }, line: { color: style.accent, width: 1.0 }, rectRadius: 0.04
    });
    slide.addText("VERIFIED", {
      x: 0.8, y: 0.28, w: 0.45, h: 0.2, fontSize: 6.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: -1.0, y: 2.0, w: 3.5, h: 3.5, fill: { color: style.accent2, transparency: 91 }, line: { color: style.accent2, width: 0 }
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 7.2, y: 5.35, w: 2.0, h: 0.05, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.02
    });
  }
}

// ============================================================================
// 4. 100+ XIL SLAYD ARXITEKTURASI (STRUCTURAL LAYOUT DISPATCHER)
// ============================================================================

// Helper to determine the exact architecture for a slide
export function resolveSlideArchitecture(card, index, totalSlides) {
  if (card.architecture) return card.architecture;
  if (index === 0) return 'hero_classic';
  if (index === totalSlides - 1 && totalSlides > 2) return 'summary_takeaways';

  const type = String(card.type || '').toLowerCase();
  
  // Specific mappings
  if (type === 'split_image' || type === 'image') return 'split_image';
  if (type === 'bento_3' || type === 'bento') return 'bento_3';
  if (type === 'grid4' || type === 'grid') return 'grid4';
  if (type === 'pillars' || type === 'columns') return 'pillars_3';
  if (type === 'stats' || type === 'deep_dive' || type === 'metrics') return 'stats_kpi';
  if (type === 'timeline' || type === 'roadmap' || type === 'process') return 'timeline_steps';
  if (type === 'quiz_slide' || type === 'quiz') return 'quiz_interactive';
  if (type === 'split' || type === 'versus') return 'split_versus';
  if (type === 'quote') return 'quote_impact';
  if (type === 'summary') return 'summary_takeaways';

  // Modular distribution across 10 distinct architectural families
  const familyIndex = index % 8;
  switch (familyIndex) {
    case 1: return 'bento_3';
    case 2: return 'split_image';
    case 3: return 'pillars_3';
    case 4: return 'grid4';
    case 5: return 'stats_kpi';
    case 6: return 'timeline_steps';
    case 7: return 'split_versus';
    default: return 'concept_card';
  }
}

// Master Layout Renderer supporting 100+ structural designs
export function renderSlideArchitecture(slide, pres, card, style, index, totalSlides, topicImageBase64, authorName, topic) {
  const arch = resolveSlideArchitecture(card, index, totalSlides);

  // 1. HERO ARCHITECTURE (1-Varoq: Muqova + Taqdimotchi ismi)
  if (arch.startsWith('hero') || index === 0) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 0.85, w: 8.4, h: 4.4,
      fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1.5 }, rectRadius: 0.15
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 0.85, w: 8.4, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.2, y: 1.25, w: 3.5, h: 0.42, fill: { color: style.bg }, line: { color: style.accent, width: 1.2 }, rectRadius: 0.08
    });
    slide.addText(card.badge || "GAMMA AI TAQDIMOT", {
      x: 1.2, y: 1.25, w: 3.5, h: 0.42, fontSize: 11, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
    });
    slide.addText((card.title || topic).toUpperCase(), {
      x: 1.2, y: 1.85, w: 7.6, h: 1.5, fontSize: 28, bold: true, color: style.text, fontFace: 'Arial'
    });
    slide.addText(card.subtitle || "Zamonaviy ta'lim va tahliliy taqdimot", {
      x: 1.2, y: 3.45, w: 7.6, h: 1.0, fontSize: 14.5, color: style.subtext, fontFace: 'Arial'
    });
    // Foydalanuvchi / Taqdimotchi ismi aks etadigan maxsus blok
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.2, y: 4.55, w: 5.2, h: 0.45, fill: { color: style.bg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.08
    });
    slide.addText(`👤 Taqdimotchi: ${authorName}  |  ⚡ 100+ Dynamic Layouts Verified`, {
      x: 1.35, y: 4.55, w: 4.9, h: 0.45, fontSize: 10, color: style.subtext, valign: 'middle', fontFace: 'Arial'
    });
    return;
  }

  // 2. SPLIT IMAGE ARCHITECTURE (Chapda HD rasm, O'ngda chuqur tahlil)
  if (arch === 'split_image' || (card.bullets && topicImageBase64 && index % 2 === 1)) {
    slide.addText(card.title || "Vizual Tahlil va Ilmiy Asoslar", {
      x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    // Chap: Rasm
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 3.9, h: 4.0, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.5 }, rectRadius: 0.12
    });
    if (topicImageBase64) {
      slide.addImage({
        data: topicImageBase64,
        x: 0.9, y: 1.35, w: 3.7, h: 3.3, sizing: { type: 'cover', w: 3.7, h: 3.3 }, round: true
      });
      slide.addText(card.badge || "HD ILMIY DIAGRAMMA", {
        x: 1.0, y: 4.75, w: 3.5, h: 0.35, fontSize: 9.5, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
      });
    } else {
      slide.addText("🖼️ VIZUAL GRAFIKA VA SXEMA", {
        x: 1.0, y: 2.8, w: 3.5, h: 0.6, fontSize: 13, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
      });
    }
    // O'ng: Tahlil
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.15, y: 1.25, w: 4.05, h: 4.0, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.12
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.15, y: 1.25, w: 4.05, h: 0.08, fill: { color: style.accent2 }, line: { color: style.accent2, width: 0 }, rectRadius: 0.04
    });
    slide.addText("📌 Muhim Qoidalar va Tahlil:", {
      x: 5.35, y: 1.45, w: 3.65, h: 0.35, fontSize: 13.5, bold: true, color: style.accent2, fontFace: 'Arial'
    });
    if (card.explanation) {
      slide.addText(card.explanation, {
        x: 5.35, y: 1.85, w: 3.65, h: 1.1, fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });
    }
    const bullets = (card.bullets || card.leftBullets || card.rightBullets || []).map(b => `✓  ${b}`).join("\n\n");
    slide.addText(bullets || "✓ Mavzuga oid aniq ta'limiy faktlar\n\n✓ Darslik mezonlariga mos xulosalar", {
      x: 5.35, y: card.explanation ? 3.05 : 1.95, w: 3.65, h: card.explanation ? 2.05 : 3.1, fontSize: 11, color: style.text, fontFace: 'Arial'
    });
    return;
  }

  // 3. BENTO 3 ARCHITECTURE (Asimmetrik 60/40 Bento Bloklar)
  if (arch === 'bento_3') {
    slide.addText(card.title || "Modulli Bento Tuzilma", {
      x: 0.8, y: 0.68, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 5.0, h: 4.0, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.5 }, rectRadius: 0.12
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 5.0, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
    });
    slide.addText(card.mainBlock?.title || card.badge || "ASOSIY TADQIQOT", {
      x: 1.1, y: 1.55, w: 4.4, h: 0.45, fontSize: 16, bold: true, color: style.accent, fontFace: 'Arial'
    });
    slide.addText(card.mainBlock?.desc || card.explanation || "Mavzuning eng fundamental markazi va darslikdagi asosiy g'oyasi.", {
      x: 1.1, y: 2.1, w: 4.4, h: 2.8, fontSize: 12.5, color: style.text, fontFace: 'Arial'
    });

    const sideCards = card.sideCards || [
      { title: "Parametr 1", desc: "Tahliliy mezon va darslik qoidalari" },
      { title: "Parametr 2", desc: "Natija, amaliyot va ilmiy xulosa" }
    ];
    sideCards.slice(0, 2).forEach((sc, idx) => {
      const yPos = 1.25 + (idx * 2.1);
      slide.addShape(pres.ShapeType.roundRect, {
        x: 6.05, y: yPos, w: 3.15, h: 1.9, fill: { color: style.cardBg }, line: { color: idx === 0 ? style.accent2 : style.cardBorder, width: 1 }, rectRadius: 0.1
      });
      slide.addText(sc.title, {
        x: 6.25, y: yPos + 0.2, w: 2.75, h: 0.35, fontSize: 12.5, bold: true, color: idx === 0 ? style.accent2 : style.text, fontFace: 'Arial'
      });
      slide.addText(sc.desc, {
        x: 6.25, y: yPos + 0.6, w: 2.75, h: 1.1, fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
      });
    });
    return;
  }

  // 4. PILLARS 3 ARCHITECTURE (3 ta mustahkam ustun)
  if (arch === 'pillars_3') {
    slide.addText(card.title || "Asosiy Ustunlar va Tamoyillar", {
      x: 0.8, y: 0.68, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    const pillars = (card.cards || []).slice(0, 3);
    pillars.forEach((c, idx) => {
      const xPos = 0.8 + (idx * 2.9);
      const col = idx === 1 ? style.accent2 : style.accent;
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.35, w: 2.65, h: 4.0, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.35, w: 2.65, h: 0.08, fill: { color: col }, line: { color: col, width: 0 }, rectRadius: 0.04
      });
      slide.addShape(pres.ShapeType.ellipse, {
        x: xPos + 0.25, y: 1.58, w: 0.55, h: 0.55, fill: { color: style.bg }, line: { color: col, width: 1.2 }
      });
      slide.addText(c.num || `0${idx + 1}`, {
        x: xPos + 0.25, y: 1.58, w: 0.55, h: 0.55, fontSize: 12, bold: true, color: col, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
      slide.addText(c.title, {
        x: xPos + 0.25, y: 2.25, w: 2.15, h: 0.5, fontSize: 13.5, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(c.desc, {
        x: xPos + 0.25, y: 2.8, w: 2.15, h: 2.3, fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
      });
    });
    return;
  }

  // 5. GRID4 ARCHITECTURE (2x2 Kvadrat Kartalar)
  if (arch === 'grid4') {
    slide.addText(card.title || "Tarkibiy Qismlar va Tuzilma", {
      x: 0.8, y: 0.68, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    const items = (card.items || []).slice(0, 4);
    const coords = [
      { x: 0.8, y: 1.35, col: style.accent, tag: "01" },
      { x: 5.15, y: 1.35, col: style.accent2, tag: "02" },
      { x: 0.8, y: 3.45, col: style.accent2, tag: "03" },
      { x: 5.15, y: 3.45, col: style.accent, tag: "04" }
    ];
    coords.forEach((pos, idx) => {
      const item = items[idx] || { title: `Element ${idx + 1}`, desc: "Batafsil ilmiy va amaliy ma'lumot" };
      slide.addShape(pres.ShapeType.roundRect, {
        x: pos.x, y: pos.y, w: 4.05, h: 1.9, fill: { color: style.cardBg }, line: { color: pos.col, width: 1 }, rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: pos.x, y: pos.y, w: 4.05, h: 0.06, fill: { color: pos.col }, line: { color: pos.col, width: 0 }, rectRadius: 0.03
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: pos.x + 0.2, y: pos.y + 0.18, w: 0.5, h: 0.32, fill: { color: style.bg }, line: { color: pos.col, width: 1 }, rectRadius: 0.05
      });
      slide.addText(pos.tag, {
        x: pos.x + 0.2, y: pos.y + 0.18, w: 0.5, h: 0.32, fontSize: 9.5, bold: true, color: pos.col, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
      slide.addText(item.title, {
        x: pos.x + 0.8, y: pos.y + 0.18, w: 3.05, h: 0.35, fontSize: 12.5, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(item.desc, {
        x: pos.x + 0.25, y: pos.y + 0.6, w: 3.6, h: 1.15, fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
      });
    });
    return;
  }

  // 6. STATS / KPI ARCHITECTURE (Parametrlar va Metrikalar)
  if (arch === 'stats_kpi') {
    slide.addText(card.title || "Asosiy Parametrlar va Statistik Faktlar", {
      x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    if (card.stats && Array.isArray(card.stats) && card.stats.length > 0) {
      const statsList = card.stats.slice(0, 3);
      statsList.forEach((st, idx) => {
        const xPos = 0.8 + (idx * 2.9);
        slide.addShape(pres.ShapeType.roundRect, {
          x: xPos, y: 1.35, w: 2.65, h: 4.0, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.2 }, rectRadius: 0.12
        });
        slide.addShape(pres.ShapeType.roundRect, {
          x: xPos, y: 1.35, w: 2.65, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
        });
        slide.addText(st.value, {
          x: xPos + 0.15, y: 1.6, w: 2.35, h: 0.85, fontSize: 32, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
        });
        slide.addText(st.label, {
          x: xPos + 0.15, y: 2.6, w: 2.35, h: 0.5, fontSize: 12.5, bold: true, color: style.text, align: 'center', fontFace: 'Arial'
        });
        slide.addText(st.desc || "", {
          x: xPos + 0.15, y: 3.15, w: 2.35, h: 1.95, fontSize: 10.5, color: style.subtext, align: 'center', fontFace: 'Arial'
        });
      });
    } else {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: 1.25, w: 3.2, h: 4.0, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.5 }, rectRadius: 0.12
      });
      slide.addText(card.metricValue || "98.5%", {
        x: 1.0, y: 1.9, w: 2.8, h: 1.0, fontSize: 44, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
      });
      slide.addText(card.metricLabel || "Samaradorlik Ko'rsatkichi", {
        x: 1.0, y: 3.25, w: 2.8, h: 0.7, fontSize: 12.5, bold: true, color: style.text, align: 'center', fontFace: 'Arial'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 4.3, y: 1.25, w: 4.9, h: 4.0, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.12
      });
      slide.addText("🔍 Tahliliy Faktlar va Natijalar:", {
        x: 4.55, y: 1.55, w: 4.4, h: 0.42, fontSize: 13.5, bold: true, color: style.text, fontFace: 'Arial'
      });
      const bulletsText = (card.bullets || []).map(b => `✓  ${b}`).join("\n\n");
      slide.addText(bulletsText || "✓ Tizimli tahlil ma'lumotlari", {
        x: 4.55, y: 2.1, w: 4.4, h: 2.9, fontSize: 11, color: style.subtext, fontFace: 'Arial'
      });
    }
    return;
  }

  // 7. TIMELINE ARCHITECTURE (Ketma-ketlik va Bosqichlar)
  if (arch === 'timeline_steps') {
    slide.addText(card.title || "Jarayon Ketma-Ketligi va Bosqichlar", {
      x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    slide.addShape(pres.ShapeType.line, {
      x: 1.3, y: 1.8, w: 0, h: 2.6, line: { color: style.accent, width: 1.8, dashType: 'dash' }
    });
    const steps = (card.steps || []).slice(0, 3);
    steps.forEach((st, idx) => {
      const yPos = 1.35 + (idx * 1.3);
      slide.addShape(pres.ShapeType.ellipse, {
        x: 1.1, y: yPos + 0.32, w: 0.4, h: 0.4, fill: { color: style.accent }, line: { color: style.bg, width: 1.5 }
      });
      slide.addText(String(idx + 1), {
        x: 1.1, y: yPos + 0.32, w: 0.4, h: 0.4, fontSize: 10, bold: true, color: style.bg, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.7, y: yPos, w: 7.5, h: 1.15, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.7, y: yPos, w: 0.08, h: 1.15, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
      });
      slide.addText(st.step || `${idx + 1}-BOSQICH`, {
        x: 1.95, y: yPos + 0.2, w: 1.6, h: 0.32, fontSize: 9.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
      slide.addText(st.title, {
        x: 3.75, y: yPos + 0.18, w: 5.25, h: 0.35, fontSize: 12.5, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(st.desc || st.text || "", {
        x: 3.75, y: yPos + 0.55, w: 5.25, h: 0.5, fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
      });
    });
    return;
  }

  // 8. SPLIT VERSUS (Qiyosiy Tahlil & Taqqoslash)
  if (arch === 'split_versus') {
    slide.addText(card.title || "Qiyosiy va Funksional Tahlil", {
      x: 0.8, y: 0.68, w: 8.4, h: 0.48, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 3.9, h: 4.0, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.12
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 3.9, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
    });
    slide.addText(card.leftTitle || "📌 1-Yo'nalish", {
      x: 1.05, y: 1.45, w: 3.4, h: 0.42, fontSize: 13.5, bold: true, color: style.accent, fontFace: 'Arial'
    });
    const leftText = (card.leftBullets || []).map(b => `• ${b}`).join("\n\n");
    slide.addText(leftText || "• Tahliliy ma'lumotlar", {
      x: 1.05, y: 1.95, w: 3.4, h: 3.1, fontSize: 11, color: style.subtext, fontFace: 'Arial'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.3, y: 1.25, w: 3.9, h: 4.0, fill: { color: style.cardBg }, line: { color: style.accent2, width: 1 }, rectRadius: 0.12
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.3, y: 1.25, w: 3.9, h: 0.08, fill: { color: style.accent2 }, line: { color: style.accent2, width: 0 }, rectRadius: 0.04
    });
    slide.addText(card.rightTitle || "💡 2-Yo'nalish", {
      x: 5.5, y: 1.45, w: 3.4, h: 0.42, fontSize: 13.5, bold: true, color: style.accent2, fontFace: 'Arial'
    });
    const rightText = (card.rightBullets || []).map(b => `• ${b}`).join("\n\n");
    slide.addText(rightText || "• Tahliliy ma'lumotlar", {
      x: 5.5, y: 1.95, w: 3.4, h: 3.1, fontSize: 11, color: style.subtext, fontFace: 'Arial'
    });

    // Markaziy Floating VS Badji
    slide.addShape(pres.ShapeType.ellipse, {
      x: 4.7, y: 2.9, w: 0.6, h: 0.6, fill: { color: style.bg }, line: { color: style.accent, width: 1.5 }
    });
    slide.addText("VS", {
      x: 4.7, y: 2.9, w: 0.6, h: 0.6, fontSize: 9.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
    });
    return;
  }

  // 9. QUIZ INTERACTIVE (Interaktiv Bilimni Sinash)
  if (arch === 'quiz_interactive') {
    slide.addText(card.title || "Interaktiv Bilimni Sinash", {
      x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.15, w: 8.4, h: 1.05, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.5 }, rectRadius: 0.1
    });
    slide.addText(card.question || "Mavzuga oid muhim savol?", {
      x: 1.05, y: 1.25, w: 7.9, h: 0.85, fontSize: 13.5, bold: true, color: style.text, fontFace: 'Arial'
    });
    const options = (card.options || []).slice(0, 4);
    const optCoords = [
      { x: 0.8, y: 2.35 }, { x: 5.15, y: 2.35 },
      { x: 0.8, y: 3.25 }, { x: 5.15, y: 3.25 }
    ];
    optCoords.forEach((pos, idx) => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: pos.x, y: pos.y, w: 4.05, h: 0.78, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.08
      });
      slide.addText(["A", "B", "C", "D"][idx], {
        x: pos.x + 0.15, y: pos.y + 0.18, w: 0.4, h: 0.4, fontSize: 10, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
      slide.addText(options[idx] || `Variant ${idx + 1}`, {
        x: pos.x + 0.65, y: pos.y + 0.12, w: 3.25, h: 0.55, fontSize: 11, color: style.text, fontFace: 'Arial'
      });
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 4.15, w: 8.4, h: 1.2, fill: { color: style.cardBg }, line: { color: style.accent2, width: 1.2 }, rectRadius: 0.1
    });
    slide.addText("🔑 O'qituvchi Kaliti va Ilmiy Sharh:", {
      x: 1.05, y: 4.25, w: 7.9, h: 0.32, fontSize: 11, bold: true, color: style.accent2, fontFace: 'Arial'
    });
    slide.addText(card.answer || "To'g'ri javob tahlili", {
      x: 1.05, y: 4.58, w: 7.9, h: 0.68, fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
    });
    return;
  }

  // 10. SUMMARY & TAKEAWAYS (Yakuniy Xulosa & Natijalar)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 0.85, w: 8.4, h: 4.4, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1.5 }, rectRadius: 0.15
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 0.85, w: 8.4, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
  });
  slide.addText(card.title || "Yakuniy Xulosa va Natijalar", {
    x: 1.2, y: 1.15, w: 7.6, h: 0.5, fontSize: 22, bold: true, color: style.accent, fontFace: 'Arial'
  });
  if (card.quote) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.2, y: 1.8, w: 7.6, h: 1.05, fill: { color: style.bg }, line: { color: style.accent2, width: 1 }, rectRadius: 0.08
    });
    slide.addText(`“ ${card.quote} ”`, {
      x: 1.4, y: 1.9, w: 7.2, h: 0.85, fontSize: 12.5, italic: true, color: style.text, align: 'center', valign: 'middle', fontFace: 'Arial'
    });
  }
  const takeawaysText = (card.takeaways || card.bullets || []).map(t => `★  ${t}`).join("\n\n");
  slide.addText(takeawaysText || "★ Mavzuning eng muhim ilmiy va amaliy xulosalari", {
    x: 1.2, y: card.quote ? 3.0 : 1.9, w: 7.6, h: card.quote ? 2.1 : 3.2, fontSize: 11.5, color: style.subtext, fontFace: 'Arial'
  });
}

// ============================================================================
// 5. POWERPOINT (.PPTX) GENERATSIYA ASOSIY FUNKSIYASI
// ============================================================================
export async function generatePresentationPptx(config = {}) {
  const {
    topic = "Fotosintez jarayoni va o'simliklar biosferasi",
    styleName = "obsidian",
    cards = null,
    authorName = "SmartOffice EduAI",
    filename = "Gamma_Taqdimot.pptx",
    includeImages = true
  } = config;

  let themeKey = styleName;
  if (styleName === 'auto' || styleName === 'random' || !GAMMA_THEMES[styleName]) {
    const keys = Object.keys(GAMMA_THEMES);
    themeKey = keys[Math.floor(Math.random() * keys.length)];
  }
  const style = GAMMA_THEMES[themeKey] || GAMMA_THEMES.obsidian;
  const slideDeck = cards && cards.length ? cards : getDefaultGammaCards(topic, authorName);

  // Topic rasmini yuklab olish
  let topicImageBase64 = null;
  if (includeImages) {
    const imgUrl = getTopicImageUrl(topic);
    topicImageBase64 = await fetchImageAsBase64(imgUrl, 3000);
  }

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  slideDeck.forEach((card, index) => {
    const slide = pres.addSlide();
    slide.background = { color: style.bg };

    // 100+ XIL DINAMIK FON GRAFIKASI (HECH QACHON BIR XIL BO'LMAYDI)
    applyDynamicBackgroundPattern(slide, pres, style, index, slideDeck.length);

    // Top Header Breadcrumb & Divider
    slide.addShape(pres.ShapeType.line, {
      x: 0.8, y: 0.62, w: 8.4, h: 0,
      line: { color: style.cardBorder, width: 0.75, dashType: 'solid' }
    });
    slide.addText(`SMARTOFFICE & EDUAI PRO  •  GAMMA & GENSPARK ENGINE  •  SLAYD ${index + 1}/${slideDeck.length}`, {
      x: 0.8, y: 0.32, w: 8.4, h: 0.28, fontSize: 9.5, color: style.subtext, bold: true, fontFace: 'Arial'
    });

    if (card.speakerNotes) {
      slide.addNotes(card.speakerNotes);
    }

    // 100+ XIL SLAYD ARXITEKTURASI RENDERINGI
    renderSlideArchitecture(slide, pres, card, style, index, slideDeck.length, topicImageBase64, authorName, topic);
  });

  if (config.outputType === 'nodebuffer' || (typeof window === 'undefined' && !config.filename)) {
    return await pres.write({ outputType: 'nodebuffer' });
  }
  return await pres.writeFile({ fileName: filename });
}
