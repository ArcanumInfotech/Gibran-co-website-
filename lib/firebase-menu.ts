import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  DEFAULT_MENU_GROUPS,
  DEFAULT_MENU_SUBGROUPS,
  DEFAULT_MENU_ITEMS,
  buildCategoriesFromGroups,
  type MenuGroup,
  type MenuSubgroup,
  type MenuItem,
  type MenuCategoryData,
} from "@/lib/full-menu-data";

export interface MenuDataState {
  groups: MenuGroup[];
  subgroups: MenuSubgroup[];
  items: MenuItem[];
  categories: MenuCategoryData[];
  brand?: {
    id?: number | string;
    code?: string;
    name?: string;
    currency?: string;
    logo?: string | null;
  };
  outlet?: {
    id?: number | string | null;
    code?: string | null;
    name?: string | null;
    address?: string | null;
    phone?: string | null;
  };
}

const MENU_DOC_REF = () => doc(db, "restaurant", "menu");
const LOCAL_STORAGE_KEY = "rms_menu_live_v5";

const LEGACY_DUMMY_NAMES = new Set([
  "pizza",
  "ndfndfn",
  "hummus bil lahme",
  "valrhona molten chocolate fondant",
  "herb-grilled chicken",
  "truffle infused labneh sphere",
  "confit de canard flatbread",
  "aged halva mille-feuille",
  "crispy calamari & saffron aioli",
  "za'atar crusted lamb ribs",
  "smoked eggplant mtbbal",
  "spiced chickpea & cauliflower dip",
  "wood-fired spiced halloumi",
  "charcoal sea bass sayadieh",
  "braised short rib tagine",
  "spiced date & pistachio cake",
  "warm cardamom knafeh",
  "orange blossom mouhalabieh",
  "beirut roastery v60",
]);

const INITIAL_DEFAULT_STATE: MenuDataState = {
  groups: DEFAULT_MENU_GROUPS,
  subgroups: DEFAULT_MENU_SUBGROUPS,
  items: DEFAULT_MENU_ITEMS,
  categories: buildCategoriesFromGroups(DEFAULT_MENU_GROUPS, DEFAULT_MENU_SUBGROUPS, DEFAULT_MENU_ITEMS),
  brand: {
    id: 1,
    code: "TFC001",
    name: "Taste Fried Chicken",
    currency: "AED",
    logo: null,
  },
  outlet: {
    id: 1,
    code: "LULU",
    name: "All Branches / Brand Default",
    address: null,
    phone: null,
  },
};

function getLocalStoredState(): MenuDataState | null {
  if (typeof window === "undefined") return null;
  try {
    // Purge legacy caches that held dummy dishes
    ["tfc_menu_live_v3", "tfc_menu_live_v2", "gibran_menu_live_v1"].forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch { }
    });

    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.groups) && Array.isArray(parsed.subgroups)) {
        const normalized = normalizeFirestoreData(parsed);
        const hasLegacy = normalized.items.some((it) =>
          LEGACY_DUMMY_NAMES.has((it.name || "").trim().toLowerCase())
        );
        if (hasLegacy) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          return null;
        }
        return normalized;
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return null;
}

function saveLocalStoredState(state: MenuDataState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent("gibran-menu-updated", { detail: state })
    );
  } catch {
    // Ignore storage write errors
  }
}

/**
 * Checks live connection to Firestore and returns connectivity diagnostic.
 */
