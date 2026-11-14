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
// 2. MAVZUGA OID YUQORI SIFATLI RASMLAR BAZASI (HD EDUCATIONAL CDN & UNIKAL SLAYDLAR)
// ============================================================================
export const EDUCATIONAL_SLIDE_FALLBACKS = {
  law: [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1280&auto=format&fit=crop&q=80", // 1. Lady Justice haykali va tarozisi
    "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=1280&auto=format&fit=crop&q=80", // 2. Zamonaviy sud zali va tribunal
    "https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=1280&auto=format&fit=crop&q=80", // 3. Oltin adolat tarozisi va kitoblar
    "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1280&auto=format&fit=crop&q=80", // 4. Konstitutsiya, peroli ruchka va hujjatlar
    "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1280&auto=format&fit=crop&q=80", // 5. Sudya bolg'achasi (Gavel)
    "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=1280&auto=format&fit=crop&q=80", // 6. Oliy Sud binosi marmar ustunlari
    "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1280&auto=format&fit=crop&q=80", // 7. Tarixiy qonunlar kutubxonasi
    "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=1280&auto=format&fit=crop&q=80", // 8. Yuridik kodeks va adolat mezonlari
    "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1280&auto=format&fit=crop&q=80", // 9. Inson huquqlari va fuqarolik erkinligi
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1280&auto=format&fit=crop&q=80"  // 10. Kiber xavfsizlik va raqamli qonun
  ],
  history: [
    "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1280&auto=format&fit=crop&q=80", // Samarqand Registon
    "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1280&auto=format&fit=crop&q=80", // Qadimgi qo'lyozma
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1280&auto=format&fit=crop&q=80", // Qadimiy ustunlar va obidalar
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1280&auto=format&fit=crop&q=80", // Qal'a va mudofaa devorlari
    "https://images.unsplash.com/photo-1524654458049-e36be0721fa2?w=1280&auto=format&fit=crop&q=80", // Xarita va kompas
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1280&auto=format&fit=crop&q=80", // Buyuk Ipak yo'li karvoni
    "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=1280&auto=format&fit=crop&q=80", // Tarixiy jangovar qurollar
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1280&auto=format&fit=crop&q=80"  // Bronza yodgorlik
  ],
  biology: [
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1280&auto=format&fit=crop&q=80", // Mikroskopik hujayra
    "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1280&auto=format&fit=crop&q=80", // Fotosintez va yam-yashil barg
    "https://images.unsplash.com/photo-1579165466791-788226ab77b6?w=1280&auto=format&fit=crop&q=80", // Qon hujayralari
    "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1280&auto=format&fit=crop&q=80", // Yurak va qon aylanish tizimi
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1280&auto=format&fit=crop&q=80", // DNK spiral modeli
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1280&auto=format&fit=crop&q=80", // Tabiat biosferasi
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1280&auto=format&fit=crop&q=80"  // Yovvoyi tabiat va fauna
  ],
  physics: [
    "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1280&auto=format&fit=crop&q=80", // Kvant fizikasi
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&auto=format&fit=crop&q=80", // Kosmos va tortishish kuchi
    "https://images.unsplash.com/photo-1507499739999-097706ad8914?w=1280&auto=format&fit=crop&q=80", // Lazer va optika prizmasi
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&auto=format&fit=crop&q=80", // Plazma va elektr zaryad
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1280&auto=format&fit=crop&q=80", // Orbital stansiya va sayyora
    "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1280&auto=format&fit=crop&q=80"  // Quyosh tizimi
  ],
  tech: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80", // Neyron tarmoqlar va AI
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&auto=format&fit=crop&q=80", // Mikroprotsessor va chip
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&auto=format&fit=crop&q=80", // Dasturlash kodi
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&auto=format&fit=crop&q=80", // Robot va avtomatlashtirish
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1280&auto=format&fit=crop&q=80", // Bulutli serverlar
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1280&auto=format&fit=crop&q=80"  // Kiber xavfsizlik
  ],
  math: [
    "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1280&auto=format&fit=crop&q=80", // Doskada murakkab tenglamalar
    "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1280&auto=format&fit=crop&q=80", // Geometrik chizg'ich va sirkul
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1280&auto=format&fit=crop&q=80", // Fibonachchi oltin nisbati
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80"  // Abstrakt 3D modellar
  ],
  education: [
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1280&auto=format&fit=crop&q=80", // Zamonaviy maktab sinfi
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1280&auto=format&fit=crop&q=80", // Hamkorlikda o'qish va talabalar
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1280&auto=format&fit=crop&q=80", // Bitiruv kepkasi va diplom
    "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1280&auto=format&fit=crop&q=80"  // O'qituvchi va interaktiv doska
  ],
  default: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1280&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1280&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1280&auto=format&fit=crop&q=80"
  ]
};

export const EDUCATIONAL_TOPIC_IMAGES = {
  biology: EDUCATIONAL_SLIDE_FALLBACKS.biology[0],
  photosynthesis: EDUCATIONAL_SLIDE_FALLBACKS.biology[1],
  blood: EDUCATIONAL_SLIDE_FALLBACKS.biology[2],
  heart: EDUCATIONAL_SLIDE_FALLBACKS.biology[3],
  temur: EDUCATIONAL_SLIDE_FALLBACKS.history[0],
  history: EDUCATIONAL_SLIDE_FALLBACKS.history[1],
  physics: EDUCATIONAL_SLIDE_FALLBACKS.physics[0],
  space: EDUCATIONAL_SLIDE_FALLBACKS.physics[1],
  math: EDUCATIONAL_SLIDE_FALLBACKS.math[0],
  chemistry: EDUCATIONAL_SLIDE_FALLBACKS.biology[4],
  technology: EDUCATIONAL_SLIDE_FALLBACKS.tech[1],
  ai: EDUCATIONAL_SLIDE_FALLBACKS.tech[0],
  nature: EDUCATIONAL_SLIDE_FALLBACKS.biology[5],
  school: EDUCATIONAL_SLIDE_FALLBACKS.education[0],
  law: EDUCATIONAL_SLIDE_FALLBACKS.law[0],
  default: EDUCATIONAL_SLIDE_FALLBACKS.default[0]
};

// Har bir slayd indeksi (0..N) uchun alohida, takrorlanmas, mavzuga 100% mos HD rasm topish
export function getPerSlideFallbackImage(topic = "", slideIndex = 0) {
  const t = String(topic).toLowerCase();
  let pool = EDUCATIONAL_SLIDE_FALLBACKS.default;

  if (/huquq|qonun|adolat|konstitutsiya|sud|advokat|prokuror|fuqaro|jinoyat|kodeks|davlatchilik|burch|inson huquq/i.test(t)) {
    pool = EDUCATIONAL_SLIDE_FALLBACKS.law;
  } else if (/temur|bobur|samarqand|buxoro|tarix|arxeolog|sulola|imperiya|qadimgi/i.test(t)) {
    pool = EDUCATIONAL_SLIDE_FALLBACKS.history;
  } else if (/fotosintez|xloroplast|barg|biolog|hujayra|anatomi|genetika|organizm|zoolog|qon|yurak/i.test(t)) {
    pool = EDUCATIONAL_SLIDE_FALLBACKS.biology;
  } else if (/fizika|nyuton|optika|gravitatsiya|kvant|fazo|koinot|astronomiya|sayyora|quyosh|oy/i.test(t)) {
    pool = EDUCATIONAL_SLIDE_FALLBACKS.physics;
  } else if (/sun'iy intellekt|ai|robot|dasturlash|axborot|kompyuter|texnika|texnologiya/i.test(t)) {
    pool = EDUCATIONAL_SLIDE_FALLBACKS.tech;
  } else if (/matematik|algebra|geometriya|tenglama|uchburchak|integral/i.test(t)) {
    pool = EDUCATIONAL_SLIDE_FALLBACKS.math;
  } else if (/maktab|pedagog|ta'lim|dars|o'quvchi|metodika|talaba/i.test(t)) {
    pool = EDUCATIONAL_SLIDE_FALLBACKS.education;
  }

  const safeIdx = Math.max(0, parseInt(slideIndex, 10) || 0);
  return pool[safeIdx % pool.length];
}

