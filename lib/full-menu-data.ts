export type DietaryTag =
  | "All"
  | "Vegetarian"
  | "Non-Vegetarian"
  | "Gluten-Free"
  | "Chef's Selection"
  | "Halal"
  | "Spicy"
  | "Vegan";

export type MenuGroup = {
  id: string;
  code?: string;
  name: string; // e.g. "Food", "Beverages"
  nameLocal?: string | null;
  description?: string;
  descLocal?: string | null;
  order: number;
};

export type MenuSubgroup = {
  id: string;
  groupId: string; // e.g. "86"
  code?: string;
  name: string; // e.g. "Burgers", "Fried Chicken", "Fries"
  nameLocal?: string | null;
  description?: string;
  order: number;
  itemCount?: number;
};

export type MenuItem = {
  id: string;
  code?: string;
  name: string;
  nameLocal?: string | null;
  description: string;
  descriptionLocal?: string | null;
  price: number;
  currency?: string;
  cookingTime?: number;
  categoryId?: string | null;
  categoryName?: string | null;
  dmOrder?: number | null;
  groupId: string;
  groupName: string;
  subgroupId: string;
  subgroupName: string;
  badge?: "VEGETARIAN" | "POPULAR" | "CHEF'S PICK" | "HOUSE FAVOURITE" | "SPICY" | "SIGNATURE" | string;
  isSignature?: boolean;
  tag?: string;
  image: string;
  images?: string[];
  dietary: DietaryTag[];
  rawDietary?: {
    isVeg: boolean;
    isVegan: boolean;
    isHalal: boolean;
    isSpicy: boolean;
  };
  calories?: string;
  prepTime?: string;
  winePairing?: string;
  ingredients?: string[];
  isAvailable?: boolean;
  createdAt?: number;
};

export type MenuCategoryData = {
  id: string;
  code?: string;
  label: string;
  nameLocal?: string | null;
  icon: "signatures" | "starters" | "mains" | "pasta" | "pizza" | "salads" | "desserts" | "beverages";
  count: number;
  order: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  collectionBadge: string;
  bannerImage: string;
  items: MenuItem[];
};

export const DEFAULT_MENU_GROUPS: MenuGroup[] = [
  {
    id: "86",
    code: "GRP00",
    name: "Food",
    order: 1,
    description: "Crispy fried chicken, signature burgers, and golden fries",
  },
  {
    id: "87",
    code: "GRP01",
    name: "Beverages",
    order: 2,
    description: "Refreshing cold drinks and artisan coffees",
  },
  {
    id: "88",
    code: "GRP02",
    name: "Desserts",
    order: 3,
    description: "Rich dark chocolate brownies and sweets",
  },
  {
    id: "89",
    code: "GRP03",
    name: "Combos",
    order: 4,
    description: "Value combos and meal deals",
  },
];

export const DEFAULT_MENU_SUBGROUPS: MenuSubgroup[] = [
  {
    id: "93",
    groupId: "86",
    name: "Burgers",
    code: "SG00",
    order: 1,
    description: "Zinger, classic and specialty burgers crafted fresh.",
  },
  {
    id: "94",
    groupId: "86",
    name: "Fried Chicken",
    code: "SG01",
    order: 2,
    description: "Heritage spiced fried chicken and chicken tikka.",
  },
  {
    id: "99",
    groupId: "86",
    name: "Fries",
    code: "SG02",
    order: 3,
    description: "Triple-cooked seasoned golden fries and sides.",
  },
  {
    id: "97",
    groupId: "87",
    name: "Cold Drinks",
    code: "SG04",
    order: 1,
    description: "Refreshing cold drinks and iced coffees.",
  },
  {
    id: "102",
    groupId: "88",
    name: "Chocolate",
    code: "SGCHO",
    order: 1,
    description: "Decadent dark chocolate brownies.",
  },
];

/**
 * Builds standard MenuCategoryData array dynamically from Groups, Subgroups, and Dishes.
 * Ordered by group/subgroup order and dishes ordered by dmOrder.
 */
