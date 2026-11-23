import type { IconName } from "@/components/icons";

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Gallery", href: "/gallery" },
  { label: "Reservation", href: "/reservation" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const pillars: { title: string; caption: string; icon: IconName }[] = [
  {
    title: "Fresh Ingredients",
    caption: "Always",
    icon: "sun",
  },
  {
    title: "Authentic",
    caption: "Recipes",
    icon: "book",
  },
  {
    title: "Elegant",
    caption: "Ambience",
    icon: "facade",
  },
  {
    title: "Memorable",
    caption: "Experiences",
    icon: "heart",
  },
];

export type RestaurantLocation = {
  id: string;
  city: string;
  district: string;
  country: string;
  address: string;
  hours: string;
  phone: string;
  badge?: string;
  mapUrl: string;
};

export const restaurantLocations: RestaurantLocation[] = [
  {
    id: "bahrain",
    city: "Bahrain",
    district: "Block 338, Adliya",
    country: "Kingdom of Bahrain",
    address: "Road 3819, Block 338, Adliya, Manama",
    hours: "12:00 PM – 11:00 PM (Daily)",
    phone: "+973 1771 4567",
    badge: "Flagship House",
    mapUrl: "https://maps.google.com/?q=Block+338+Adliya+Bahrain",
  },
  {
    id: "abu-dhabi",
    city: "Abu Dhabi",
    district: "Al Maryah Island",
    country: "United Arab Emirates",
    address: "The Galleria Promenade, Al Maryah Island",
    hours: "12:00 PM – 12:00 AM (Daily)",
    phone: "+971 2 645 8920",
    badge: "Waterfront Lounge",
    mapUrl: "https://maps.google.com/?q=The+Galleria+Al+Maryah+Island+Abu+Dhabi",
  },
  {
    id: "beirut",
    city: "Beirut",
    district: "Saifi Village",
    country: "Lebanon",
    address: "Quartier des Arts, Saifi Village, Beirut",
    hours: "1:00 PM – 11:30 PM (Daily)",
    phone: "+961 1 980 120",
    badge: "Artisan Courtyard",
    mapUrl: "https://maps.google.com/?q=Saifi+Village+Beirut+Lebanon",
  },
];


export type Dish = {
  id: string;
  name: string;
  nameLocal?: string;
  description: string;
  price: string;
  image: string;
  tag?: string;
  dmOrder?: number;
};

export const signatureDishes: Dish[] = [
  {
    id: "119",
    name: "Zinger Burger",
    description:
      "Crispy golden fried chicken fillet with fiery seasoning, layered with chilled iceberg lettuce and house toum mayo on a toasted brioche bun.",
    price: "AED 15.00",
    image: "https://erp-accurtae.s3.ap-south-1.amazonaws.com/arcanum-rms-media/items/1793964825919-df6b42b41cef-zinger.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIATIQGTY745M4RS4FP%2F20261123%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20261123T100255Z&X-Amz-Expires=3600&X-Amz-Signature=e0a023aae9832b9b97b5649c005c939aef0cd27c7236169c7fc81cc3eb83ec24&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    tag: "Chef's Pick",
    dmOrder: 1,
  },
  {
    id: "107",
    name: "Spicy Chicken Burger",
    description:
      "Spicy hand-breaded chicken breast tossed in Aleppo chili rub, smoked paprika aioli, and pickled peppers on artisan bun.",
    price: "AED 20.00",
    image: "/images/dish-chicken.jpg",
    tag: "Spicy",
    dmOrder: 2,
  },
  {
    id: "109",
    name: "Double Beef Burger",
    description:
      "Double prime smashed beef patties with caramelized sweet shallots, melted aged cheddar, and house mustard glaze.",
    price: "AED 25.00",
    image: "/assets/gallery/charred-lamb-chops.jpg",
    tag: "Signature",
    dmOrder: 3,
  },
  {
    id: "111",
    name: "Fried Chicken 2 PCS",
    description:
      "Two pieces of crunchy heritage spiced fried chicken, ultra crisp on the outside, juicy within, served with house dip.",
    price: "AED 15.00",
    image: "/images/dish-chicken.jpg",
    tag: "Popular",
    dmOrder: 4,
  },
  {
    id: "112",
    name: "Chicken Tikka",
    description:
      "Boneless chicken morsels steeped in aromatic yogurt, coriander, and crushed spices, char-grilled to tender perfection.",
    price: "AED 15.00",
    image: "https://erp-accurtae.s3.ap-south-1.amazonaws.com/arcanum-rms-media/items/1793962747483-c60c3404ac23-gobi.jpg",
    tag: "House Favourite",
    dmOrder: 5,
  },
  {
    id: "117",
    name: "Chocolate Brownie",
    description:
      "Warm Belgian dark chocolate fudge brownie with molten center, topped with roasted Aleppo pistachios and vanilla cream.",
    price: "AED 15.00",
    image: "/images/dish-lava-cake.jpg",
    tag: "Dessert",
    dmOrder: 6,
  },
];

export type MenuCategory = {
  id: string;
  label: string;
  intro: string;
  order?: number;
  items: { name: string; note: string; price: string; id?: string; dmOrder?: number }[];
};

export const menuCategories: MenuCategory[] = [
  {
    id: "burgers",
    label: "Burgers",
    order: 1,
    intro: "Zinger, classic, double beef, and specialty chicken burgers crafted fresh to order.",
    items: [
      { id: "119", name: "Zinger Burger", note: "Crispy chicken fillet, iceberg lettuce, signature mayo", price: "AED 15.00", dmOrder: 1 },
      { id: "107", name: "Spicy Chicken Burger", note: "Hand-breaded spicy chicken, smoked paprika aioli", price: "AED 20.00", dmOrder: 2 },
      { id: "109", name: "Double Beef Burger", note: "Double smashed beef patties, cheddar, shallots", price: "AED 25.00", dmOrder: 3 },
      { id: "106", name: "Classic Chicken Burger", note: "Tender seasoned chicken fillet, garden greens", price: "AED 18.00", dmOrder: 4 },
    ],
  },
  {
    id: "fried-chicken",
    label: "Fried Chicken & Grills",
    order: 2,
    intro: "Heritage recipe crispy fried chicken and skewered chicken tikka.",
    items: [
      { id: "111", name: "Fried Chicken 2 PCS", note: "Two pieces crunchy spiced fried chicken with dip", price: "AED 15.00", dmOrder: 1 },
      { id: "112", name: "Chicken Tikka", note: "Boneless chicken steeped in spiced yogurt, char-grilled", price: "AED 15.00", dmOrder: 2 },
    ],
  },
  {
    id: "sides",
    label: "Sides & Fries",
    order: 3,
    intro: "Golden seasoned potato fries and savory sides to accompany your feast.",
    items: [
      { id: "113", name: "French Fries", note: "Triple-cooked golden potato batons with sea salt & dip", price: "AED 15.00", dmOrder: 1 },
    ],
  },
  {
    id: "beverages",
    label: "Beverages",
    order: 4,
    intro: "Cold drinks, refreshments, and artisan slow-extracted iced coffees.",
    items: [
      { id: "118", name: "Iced Coffee", note: "Slow-extracted cold brew with condensed cardamom cream", price: "AED 15.00", dmOrder: 1 },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    order: 5,
    intro: "Decadent dark chocolate brownies and indulgent sweet finishes.",
    items: [
      { id: "117", name: "Chocolate Brownie", note: "Warm Belgian dark chocolate fudge brownie with molten center", price: "AED 15.00", dmOrder: 1 },
    ],
  },
];

export const marqueeItems = [
  "Warm Bread",
  "Strong Coffee",
  "For The Other Half Of Your Hunger",
  "Modern Lebanese Deli",
  "Plates Passed & Stories Unfolded",
  "You Are The & Co.",
];

/**
 * Scroll-linked narrative for the pinned "A Culinary Journey" sequence.
 * Each slide reveals in turn as the frame sequence scrubs forward.
 */
export const journeySlides = [
  {
    eyebrow: "Exquisite Flavors • Sophisticated Ambience",
    line1: "A Culinary Journey",
    line2: "Like No Other",
    body: "At Gibran & Co., every dish tells a story. A harmony of fine ingredients, timeless recipes and a passion for exceptional dining.",
    label: "Chef's Tasting Edition",
  },
  {
    eyebrow: "Sourced Daily • Terraces Above Bsharri",
    line1: "Picked Before",
    line2: "The Sun Lifts",
    body: "Herbs cut at first light, olives turned the day they fall, cheese still warm from the village oven. Nothing waits on a shelf longer than it should.",
    label: "Seasonal Mezza Service",
  },
  {
    eyebrow: "Charcoal • Vine Cuttings • Stone Oven",
    line1: "Fire, Salt",
    line2: "And Patience",
    body: "The grill decides the crust. Bread is baked against hot stone, and every sauce is given the time it asks for — unhurried, because the best things are.",
    label: "The Wood-Fired Grill",
  },
  {
    eyebrow: "Cellar Chosen • Plate By Plate",
    line1: "Every Plate",
    line2: "Tells A Story",
    body: "A Lebanese reserve, an old-vintage Burgundy, a Bedouin coffee poured at the close. Pairings that arrive before anyone thinks to ask.",
    label: "The Cellar Pairing",
  },
];

export const infoStrip: {
  label: string;
  value: string;
  icon: IconName;
  id?: string;
}[] = [
    {
      label: "Location",
      value: "Bahrain / Abu Dhabi & Beirut",
      icon: "pin",
    },
    {
      label: "Open Hours",
      value: "12:00 PM – 11:00 PM (Daily)",
      icon: "clock",
    },
    {
      label: "Call Us",
      value: "+973 123 4567",
      icon: "phone",
      id: "contact",
    },
  ];