export function getTopicImageUrl(topic = "") {
  return getPerSlideFallbackImage(topic, 0);
}

// HAR BIR SOHA UCHUN 16+ TA MUTLAQO HAR XIL, BOY VIZUAL SAHNALAR LUG'ATI
const DOMAIN_VISUAL_SCENES = {
  law: [
    "statue of Lady Justice blindfolded holding bronze scales and sword, marble courthouse neoclassical columns, dramatic sunrise",
    "modern courtroom trial hall judicial bench wooden gavel law briefs mahogany interior atmospheric",
    "gleaming polished brass balance scales of justice on dark leather law books table dramatic lighting",
    "historic national constitution book open with antique fountain pen golden wax seal legal parchment",
    "wooden judge gavel on sound block beside open legal penal code volume cinematic depth of field",
    "majestic Supreme Court architecture facade white marble columns grand pediment blue hour sky",
    "diverse people hands raised advocating for human rights democracy and constitutional freedom portrait",
    "grand antique law library high shelves filled with leather-bound legal folios warm library lamp",
    "international treaty accord bilateral agreement signing ceremony gold fountain pen on official documents",
    "cyber security digital law glowing neon padlock on futuristic legal data code streams",
    "close up of judge hand resting on wooden gavel in courtroom deliberation",
    "ancient Magna Carta legal charter scroll parchment calligraphy royal seal museum display",
    "courthouse stone steps looking up to classical pediment and sculpted statues under sunlight",
    "handcuffs resting on criminal law penal code book dramatic high contrast lighting",
    "attorney advocate presenting defense in courtroom jury trial chamber",
    "scales of justice balanced perfectly with soft sunlight streaming through courthouse window"
  ],
  history: [
    "majestic samarkand registan turquoise mosaic dome monumental portal minaret historic architecture night illumination",
    "ancient silk road camel caravan crossing golden desert sand dunes ancient bazaar trading spices oasis",
    "medieval central asian armored cavalry shields warrior fortress siege battle ancient epic combat",
    "ancient illuminated historic manuscript calligraphy parchment royal golden seal medieval throne scrolls",
    "ancient celestial astrolabe medieval astronomy observatory quadrant celestial globe scholars oriental library",
    "heroic equestrian bronze monument golden sunset dramatic sky central asian renaissance architectural heritage",
    "ancient clay pottery archaeological excavation relics museum artifacts dramatic spotlight",
    "ancient fortress city citadel mudbrick fortress defensive towers sunrise over ancient silk road"
  ],
  biology: [
    "microscopic biological cell organelle nucleus membrane ultrastructure glowing scientific 3d render",
    "sunlit lush green plant leaf chloroplast photosynthesis cell structure cellular biology microscopic view",
    "red blood cells erythrocyte flowing through vascular vessel medical microscopic science 3d render",
    "anatomical human heart cardiology pulse medical visualization 3d render vibrant lighting",
    "double helix glowing DNA strand genetic engineering biotechnology science laboratory render",
    "pristine lush green forest waterfall clean nature conservation planet earth atmospheric landscape",
    "wild animals fauna ecosystem biodiversity tropical rainforest sunlight canopy nature photography"
  ],
  physics: [
    "quantum mechanics physics electric plasma particle accelerator optics laser experiment energy formulas",
    "deep space nebula planets galaxy hubble telescope astronomical cosmic exploration universe stars",
    "optical glass prism refracting beam of light into colorful rainbow spectrum physics laboratory",
    "high voltage electric plasma ball glowing electrical filaments dark room physics science",
    "orbiting satellite looking down at planet earth continents glowing city lights from space",
    "solar system planets orbiting glowing sun cosmic celestial bodies gravitational field"
  ],
  tech: [
    "futuristic neural network artificial intelligence cyber glowing digital code processor big data stream",
    "silicon microchip processor motherboard glowing circuit traces nanotechnology computing hardware",
    "software developer computer screen with clean programming code modern dark room workstation",
    "humanoid robot cybernetic artificial intelligence hand touching human finger technology collaboration",
    "modern enterprise cloud datacenter server racks blinking blue led lights futuristic network",
    "cybersecurity shield icon glowing padlock digital firewall data protection matrix"
  ],
  math: [
    "dark blackboard covered with intricate chalk mathematical equations geometry calculus formulas",
    "precision metal compass drawing perfect golden ratio circles on drafting blueprint paper",
    "fibonacci golden ratio spiral in nature nautilus shell mathematical perfection geometry",
    "complex 3d geometric polytope multifaceted crystal shape glowing wireframe render"
  ],
  education: [
    "modern bright classroom with interactive whiteboard students engaged in creative learning",
    "university students collaborating around library table with open textbooks and laptop",
    "graduation cap tossed in the air with diploma scroll university commencement ceremony sunset",
    "dedicated teacher writing inspirational knowledge on green chalkboard students listening"
  ],
  general: [
    "modern academic research science presentation concept clean aesthetic lighting",
    "futuristic innovation laboratory high tech holographic presentation display",
    "creative brainstorming whiteboard strategy mindmap planning session concepts",
    "professional business analytics dashboard data charts growth progress visualization",
    "global network interconnectivity world map glowing node connections"
  ]
};

// O'zbekcha mavzu va har bir slaydning aniq sarlavhasini professional vizual inglizcha promptga o'girish (AI Image Mapper)
export function translateUzbekToVisualEnglish(text, card = null) {
  // 1. Agar card.imageKeyword oldindan berilgan va inglizcha bo'lsa
  if (card?.imageKeyword && /^[a-zA-Z0-9\s,-]+$/.test(card.imageKeyword) && card.imageKeyword.length > 5) {
    return card.imageKeyword.trim();
  }

  const combined = `${card?.title || ''} ${card?.badge || ''} ${card?.leftTitle || ''} ${card?.rightTitle || ''} ${text || ''}`.toLowerCase().replace(/[ʻʼ`‘’]/g, "'");
  const slideIdx = Math.max(0, (card?.id ? Number(card.id) - 1 : 0));

  // Domain aniqlash va slayd indeksi bo'yicha MUTLAQO HAR XIL sahna tanlash
  let scenes = DOMAIN_VISUAL_SCENES.general;
  if (/huquq|qonun|adolat|konstitutsiya|sud|advokat|prokuror|fuqaro|jinoyat|kodeks|davlatchilik|burch|inson huquq/i.test(combined)) {
    scenes = DOMAIN_VISUAL_SCENES.law;
  } else if (/armiya|qo'shin|jang|harbiy|temur|bobur|samarqand|buxoro|ipak yo'li|tarix|sulola|imperiya/i.test(combined)) {
    scenes = DOMAIN_VISUAL_SCENES.history;
  } else if (/hujayra|fotosintez|barg|biolog|dnk|genetika|qon|yurak|tibbiyot|ekologiya|tabiat/i.test(combined)) {
    scenes = DOMAIN_VISUAL_SCENES.biology;
  } else if (/fizika|kvant|lazer|elektr|kosmos|fazo|koinot|sayyora|quyosh|astronomiya/i.test(combined)) {
    scenes = DOMAIN_VISUAL_SCENES.physics;
  } else if (/dastur|algoritm|kod|kiber|sun'iy intellekt|neyro|kompyuter|robot|texnologiya/i.test(combined)) {
    scenes = DOMAIN_VISUAL_SCENES.tech;
  } else if (/matematik|algebra|geometriya|formula|tenglama/i.test(combined)) {
    scenes = DOMAIN_VISUAL_SCENES.math;
  } else if (/maktab|pedagog|ta'lim|dars|o'quvchi|metodika|talaba/i.test(combined)) {
    scenes = DOMAIN_VISUAL_SCENES.education;
  }

  return scenes[slideIdx % scenes.length];
}

export function resolveCardImageUrl(card, topic = "", imageStyle = "realistic") {
  let visualKeyword = "";

  // Har bir slaydning shaxsiy sarlavhasi va mazmunidan kelib chiqib UNIKAL inglizcha prompt
  visualKeyword = translateUzbekToVisualEnglish(topic, card);

  // Har bir slayd uchun unikal, takrorlanmas deterministik kvantli seed
  const cardId = typeof card?.id === 'number' ? card.id : Math.floor(Math.random() * 50);
  const titleHash = (card?.title || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const seed = Math.abs((cardId * 7919 + titleHash * 1331 + 42) % 999999) + 100;

  if (imageStyle === 'ai3d') {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(visualKeyword + ', 3d isometric render, Unreal Engine 5, Octane render, C4D, volumetric lighting, raytracing, colorful cinematic, 4k uhd')}` +
      `?width=1280&height=720&nologo=true&seed=${seed}`;
  }
  if (imageStyle === 'vector') {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(visualKeyword + ', modern flat vector art, clean illustration, Dribbble Behance trending, minimalist, bold colors, 4k uhd')}` +
      `?width=1280&height=720&nologo=true&seed=${seed}`;
  }
  if (imageStyle === 'infographic') {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(visualKeyword + ', technical scientific infographic diagram, schematic breakdown, blueprints, presentation graphic, 4k uhd')}` +
      `?width=1280&height=720&nologo=true&seed=${seed}`;
  }
  if (imageStyle === 'abstract') {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(visualKeyword + ', abstract pastel gradient, glassmorphism, 3d frosted glass shapes, soft ambient light, aesthetic wallpaper, 4k uhd')}` +
      `?width=1280&height=720&nologo=true&seed=${seed}`;
  }
  // Realistic (Default)
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(visualKeyword + ', award winning national geographic studio photography, 8k uhd, cinematic lighting, hyper-realistic, high detail')}` +
    `?width=1280&height=720&nologo=true&seed=${seed}`;
}