export async function checkFirestoreConnection(): Promise<{
  connected: boolean;
  projectId: string;
  error?: string;
}> {
  const projectId = db.app.options.projectId || "unknown";
  try {
    const snap = await getDoc(MENU_DOC_REF());
    return { connected: true, projectId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { connected: false, projectId, error: msg };
  }
}

/**
 * Normalizes document data from Firestore into full MenuDataState.
 */
function normalizeFirestoreData(data: Record<string, unknown> | undefined): MenuDataState {
  let groups: MenuGroup[] = Array.isArray(data?.groups) && (data.groups as MenuGroup[]).length > 0
    ? (data.groups as MenuGroup[])
    : DEFAULT_MENU_GROUPS;

  let subgroups: MenuSubgroup[] = Array.isArray(data?.subgroups) && (data.subgroups as MenuSubgroup[]).length > 0
    ? (data.subgroups as MenuSubgroup[])
    : DEFAULT_MENU_SUBGROUPS;

  // Items: only user dishes. If legacy data had categories with items, extract items with group/subgroup
  let items: MenuItem[] = [];
  if (Array.isArray(data?.items)) {
    items = data.items as MenuItem[];
  }

  // Ensure every item has groupId, subgroupId and a valid existing image path
  items = items.map((it) => {
    const sub = subgroups.find((s) => s.id === it.subgroupId) || subgroups[0];
    const grp = groups.find((g) => g.id === it.groupId || g.id === sub?.groupId) || groups[0];

    let validImage = it.image;
    if (!validImage || validImage.startsWith("/uploads/")) {
      const lowerName = (it.name || "").toLowerCase();
      if (lowerName.includes("chocolate") || lowerName.includes("brownie") || lowerName.includes("cake")) {
        validImage = "/images/dish-lava-cake.jpg";
      } else if (lowerName.includes("coffee") || lowerName.includes("drink")) {
        validImage = "/assets/gallery/roastery-cezve.jpg";
      } else if (lowerName.includes("fries")) {
        validImage = "/images/crispy-calamari.jpg";
      } else {
        validImage = "/images/dish-chicken.jpg";
      }
    }

    return {
      ...it,
      image: validImage,
      groupId: it.groupId || grp?.id || "86",
      groupName: it.groupName || grp?.name || "Food",
      subgroupId: it.subgroupId || sub?.id || "93",
      subgroupName: it.subgroupName || sub?.name || "Burgers",
    };
  });

  // Deduplicate items so duplicate entries never appear and filter out legacy dummy items
  const seenDishNames = new Set<string>();
  items = items.filter((it) => {
    const key = (it.name || "").trim().toLowerCase();
    if (!key || seenDishNames.has(key) || LEGACY_DUMMY_NAMES.has(key)) return false;
    seenDishNames.add(key);
    return true;
  });

  // If no dishes remain, fallback to default RMS dishes so old dummy data never empties the menu
  if (items.length === 0) {
    items = DEFAULT_MENU_ITEMS;
  }

  const categories = buildCategoriesFromGroups(groups, subgroups, items);

  const brand = (data?.brand as MenuDataState["brand"]) || {
    id: 1,
    code: "TFC001",
    name: "Taste Fried Chicken",
    currency: "AED",
    logo: null,
  };

  const outlet = (data?.outlet as MenuDataState["outlet"]) || {
    id: 1,
    code: "LULU",
    name: "All Branches / Brand Default",
    address: null,
    phone: null,
  };

  return { groups, subgroups, items, categories, brand, outlet };
}

/**
 * Loads menu data directly from RMS or Firebase Firestore, falling back to local cache or defaults.
 */
export async function getMenuFromFirebase(): Promise<MenuDataState> {
  const local = getLocalStoredState();

  // 1. Try RMS catalog
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/menu");
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.items) && json.data.items.length > 0) {
        saveLocalStoredState(json.data);
        return json.data;
      }
    } else {
      const { getRestaurantMenuState } = await import("@/lib/rms-menu");
      const rmsState = await getRestaurantMenuState();
      if (rmsState && rmsState.items && rmsState.items.length > 0) {
        saveLocalStoredState(rmsState);
        return rmsState;
      }
    }
  } catch (err) {
    console.warn("RMS menu fetch notice, checking local/Firestore:", err);
  }

  // 2. Fallback to Firestore
  try {
    const snap = await getDoc(MENU_DOC_REF());
    if (snap.exists()) {
      const state = normalizeFirestoreData(snap.data());
      saveLocalStoredState(state);
      return state;
    } else {
      // Initialize doc in Firestore with default groups & subgroups (0 dishes)
      await setDoc(MENU_DOC_REF(), {
        groups: INITIAL_DEFAULT_STATE.groups,
        subgroups: INITIAL_DEFAULT_STATE.subgroups,
        items: [],
        categories: INITIAL_DEFAULT_STATE.categories,
        updatedAt: Date.now(),
      });
      saveLocalStoredState(INITIAL_DEFAULT_STATE);
      return INITIAL_DEFAULT_STATE;
    }
  } catch (err) {
    console.warn("Firestore menu fetch fallback:", err);
  }

  return local || INITIAL_DEFAULT_STATE;
}