export function buildCategoriesFromGroups(
  groups: MenuGroup[] = DEFAULT_MENU_GROUPS,
  subgroups: MenuSubgroup[] = DEFAULT_MENU_SUBGROUPS,
  items: MenuItem[] = []
): MenuCategoryData[] {
  if (!subgroups || subgroups.length === 0) {
    // Sort items by dmOrder
    const sortedItems = [...items].sort((a, b) => (a.dmOrder ?? 999) - (b.dmOrder ?? 999));
    return [
      {
        id: "all",
        label: "All Selections",
        icon: "signatures",
        count: sortedItems.length,
        order: 1,
        eyebrow: "TASTE FRIED CHICKEN",
        title: "Digital Menu",
        subtitle: "Explore our freshly prepared creations",
        collectionBadge: "TFC MENU",
        bannerImage: "/images/dish-chicken.jpg",
        items: sortedItems,
      },
    ];
  }

  // Sort groups by cat.order
  const sortedGroups = [...groups].sort((a, b) => (a.order || 0) - (b.order || 0));

  const categories: MenuCategoryData[] = [];

  sortedGroups.forEach((group, grpIdx) => {
    const groupSubgroups = subgroups
      .filter((s) => s.groupId === group.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (groupSubgroups.length === 0) {
      // Group with direct items
      const groupItems = items
        .filter((it) => it.groupId === group.id || it.groupName?.toLowerCase() === group.name.toLowerCase())
        .sort((a, b) => (a.dmOrder ?? 999) - (b.dmOrder ?? 999));

      categories.push({
        id: group.id,
        code: group.code,
        label: group.name,
        nameLocal: group.nameLocal,
        icon: getCategoryIcon(group.name),
        count: groupItems.length,
        order: group.order || grpIdx + 1,
        eyebrow: "TASTE FRIED CHICKEN",
        title: group.name,
        subtitle: group.description || `Freshly prepared ${group.name.toLowerCase()} crafted to order.`,
        collectionBadge: `${group.name.toUpperCase()} SELECTION`,
        bannerImage: getCategoryBanner(group.name),
        items: groupItems,
      });
      return;
    }

    groupSubgroups.forEach((sub, subIdx) => {
      const subItems = items
        .filter((item) => {
          if (item.subgroupId) return item.subgroupId === sub.id;
          return item.groupId === group.id;
        })
        .sort((a, b) => (a.dmOrder ?? 999) - (b.dmOrder ?? 999));

      categories.push({
        id: sub.id,
        code: sub.code,
        label: sub.name,
        nameLocal: sub.nameLocal,
        icon: getCategoryIcon(sub.name),
        count: subItems.length,
        order: (group.order || 1) * 10 + (sub.order || subIdx + 1),
        eyebrow: group.name.toUpperCase(),
        title: sub.name,
        subtitle: sub.description || `Freshly prepared ${sub.name.toLowerCase()} made to order.`,
        collectionBadge: `${sub.name.toUpperCase()} COLLECTION`,
        bannerImage: getCategoryBanner(sub.name),
        items: subItems,
      });
    });
  });

  return categories;
}

function getCategoryIcon(name: string): MenuCategoryData["icon"] {
  const lower = name.toLowerCase();
  if (lower.includes("burger") || lower.includes("chicken") || lower.includes("food")) return "mains";
  if (lower.includes("bever") || lower.includes("drink") || lower.includes("coffee")) return "beverages";
  if (lower.includes("dessert") || lower.includes("brownie") || lower.includes("sweet")) return "desserts";
  if (lower.includes("fries") || lower.includes("starter") || lower.includes("appetizer")) return "starters";
  return "signatures";
}

function getCategoryBanner(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("dessert") || lower.includes("brownie") || lower.includes("chocolate")) {
    return "/images/dish-lava-cake.jpg";
  }
  if (lower.includes("bever") || lower.includes("drink") || lower.includes("coffee")) {
    return "/assets/gallery/roastery-cezve.jpg";
  }
  if (lower.includes("fries") || lower.includes("side")) {
    return "/images/crispy-calamari.jpg";
  }
  return "/images/dish-chicken.jpg";
}

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: "119",
    code: "GIB-119",
    name: "Zinger Burger",
    nameLocal: "برجر زنجر",
    description: "Crispy golden fried chicken fillet with fiery seasoning, layered with chilled iceberg lettuce and house toum mayo on a toasted brioche bun.",
    price: 15,
    currency: "AED",
    cookingTime: 10,
    groupId: "86",
    groupName: "Food",
    subgroupId: "93",
    subgroupName: "Burgers",
    badge: "CHEF'S PICK",
    image: "https://erp-accurtae.s3.ap-south-1.amazonaws.com/arcanum-rms-media/items/1793964825919-df6b42b41cef-zinger.jpg",
    dietary: ["Non-Vegetarian", "Chef's Selection", "Halal"],
    rawDietary: { isVeg: false, isVegan: false, isHalal: true, isSpicy: true },
    dmOrder: 1,
  },
  {
    id: "107",
    code: "GIB-107",
    name: "Spicy Chicken Burger",
    nameLocal: "برجر دجاج حار",
    description: "Spicy hand-breaded chicken breast tossed in Aleppo chili rub, smoked paprika aioli, and pickled peppers on artisan bun.",
    price: 20,
    currency: "AED",
    cookingTime: 10,
    groupId: "86",
    groupName: "Food",
    subgroupId: "93",
    subgroupName: "Burgers",
    badge: "SPICY",
    image: "/images/dish-chicken.jpg",
    dietary: ["Non-Vegetarian", "Spicy", "Halal"],
    rawDietary: { isVeg: false, isVegan: false, isHalal: true, isSpicy: true },
    dmOrder: 2,
  },
  {
    id: "109",
    code: "GIB-109",
    name: "Double Beef Burger",
    nameLocal: "برجر لحم بقري مزدوج",
    description: "Double prime smashed beef patties with caramelized sweet shallots, melted aged cheddar, and house mustard glaze.",
    price: 25,
    currency: "AED",
    cookingTime: 12,
    groupId: "86",
    groupName: "Food",
    subgroupId: "93",
    subgroupName: "Burgers",
    badge: "SIGNATURE",
    image: "/assets/gallery/charred-lamb-chops.jpg",
    dietary: ["Non-Vegetarian", "Halal"],
    rawDietary: { isVeg: false, isVegan: false, isHalal: true, isSpicy: false },
    dmOrder: 3,
  },
  {
    id: "106",
    code: "GIB-106",
    name: "Classic Chicken Burger",
    nameLocal: "برجر دجاج كلاسيك",
    description: "Tender seasoned chicken fillet flame-seared, topped with crisp garden greens, sweet pickles, and signature house deli dressing.",
    price: 18,
    currency: "AED",
    cookingTime: 10,
    groupId: "86",
    groupName: "Food",
    subgroupId: "93",
    subgroupName: "Burgers",
    badge: "POPULAR",
    image: "/images/dish-chicken.jpg",
    dietary: ["Non-Vegetarian", "Halal"],
    rawDietary: { isVeg: false, isVegan: false, isHalal: true, isSpicy: false },
    dmOrder: 4,
  },
  {
    id: "111",
    code: "GIB-111",
    name: "Fried Chicken 2 PCS",
    nameLocal: "دجاج مقلي قطعتين",
    description: "Two pieces of crunchy heritage spiced fried chicken, ultra crisp on the outside, juicy within, served with house dip.",
    price: 15,
    currency: "AED",
    cookingTime: 10,
    groupId: "86",
    groupName: "Food",
    subgroupId: "94",
    subgroupName: "Fried Chicken",
    badge: "POPULAR",
    image: "/images/dish-chicken.jpg",
    dietary: ["Non-Vegetarian", "Halal"],
    rawDietary: { isVeg: false, isVegan: false, isHalal: true, isSpicy: false },
    dmOrder: 1,
  },
  {
    id: "112",
    code: "GIB-112",
    name: "Chicken Tikka",
    nameLocal: "دجاج تيكا",
    description: "Boneless chicken morsels steeped in aromatic yogurt, coriander, and crushed spices, char-grilled to tender perfection.",
    price: 15,
    currency: "AED",
    cookingTime: 10,
    groupId: "86",
    groupName: "Food",
    subgroupId: "94",
    subgroupName: "Fried Chicken",
    badge: "CHEF'S PICK",
    image: "https://erp-accurtae.s3.ap-south-1.amazonaws.com/arcanum-rms-media/items/1793962747483-c60c3404ac23-gobi.jpg",
    dietary: ["Non-Vegetarian", "Halal"],
    rawDietary: { isVeg: false, isVegan: false, isHalal: true, isSpicy: false },
    dmOrder: 2,
  },
  {
    id: "113",
    code: "GIB-113",
    name: "French Fries",
    nameLocal: "بطاطس مقلية",
    description: "Triple-cooked golden potato batons lightly dusted with sea salt, served with garlic dip.",
    price: 15,
    currency: "AED",
    cookingTime: 8,
    groupId: "86",
    groupName: "Food",
    subgroupId: "99",
    subgroupName: "Fries",
    badge: "POPULAR",
    image: "/images/crispy-calamari.jpg",
    dietary: ["Vegetarian", "Halal"],
    rawDietary: { isVeg: true, isVegan: true, isHalal: true, isSpicy: false },
    dmOrder: 1,
  },
  {
    id: "118",
    code: "GIB-118",
    name: "Iced Coffee",
    nameLocal: "قهوة مثلجة",
    description: "Slow-extracted cold brew poured over artisan ice cubes with condensed cardamom cream and freshly frothed milk.",
    price: 15,
    currency: "AED",
    cookingTime: 5,
    groupId: "87",
    groupName: "Beverages",
    subgroupId: "97",
    subgroupName: "Cold Drinks",
    badge: "POPULAR",
    image: "/assets/gallery/roastery-cezve.jpg",
    dietary: ["Vegetarian"],
    rawDietary: { isVeg: true, isVegan: false, isHalal: true, isSpicy: false },
    dmOrder: 1,
  },
  {
    id: "117",
    code: "GIB-117",
    name: "Chocolate Brownie",
    nameLocal: "براوني الشوكولاتة",
    description: "Warm Belgian dark chocolate fudge brownie with molten center, topped with roasted Aleppo pistachios and vanilla cream.",
    price: 15,
    currency: "AED",
    cookingTime: 8,
    groupId: "88",
    groupName: "Desserts",
    subgroupId: "102",
    subgroupName: "Chocolate",
    badge: "SIGNATURE",
    image: "/images/dish-lava-cake.jpg",
    dietary: ["Vegetarian"],
    rawDietary: { isVeg: true, isVegan: false, isHalal: true, isSpicy: false },
    dmOrder: 1,
  },
];

export const FULL_MENU_CATEGORIES: MenuCategoryData[] = buildCategoriesFromGroups(
  DEFAULT_MENU_GROUPS,
  DEFAULT_MENU_SUBGROUPS,
  DEFAULT_MENU_ITEMS
);