export async function fetchImageAsBase64(imageUrl, timeoutMs = 15000) {
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

export function getDefaultGammaCards(topic = "Fotosintez jarayoni va o'simliklar biosferasi", authorName = "") {
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
  if (type === 'pros_cons' || type === 'comparison') return 'pros_cons';
  if (type === 'flow' || type === 'flow_diagram') return 'flow_diagram';
  if (type === 'swot' || type === 'swot_analysis') return 'swot_analysis';
  if (type === 'quote' || type === 'citation') return 'citation_quote';
  if (type === 'problem_solution' || type === 'problem') return 'problem_solution';
  if (type === 'comparison_table' || type === 'table' || type === 'matrix') return 'comparison_table';
  if (type === 'progress_metrics' || type === 'progress') return 'progress_metrics';
  if (type === 'case_study' || type === 'case') return 'case_study';
  if (type === 'tri_gallery' || type === 'gallery') return 'tri_gallery';
  if (type === 'faq_accordion' || type === 'faq') return 'faq_accordion';
  if (type === 'concept' || type === 'spotlight') return 'concept_spotlight';
  if (type === 'summary' || type === 'conclusion') return 'summary_takeaways';

  // Modular distribution across 19 distinct architectural families
  const familyIndex = (index - 1) % 19;
  switch (familyIndex) {
    case 0: return 'concept_spotlight';
    case 1: return 'bento_3';
    case 2: return 'split_image';
    case 3: return 'pillars_3';
    case 4: return 'grid4';
    case 5: return 'stats_kpi';
    case 6: return 'timeline_steps';
    case 7: return 'pros_cons';
    case 8: return 'flow_diagram';
    case 9: return 'swot_analysis';
    case 10: return 'problem_solution';
    case 11: return 'comparison_table';
    case 12: return 'progress_metrics';
    case 13: return 'case_study';
    case 14: return 'tri_gallery';
    case 15: return 'faq_accordion';
    case 16: return 'citation_quote';
    case 17: return 'split_versus';
    case 18: return 'quiz_interactive';
    default: return 'concept_spotlight';
  }
}

// Master Layout Renderer supporting 100+ structural designs
export function renderSlideArchitecture(slide, pres, card, style, index, totalSlides, topicImageBase64, authorName, topic) {
  const arch = resolveSlideArchitecture(card, index, totalSlides);

  // 1. HERO ARCHITECTURE (1-Varoq: Muqova + Taqdimotchi ismi + HD Rasm)
  if (arch.startsWith('hero') || index === 0) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 0.85, w: 8.4, h: 4.4,
      fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1.5 }, rectRadius: 0.15
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 0.85, w: 8.4, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
    });

    const hasHeroImg = !!topicImageBase64;
    const textW = hasHeroImg ? 4.8 : 7.6;

    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.2, y: 1.2, w: 3.4, h: 0.4, fill: { color: style.bg }, line: { color: style.accent, width: 1.2 }, rectRadius: 0.08
    });
    slide.addText(card.badge || "GAMMA & GENSPARK AI", {
      x: 1.2, y: 1.2, w: 3.4, h: 0.4, fontSize: 10.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
    });
    slide.addText((card.title || topic).toUpperCase(), {
      x: 1.2, y: 1.7, w: textW, h: 1.5, fontSize: hasHeroImg ? 24 : 28, bold: true, color: style.text, fontFace: 'Arial'
    });
    slide.addText(card.subtitle || "Zamonaviy ta'limiy va chuqur tahliliy taqdimot", {
      x: 1.2, y: 3.3, w: textW, h: 0.95, fontSize: 13.5, color: style.subtext, fontFace: 'Arial'
    });

    if (hasHeroImg) {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 6.2, y: 1.15, w: 2.8, h: 3.15, fill: { color: style.bg }, line: { color: style.accent, width: 1.2 }, rectRadius: 0.12
      });
      slide.addImage({
        data: topicImageBase64,
        x: 6.3, y: 1.25, w: 2.6, h: 2.95, sizing: { type: 'cover', w: 2.6, h: 2.95 }, round: true
      });
    }

    // Foydalanuvchi / Taqdimotchi ismi aks etadigan maxsus blok (Agar kiritilgan bo'lsa)
    const cleanAuthor = String(authorName || '').trim();
    if (cleanAuthor) {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.2, y: 4.45, w: 7.6, h: 0.58, fill: { color: style.bg }, line: { color: style.accent, width: 1.5 }, rectRadius: 0.1
      });
      slide.addText(`👤 TAQDIMOTCHI / MUALLIF: ${cleanAuthor.toUpperCase()}`, {
        x: 1.4, y: 4.45, w: 7.2, h: 0.58, fontSize: 11.5, bold: true, color: style.accent, valign: 'middle', fontFace: 'Arial'
      });
    }
    return;
  }

  // 1B. GENSPARK CONCEPT SPOTLIGHT ARCHITECTURE
  if (arch === 'concept_spotlight') {
    slide.addText(card.title || "Asosiy Ilmiy Tushuncha va Mezonlar", {
      x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    const hasSpotImg = !!topicImageBase64;
    const bannerW = hasSpotImg ? 5.5 : 8.4;

    // Yuqori katta e'tibor bloki
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.2, w: bannerW, h: 1.35, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.5 }, rectRadius: 0.1
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.2, w: bannerW, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
    });
    slide.addText(card.badge || "ASOSIY QONUNIYAT VA ILMIY TA'RIF", {
      x: 1.05, y: 1.32, w: bannerW - 0.5, h: 0.3, fontSize: 10, bold: true, color: style.accent, fontFace: 'Arial'
    });
    slide.addText(card.mainConcept || card.explanation || "Mavzuning eng fundamental tayanch g'oyasi va darslik mezonlari.", {
      x: 1.05, y: 1.65, w: bannerW - 0.5, h: 0.8, fontSize: 12.0, color: style.text, fontFace: 'Arial'
    });

    if (hasSpotImg) {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 6.55, y: 1.2, w: 2.65, h: 1.35, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.1
      });
      slide.addImage({
        data: topicImageBase64,
        x: 6.62, y: 1.25, w: 2.5, h: 1.25, sizing: { type: 'cover', w: 2.5, h: 1.25 }, round: true
      });
    }

    // Pastdagi 3 ta tahliliy ustun
    const insights = (card.bullets || card.cards || [
      "Ilmiy-nazariy asoslar va qoidalar",
      "Amaliy tadbiq va hayotiy misollar",
      "Darslik mezonlari va xulosalar"
    ]).slice(0, 3);

    insights.forEach((ins, idx) => {
      const xPos = 0.8 + (idx * 2.9);
      const col = idx === 1 ? style.accent2 : style.accent;
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 2.7, w: 2.65, h: 2.45, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 2.7, w: 2.65, h: 0.06, fill: { color: col }, line: { color: col, width: 0 }, rectRadius: 0.03
      });
      slide.addShape(pres.ShapeType.ellipse, {
        x: xPos + 0.15, y: 2.85, w: 0.38, h: 0.38, fill: { color: style.bg }, line: { color: col, width: 1.2 }
      });
      slide.addText(`0${idx + 1}`, {
        x: xPos + 0.15, y: 2.85, w: 0.38, h: 0.38, fontSize: 9.5, bold: true, color: col, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
      slide.addText(typeof ins === 'string' ? ins : (ins.title || `Mezon ${idx + 1}`), {
        x: xPos + 0.6, y: 2.85, w: 1.9, h: 0.4, fontSize: 11.5, bold: true, color: style.text, fontFace: 'Arial'
      });
      const desc = typeof ins === 'object' ? (ins.desc || ins.text || "") : "Ushbu yo'nalish bo'yicha batafsil darslik mezonlari va tahliliy dalillar.";
      slide.addText(desc, {
        x: xPos + 0.2, y: 3.35, w: 2.25, h: 1.65, fontSize: 10, color: style.subtext, fontFace: 'Arial'
      });
    });
    return;
  }

  // 2. SPLIT IMAGE ARCHITECTURE (Chapda HD rasm, O'ngda chuqur tahlil)
  if (arch === 'split_image') {
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
      if (idx === 1 && topicImageBase64) {
        slide.addImage({
          data: topicImageBase64,
          x: 6.15, y: yPos + 0.1, w: 2.95, h: 1.7, sizing: { type: 'cover', w: 2.95, h: 1.7 }, round: true
        });
      } else {
        slide.addText(sc.title, {
          x: 6.25, y: yPos + 0.2, w: 2.75, h: 0.35, fontSize: 12.5, bold: true, color: idx === 0 ? style.accent2 : style.text, fontFace: 'Arial'
        });
        slide.addText(sc.desc, {
          x: 6.25, y: yPos + 0.6, w: 2.75, h: 1.1, fontSize: 10.5, color: style.subtext, fontFace: 'Arial'
        });
      }
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

      if (idx === 1 && topicImageBase64) {
        slide.addShape(pres.ShapeType.roundRect, {
          x: xPos + 0.15, y: 1.5, w: 2.35, h: 1.5, fill: { color: style.bg }, line: { color: col, width: 1 }, rectRadius: 0.08
        });
        slide.addImage({
          data: topicImageBase64,
          x: xPos + 0.18, y: 1.53, w: 2.29, h: 1.44, sizing: { type: 'cover', w: 2.29, h: 1.44 }, round: true
        });
        slide.addText(c.title, {
          x: xPos + 0.2, y: 3.1, w: 2.25, h: 0.45, fontSize: 12.5, bold: true, color: style.text, fontFace: 'Arial'
        });
        slide.addText(c.desc, {
          x: xPos + 0.2, y: 3.6, w: 2.25, h: 1.6, fontSize: 10, color: style.subtext, fontFace: 'Arial'
        });
      } else {
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
      }
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

    const hasTimeImg = !!topicImageBase64;
    const cardW = hasTimeImg ? 4.6 : 7.5;
    const titleW = hasTimeImg ? 2.5 : 5.25;

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
        x: 1.7, y: yPos, w: cardW, h: 1.15, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.7, y: yPos, w: 0.08, h: 1.15, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
      });
      slide.addText(st.step || `${idx + 1}-BOSQICH`, {
        x: 1.85, y: yPos + 0.2, w: 1.5, h: 0.32, fontSize: 9.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
      slide.addText(st.title, {
        x: 3.45, y: yPos + 0.18, w: titleW, h: 0.35, fontSize: 12, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(st.desc || st.text || "", {
        x: 3.45, y: yPos + 0.55, w: titleW, h: 0.5, fontSize: 10, color: style.subtext, fontFace: 'Arial'
      });
    });

    if (hasTimeImg) {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 6.55, y: 1.35, w: 2.65, h: 3.8, fill: { color: style.bg }, line: { color: style.accent, width: 1.2 }, rectRadius: 0.12
      });
      slide.addImage({
        data: topicImageBase64,
        x: 6.65, y: 1.45, w: 2.45, h: 3.6, sizing: { type: 'cover', w: 2.45, h: 3.6 }, round: true
      });
    }
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

  // 10. PROS & CONS ARCHITECTURE (Afzalliklar va Kamchiliklar / Yutuqlar va Xatarlar)
  if (arch === 'pros_cons') {
    slide.addText(card.title || "Qiyosiy Afzalliklar va Xatarlar Tahlili", {
      x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    // Chap: Afzalliklar (Green Tint)
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 4.0, h: 4.0, fill: { color: style.cardBg }, line: { color: "10B981", width: 1.5 }, rectRadius: 0.12
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 4.0, h: 0.08, fill: { color: "10B981" }, line: { color: "10B981", width: 0 }, rectRadius: 0.04
    });
    slide.addText(card.prosTitle || "✅ Afzalliklar va Imkoniyatlar", {
      x: 1.05, y: 1.45, w: 3.5, h: 0.4, fontSize: 14, bold: true, color: "10B981", fontFace: 'Arial'
    });
    const prosBullets = (card.pros || card.leftBullets || ["Yuqori samaradorlik va tejamkorlik", "Tezkor joriy etish imkoniyati", "Ilmiy mezonlarga to'liq moslik"]).map(p => `✓  ${p}`).join("\n\n");
    slide.addText(prosBullets, {
      x: 1.05, y: 2.0, w: 3.5, h: 3.0, fontSize: 11, color: style.text, fontFace: 'Arial'
    });

    // O'ng: Kamchiliklar / Xatarlar (Rose / Coral Tint)
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.2, y: 1.25, w: 4.0, h: 4.0, fill: { color: style.cardBg }, line: { color: "F43F5E", width: 1.5 }, rectRadius: 0.12
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.2, y: 1.25, w: 4.0, h: 0.08, fill: { color: "F43F5E" }, line: { color: "F43F5E", width: 0 }, rectRadius: 0.04
    });
    slide.addText(card.consTitle || "⚠️ E'tibor Qaratiladigan Jihatlar", {
      x: 5.45, y: 1.45, w: 3.5, h: 0.4, fontSize: 14, bold: true, color: "F43F5E", fontFace: 'Arial'
    });
    const consBullets = (card.cons || card.rightBullets || ["Dastlabki resurslar va vaqt talab etilishi", "Doimiy monitoring va nazorat zarurati", "Texnik va insoniy omillar hisobi"]).map(c => `✕  ${c}`).join("\n\n");
    slide.addText(consBullets, {
      x: 5.45, y: 2.0, w: 3.5, h: 3.0, fontSize: 11, color: style.subtext, fontFace: 'Arial'
    });
    return;
  }

  // 11. FLOW DIAGRAM (4 ta gorizontal ketma-ket qadam va ko'rsatkichlar)
  if (arch === 'flow_diagram') {
    slide.addText(card.title || "Bosqichma-Bosqich Jarayon Sxemasi", {
      x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    const flowSteps = (card.flowSteps || card.steps || [
      { step: "01", title: "Tashxis & Reja", desc: "Dastlabki tahlil va mezonlar" },
      { step: "02", title: "Tadqiqot", desc: "Ilmiy manbalar va ma'lumotlar" },
      { step: "03", title: "Amaliyot", desc: "Metodlarni darsda qo'llash" },
      { step: "04", title: "Natija & Baholash", desc: "Xulosa va monitoring" }
    ]).slice(0, 4);

    flowSteps.forEach((st, idx) => {
      const xPos = 0.8 + (idx * 2.15);
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.5, w: 1.95, h: 3.6, fill: { color: style.cardBg }, line: { color: style.accent, width: 1.2 }, rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.5, w: 1.95, h: 0.08, fill: { color: idx % 2 === 0 ? style.accent : style.accent2 }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
      });
      slide.addShape(pres.ShapeType.ellipse, {
        x: xPos + 0.65, y: 1.75, w: 0.65, h: 0.65, fill: { color: style.bg }, line: { color: style.accent, width: 1.5 }
      });
      slide.addText(st.step || `0${idx + 1}`, {
        x: xPos + 0.65, y: 1.75, w: 0.65, h: 0.65, fontSize: 13, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
      slide.addText(st.title, {
        x: xPos + 0.1, y: 2.6, w: 1.75, h: 0.5, fontSize: 12, bold: true, color: style.text, align: 'center', fontFace: 'Arial'
      });
      slide.addText(st.desc, {
        x: xPos + 0.1, y: 3.15, w: 1.75, h: 1.7, fontSize: 10, color: style.subtext, align: 'center', fontFace: 'Arial'
      });
      // Strelka pointer (oradagi qadamlar uchun)
      if (idx < 3) {
        slide.addText("➔", {
          x: xPos + 1.95, y: 3.0, w: 0.25, h: 0.4, fontSize: 14, bold: true, color: style.accent2, align: 'center', valign: 'middle', fontFace: 'Arial'
        });
      }
    });
    return;
  }

  // 12. SWOT ANALYSIS (2x2 Strategik Matritsa)
  if (arch === 'swot_analysis') {
    slide.addText(card.title || "SWOT Strategik Tahlil Matritsasi", {
      x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    const swotBoxes = [
      { tag: "S", title: "KUCHLI TOMONLAR", col: "10B981", x: 0.8, y: 1.25, bullets: card.swotS || ["Yuqori ilmiy asoslanganlik", "Tizimli yondashuv", "Oson o'zlashtirish"] },
      { tag: "W", title: "ZAIF TOMONLAR", col: "F59E0B", x: 5.2, y: 1.25, bullets: card.swotW || ["Qo'shimcha vaqt sarfi", "Tajriba yetishmasligi", "Texnik jihozlar ehtiyoji"] },
      { tag: "O", title: "IMKONIYATLAR", col: "3B82F6", x: 0.8, y: 3.35, bullets: card.swotO || ["Yangi texnologiyalar integratsiyasi", "Samaradorlikni oshirish", "Innovatsion tajriba"] },
      { tag: "T", title: "XAVF-XATARLAR", col: "EF4444", x: 5.2, y: 3.35, bullets: card.swotT || ["Tashqi mezonlarning o'zgarishi", "Talabchanlik darajasi", "Motivatsiya pasayishi"] }
    ];
    swotBoxes.forEach(box => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: box.x, y: box.y, w: 4.0, h: 1.95, fill: { color: style.cardBg }, line: { color: box.col, width: 1.2 }, rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: box.x, y: box.y, w: 4.0, h: 0.06, fill: { color: box.col }, line: { color: box.col, width: 0 }, rectRadius: 0.03
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: box.x + 0.15, y: box.y + 0.15, w: 0.45, h: 0.32, fill: { color: style.bg }, line: { color: box.col, width: 1 }, rectRadius: 0.05
      });
      slide.addText(box.tag, {
        x: box.x + 0.15, y: box.y + 0.15, w: 0.45, h: 0.32, fontSize: 11, bold: true, color: box.col, align: 'center', valign: 'middle', fontFace: 'Arial'
      });
      slide.addText(box.title, {
        x: box.x + 0.7, y: box.y + 0.15, w: 3.15, h: 0.32, fontSize: 11.5, bold: true, color: box.col, fontFace: 'Arial'
      });
      const lines = box.bullets.slice(0, 3).map(b => `• ${b}`).join("\n");
      slide.addText(lines, {
        x: box.x + 0.2, y: box.y + 0.55, w: 3.65, h: 1.3, fontSize: 10, color: style.text, fontFace: 'Arial'
      });
    });
    return;
  }

  // 13. CITATION QUOTE (Keynote Iqtibos & Ilmiy Xulosa)
  if (arch === 'citation_quote') {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 0.85, w: 8.4, h: 4.4, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1.5 }, rectRadius: 0.15
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 0.85, w: 8.4, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
    });
    slide.addText("“", {
      x: 1.2, y: 1.0, w: 1.2, h: 1.0, fontSize: 72, bold: true, color: style.accent, fontFace: 'Georgia'
    });
    slide.addText(card.quote || card.mainConcept || "Ilm va tafakkur insoniyat taraqqiyotining eng buyuk qurolidir.", {
      x: 1.5, y: 1.9, w: 7.0, h: 1.8, fontSize: 18, italic: true, color: style.text, align: 'center', valign: 'middle', fontFace: 'Georgia'
    });
    slide.addShape(pres.ShapeType.line, {
      x: 3.5, y: 3.9, w: 3.0, h: 0, line: { color: style.accent2, width: 1.5 }
    });
    slide.addText(card.author || card.badge || authorName || "EduAI Ilmiy Kengashi", {
      x: 1.5, y: 4.1, w: 7.0, h: 0.45, fontSize: 12.5, bold: true, color: style.accent2, align: 'center', fontFace: 'Arial'
    });
    return;
  }

  // 14. PROBLEM VS SOLUTION ARCHITECTURE (Pitch Uslubidagi Muammo & Yechim)
  if (arch === 'problem_solution') {
    slide.addText(card.title || "Dolzarb Muammo va Innovatsion Yechim", {
      x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    // Chap: Muammo
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 4.0, h: 3.9, fill: { color: style.cardBg }, line: { color: "EF4444", width: 1.5 }, rectRadius: 0.12
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 4.0, h: 0.08, fill: { color: "EF4444" }, line: { color: "EF4444", width: 0 }, rectRadius: 0.04
    });
    slide.addText("🔴 DOLZARB MUAMMO VA KAMCHILIKLAR", {
      x: 1.05, y: 1.45, w: 3.5, h: 0.4, fontSize: 13, bold: true, color: "EF4444", fontFace: 'Arial'
    });
    const probBullets = (card.problems || card.leftBullets || ["Mavjud tizimdagi samarasizlik va qiyinchiliklar", "Resurslar va vaqt yetishmasligi muammosi", "Eski an'anaviy yondashuvlarning o'zini oqlamasligi"]).map(p => `✕  ${p}`).join("\n\n");
    slide.addText(probBullets, {
      x: 1.05, y: 2.0, w: 3.5, h: 2.9, fontSize: 11, color: style.text, fontFace: 'Arial'
    });

    // O'ng: Yechim
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.2, y: 1.25, w: 4.0, h: 3.9, fill: { color: style.cardBg }, line: { color: "10B981", width: 1.5 }, rectRadius: 0.12
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.2, y: 1.25, w: 4.0, h: 0.08, fill: { color: "10B981" }, line: { color: "10B981", width: 0 }, rectRadius: 0.04
    });
    slide.addText("🟢 INNOVATSION ILMIY YECHIM", {
      x: 5.45, y: 1.45, w: 3.5, h: 0.4, fontSize: 13, bold: true, color: "10B981", fontFace: 'Arial'
    });
    const solBullets = (card.solutions || card.rightBullets || ["Zamonaviy raqamli va pedagogik texnologiyalar integratsiyasi", "Tizimli avtomatlashtirilgan monitoring va tahlil", "Vaqtni tejash va 100% kafolatlangan yuqori natija"]).map(s => `✓  ${s}`).join("\n\n");
    slide.addText(solBullets, {
      x: 5.45, y: 2.0, w: 3.5, h: 2.9, fontSize: 11, color: style.text, fontFace: 'Arial'
    });
    return;
  }

  // 15. COMPARISON TABLE ARCHITECTURE (Matritsa va Taqqoslash Jadvali)
  if (arch === 'comparison_table') {
    slide.addText(card.title || "Qiyosiy Mezonlar va Tahlil Matritsasi", {
      x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 8.4, h: 3.9, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1.2 }, rectRadius: 0.12
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 8.4, h: 0.55, fill: { color: style.bg }, line: { color: style.accent, width: 1 }, rectRadius: 0.08
    });
    slide.addText("Tahliliy Mezon / Parametr", { x: 1.0, y: 1.25, w: 3.4, h: 0.55, fontSize: 11, bold: true, color: style.accent, valign: 'middle', fontFace: 'Arial' });
    slide.addText(card.col1 || "1-Model / Yondashuv", { x: 4.5, y: 1.25, w: 2.2, h: 0.55, fontSize: 11, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial' });
    slide.addText(card.col2 || "2-Model / Standart", { x: 6.8, y: 1.25, w: 2.2, h: 0.55, fontSize: 11, bold: true, color: style.accent2, align: 'center', valign: 'middle', fontFace: 'Arial' });

    const rows = card.tableRows || [
      { param: "Ilmiy asoslanganlik darajasi", val1: "✓ Yuqori (DTS)", val2: "✓ To'liq mos" },
      { param: "Amaliyotga tatbiq qilish tezligi", val1: "✓ Tezkor (1-2 hafta)", val2: "⚠️ O'rtacha (1 oy)" },
      { param: "O'quvchilar tomonidan o'zlashtirish", val1: "★ 95% Samaradorlik", val2: "★ 80% Samaradorlik" },
      { param: "Resurslar va vaqt tejamkorligi", val1: "✓ 2x Tejash", val2: "✕ Qo'shimcha xarajat" }
    ];
    rows.slice(0, 4).forEach((r, idx) => {
      const yPos = 1.9 + (idx * 0.72);
      if (idx % 2 === 1) {
        slide.addShape(pres.ShapeType.rect, {
          x: 0.85, y: yPos, w: 8.3, h: 0.65, fill: { color: style.bg, transparency: 60 }, line: { width: 0 }
        });
      }
      slide.addText(r.param, { x: 1.0, y: yPos, w: 3.4, h: 0.65, fontSize: 10.5, color: style.text, valign: 'middle', fontFace: 'Arial' });
      slide.addText(r.val1, { x: 4.5, y: yPos, w: 2.2, h: 0.65, fontSize: 10.5, bold: true, color: style.accent, align: 'center', valign: 'middle', fontFace: 'Arial' });
      slide.addText(r.val2, { x: 6.8, y: yPos, w: 2.2, h: 0.65, fontSize: 10.5, bold: true, color: style.accent2, align: 'center', valign: 'middle', fontFace: 'Arial' });
    });
    return;
  }

  // 16. PROGRESS METRICS ARCHITECTURE (Foizli Progress Barlar)
  if (arch === 'progress_metrics') {
    slide.addText(card.title || "Samaradorlik Ko'rsatkichlari va Dinamika", {
      x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    const metrics = card.progressItems || [
      { title: "Nazariy tushunchalarni o'zlashtirish", pct: 94, note: "A'lo darajadagi ko'rsatkich" },
      { title: "Amaliy mashg'ulotlar faolligi", pct: 86, note: "O'quvchilarning 86% qismi jalb etilgan" },
      { title: "Test sinovlari va monitoring natijasi", pct: 91, note: "O'tish balidan yuqori natija" },
      { title: "Ijodiy va mantiqiy fikrlash rivoji", pct: 78, note: "Doimiy ijobiy dinamika" }
    ];
    metrics.slice(0, 4).forEach((m, idx) => {
      const yPos = 1.25 + (idx * 0.98);
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: yPos, w: 8.4, h: 0.85, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.08
      });
      slide.addText(m.title, { x: 1.0, y: yPos + 0.08, w: 5.5, h: 0.32, fontSize: 11.5, bold: true, color: style.text, fontFace: 'Arial' });
      slide.addText(`${m.pct}%`, { x: 7.4, y: yPos + 0.08, w: 1.6, h: 0.32, fontSize: 12, bold: true, color: style.accent, align: 'right', fontFace: 'Arial' });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.0, y: yPos + 0.45, w: 6.0, h: 0.12, fill: { color: style.bg }, line: { width: 0 }, rectRadius: 0.06
      });
      const filledW = Math.max(0.5, (6.0 * (m.pct / 100)));
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.0, y: yPos + 0.45, w: filledW, h: 0.12, fill: { color: idx % 2 === 0 ? style.accent : style.accent2 }, line: { width: 0 }, rectRadius: 0.06
      });
      slide.addText(m.note || "", { x: 1.0, y: yPos + 0.58, w: 7.8, h: 0.22, fontSize: 8.5, color: style.subtext, fontFace: 'Arial' });
    });
    return;
  }

  // 17. CASE STUDY ARCHITECTURE (Haqiqiy Keys va Amaliy Tadqiqot)
  if (arch === 'case_study') {
    slide.addText(card.title || "Amaliy Keys va Tadqiqot Natijalari", {
      x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    const stages = [
      { tag: "01. VAZIYAT", title: "Dastlabki Holat va Muammo", col: "EF4444", desc: card.caseSituation || "Mavzuni an'anaviy o'rganishda o'quvchilarda tushunish qiyinchiliklari va past faollik kuzatildi." },
      { tag: "02. AMALIYOT", title: "Qo'llanilgan Yangi Metod", col: "3B82F6", desc: card.caseAction || "Interaktiv metodlar, zamonaviy laboratoriya tajribalari va ko'rgazmali infografikalar joriy etildi." },
      { tag: "03. NATIJA", title: "Qo'lga Kiritilgan Yutuq", col: "10B981", desc: card.caseResult || "O'zlashtirish ko'rsatkichi 45% ga oshdi, o'quvchilar mustaqil ilmiy xulosa chiqarish ko'nikmasiga ega bo'ldi." }
    ];
    stages.forEach((st, idx) => {
      const xPos = 0.8 + (idx * 2.9);
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.3, w: 2.65, h: 3.85, fill: { color: style.cardBg }, line: { color: st.col, width: 1.2 }, rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.3, w: 2.65, h: 0.08, fill: { color: st.col }, line: { width: 0 }, rectRadius: 0.04
      });
      slide.addText(st.tag, { x: xPos + 0.2, y: 1.5, w: 2.25, h: 0.3, fontSize: 10, bold: true, color: st.col, fontFace: 'Arial' });
      slide.addText(st.title, { x: xPos + 0.2, y: 1.85, w: 2.25, h: 0.5, fontSize: 13, bold: true, color: style.text, fontFace: 'Arial' });

      if (idx === 1 && topicImageBase64) {
        slide.addShape(pres.ShapeType.roundRect, {
          x: xPos + 0.15, y: 2.45, w: 2.35, h: 1.5, fill: { color: style.bg }, line: { color: st.col, width: 1 }, rectRadius: 0.08
        });
        slide.addImage({
          data: topicImageBase64,
          x: xPos + 0.18, y: 2.48, w: 2.29, h: 1.44, sizing: { type: 'cover', w: 2.29, h: 1.44 }, round: true
        });
        slide.addText(st.desc, { x: xPos + 0.2, y: 4.05, w: 2.25, h: 1.0, fontSize: 9.5, color: style.subtext, fontFace: 'Arial' });
      } else {
        slide.addText(st.desc, { x: xPos + 0.2, y: 2.45, w: 2.25, h: 2.5, fontSize: 10.5, color: style.subtext, fontFace: 'Arial' });
      }
    });
    return;
  }

  // 18. TRI GALLERY ARCHITECTURE (3 ta Vizual Mini-Karta)
  if (arch === 'tri_gallery') {
    slide.addText(card.title || "Vizual Konsepsiyalar Galereyasi", {
      x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    const items = (card.cards || card.items || [
      { title: "Asosiy Element", desc: "Mavzuning dastlabki poydevori va muhim ta'rifi" },
      { title: "Rivojlanish Fazasi", desc: "Ketma-ket kechadigan o'zgarishlar va jarayon" },
      { title: "Yakuniy Hosila", desc: "Olingan yakuniy natija va amaliy ahamiyat" }
    ]).slice(0, 3);
    items.forEach((it, idx) => {
      const xPos = 0.8 + (idx * 2.9);
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.3, w: 2.65, h: 3.85, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.12
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos + 0.15, y: 1.45, w: 2.35, h: 1.7, fill: { color: style.bg }, line: { color: style.accent, width: 1 }, rectRadius: 0.08
      });
      if (topicImageBase64) {
        slide.addImage({
          data: topicImageBase64,
          x: xPos + 0.2, y: 1.5, w: 2.25, h: 1.6, sizing: { type: 'cover', w: 2.25, h: 1.6 }
        });
      } else {
        slide.addText("🖼️ VIZUAL KARTA", {
          x: xPos + 0.2, y: 2.1, w: 2.25, h: 0.4, fontSize: 11, bold: true, color: style.accent, align: 'center', fontFace: 'Arial'
        });
      }
      slide.addText(it.title || `Konsept 0${idx + 1}`, {
        x: xPos + 0.2, y: 3.3, w: 2.25, h: 0.45, fontSize: 12.5, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(it.desc || it.text || "", {
        x: xPos + 0.2, y: 3.8, w: 2.25, h: 1.25, fontSize: 10, color: style.subtext, fontFace: 'Arial'
      });
    });
    return;
  }

  // 19. FAQ ACCORDION ARCHITECTURE (3 ta Muhim Savol va Ilmiy Sharh)
  if (arch === 'faq_accordion') {
    slide.addText(card.title || "Asosiy Savollar va Ilmiy Tushuntirishlar", {
      x: 0.8, y: 0.65, w: 8.4, h: 0.45, fontSize: 22, bold: true, color: style.text, fontFace: 'Arial'
    });
    const faqs = card.faqItems || [
      { q: "Mavzuning eng fundamental o'rganish maqsadi nimadan iborat?", a: "O'quvchilarda jarayonning mohiyatini ilmiy asosda tushunish va DTS mezonlariga mos ko'nikmalarni shakllantirish." },
      { q: "Ushbu qonuniyat kundalik hayot va amaliyotda qayerda uchraydi?", a: "Tabiatdagi barcha moddalar almashinuvida, ishlab chiqarish texnologiyalarida va ekologik tizimlarda asosiy o'rin tutadi." },
      { q: "Imtihon va nazorat testlarida nimalarga alohida e'tibor qaratish kerak?", a: "Formulalar, asosiy terminlar va hodisalar o'rtasidagi sabab-oqibat bog'liqliklarini aniq bilish zarur." }
    ];
    faqs.slice(0, 3).forEach((f, idx) => {
      const yPos = 1.25 + (idx * 1.3);
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: yPos, w: 8.4, h: 1.15, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1 }, rectRadius: 0.1
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: yPos, w: 0.08, h: 1.15, fill: { color: idx === 1 ? style.accent2 : style.accent }, line: { width: 0 }, rectRadius: 0.04
      });
      slide.addText(`❓ ${f.q}`, {
        x: 1.05, y: yPos + 0.12, w: 7.9, h: 0.35, fontSize: 11.5, bold: true, color: style.text, fontFace: 'Arial'
      });
      slide.addText(`💡 ${f.a}`, {
        x: 1.05, y: yPos + 0.48, w: 7.9, h: 0.58, fontSize: 10, color: style.subtext, fontFace: 'Arial'
      });
    });
    return;
  }

  // 20. SUMMARY & TAKEAWAYS (Yakuniy Xulosa & Natijalar)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 0.85, w: 8.4, h: 4.4, fill: { color: style.cardBg }, line: { color: style.cardBorder, width: 1.5 }, rectRadius: 0.15
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 0.85, w: 8.4, h: 0.08, fill: { color: style.accent }, line: { color: style.accent, width: 0 }, rectRadius: 0.04
  });

  const hasSumImg = !!topicImageBase64;
  const sumW = hasSumImg ? 5.2 : 7.6;

  slide.addText(card.title || "Yakuniy Xulosa va Natijalar", {
    x: 1.2, y: 1.15, w: sumW, h: 0.5, fontSize: 22, bold: true, color: style.accent, fontFace: 'Arial'
  });
  if (card.quote) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.2, y: 1.75, w: sumW, h: 0.95, fill: { color: style.bg }, line: { color: style.accent2, width: 1 }, rectRadius: 0.08
    });
    slide.addText(`“ ${card.quote} ”`, {
      x: 1.35, y: 1.8, w: sumW - 0.3, h: 0.8, fontSize: 11.5, italic: true, color: style.text, align: 'center', valign: 'middle', fontFace: 'Arial'
    });
  }
  const takeawaysText = (card.takeaways || card.bullets || []).map(t => `★  ${t}`).join("\n\n");
  slide.addText(takeawaysText || "★ Mavzuning eng muhim ilmiy va amaliy xulosalari", {
    x: 1.2, y: card.quote ? 2.85 : 1.75, w: sumW, h: card.quote ? 2.25 : 3.3, fontSize: 11.5, color: style.subtext, fontFace: 'Arial'
  });

  if (hasSumImg) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.55, y: 1.15, w: 2.45, h: 3.8, fill: { color: style.bg }, line: { color: style.accent, width: 1.2 }, rectRadius: 0.12
    });
    slide.addImage({
      data: topicImageBase64,
      x: 6.65, y: 1.25, w: 2.25, h: 3.6, sizing: { type: 'cover', w: 2.25, h: 3.6 }, round: true
    });
  }
}