/**
 * Explicitly synchronizes the menu state with the external RMS catalog.
 */
export async function syncWithRMS(): Promise<MenuDataState> {
  if (typeof window !== "undefined") {
    const res = await fetch("/api/menu");
    const json = await res.json();
    if (json.success && json.data && Array.isArray(json.data.items) && json.data.items.length > 0) {
      saveLocalStoredState(json.data);
      return json.data;
    }
  } else {
    const { getRestaurantMenuState } = await import("@/lib/rms-menu");
    const rmsState = await getRestaurantMenuState();
    if (rmsState && rmsState.items && rmsState.items.length > 0) {
      saveLocalStoredState(rmsState);
      return rmsState;
    }
  }
  return getLocalStoredState() || INITIAL_DEFAULT_STATE;
}

/**
 * Real-time listener for menu updates directly from Firebase Firestore and RMS API.
 */
export function subscribeToFirebaseMenu(
  onUpdate: (state: MenuDataState) => void
): () => void {
  // First deliver cached data or INITIAL_DEFAULT_STATE immediately so reloading never shows old items or empty state
  const cached = getLocalStoredState();
  onUpdate(cached || INITIAL_DEFAULT_STATE);

  let isDestroyed = false;
  let lastItemFingerprint = cached
    ? cached.items.map((i) => `${i.id}_${i.price}_${i.isAvailable}`).join("|")
    : "";

  // Core background fetch function: polls RMS live menu via /api/menu
  const fetchFreshMenu = async () => {
    if (typeof window === "undefined" || isDestroyed) return;
    try {
      const res = await fetch(`/api/menu?_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.items)) {
        const fingerprint = json.data.items
          .map((i: MenuItem) => `${i.id}_${i.price}_${i.isAvailable}`)
          .join("|");

        if (fingerprint !== lastItemFingerprint) {
          lastItemFingerprint = fingerprint;
          saveLocalStoredState(json.data);
          onUpdate(json.data);
        }
      }
    } catch {
      // Quiet background check failure
    }
  };

  // Immediate fetch on mount
  fetchFreshMenu();

  // 1. Live background polling every 6 seconds to capture additions from RMS console automatically
  const pollTimer = setInterval(fetchFreshMenu, 6000);

  // 2. Re-fetch immediately whenever window gains focus (e.g. user added dish in console tab and switched back!)
  const handleFocus = () => {
    fetchFreshMenu();
  };
  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      fetchFreshMenu();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
  }

  let unsubscribeFirestore: (() => void) | null = null;

  try {
    unsubscribeFirestore = onSnapshot(
      MENU_DOC_REF(),
      (snap) => {
        if (snap.exists()) {
          const docData = snap.data();
          if (docData?.syncedFromRMS) {
            const state = normalizeFirestoreData(docData);
            if (state.items && state.items.length > 0) {
              const fingerprint = state.items
                .map((i) => `${i.id}_${i.price}_${i.isAvailable}`)
                .join("|");
              if (fingerprint !== lastItemFingerprint) {
                lastItemFingerprint = fingerprint;
                saveLocalStoredState(state);
                onUpdate(state);
              }
            }
          }
        }
      },
      (err) => {
        console.warn("Firestore snapshot listener notice:", err.message);
      }
    );
  } catch (err) {
    console.warn("Could not bind Firestore listener:", err);
  }

  const handleLocalUpdate = (e: Event) => {
    const customEvent = e as CustomEvent<MenuDataState>;
    if (customEvent.detail?.groups) {
      onUpdate(customEvent.detail);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("gibran-menu-updated", handleLocalUpdate);
  }

  return () => {
    isDestroyed = true;
    clearInterval(pollTimer);
    if (typeof window !== "undefined") {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("gibran-menu-updated", handleLocalUpdate);
    }
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}

/**
 * Persists updated state to both local storage and Firestore.
 */
async function syncMenuState(state: MenuDataState): Promise<void> {
  const categories = buildCategoriesFromGroups(state.groups, state.subgroups, state.items);
  const fullState: MenuDataState = {
    ...state,
    categories,
  };

  saveLocalStoredState(fullState);

  try {
    await setDoc(
      MENU_DOC_REF(),
      {
        groups: fullState.groups,
        subgroups: fullState.subgroups,
        items: fullState.items,
        categories: fullState.categories,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Saved locally, Firestore sync note:", err);
  }
}

// ==========================================
// GROUP MANAGEMENT
// ==========================================

export async function addGroupToFirebase(
  name: string,
  currentState: MenuDataState,
  description?: string
): Promise<{ success: boolean; group: MenuGroup; state: MenuDataState }> {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const id = slug || `group-${Date.now().toString().slice(-4)}`;

  const newGroup: MenuGroup = {
    id,
    name: name.trim(),
    description: description?.trim() || "",
    order: currentState.groups.length + 1,
  };

  const updatedGroups = [...currentState.groups.filter((g) => g.id !== id), newGroup];
  const nextState: MenuDataState = {
    ...currentState,
    groups: updatedGroups,
  };

  await syncMenuState(nextState);
  return { success: true, group: newGroup, state: nextState };
}

export async function updateGroupInFirebase(
  groupId: string,
  updates: Partial<MenuGroup>,
  currentState: MenuDataState
): Promise<{ success: boolean; state: MenuDataState }> {
  const updatedGroups = currentState.groups.map((g) => {
    if (g.id === groupId) {
      return { ...g, ...updates };
    }
    return g;
  });

  const nextState: MenuDataState = {
    ...currentState,
    groups: updatedGroups,
  };

  await syncMenuState(nextState);
  return { success: true, state: nextState };
}

export async function deleteGroupFromFirebase(
  groupId: string,
  currentState: MenuDataState
): Promise<{ success: boolean; state: MenuDataState }> {
  const updatedGroups = currentState.groups.filter((g) => g.id !== groupId);
  // Also remove subgroups belonging to this group
  const updatedSubgroups = currentState.subgroups.filter((s) => s.groupId !== groupId);
  // Also remove dishes belonging to this group
  const updatedItems = currentState.items.filter((it) => it.groupId !== groupId);

  const nextState: MenuDataState = {
    ...currentState,
    groups: updatedGroups,
    subgroups: updatedSubgroups,
    items: updatedItems,
  };

  await syncMenuState(nextState);
  return { success: true, state: nextState };
}

// ==========================================
// SUBGROUP MANAGEMENT
// ==========================================

export async function addSubgroupToFirebase(
  groupId: string,
  name: string,
  currentState: MenuDataState,
  description?: string
): Promise<{ success: boolean; subgroup: MenuSubgroup; state: MenuDataState }> {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const id = slug || `subgroup-${Date.now().toString().slice(-4)}`;

  const newSubgroup: MenuSubgroup = {
    id,
    groupId,
    name: name.trim(),
    description: description?.trim() || "",
    order: currentState.subgroups.filter((s) => s.groupId === groupId).length + 1,
  };

  const updatedSubgroups = [...currentState.subgroups.filter((s) => s.id !== id), newSubgroup];
  const nextState: MenuDataState = {
    ...currentState,
    subgroups: updatedSubgroups,
  };

  await syncMenuState(nextState);
  return { success: true, subgroup: newSubgroup, state: nextState };
}

export async function updateSubgroupInFirebase(
  subgroupId: string,
  updates: Partial<MenuSubgroup>,
  currentState: MenuDataState
): Promise<{ success: boolean; state: MenuDataState }> {
  const updatedSubgroups = currentState.subgroups.map((s) => {
    if (s.id === subgroupId) {
      return { ...s, ...updates };
    }
    return s;
  });

  const nextState: MenuDataState = {
    ...currentState,
    subgroups: updatedSubgroups,
  };

  await syncMenuState(nextState);
  return { success: true, state: nextState };
}

export async function deleteSubgroupFromFirebase(
  subgroupId: string,
  currentState: MenuDataState
): Promise<{ success: boolean; state: MenuDataState }> {
  const updatedSubgroups = currentState.subgroups.filter((s) => s.id !== subgroupId);
  // Also remove items inside this subgroup
  const updatedItems = currentState.items.filter((it) => it.subgroupId !== subgroupId);

  const nextState: MenuDataState = {
    ...currentState,
    subgroups: updatedSubgroups,
    items: updatedItems,
  };

  await syncMenuState(nextState);
  return { success: true, state: nextState };
}

// ==========================================
// DISH (ITEM) MANAGEMENT
// ==========================================

export async function addDishToFirebase(
  dish: Omit<MenuItem, "id"> & { id?: string },
  currentState: MenuDataState
): Promise<{ success: boolean; item: MenuItem; state: MenuDataState }> {
  const slug = (dish.name || "dish")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const id = dish.id || `${slug}-${Date.now().toString().slice(-4)}`;

  const dietary = Array.from(new Set(["All", ...(dish.dietary || [])])) as MenuItem["dietary"];

  // Resolve group and subgroup names
  const group = currentState.groups.find((g) => g.id === dish.groupId);
  const subgroup = currentState.subgroups.find((s) => s.id === dish.subgroupId);

  const newItem: MenuItem = {
    id,
    name: dish.name.trim(),
    description: dish.description?.trim() || "",
    price: Number(dish.price) || 0,
    groupId: dish.groupId || group?.id || currentState.groups[0]?.id || "food",
    groupName: group?.name || dish.groupName || "Food Menu",
    subgroupId: dish.subgroupId || subgroup?.id || currentState.subgroups[0]?.id || "starters",
    subgroupName: subgroup?.name || dish.subgroupName || "Starters & Mezze",
    badge: dish.badge || undefined,
    image: dish.image || "/images/dish-risotto.jpg",
    dietary,
    calories: dish.calories?.trim() || undefined,
    prepTime: dish.prepTime?.trim() || undefined,
    winePairing: dish.winePairing?.trim() || undefined,
    ingredients: dish.ingredients?.filter((i) => i.trim().length > 0) || [],
    createdAt: Date.now(),
  };

  const updatedItems = [newItem, ...currentState.items.filter((it) => it.id !== newItem.id)];
  const nextState: MenuDataState = {
    ...currentState,
    items: updatedItems,
  };

  await syncMenuState(nextState);
  return { success: true, item: newItem, state: nextState };
}

export async function updateDishInFirebase(
  dishId: string,
  updates: Partial<MenuItem>,
  currentState: MenuDataState
): Promise<{ success: boolean; item: MenuItem; state: MenuDataState }> {
  const existing = currentState.items.find((it) => it.id === dishId);
  if (!existing) {
    throw new Error(`Dish '${dishId}' not found`);
  }

  const group = updates.groupId
    ? currentState.groups.find((g) => g.id === updates.groupId)
    : currentState.groups.find((g) => g.id === existing.groupId);

  const subgroup = updates.subgroupId
    ? currentState.subgroups.find((s) => s.id === updates.subgroupId)
    : currentState.subgroups.find((s) => s.id === existing.subgroupId);

  const updatedItem: MenuItem = {
    ...existing,
    ...updates,
    groupName: group?.name || updates.groupName || existing.groupName,
    subgroupName: subgroup?.name || updates.subgroupName || existing.subgroupName,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    dietary: updates.dietary
      ? (Array.from(new Set(["All", ...updates.dietary])) as MenuItem["dietary"])
      : existing.dietary,
  };

  const updatedItems = currentState.items.map((it) => (it.id === dishId ? updatedItem : it));
  const nextState: MenuDataState = {
    ...currentState,
    items: updatedItems,
  };

  await syncMenuState(nextState);
  return { success: true, item: updatedItem, state: nextState };
}

export async function deleteDishFromFirebase(
  dishId: string,
  currentState: MenuDataState
): Promise<{ success: boolean; state: MenuDataState }> {
  const updatedItems = currentState.items.filter((it) => it.id !== dishId);
  const nextState: MenuDataState = {
    ...currentState,
    items: updatedItems,
  };

  await syncMenuState(nextState);
  return { success: true, state: nextState };
}

/**
 * Clears ALL dishes from the menu completely (sets dishes to empty array []).
 */
export async function clearAllDishesFromFirebase(
  currentState: MenuDataState
): Promise<{ success: boolean; state: MenuDataState }> {
  const nextState: MenuDataState = {
    ...currentState,
    items: [],
  };

  await syncMenuState(nextState);
  return { success: true, state: nextState };
}

/**
 * Converts an image file to an optimized, lightweight Base64 data URL (<40KB)
 * completely in the client browser using HTML5 Canvas.
 * No API routes or cloud storage buckets required.
 */
export async function convertImageToBase64(
  file: File,
  maxDim = 800,
  quality = 0.75
): Promise<string> {
  if (typeof window === "undefined") return "";

  return new Promise((resolve, reject) => {
    // If already an SVG, read directly
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return resolve("");

      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as compressed, lightweight JPEG Base64
          const base64Data = canvas.toDataURL("image/jpeg", quality);
          resolve(base64Data);
        } else {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Direct client-side Base64 converter (no api routes or cloud storage needed)
 */
export const uploadDishImageToFirebase = convertImageToBase64;

/**
 * Taste Fried Chicken Live Dishes for quick seeding or fallback
 */
export const SAMPLE_RMS_DISHES: Omit<MenuItem, "id">[] = [
  {
    name: "Zinger Burger",
    description: "Crispy golden fried chicken fillet with fiery seasoning, layered with chilled iceberg lettuce and house toum mayo on a toasted brioche bun.",
    price: 15,
    groupId: "86",
    groupName: "Food",
    subgroupId: "93",
    subgroupName: "Burgers",
    badge: "CHEF'S PICK",
    image: "https://erp-accurtae.s3.ap-south-1.amazonaws.com/arcanum-rms-media/items/1793964825919-df6b42b41cef-zinger.jpg",
    dietary: ["Non-Vegetarian", "Chef's Selection", "Halal"],
    prepTime: "10 mins",
    dmOrder: 1,
  },
  {
    name: "Spicy Chicken Burger",
    description: "Spicy hand-breaded chicken breast tossed in Aleppo chili rub, smoked paprika aioli, and pickled peppers on artisan bun.",
    price: 20,
    groupId: "86",
    groupName: "Food",
    subgroupId: "93",
    subgroupName: "Burgers",
    badge: "SPICY",
    image: "/images/dish-chicken.jpg",
    dietary: ["Non-Vegetarian", "Spicy", "Halal"],
    prepTime: "10 mins",
    dmOrder: 2,
  },
  {
    name: "Double Beef Burger",
    description: "Double prime smashed beef patties with caramelized sweet shallots, melted aged cheddar, and house mustard glaze.",
    price: 25,
    groupId: "86",
    groupName: "Food",
    subgroupId: "93",
    subgroupName: "Burgers",
    badge: "SIGNATURE",
    image: "/assets/gallery/charred-lamb-chops.jpg",
    dietary: ["Non-Vegetarian", "Halal"],
    prepTime: "12 mins",
    dmOrder: 3,
  },
  {
    name: "Classic Chicken Burger",
    description: "Tender seasoned chicken fillet flame-seared, topped with crisp garden greens, sweet pickles, and signature house deli dressing.",
    price: 18,
    groupId: "86",
    groupName: "Food",
    subgroupId: "93",
    subgroupName: "Burgers",
    badge: "POPULAR",
    image: "/images/dish-chicken.jpg",
    dietary: ["Non-Vegetarian", "Halal"],
    prepTime: "10 mins",
    dmOrder: 4,
  },
  {
    name: "Fried Chicken 2 PCS",
    description: "Two pieces of crunchy heritage spiced fried chicken, ultra crisp on the outside, juicy within, served with house dip.",
    price: 15,
    groupId: "86",
    groupName: "Food",
    subgroupId: "94",
    subgroupName: "Fried Chicken",
    badge: "POPULAR",
    image: "/images/dish-chicken.jpg",
    dietary: ["Non-Vegetarian", "Halal"],
    prepTime: "10 mins",
    dmOrder: 1,
  },
  {
    name: "Chicken Tikka",
    description: "Boneless chicken morsels steeped in aromatic yogurt, coriander, and crushed spices, char-grilled to tender perfection.",
    price: 15,
    groupId: "86",
    groupName: "Food",
    subgroupId: "94",
    subgroupName: "Fried Chicken",
    badge: "CHEF'S PICK",
    image: "https://erp-accurtae.s3.ap-south-1.amazonaws.com/arcanum-rms-media/items/1793962747483-c60c3404ac23-gobi.jpg",
    dietary: ["Non-Vegetarian", "Halal"],
    prepTime: "10 mins",
    dmOrder: 2,
  },
  {
    name: "French Fries",
    description: "Triple-cooked golden potato batons lightly dusted with sea salt, served with garlic dip.",
    price: 15,
    groupId: "86",
    groupName: "Food",
    subgroupId: "99",
    subgroupName: "Fries",
    badge: "POPULAR",
    image: "/images/crispy-calamari.jpg",
    dietary: ["Vegetarian", "Halal"],
    prepTime: "8 mins",
    dmOrder: 1,
  },
  {
    name: "Iced Coffee",
    description: "Slow-extracted cold brew poured over artisan ice cubes with condensed cardamom cream and freshly frothed milk.",
    price: 15,
    groupId: "87",
    groupName: "Beverages",
    subgroupId: "97",
    subgroupName: "Cold Drinks",
    badge: "POPULAR",
    image: "/assets/gallery/roastery-cezve.jpg",
    dietary: ["Vegetarian"],
    prepTime: "5 mins",
    dmOrder: 1,
  },
  {
    name: "Chocolate Brownie",
    description: "Warm Belgian dark chocolate fudge brownie with molten center, topped with roasted Aleppo pistachios and vanilla cream.",
    price: 15,
    groupId: "88",
    groupName: "Desserts",
    subgroupId: "102",
    subgroupName: "Chocolate",
    badge: "SIGNATURE",
    image: "/images/dish-lava-cake.jpg",
    dietary: ["Vegetarian"],
    prepTime: "8 mins",
    dmOrder: 1,
  },
];

export const AUTHENTIC_LEBANESE_DISHES = SAMPLE_RMS_DISHES;

/**
 * Seeds the menu with the live Taste Fried Chicken dishes.
 */
export async function seedSampleLebaneseDishes(
  currentState: MenuDataState
): Promise<{ success: boolean; state: MenuDataState; count: number }> {
  const existingNames = new Set(
    currentState.items.map((it) => it.name.trim().toLowerCase())
  );
  const dishesToAdd = SAMPLE_RMS_DISHES.filter(
    (d) => !existingNames.has(d.name.trim().toLowerCase())
  );

  if (dishesToAdd.length === 0) {
    return { success: true, state: currentState, count: 0 };
  }

  const newDishes: MenuItem[] = dishesToAdd.map((d, index) => ({
    ...d,
    id: `dish_${Date.now()}_${index}`,
    createdAt: Date.now() + index,
  }));

  const nextState: MenuDataState = {
    ...currentState,
    items: [...currentState.items, ...newDishes],
  };

  await syncMenuState(nextState);
  return { success: true, state: nextState, count: newDishes.length };
}
