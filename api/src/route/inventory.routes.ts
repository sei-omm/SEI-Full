import { Router } from "express";
import {
  addNewCategory,
  addNewConsumableItem,
  addNewDurable,
  addNewItemInfo,
  addNewItemStock,
  addNewList,
  addNewMaintenceRecord,
  addNewVendorItem,
  calcluteStockInfo,
  consumeStock,
  deleteCategory,
  deleteConsumableItem,
  deleteVendorItem,
  getAllItemInfo,
  getAllItemStockInfo,
  getCategory,
  getConsumableInfo,
  getDurableFiltersItemInfo,
  getDurableInfo,
  getItemsForDropDown,
  getMaintenceRecords,
  getPreviousOpeningStock,
  getSingleConsumableInfo,
  getSingleDurableInfo,
  getSingleItemInfo,
  getSingleMaintenceRecord,
  getSingleStockInfo,
  getSingleVendorInfo,
  getVendorFiltersItemInfo,
  getVendorIdName,
  getVendorInfo,
  updateCategory,
  updateConsumableItem,
  updateDurableInfo,
  updateItemInfo,
  updateItemStock,
  updateMaintenceRecord,
  updateMaintenceRecordStatus,
  updateVendorItem,
} from "../controller/inventory.controller";
import { streamMaintenceRecordExcelReport } from "../controller/stream.report";

export const inventoryRoute = Router();

inventoryRoute
  .get("/item", getAllItemInfo)
  .get("/item/drop-down", getItemsForDropDown)
  .get("/item/:item_id", getSingleItemInfo)
  .post("/item", addNewItemInfo)
  .put("/item/:item_id", updateItemInfo)

  // .get("/item-stock/calclute/:item_id", calcluteStockInfo)
  // .get("/item-stock/get-last-closing-stock/:item_id", getPreviousOpeningStock)
  .get("/item-stock/get-all/:item_id", getAllItemStockInfo)
  .post("/item-stock", addNewItemStock)
  .post("/item-stock/consumed", consumeStock)
  .put("/item-stock/:stock_id", updateItemStock)
  .get("/item-stock/:stock_id", getSingleStockInfo)

  .get("/maintence-record", getMaintenceRecords)
  .get("/maintence-record/excel", streamMaintenceRecordExcelReport)
  // .get("/maintence-record/:record_id", getSingleMaintenceRecord)
  .post("/maintence-record", addNewMaintenceRecord)
  .patch("/maintence-record/:record_id", updateMaintenceRecordStatus)
  // .put("/maintence-record/:record_id", updateMaintenceRecord)

  .get("/durable", getDurableInfo)
  .get("/durable/filter-items", getDurableFiltersItemInfo)
  .get("/durable/:durable_id", getSingleDurableInfo)
  .post("/durable", addNewDurable)
  .put("/durable/:durable_id", updateDurableInfo)

  .get("/category", getCategory)
  .post("/category", addNewCategory)
  .put("/category/:category_id", updateCategory)
  .delete("/category/:category_id", deleteCategory)

  .get("/consumable", getConsumableInfo)
  .get("/consumable/:consumable_id", getSingleConsumableInfo)
  .post("/consumable", addNewConsumableItem)
  .put("/consumable/:consumable_id", updateConsumableItem)
  .delete("/consumable/:consumable_id", deleteConsumableItem)

  .get("/vendor", getVendorInfo)
  .get("/vendor/id-name", getVendorIdName)
  .get("/vendor/filter-items", getVendorFiltersItemInfo)
  .get("/vendor/:vendor_id", getSingleVendorInfo)
  .post("/vendor", addNewVendorItem)
  .put("/vendor/:vendor_id", updateVendorItem)
  .delete("/vendor/:vendor_id", deleteVendorItem);
