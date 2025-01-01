// export const BASE_API = "https://sei-api-zeta.vercel.app/api/v1";
// export const BASE_API = "http://localhost:8080/api/v1";
export const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

export const inventoryCatList = [
  { category_id: 1, category_name: "Consumable" },
  { category_id: 2, category_name: "Durable" },
];

export const inventorySubCatList = [
  { sub_category_id: 1, sub_category_name: "Civil" },
  { sub_category_id: 2, sub_category_name: "Electrical" },
  { sub_category_id: 3, sub_category_name: "Furniture" },
  { sub_category_id: 4, sub_category_name: "LSA" },
  { sub_category_id: 5, sub_category_name: "FFA" },
  { sub_category_id: 6, sub_category_name: "Stationary" },
  { sub_category_id: 7, sub_category_name: "IT" },
  { sub_category_id: 8, sub_category_name: "Handouts" },
  { sub_category_id: 9, sub_category_name: "Ladhiyapur Store" },
];

export const inventoryItemStatuList = [
  { item_status_id: 1, item_status_name: "Repairable" },
  { item_status_id: 2, item_status_name: "Fully Damaged" },
  { item_status_id: 3, item_status_name: "Working" },
  { item_status_id: 4, item_status_name: "Damaged" },
];

export const paymentModes = [
  { id: 1, text: "CASH" },
  { id: 2, text: "ICICI BANK" },
  { id: 3, text: "CANARA BANK" },
  { id: 4, text: "SWIPE CARD" },
  { id: 5, text: "ONLINE" },
];

