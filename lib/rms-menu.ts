import fs from "fs";
import path from "path";
import {
  type MenuGroup,
  type MenuSubgroup,
  type MenuItem,
  type DietaryTag,
  type MenuCategoryData,
  buildCategoriesFromGroups,
} from "@/lib/full-menu-data";

export interface MenuDataState {
  groups: MenuGroup[];
  subgroups: MenuSubgroup[];
  items: MenuItem[];
  categories: MenuCategoryData[];
  brand?: {
    id: number;
    code: string;
    name: string;
    currency: string;
    logo: string | null;
  };
}

export interface RMSDietary {
  isVeg: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isSpicy: boolean;
}

export interface RMSItem {
  id: number;
  code: string;
  barcode: string | null;
  name: string;
  nameLocal: string | null;
  description: string | null;
  descriptionLocal: string | null;
  price: number;
  cookingTime: number;
  categoryId: number | null;
  categoryName: string | null;
  dmOrder: number | null;
  groupId: number;
  groupName: string;
  subgroupId: number;
  subgroupName: string;
  image: string | null;
  images: string[];
  dietary: RMSDietary;
  isAvailable: boolean;
}

export interface RMSCategory {
  id: number;
  code: string;
  name: string;
  nameLocal: string | null;
  description: string | null;
  descLocal: string | null;
  order: number;
  image: string | null;
  items: RMSItem[];
}

export interface RMSMenuData {
  brand: {
    id: number;
    code: string;
    name: string;
    currency: string;
    logo: string | null;
  };
  outlet: {
    id: number | null;
    code: string | null;
    name: string | null;
    address: string | null;
    phone: string | null;
  };
  categories: RMSCategory[];
  groups?: Array<{
    id: number;
    code: string;
    name: string;
    nameLocal: string | null;
    order: number;
    subgroups?: Array<{
      id: number;
      code: string;
      name: string;
      order: number;
      itemCount?: number;
    }>;
  }>;
}

export interface RMSProductsParams {
  groupId?: string | number;
  subgroupId?: string | number;
  categoryId?: string | number;
  dietary?: "veg" | "non_veg" | "vegan" | "halal" | "spicy";
  q?: string;
  page?: number;
  limit?: number;
}

export interface RMSProductsResponse {
  success: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: RMSItem[];
}

const DEFAULT_API_URL = "https://arclocpc.tail9812b0.ts.net/api/v1/external";
const DEFAULT_API_KEY =
  "rms_ext_eyJjb21wYW55SWQiOjY0LCJkaXZpc2lvbklkIjpudWxsLCJjb21wYW55Q29kZSI6IlRGQzAwMSIsIm5hbWUiOiJPZmZpY2lhbCBXZWJzaXRlIiwic2NvcGUiOiJjYXRhbG9nOnJlYWQiLCJjcmVhdGVkQXQiOjE3OTU0MjU5ODE4NzJ9.NTiogfhQa4TY4hLStwgyfyoe51v8xMTbCi72IF_y65o";

export function getRMSConfig() {
  const baseUrl =
    process.env.RMS_EXTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_RMS_EXTERNAL_API_URL ||
    DEFAULT_API_URL;
  const apiKey =
    process.env.RMS_EXTERNAL_API_KEY ||
    process.env.NEXT_PUBLIC_RMS_EXTERNAL_API_KEY ||
    DEFAULT_API_KEY;

  return { baseUrl, apiKey };
}

/** Local disk fallback cache file path */
const CACHE_FILE_PATH = path.join(process.cwd(), ".rms-menu-cache.json");

/** In-memory cached menu data */
let memoryCache: RMSMenuData | null = null;

function readDiskCache(): RMSMenuData | null {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const raw = fs.readFileSync(CACHE_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.categories)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read disk cache:", err);
  }
  return memoryCache;
}

function writeDiskCache(data: RMSMenuData) {
  memoryCache = data;
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Ignore cache write errors
  }
}

