import Joi, { number } from "joi";

//inventory list
export const addNewListValidator = Joi.object({
  item_name: Joi.string().required(),

  category: Joi.number().required(),
  sub_category: Joi.number().required(),

  description: Joi.string().optional().allow(""),
  where_to_use: Joi.string().optional().allow(""),

  used_by: Joi.string().optional().allow(""),

  opening_stock: Joi.number().required(),
  minimum_quantity: Joi.number().required(),
  item_consumed: Joi.number().required(),
  closing_stock: Joi.number().required(),

  item_status: Joi.number().required(),

  vendor_id: Joi.number().required(),

  cost_per_unit_current: Joi.number().required(),
  total_value: Joi.number().required(),

  remark: Joi.string().optional().allow(""),
});

export const addNewItemValidator = Joi.object({
  item_name: Joi.string().required(),

  category: Joi.number().required(),
  sub_category: Joi.number().required(),

  where_to_use: Joi.string().optional().allow(""),
  used_by: Joi.string().optional().allow(""),
  description: Joi.string().optional().allow(""),

  minimum_quantity: Joi.number().required(),

  institute: Joi.string().required(),
});

export const updateItemValidator = addNewItemValidator.keys({
  item_id: Joi.number().required(),
});

//inventory item stock
export const addNewItemStockValidator = Joi.object({
  opening_stock: Joi.number().required(),
  item_consumed: Joi.number().required(),
  closing_stock: Joi.number().required(),

  status: Joi.string().required(),

  vendor_id: Joi.number().required(),
  cost_per_unit_current: Joi.number().required(),
  total_value: Joi.number().required(),

  remark: Joi.string().optional().allow(""),

  item_id: Joi.number().required(),

  type: Joi.string().valid("add", "consumed").required(),

  purchase_date: Joi.string().optional(),
});

export const consumeStockValidator = Joi.object({
  item_id: Joi.number().required(),
  item_consumed: Joi.number().required(),
  type: Joi.string().valid("add", "consumed").required(),
  remark: Joi.string().optional().allow(""),
});

export const updateItemStockValidator = addNewItemStockValidator.keys({
  stock_id: Joi.number().required(),
});

export const getAllStockInfo = Joi.object({
  item_id: Joi.number().required(),
});

export const getPreviousOpeningStockValidator = Joi.object({
  item_id: Joi.number().required(),
});

export const calcluteStockInfoValidator = Joi.object({
  item_id: Joi.number().required(),
});

//maintence-record
export const addNewMaintenceRecordValidator = Joi.object({
  item_id: Joi.number().required(),
  maintence_date: Joi.string().required(),
  work_station: Joi.string().required(),
  description_of_work: Joi.string().required(),
  department: Joi.string().optional().allow(""),
  assigned_person: Joi.string().required(),
  approved_by: Joi.string().required(),
  cost: Joi.number().required(),
  status: Joi.string().valid("Completed", "Pending").required(),
  completed_date: Joi.string().when("status", {
    is: "Completed",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  remark: Joi.string().optional().allow(""),
  institute: Joi.string().required(),
});

export const updateMaintenceRecordValidator =
  addNewMaintenceRecordValidator.keys({
    record_id: Joi.number().required(),
  });

export const updateMaintenceRecordStatusValidator = Joi.object({
  record_id: Joi.number().required(),
  status: Joi.string().valid("Completed", "Pending").required(),
})

//durable
export const addNewDurableValidator = Joi.object({
  room_name: Joi.string().required(),
  floor: Joi.number().required(),
  number_of_rows: Joi.number().required(),
  capasity: Joi.number().required(),
  available_items: Joi.string().required(),
  is_available: Joi.boolean().required(),
});

export const updateDurableValidator = addNewDurableValidator.keys({
  durable_id: Joi.number().required(),
});

export const getSingleDurableInfoValidator = Joi.object({
  durable_id: Joi.number().required(),
});

//category
export const addNewCategoryValidator = Joi.object({
  category_name: Joi.string().required(),
});

export const updateCategoryValidator = addNewCategoryValidator.keys({
  category_id: Joi.number().required(),
});

export const deleteCategoryValidator = Joi.object({
  category_id: Joi.number().required(),
});

//consumable
export const addNewConsumableItemValidator = Joi.object({
  item_name: Joi.string().required(),
  category_id: Joi.number().required(),
  quantity: Joi.number().required(),
  min_quantity: Joi.number().required(),
  last_purchase_date: Joi.string().required(),
  supplier_id: Joi.number().required(),
  cost_per_unit: Joi.number().required(),
  total_volume: Joi.number().required(),
  remark: Joi.string().optional().allow(""),
});

export const updateConsumableItemValidator = addNewConsumableItemValidator.keys(
  {
    consumable_id: Joi.number().required(),
  }
);

export const deleteConsumableItemValidator = Joi.object({
  consumable_id: Joi.number().required(),
});

//vendor
export const addNewVendorValidator = Joi.object({
  vendor_name: Joi.string().required(),
  institutes: Joi.string().required(),
  service_type: Joi.string().required(),
  address: Joi.string().required(),
  contact_details: Joi.string().required(),
});

export const updateVendorValidator = addNewVendorValidator.keys({
  vendor_id: Joi.number().required(),
});

export const deleteVendorValidator = Joi.object({
  vendor_id: Joi.number().required(),
});