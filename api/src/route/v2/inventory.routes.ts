import { Router } from "express";
import { getInventoryItem } from "../../controller/v2/inventory.controller";

export const inventoryRoutesV2 = Router();

inventoryRoutesV2.get("/item", getInventoryItem)