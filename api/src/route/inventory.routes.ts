import { Router } from "express";
import {
  addMulipInventoryItem,
  addMultiItemStock,
  addMultiMaintenceRecord,
  addMultiPlannedMaintenanceSystem,
  addMultipleVendorItem,
  addNewCategory,
  addNewConsumableItem,
  addNewDurable,
  addNewItemInfo,
  addNewItemStock,
  addNewList,
  addNewMaintenceRecord,
  addNewPlannedMaintenanceSystem,
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
  getPlannedMaintenanceSystem,
  getPreviousOpeningStock,
  getSingleConsumableInfo,
  getSingleDurableInfo,
  getSingleItemInfo,
  getSingleMaintenceRecord,
  getSinglePlannedMaintenanceSystem,
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
  updatePlannedMaintenanceSystem,
  updateVendorItem,
} from "../controller/inventory.controller";
import { streamMaintenceRecordExcelReport } from "../controller/stream.report";

export const inventoryRoute = Router();

inventoryRoute
  .get("/item", getAllItemInfo)
  .get("/item/drop-down", getItemsForDropDown)
  .get("/item/:item_id", getSingleItemInfo)
  .post("/item", addNewItemInfo)
  .post("/item/multi", addMulipInventoryItem)
  .put("/item/:item_id", updateItemInfo)

  // .get("/item-stock/calclute/:item_id", calcluteStockInfo)
  // .get("/item-stock/get-last-closing-stock/:item_id", getPreviousOpeningStock)
  .get("/item-stock/get-all/:item_id", getAllItemStockInfo)
  .post("/item-stock", addNewItemStock)
  .post("/item-stock/multi", addMultiItemStock)
  .post("/item-stock/consumed", consumeStock)
  .put("/item-stock/:stock_id", updateItemStock)
  .get("/item-stock/:stock_id", getSingleStockInfo)

  .get("/maintence-record", getMaintenceRecords)
  .get("/maintence-record/excel", streamMaintenceRecordExcelReport)
  // .get("/maintence-record/:record_id", getSingleMaintenceRecord)
  .post("/maintence-record", addNewMaintenceRecord)
  .post("/maintence-record/multi" ,addMultiMaintenceRecord)
  .patch("/maintence-record/:record_id", updateMaintenceRecordStatus)
  // .put("/maintence-record/:record_id", updateMaintenceRecord)

  .get("/planned-maintenance-system", getPlannedMaintenanceSystem)
  .get(
    "/planned-maintenance-system/:planned_maintenance_system_id",
    getSinglePlannedMaintenanceSystem
  )
  .post("/planned-maintenance-system", addNewPlannedMaintenanceSystem)
  .post("/planned-maintenance-system/multi", addMultiPlannedMaintenanceSystem)
  .put(
    "/planned-maintenance-system/:planned_maintenance_system_id",
    updatePlannedMaintenanceSystem
  )

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
  .post("/vendor/multi", addMultipleVendorItem)
  .put("/vendor/:vendor_id", updateVendorItem)
  .delete("/vendor/:vendor_id", deleteVendorItem);