/** Fallback descriptions for dishes if not yet set in RMS */
const DEFAULT_DISH_DESCRIPTIONS: Record<string, string> = {
  "zinger burger":
    "Crisp golden fried chicken fillet with fiery seasoning, layered with chilled iceberg lettuce and house toum mayo on a toasted brioche bun.",
  "classic chicken burger":
    "Tender seasoned chicken fillet flame-seared, topped with crisp garden greens, sweet pickles, and signature house deli dressing.",
  "spicy chicken burger":
    "Spicy hand-breaded chicken breast tossed in Aleppo chili rub, smoked paprika aioli, and pickled peppers on artisan bun.",
  "double beef burger":
    "Double prime smashed beef patties with caramelized sweet shallots, melted aged cheddar, and house mustard glaze.",
  "french fries":
    "Triple-cooked golden potato batons lightly dusted with wild Mediterranean sumac and sea salt, served with garlic dip.",
  "chicken tikka":
    "Boneless chicken morsels steeped in aromatic yogurt, coriander, and crushed spices, char-grilled to tender perfection.",
  "fried chicken 2 pcs":
    "Two pieces of crunchy heritage spiced fried chicken, ultra crisp on the outside, juicy within, served with house dip.",
  "iced coffee":
    "Slow-extracted cold brew poured over artisan ice cubes with condensed cardamom cream and freshly frothed milk.",
  "chocolate brownie":
    "Warm Belgian dark chocolate fudge brownie with molten center, topped with roasted Aleppo pistachios and vanilla cream.",
};

/** Selects an appealing fallback photo if RMS item has no image attached */
function getFallbackImage(itemName: string, subgroupName: string): string {
  const lower = `${itemName} ${subgroupName}`.toLowerCase();
  if (lower.includes("brownie") || lower.includes("chocolate") || lower.includes("dessert") || lower.includes("cake")) {
    return "/images/dish-lava-cake.jpg";
  }
  if (lower.includes("coffee") || lower.includes("drink") || lower.includes("beverage")) {
    return "/assets/gallery/roastery-cezve.jpg";
  }
  if (lower.includes("fry") || lower.includes("fries") || lower.includes("side")) {
    return "/images/crispy-calamari.jpg";
  }
  if (lower.includes("chicken") || lower.includes("tikka") || lower.includes("grill")) {
    return "/images/dish-chicken.jpg";
  }
  if (lower.includes("burger") || lower.includes("beef") || lower.includes("lamb")) {
    return "/assets/gallery/charred-lamb-chops.jpg";
  }
  return "/images/dish-chicken.jpg";
}

/**
 * Transforms RMS categories and products into the unified MenuDataState
 * compatible with all site components, following the API Specification:
 * - Categories ordered by cat.order
 * - Dishes ordered by dish.dmOrder
 * - Prices formatted with brand.currency
 * - Dietary badges rendered from dish.dietary.isVeg and isSpicy
 */
