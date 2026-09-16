import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// TODO(backend): this module is not registered in backend/src/server.js yet,
// so the seed data below is still the source of truth. Flip to true once it is.
const BACKEND_SERVES_THIS = false;

// TEMPORARY: seed data lives here until the backend serves it.
// Once BACKEND_URL is available, delete this and use the fetch below.
const PLACEHOLDER_PRODUCTS = [
  {
    productId: "40131171",
    name: "Premium Care Diaper Pants - Extra Large, 12-17 kg, Lotion with Aloe Vera",
    description:
      "Pampers Premium Care Pants provide cottony softness, soothing aloe vera lotion, a wetness indicator, breathable comfort, and leak protection.",
    brand: "Pampers",
    quantity: "11 pcs",
    category: "Baby Care",
    subcategory: "Diapers",
    price: 26.63,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e161468f.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/40131171/pampers-premium-care-diaper-pants-with-wetness-indicator-cottony-soft-xl-11-pcs/",
    attributes: [
      { k: "size", v: "XL" },
      { k: "weightRange", v: "12-17", u: "kg" },
      { k: "feature", v: "Lotion with Aloe Vera" },
      { k: "feature", v: "Wetness Indicator" },
      { k: "feature", v: "12-hour Leak Lock" },
      { k: "feature", v: "Disposal Tape" },
    ],
    reviews: [
      {
        userId: "CUST-10001",
        review: "Soft and comfortable, with a helpful wetness indicator.",
        verified: true,
      },
      {
        userId: "CUST-10002",
        review: "Good overnight protection and an easy-to-use design.",
        verified: true,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "100316308",
    name: "Baby Lotion",
    description:
      "Himalaya Baby Lotion is a fast-absorbing daily moisturizer enriched with olive oil, almond oil, yashtimadhu, and country mallow.",
    brand: "Himalaya Baby",
    quantity: "200 ml",
    category: "Baby Care",
    subcategory: "Baby Creams & Lotions",
    price: 38.4,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e161479e.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/100316308/himalaya-baby-baby-lotion-200-ml/",
    attributes: [
      { k: "ingredient", v: "Olive Oil" },
      { k: "ingredient", v: "Almond Oil" },
      { k: "ingredient", v: "Yashtimadhu" },
      { k: "ingredient", v: "Country Mallow" },
      { k: "use", v: "Daily moisturizer" },
    ],
    reviews: [
      {
        userId: "CUST-10003",
        review: "The lotion absorbs quickly and leaves skin feeling soft.",
        verified: true,
      },
      {
        userId: "CUST-10004",
        review: "Gentle texture for everyday use.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "20002821",
    name: "Baby Lotion",
    description:
      "Himalaya Baby Lotion is a fast-absorbing daily moisturizer enriched with olive oil, almond oil, yashtimadhu, and country mallow.",
    brand: "Himalaya Baby",
    quantity: "400 ml",
    category: "Baby Care",
    subcategory: "Baby Creams & Lotions",
    price: 8.15,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e161479f.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/20002821/himalaya-baby-baby-lotion-400-ml/",
    attributes: [
      { k: "ingredient", v: "Olive Oil" },
      { k: "ingredient", v: "Almond Oil" },
      { k: "ingredient", v: "Yashtimadhu" },
      { k: "ingredient", v: "Country Mallow" },
      { k: "use", v: "Daily moisturizer" },
    ],
    reviews: [
      {
        userId: "CUST-10005",
        review: "The larger bottle is convenient and moisturizes well.",
        verified: true,
      },
      {
        userId: "CUST-10006",
        review: "Light texture that works well as a daily moisturizer.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "40013478",
    name: "Baby Lotion",
    description:
      "Himalaya Baby Lotion is a fast-absorbing daily moisturizer enriched with olive oil, almond oil, yashtimadhu, and country mallow.",
    brand: "Himalaya Baby",
    quantity: "100 ml",
    category: "Baby Care",
    subcategory: "Baby Creams & Lotions",
    price: 38.16,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16147a0.jpg",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/40013478/himalaya-baby-baby-lotion-100-ml-bottle/",
    attributes: [
      { k: "ingredient", v: "Olive Oil" },
      { k: "ingredient", v: "Almond Oil" },
      { k: "ingredient", v: "Yashtimadhu" },
      { k: "ingredient", v: "Country Mallow" },
      { k: "use", v: "Daily moisturizer" },
    ],
    reviews: [
      {
        userId: "CUST-10007",
        review: "The small bottle is convenient for travel and daily use.",
        verified: true,
      },
      {
        userId: "CUST-10008",
        review: "It absorbs quickly without feeling greasy.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "100526377",
    name: "Baby Powder",
    description:
      "Himalaya Baby Powder uses herbal ingredients to help keep delicate baby skin cool, comfortable, fresh, and dry.",
    brand: "Himalaya Baby",
    quantity: "400 g",
    category: "Baby Care",
    subcategory: "Baby Powder",
    price: 29.38,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e161483e.jpg",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/100526377/himalaya-baby-baby-powder-400-g/",
    attributes: [
      { k: "ingredient", v: "Khus-grass" },
      { k: "ingredient", v: "Yashada Bhasma" },
      { k: "ingredient", v: "Olive" },
      { k: "ingredient", v: "Sandal" },
      { k: "feature", v: "Cooling and soothing care" },
    ],
    reviews: [
      {
        userId: "CUST-10001",
        review: "The powder is easy to apply and keeps skin feeling fresh.",
        verified: true,
      },
      {
        userId: "CUST-10002",
        review: "The cooling feel is useful after a bath.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "100014839",
    name: "Baby Powder",
    description:
      "Himalaya Baby Powder uses herbal ingredients to help keep delicate baby skin cool, comfortable, fresh, and dry.",
    brand: "Himalaya Baby",
    quantity: "100 g",
    category: "Baby Care",
    subcategory: "Baby Powder",
    price: 19.4,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e161483f.jpg",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/100014839/himalaya-baby-baby-powder-100-g-bottle/",
    attributes: [
      { k: "ingredient", v: "Khus-grass" },
      { k: "ingredient", v: "Yashada Bhasma" },
      { k: "ingredient", v: "Olive" },
      { k: "ingredient", v: "Sandal" },
      { k: "feature", v: "Cooling and soothing care" },
    ],
    reviews: [
      {
        userId: "CUST-10003",
        review: "A convenient small pack for regular baby-care routines.",
        verified: true,
      },
      {
        userId: "CUST-10004",
        review: "The powder has a soft texture and mild fragrance.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "1206304",
    name: "Bathing Bar Soap - Germ Protection, Original",
    description:
      "Dettol Original Bathing Bar provides antibacterial germ protection, freshness, and moisturization for everyday personal hygiene.",
    brand: "Dettol",
    quantity: "8x125 g",
    category: "Beauty & Hygiene",
    subcategory: "Bathing Bars & Soaps",
    price: 4.18,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145a4.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/1206304/dettol-bathing-bar-soap-germ-protection-original-8x125-g/",
    attributes: [
      { k: "variant", v: "Original" },
      { k: "formula", v: "Antibacterial germ protection" },
      { k: "feature", v: "Dermatologically tested" },
    ],
    reviews: [
      {
        userId: "CUST-10005",
        review: "The soap has a fresh scent and leaves a clean feeling.",
        verified: true,
      },
      {
        userId: "CUST-10006",
        review: "The multipack is useful for keeping extra bars at home.",
        verified: true,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "100008548",
    name: "Original Bathing Bar Soap, Daily Protection from Germs",
    description:
      "Dettol Original Bathing Soap provides antibacterial germ protection, freshness, and moisturization for everyday personal hygiene.",
    brand: "Dettol",
    quantity: "125 g",
    category: "Beauty & Hygiene",
    subcategory: "Bathing Bars & Soaps",
    price: 18.08,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145a6.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/100008548/dettol-original-bathing-soap-bar-with-76-tfm-protects-from-germs-125-g/",
    attributes: [
      { k: "variant", v: "Original" },
      { k: "formula", v: "Antibacterial germ protection" },
      { k: "tfm", v: "76", u: "%" },
    ],
    reviews: [
      {
        userId: "CUST-10007",
        review: "A reliable everyday soap with a fresh, clean feel.",
        verified: true,
      },
      {
        userId: "CUST-10008",
        review: "The bar lasts well with regular use.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "1200377",
    name: "Bathing Soap - Original",
    description:
      "Dettol Original Bar Soap is a mild soap with a fresh fragrance and antibacterial agents for everyday cleansing.",
    brand: "Dettol",
    quantity: "4x125 g",
    category: "Beauty & Hygiene",
    subcategory: "Bathing Bars & Soaps",
    price: 18.47,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145a7.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/1200377/dettol-bathing-soap-original-4x125-g/",
    attributes: [
      { k: "variant", v: "Original" },
      { k: "formula", v: "Antibacterial germ protection" },
      { k: "feature", v: "Fresh fragrance" },
    ],
    reviews: [
      {
        userId: "CUST-10001",
        review: "The original scent is fresh and familiar.",
        verified: true,
      },
      {
        userId: "CUST-10002",
        review: "The soap lathers well and rinses cleanly.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "1203036",
    name: "Bathing Soap - Original",
    description:
      "Dettol Original Bar Soap is a mild soap with a fresh fragrance and antibacterial agents for everyday cleansing.",
    brand: "Dettol",
    quantity: "2x125 g",
    category: "Beauty & Hygiene",
    subcategory: "Bathing Bars & Soaps",
    price: 6.6,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145a8.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/1203036/dettol-bathing-soap-original-2x125-g/",
    attributes: [
      { k: "variant", v: "Original" },
      { k: "formula", v: "Antibacterial germ protection" },
      { k: "feature", v: "Fresh fragrance" },
    ],
    reviews: [
      {
        userId: "CUST-10003",
        review: "A practical two-bar pack for everyday bathing.",
        verified: true,
      },
      {
        userId: "CUST-10004",
        review: "Leaves a clean feeling and rinses easily.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "1206303",
    name: "Bathing Bar Soap - Germ Protection, Original",
    description:
      "Dettol Original Bathing Bar provides antibacterial germ protection, freshness, and moisturization for everyday personal hygiene.",
    brand: "Dettol",
    quantity: "6x125 g",
    category: "Beauty & Hygiene",
    subcategory: "Bathing Bars & Soaps",
    price: 17.02,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145a9.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/1206303/dettol-bathing-bar-soap-germ-protection-original-6x125-g/",
    attributes: [
      { k: "variant", v: "Original" },
      { k: "formula", v: "Antibacterial germ protection" },
      { k: "feature", v: "Dermatologically tested" },
    ],
    reviews: [
      {
        userId: "CUST-10005",
        review: "The larger multipack is convenient for the household.",
        verified: true,
      },
      {
        userId: "CUST-10006",
        review: "The bar has a fresh scent and holds up well between uses.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "1205003",
    name: "Toothpaste - Strong Teeth, Dental Cream, Anti Cavity",
    description:
      "Colgate Strong Teeth toothpaste uses Calcium Boost and Arginine technology to help protect against cavities, strengthen teeth, and freshen breath.",
    brand: "Colgate",
    quantity: "2x300 g",
    category: "Beauty & Hygiene",
    subcategory: "Toothpaste",
    price: 48.47,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145ac.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/1205003/colgate-toothpaste-strong-teeth-dental-cream-anti-cavity-2x300-g/",
    attributes: [
      { k: "formula", v: "Calcium Boost + Arginine" },
      { k: "benefit", v: "Anti-cavity protection" },
      { k: "benefit", v: "Stronger teeth" },
      { k: "benefit", v: "Freshens breath" },
      { k: "dietaryClaim", v: "Vegan" },
      { k: "dietaryClaim", v: "Gluten-free" },
    ],
    reviews: [
      {
        userId: "CUST-10007",
        review: "Leaves a clean taste and works well for twice-daily brushing.",
        verified: true,
      },
      {
        userId: "CUST-10008",
        review: "The multipack is convenient for the family.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "40097081",
    name: "Matic Detergent Washing Powder - Front Load",
    description:
      "Ariel Matic Front Load detergent powder is designed for fully automatic front-loading machines and provides deep cleaning, stain removal, and freshness.",
    brand: "Ariel",
    quantity: "1 kg",
    category: "Cleaning & Household",
    subcategory: "Detergent Powder, Liquid",
    price: 14.02,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e1614765.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/40097081/ariel-matic-detergent-washing-powder-front-load-1-kg/",
    attributes: [
      { k: "machineType", v: "Front load" },
      { k: "form", v: "Powder" },
      { k: "feature", v: "Tough stain removal" },
      { k: "compatibility", v: "Fully automatic washing machines" },
    ],
    reviews: [
      {
        userId: "CUST-10001",
        review: "Cleans everyday stains well in my front-load machine.",
        verified: true,
      },
      {
        userId: "CUST-10002",
        review: "The one-kilogram pack is convenient to try.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "40097083",
    name: "Detergent Washing Powder - Matic Front Load",
    description:
      "Ariel Matic Front Load detergent powder is designed for fully automatic front-loading machines and provides deep cleaning, stain removal, and freshness.",
    brand: "Ariel",
    quantity: "2 kg",
    category: "Cleaning & Household",
    subcategory: "Detergent Powder, Liquid",
    price: 42.59,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e1614766.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/40097083/ariel-detergent-washing-powder-matic-front-load-2-kg/",
    attributes: [
      { k: "machineType", v: "Front load" },
      { k: "form", v: "Powder" },
      { k: "feature", v: "Tough stain removal" },
      { k: "feature", v: "Bright Guard technology" },
      { k: "compatibility", v: "Fully automatic washing machines" },
    ],
    reviews: [
      {
        userId: "CUST-10003",
        review: "The powder dissolves properly and leaves clothes fresh.",
        verified: true,
      },
      {
        userId: "CUST-10004",
        review: "Good cleaning performance for regular laundry loads.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "40097085",
    name: "Washing Detergent Powder - Matic Front Load",
    description:
      "Ariel Matic Front Load detergent powder is designed for fully automatic front-loading machines and provides deep cleaning, stain removal, and freshness.",
    brand: "Ariel",
    quantity: "500 g",
    category: "Cleaning & Household",
    subcategory: "Detergent Powder, Liquid",
    price: 30.6,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e1614767.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/40097085/ariel-washing-detergent-powder-matic-front-load-500-g/",
    attributes: [
      { k: "machineType", v: "Front load" },
      { k: "form", v: "Powder" },
      { k: "feature", v: "Tough stain removal" },
      { k: "compatibility", v: "Fully automatic washing machines" },
    ],
    reviews: [
      {
        userId: "CUST-10005",
        review: "Works well for front-load washing and regular stains.",
        verified: true,
      },
      {
        userId: "CUST-10006",
        review: "The smaller pack is convenient for limited storage space.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "40106413",
    name: "Matic Front Load Detergent Washing Powder",
    description:
      "Ariel Matic Front Load detergent powder is designed for fully automatic front-loading machines and provides deep cleaning, stain removal, and freshness.",
    brand: "Ariel",
    quantity: "4 kg",
    category: "Cleaning & Household",
    subcategory: "Detergent Powder, Liquid",
    price: 22.48,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e1614768.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/40106413/ariel-matic-front-load-detergent-washing-powder-4-kg/",
    attributes: [
      { k: "machineType", v: "Front load" },
      { k: "form", v: "Powder" },
      { k: "feature", v: "Tough stain removal" },
      { k: "feature", v: "Bright clean technology" },
      { k: "compatibility", v: "Fully automatic washing machines" },
    ],
    reviews: [
      {
        userId: "CUST-10007",
        review: "The larger pack is convenient for a busy household.",
        verified: true,
      },
      {
        userId: "CUST-10008",
        review: "Good stain removal and freshness in a front-load machine.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "212128",
    name: "Matic Top Load Detergent Powder",
    description:
      "Surf Excel Matic Top Load detergent powder is formulated for top-loading machines to remove tough stains without pre-soaking or scrubbing.",
    brand: "Surf Excel",
    quantity: "2 kg",
    category: "Cleaning & Household",
    subcategory: "Detergent Powder, Liquid",
    price: 33.42,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16147fe.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/212128/surf-excel-matic-top-load-detergent-powder-2-kg/",
    attributes: [
      { k: "machineType", v: "Top load" },
      { k: "form", v: "Powder" },
      { k: "feature", v: "Tough stain removal" },
      { k: "feature", v: "No pre-soaking required" },
      { k: "waterLevel", v: "40", u: "L" },
      { k: "compatibility", v: "Fully automatic washing machines" },
    ],
    reviews: [
      {
        userId: "CUST-10001",
        review: "Works well in my top-load machine without pre-soaking.",
        verified: true,
      },
      {
        userId: "CUST-10002",
        review: "The powder dissolves well and handles regular laundry stains.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "40171081",
    name: "Matic Detergent Powder - Top Load",
    description:
      "Surf Excel Matic Top Load detergent powder is formulated for top-loading machines to remove tough stains without pre-soaking or scrubbing.",
    brand: "Surf Excel",
    quantity: "4 kg",
    category: "Cleaning & Household",
    subcategory: "Detergent Powder, Liquid",
    price: 44.16,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16147ff.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/40171081/surf-excel-matic-top-load-detergent-powder-3-kg/",
    attributes: [
      { k: "machineType", v: "Top load" },
      { k: "form", v: "Powder" },
      { k: "feature", v: "Tough stain removal" },
      { k: "feature", v: "No pre-soaking required" },
      { k: "waterLevel", v: "40", u: "L" },
      { k: "compatibility", v: "Fully automatic washing machines" },
    ],
    reviews: [
      {
        userId: "CUST-10003",
        review: "The large pack is good value for frequent laundry loads.",
        verified: true,
      },
      {
        userId: "CUST-10004",
        review: "Works well in a top-load machine and leaves clothes fresh.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "1214632",
    name: "Carbon Zinc Battery Red HD AA 1015",
    description:
      "Eveready Carbon Zinc AA batteries provide reliable, leak-proof power for regular-drain household devices.",
    brand: "Eveready",
    quantity: "2 x 10 pcs",
    category: "Kitchen, Garden & Pets",
    subcategory: "Battery & Electrical",
    price: 14.44,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145c5.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/1214632/eveready-carbon-zinc-battery-red-hd-aa-1015-2-x-10-pcs/",
    attributes: [
      { k: "chemistry", v: "Carbon Zinc" },
      { k: "batterySize", v: "AA" },
      { k: "feature", v: "Leak-proof protection" },
      { k: "freeFrom", v: "Mercury, lead, and cadmium" },
      { k: "use", v: "Regular-drain household devices" },
    ],
    reviews: [
      {
        userId: "CUST-10005",
        review: "The batteries provide reliable power for remotes and clocks.",
        verified: true,
      },
      {
        userId: "CUST-10006",
        review: "The multipack is useful for keeping spares at home.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "106417",
    name: "Carbon Zinc Battery Red HD AA 1015",
    description:
      "Eveready Carbon Zinc AA batteries provide reliable, leak-proof power for regular-drain household devices.",
    brand: "Eveready",
    quantity: "10 pcs",
    category: "Kitchen, Garden & Pets",
    subcategory: "Battery & Electrical",
    price: 38.27,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145c6.png",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/106417/eveready-carbon-zinc-battery-red-hd-aa-1015-10-pcs/",
    attributes: [
      { k: "chemistry", v: "Carbon Zinc" },
      { k: "batterySize", v: "AA" },
      { k: "feature", v: "Leak-proof protection" },
      { k: "freeFrom", v: "Mercury, lead, and cadmium" },
      { k: "use", v: "Regular-drain household devices" },
    ],
    reviews: [
      {
        userId: "CUST-10007",
        review: "Good everyday batteries for small household devices.",
        verified: true,
      },
      {
        userId: "CUST-10008",
        review: "The ten-pack is convenient and performed as expected.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "265378",
    name: "Dry Pet Food - For Adult Dogs, Chicken & Vegetables",
    description:
      "Pedigree Adult Dry Dog Food with chicken and vegetables provides complete and balanced nutrition for adult dogs.",
    brand: "Pedigree",
    quantity: "400 g",
    category: "Kitchen, Garden & Pets",
    subcategory: "Pet Meals & Treats",
    price: 26.85,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145ce.jpg",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/265378/pedigree-dry-dog-food-chicken-vegetables-for-adult-dogs-400-g/",
    attributes: [
      { k: "lifeStage", v: "Adult dogs" },
      { k: "flavor", v: "Chicken and vegetables" },
      { k: "form", v: "Dry food" },
      { k: "nutrient", v: "37 essential nutrients" },
    ],
    reviews: [
      {
        userId: "CUST-10001",
        review: "My dog enjoys the chicken and vegetable flavor.",
        verified: true,
      },
      {
        userId: "CUST-10002",
        review: "The smaller pack is convenient for trying the food.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "256652",
    name: "Dry Dog Food - Chicken & Vegetables, For Adult Dogs",
    description:
      "Pedigree Adult Dry Dog Food with chicken and vegetables provides complete and balanced nutrition for adult dogs.",
    brand: "Pedigree",
    quantity: "1.2 kg",
    category: "Kitchen, Garden & Pets",
    subcategory: "Pet Meals & Treats",
    price: 21.22,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145cf.jpg",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/256652/pedigree-dry-dog-food-chicken-vegetables-for-adult-dogs-12-kg/",
    attributes: [
      { k: "lifeStage", v: "Adult dogs" },
      { k: "flavor", v: "Chicken and vegetables" },
      { k: "form", v: "Dry food" },
      { k: "nutrient", v: "37 essential nutrients" },
      { k: "benefit", v: "Healthy muscles and bones" },
    ],
    reviews: [
      {
        userId: "CUST-10003",
        review: "My dog enjoys the food and the kibble is easy to serve.",
        verified: true,
      },
      {
        userId: "CUST-10004",
        review: "A practical size for regular feeding.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "30005107",
    name: "Dry Pet Food - For Adult Dogs, Chicken & Vegetables",
    description:
      "Pedigree Adult Dry Dog Food with chicken and vegetables provides complete and balanced nutrition for adult dogs.",
    brand: "Pedigree",
    quantity: "3 kg",
    category: "Kitchen, Garden & Pets",
    subcategory: "Pet Meals & Treats",
    price: 38.76,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145d1.jpg",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/30005107/pedigree-dry-dog-food-chicken-vegetables-for-adult-dogs-3-kg/",
    attributes: [
      { k: "lifeStage", v: "Adult dogs" },
      { k: "flavor", v: "Chicken and vegetables" },
      { k: "form", v: "Dry food" },
      { k: "nutrient", v: "37 essential nutrients" },
      { k: "benefit", v: "Healthy muscles and bones" },
    ],
    reviews: [
      {
        userId: "CUST-10005",
        review: "The three-kilogram pack is convenient for regular feeding.",
        verified: true,
      },
      {
        userId: "CUST-10006",
        review: "My dog eats it happily and the packaging was secure.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
  {
    productId: "30005108",
    name: "Dry Pet Food - For Adult Dogs, Chicken & Vegetables",
    description:
      "Pedigree Adult Dry Dog Food with chicken and vegetables provides complete and balanced nutrition for adult dogs.",
    brand: "Pedigree",
    quantity: "15 kg",
    category: "Kitchen, Garden & Pets",
    subcategory: "Pet Meals & Treats",
    price: 30.61,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e16145d2.jpg",
    source: "BigBasket",
    sourceUrl:
      "https://www.bigbasket.com/pd/30005108/pedigree-dry-dog-food-chicken-vegetables-for-adult-dogs-15-kg/",
    attributes: [
      { k: "lifeStage", v: "Adult dogs" },
      { k: "flavor", v: "Chicken and vegetables" },
      { k: "form", v: "Dry food" },
      { k: "nutrient", v: "37 essential nutrients" },
      { k: "benefit", v: "Healthy muscles and bones" },
    ],
    reviews: [
      {
        userId: "CUST-10007",
        review: "The large pack is convenient for a multi-week supply.",
        verified: true,
      },
      {
        userId: "CUST-10008",
        review: "Good value for households with a larger dog or multiple dogs.",
        verified: false,
      },
    ],
    status: true,
    createAt: { $date: "2026-08-28T00:00:00.000Z" },
  },
];

export async function GET() {
  if (!BACKEND_SERVES_THIS || !BACKEND_URL) {
    return NextResponse.json(PLACEHOLDER_PRODUCTS);
  }

  try {
    const res = await fetch(`${BACKEND_URL}/products`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend responded with ${res.status}` },
        { status: res.status },
      );
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 502 },
    );
  }
}