// ============================================================================
// 5. POWERPOINT (.PPTX) GENERATSIYA ASOSIY FUNKSIYASI
// ============================================================================
export async function generatePresentationPptx(config = {}) {
  const {
    topic = "Fotosintez jarayoni va o'simliklar biosferasi",
    styleName = "obsidian",
    cards = null,
    authorName = "",
    filename = "Gamma_Taqdimot.pptx",
    includeImages = true,
    imageDensity = 'medium',
    imageStyle = 'realistic',
    slideTransition = 'fade'
  } = config;

  let themeKey = styleName;
  if (styleName === 'auto' || styleName === 'random' || !GAMMA_THEMES[styleName]) {
    const keys = Object.keys(GAMMA_THEMES);
    themeKey = keys[Math.floor(Math.random() * keys.length)];
  }
  const style = GAMMA_THEMES[themeKey] || GAMMA_THEMES.obsidian;
  let slideDeck = cards && cards.length ? [...cards] : getDefaultGammaCards(topic, authorName);

  // 1 dan 30 gacha bo'lgan barcha betlarni qo'llab-quvvatlash
  if (config.slideCount) {
    const targetCount = Math.min(30, Math.max(1, parseInt(config.slideCount, 10) || slideDeck.length));
    if (slideDeck.length < targetCount) {
      const summaryCard = slideDeck[slideDeck.length - 1];
      const baseCards = slideDeck.slice(0, slideDeck.length - 1);
      const subtopics = [
        "Ilmiy-Nazariy Asoslar va Fundamental Qonuniyatlar", "Laboratoriya Tajribalari va Amaliy Tahlillar", 
        "Fanlararo Integratsiya va Qiyosiy Solishtirish", "Tarixiy Rivojlanish Bosqichlari va Kashfiyotlar", 
        "Zamonaviy Texnologiyalar va Raqamli Yondashuvlar", "Davlat Ta'lim Standartlari va DTS Mezonlari",
        "Atrof-muhit, Ekologiya va Ijtimoiy Ahamiyat", "Interaktiv Metodlar, Savol-Javob va Masalalar", 
        "Formulalar, Teoremalar va Miqdoriy Ko'rsatkichlar", "Statistik Ko'rsatkichlar va Qiyosiy Dinamika", 
        "Dolzarb Muammolar va Ularning Innovatsion Yechimlari", "Zamonaviy Ilmiy Yondashuvlar va Yangiliklar",
        "Kelajak Istiqbollari va Strategik Xulosalar", "O'quvchilar Mustaqil Bajarishi Uchun Keys-topshiriqlar", 
        "O'qituvchi Uchun Metodik Tavsiyalar va Qo'llanma"
      ];
      const layoutTemplates = [
        { type: "split_image", badge: "ILMIY AMALIYOT" },
        { type: "pillars", badge: "3 TAYANCH YO'NALISH" },
        { type: "bento_3", badge: "KOMPLEKS TAHLIL" },
        { type: "grid4", badge: "TARKIBIY ELEMENTLAR" },
        { type: "stats", badge: "STATISTIK PARAMETRLAR" },
        { type: "timeline", badge: "BOSQICHMA-BOSQICH DASTUR" },
        { type: "case_study", badge: "AMALIY KEYS" },
        { type: "problem_solution", badge: "DOLZARB YECHIM" },
        { type: "flow_diagram", badge: "SXEMATIK KETMA-KETLIK" }
      ];
      while (baseCards.length < targetCount - 1) {
        const i = baseCards.length;
        const subTitle = subtopics[i % subtopics.length];
        const tmpl = layoutTemplates[i % layoutTemplates.length];
        baseCards.push({
          type: tmpl.type,
          title: `${topic}: ${subTitle}`,
          badge: `${tmpl.badge} • 0${i + 1}`,
          mainConcept: `${topic} doirasida ${subTitle.toLowerCase()} chuqur pedagogik va ilmiy ahamiyat kasb etib, darslikning tayanch mezonlarini to'liq ochib beradi.`,
          explanation: `Ushbu bosqichda o'quvchilar va mutaxassislar uchun mavzuning fundamental prinsiplari, miqdoriy formulalari, tajriba xulosalari hamda ta'limiy ko'nikmalari batafsil sharhlab o'tiladi.`,
          imageKeyword: `${topic} ${subTitle} science education laboratory`,
          bullets: [
            `${subTitle} yuzasidan eng muhim ta'riflar, tushunchalar va ilmiy aksiomalar`,
            `Darslik dasturidagi formulalar, qoidalar va amaliy hisoblash algoritmlari`,
            `Fanlararo amaliyot: nazariy bilimlarni hayotiy masalalarda qo'llash tajribasi`,
            `Monitoring va o'zlashtirishni tekshirish uchun nazorat savollari majmuasi`
          ],
          speakerNotes: `Hurmatli ishtirokchilar, ushbu slaydda ${topic} mavzusining «${subTitle}» qismiga e'tibor qaratamiz. Bu yerda asosiy e'tibor ilmiy tahlil va darslik mezonlariga qaratilgan.`
        });
      }
      slideDeck = [...baseCards, summaryCard];
    } else if (slideDeck.length > targetCount) {
      const summaryCard = slideDeck[slideDeck.length - 1];
      slideDeck = [...slideDeck.slice(0, targetCount - 1), summaryCard];
    }
  }

  // Topic va per-slide maxsus kontekstli rasmlarni parallel yuklab olish
  let topicImageBase64 = null;
  const cardImages = [];
  if (includeImages) {
    try {
      const firstCard = slideDeck[0] || {};
      const imgUrl = firstCard.imageUrl || resolveCardImageUrl({ ...firstCard, id: 1 }, topic, imageStyle);
      topicImageBase64 = await fetchImageAsBase64(imgUrl, 10000);
      if (!topicImageBase64) {
        const fallbackUrl = getPerSlideFallbackImage(topic, 0);
        topicImageBase64 = await fetchImageAsBase64(fallbackUrl, 6000);
      }
    } catch (e) {
      try {
        const fallbackUrl = getPerSlideFallbackImage(topic, 0);
        topicImageBase64 = await fetchImageAsBase64(fallbackUrl, 6000);
      } catch (errFallback) {
        topicImageBase64 = null;
      }
    }

    const visualArchs = ['split_image', 'tri_gallery', 'case_study', 'bento_3', 'concept_spotlight', 'hero_classic', 'pillars_3', 'problem_solution', 'summary_takeaways', 'timeline_steps'];
    const fetchPromises = slideDeck.map(async (card, idx) => {
      if (idx === 0) return topicImageBase64;
      const arch = resolveSlideArchitecture(card, idx, slideDeck.length);
      const isVisualLayout = visualArchs.includes(arch);
      let shouldFetch = false;
      if (imageDensity === 'low') {
        shouldFetch = isVisualLayout && (idx === 2 || idx === Math.floor(slideDeck.length / 2));
      } else {
        // High va Medium: Gamma darajasidagi maksimal vizual to'yinganlik
        shouldFetch = true;
      }

      if (shouldFetch) {
        try {
          const cardUrl = card.imageUrl || resolveCardImageUrl({ ...card, id: idx + 1 }, topic, imageStyle);
          let b64 = await fetchImageAsBase64(cardUrl, 10000);
          if (!b64) {
            const fallbackUrl = getPerSlideFallbackImage(topic, idx);
            b64 = await fetchImageAsBase64(fallbackUrl, 6000);
          }
          return b64 || null;
        } catch (err) {
          try {
            const fallbackUrl = getPerSlideFallbackImage(topic, idx);
            const b64 = await fetchImageAsBase64(fallbackUrl, 6000);
            return b64 || null;
          } catch (e2) {
            return null;
          }
        }
      }
      return null;
    });

    const settled = await Promise.allSettled(fetchPromises);
    settled.forEach(s => cardImages.push(s.status === 'fulfilled' ? s.value : null));
  }

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  const transitionTypes = ['fade', 'push', 'wipe', 'split', 'reveal', 'cover'];

  slideDeck.forEach((card, index) => {
    const slide = pres.addSlide();
    const arch = resolveSlideArchitecture(card, index, slideDeck.length);

    // Gamma & Genspark uslubida har bir slayd uchun dinamik almashinuvchi fon kontrasti
    let slideBgColor = style.bg;
    if (index === 0 || index === slideDeck.length - 1) {
      slideBgColor = style.bg;
    } else if (arch === 'citation_quote' || arch === 'stats_kpi' || arch === 'quiz_interactive') {
      slideBgColor = style.cardBg;
    } else if (index % 2 === 1) {
      slideBgColor = style.bg;
    } else {
      slideBgColor = style.cardBg;
    }
    slide.background = { color: slideBgColor };

    // PPTX Perexod (Transition Animatsiyasi)
    const pptxTransType = slideTransition === 'slide' ? 'push' : (slideTransition === 'zoom' ? 'zoom' : (slideTransition === 'flip' ? 'wipe' : 'fade'));
    slide.transition = {
      type: index === 0 ? 'fade' : pptxTransType,
      duration: 0.6
    };

    // 100+ XIL DINAMIK FON GRAFIKASI (HECH QACHON BIR XIL BO'LMAYDI)
    applyDynamicBackgroundPattern(slide, pres, style, index, slideDeck.length);

    // Top Header Breadcrumb & Divider (Faqat ichki slaydlarda, Hero muqovada emas)
    if (index > 0) {
      slide.addShape(pres.ShapeType.line, {
        x: 0.8, y: 0.62, w: 8.4, h: 0,
        line: { color: style.cardBorder, width: 0.75, dashType: 'solid' }
      });
      slide.addText(`SMARTOFFICE & EDUAI PRO  •  GAMMA & GENSPARK ENGINE  •  SLAYD ${index + 1}/${slideDeck.length}`, {
        x: 0.8, y: 0.32, w: 8.4, h: 0.28, fontSize: 9.5, color: style.subtext, bold: true, fontFace: 'Arial'
      });
    }

    if (card.speakerNotes) {
      slide.addNotes(card.speakerNotes);
    }

    // 100+ XIL SLAYD ARXITEKTURASI RENDERINGI (Har bir slayd uchun UNIKAL rasm, hech qachon 1-slayddan nusxalanmaydi)
    const slideImg = (cardImages && cardImages[index]) ? cardImages[index] : (index === 0 ? topicImageBase64 : null);
    renderSlideArchitecture(slide, pres, card, style, index, slideDeck.length, slideImg, authorName, topic);

    // Pastki Elegant Footer (1-slayddan keyingi barcha varaqlarda)
    if (index > 0) {
      slide.addShape(pres.ShapeType.line, {
        x: 0.8, y: 5.32, w: 8.4, h: 0,
        line: { color: style.cardBorder, width: 0.5, dashType: 'solid' }
      });
      slide.addText(`📌 ${topic.slice(0, 36)}`, {
        x: 0.8, y: 5.35, w: 3.8, h: 0.22, fontSize: 8.5, color: style.subtext, fontFace: 'Arial'
      });
      if (authorName && authorName.trim()) {
        slide.addText(`👤 ${authorName.trim()}`, {
          x: 4.6, y: 5.35, w: 3.0, h: 0.22, fontSize: 8.5, color: style.subtext, align: 'center', fontFace: 'Arial'
        });
      }
      slide.addText(`${index + 1} / ${slideDeck.length}`, {
        x: 7.8, y: 5.35, w: 1.4, h: 0.22, fontSize: 8.5, color: style.subtext, align: 'right', fontFace: 'Arial'
      });
    }
  });

  if (config.outputType === 'nodebuffer' || (typeof window === 'undefined' && !config.filename)) {
    return await pres.write({ outputType: 'nodebuffer' });
  }
  return await pres.writeFile({ fileName: filename });
}