export function transformRMSToMenuState(rmsData: RMSMenuData): MenuDataState {
  const currency = rmsData.brand?.currency || "AED";

  // 1. Sort categories/groups by order
  const sortedCategories = [...(rmsData.categories || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  const groups: MenuGroup[] = [];
  const subgroups: MenuSubgroup[] = [];
  const items: MenuItem[] = [];

  const seenSubgroups = new Set<string>();
  const seenItems = new Set<string>();

  sortedCategories.forEach((cat, catIdx) => {
    const groupId = String(cat.id);
    const groupName = cat.name || `Category ${catIdx + 1}`;

    groups.push({
      id: groupId,
      code: cat.code,
      name: groupName,
      nameLocal: cat.nameLocal,
      description: cat.description || `Artisanal ${groupName.toLowerCase()} selections crafted to order.`,
      descLocal: cat.descLocal,
      order: cat.order || catIdx + 1,
    });

    // 2. Sort dishes inside each category by dmOrder
    const sortedItems = [...(cat.items || [])].sort((a, b) => {
      const orderA = a.dmOrder !== null && a.dmOrder !== undefined ? a.dmOrder : a.id;
      const orderB = b.dmOrder !== null && b.dmOrder !== undefined ? b.dmOrder : b.id;
      return orderA - orderB;
    });

    sortedItems.forEach((it) => {
      // Don't include custom/open zero-price items in the public menu unless priced
      if (it.price <= 0 && it.name.toLowerCase().includes("open item")) {
        return;
      }

      const itemId = String(it.id);
      if (seenItems.has(itemId)) return;
      seenItems.add(itemId);

      const subId = it.subgroupId ? String(it.subgroupId) : `${groupId}-general`;
      const subName = it.subgroupName || "Specialties";

      if (!seenSubgroups.has(subId)) {
        seenSubgroups.add(subId);
        subgroups.push({
          id: subId,
          groupId: groupId,
          name: subName,
          nameLocal: null,
          description: `Freshly prepared ${subName.toLowerCase()} made with authentic ingredients.`,
          order: subgroups.filter((s) => s.groupId === groupId).length + 1,
        });
      }

      // Build dietary tags following specification
      const dietary: DietaryTag[] = ["All"];
      if (it.dietary?.isVeg) {
        dietary.push("Vegetarian");
      } else {
        dietary.push("Non-Vegetarian");
      }
      if (it.dietary?.isVegan) dietary.push("Vegan");
      if (it.dietary?.isHalal) dietary.push("Halal");
      if (it.dietary?.isSpicy) dietary.push("Spicy");
      if (it.price >= 20 || it.code === "ZB001") dietary.push("Chef's Selection");

      // Badges
      let badge: string = "POPULAR";
      if (it.dietary?.isSpicy) badge = "SPICY";
      else if (it.dietary?.isVeg) badge = "VEGETARIAN";
      else if (it.price >= 25) badge = "SIGNATURE";
      else if (it.name.toLowerCase().includes("zinger") || it.name.toLowerCase().includes("tikka")) badge = "CHEF'S PICK";
      else if (it.code.endsWith("01")) badge = "HOUSE FAVOURITE";

      const lowerName = it.name.toLowerCase().trim();
      const description =
        it.description?.trim() ||
        DEFAULT_DISH_DESCRIPTIONS[lowerName] ||
        `Freshly prepared ${it.name} made with handpicked ingredients and distinct spices.`;

      const image = it.image && it.image.trim().length > 0
        ? it.image
        : getFallbackImage(it.name, subName);

      items.push({
        id: itemId,
        code: it.code,
        name: it.name,
        nameLocal: it.nameLocal,
        description,
        descriptionLocal: it.descriptionLocal,
        price: Number(it.price) || 0,
        currency,
        cookingTime: it.cookingTime,
        categoryId: it.categoryId ? String(it.categoryId) : groupId,
        categoryName: it.categoryName || groupName,
        dmOrder: it.dmOrder,
        groupId,
        groupName,
        subgroupId: subId,
        subgroupName: subName,
        badge,
        isSignature: it.price >= 20 || it.code === "ZB001",
        image,
        images: it.images || [],
        dietary,
        rawDietary: it.dietary,
        prepTime: it.cookingTime ? `${it.cookingTime} mins` : undefined,
        isAvailable: it.isAvailable ?? true,
        createdAt: it.id,
      });
    });
  });

  // Ensure subgroups exist even if groups have no items yet
  if (subgroups.length === 0) {
    groups.forEach((g) => {
      subgroups.push({
        id: `${g.id}-all`,
        groupId: g.id,
        name: `All ${g.name}`,
        description: `Explore all ${g.name.toLowerCase()} selections`,
        order: 1,
      });
    });
  }

  const categories = buildCategoriesFromGroups(groups, subgroups, items);

  return {
    groups,
    subgroups,
    items,
    categories,
    brand: rmsData.brand,
  };
}

/**
 * Endpoint 1: Fetches the entire structured menu tree in one call.
 * Recommended for landing pages and full menu tabs.
 */
export async function getRestaurantMenu(): Promise<RMSMenuData> {
  const { baseUrl, apiKey } = getRMSConfig();
  const API_URL = `${baseUrl}/menu`;

  try {
    const res = await fetch(API_URL, {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store", // Always fetch live so console additions reflect immediately
      signal: AbortSignal.timeout(8000), // 8s timeout guard
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.categories)) {
        writeDiskCache(json.data);
        return json.data as RMSMenuData;
      }
    }
    console.warn(`RMS fetch responded with status ${res.status}. Falling back to cached catalog.`);
  } catch (err) {
    console.warn("RMS fetch timeout or error, falling back to cached catalog:", err);
  }

  // Fallback to disk cache if available
  const cached = readDiskCache();
  if (cached) {
    return cached;
  }

  // If RMS is unreachable and no cache exists, return an empty menu safely without crashing
  return {
    brand: {
      id: 64,
      code: "TFC001",
      name: "Taste Fried Chicken",
      currency: "AED",
      logo: null,
    },
    outlet: {
      id: null,
      code: null,
      name: null,
      address: null,
      phone: null,
    },
    categories: [],
    groups: [],
  };
}

/**
 * Endpoint 2: Returns Digital Menu categories with live active dish counts.
 */
export async function getRestaurantCategories(): Promise<
  Array<{ id: number; code: string; name: string; nameLocal: string | null; order: number; itemCount: number }>
> {
  const { baseUrl, apiKey } = getRMSConfig();
  const API_URL = `${baseUrl}/categories`;

  try {
    const res = await fetch(API_URL, {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }

    // Fallback: derive categories from full menu tree if /categories is empty
    const menu = await getRestaurantMenu();
    return (menu.categories || []).map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      nameLocal: c.nameLocal,
      order: c.order,
      itemCount: (c.items || []).length,
    }));
  } catch (err) {
    console.warn("RMS categories fetch notice:", err);
  }

  return [];
}

