import express from "express";
const router = express.Router();
import ModuleController from "../../controllers/Interview/ModuleController.js";

router.get("/:id",ModuleController.getModulesByPathId); // Get a specific path by ID

export default router;