/**
 * Endpoint 3: Search and filter dishes with pagination.
 */
export async function getRestaurantProducts(
  params: RMSProductsParams = {}
): Promise<RMSProductsResponse> {
  const { baseUrl, apiKey } = getRMSConfig();
  const url = new URL(`${baseUrl}/products`);

  if (params.groupId !== undefined) url.searchParams.set("groupId", String(params.groupId));
  if (params.subgroupId !== undefined) url.searchParams.set("subgroupId", String(params.subgroupId));
  if (params.categoryId !== undefined) url.searchParams.set("categoryId", String(params.categoryId));
  if (params.dietary) url.searchParams.set("dietary", params.dietary);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.page !== undefined) url.searchParams.set("page", String(params.page));
  if (params.limit !== undefined) url.searchParams.set("limit", String(params.limit));

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      return (await res.json()) as RMSProductsResponse;
    }
  } catch (err) {
    console.warn("RMS products query timeout or error, filtering cached dishes:", err);
  }

  // Fallback: filter cached menu items locally
  const cachedMenu = readDiskCache();
  const allItems: RMSItem[] = (cachedMenu?.categories || []).flatMap((c) => c.items);
  let filtered = allItems;

  if (params.groupId !== undefined) {
    filtered = filtered.filter((it) => String(it.groupId) === String(params.groupId));
  }
  if (params.subgroupId !== undefined) {
    filtered = filtered.filter((it) => String(it.subgroupId) === String(params.subgroupId));
  }
  if (params.dietary) {
    if (params.dietary === "veg") filtered = filtered.filter((it) => it.dietary?.isVeg);
    if (params.dietary === "non_veg") filtered = filtered.filter((it) => !it.dietary?.isVeg);
    if (params.dietary === "vegan") filtered = filtered.filter((it) => it.dietary?.isVegan);
    if (params.dietary === "halal") filtered = filtered.filter((it) => it.dietary?.isHalal);
    if (params.dietary === "spicy") filtered = filtered.filter((it) => it.dietary?.isSpicy);
  }
  if (params.q) {
    const query = params.q.toLowerCase().trim();
    filtered = filtered.filter(
      (it) =>
        it.name.toLowerCase().includes(query) ||
        (it.nameLocal && it.nameLocal.toLowerCase().includes(query)) ||
        (it.code && it.code.toLowerCase().includes(query)) ||
        (it.description && it.description.toLowerCase().includes(query))
    );
  }

  const page = params.page || 1;
  const limit = params.limit || 50;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    success: true,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
    data: paginated,
  };
}

/**
 * Endpoint 4: Returns catalog groups and subgroups hierarchy with item counts.
 */
export async function getRestaurantGroups(): Promise<unknown[]> {
  const { baseUrl, apiKey } = getRMSConfig();
  const API_URL = `${baseUrl}/groups`;

  try {
    const res = await fetch(API_URL, {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (err) {
    console.warn("RMS groups fetch notice:", err);
  }

  return [];
}

/**
 * High-level helper: Fetches menu from RMS and returns ready-to-render MenuDataState.
 */
export async function getRestaurantMenuState(): Promise<MenuDataState> {
  const rmsData = await getRestaurantMenu();
  return transformRMSToMenuState(rmsData);
}
