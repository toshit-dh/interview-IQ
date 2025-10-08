import express from "express";
const router = express.Router();
import PathController from "../../controllers/Interview/Pathcontroller.js";

router.get("/", PathController.getAllPaths); // Get all paths
router.get("/:id", PathController.getPathById); // Get a specific path by ID

// 🛠️ Admin Routes
router.post("/", PathController.createPath); // Create a new path
router.put("/:id", PathController.updatePath); // Update an existing path
router.delete("/:id", PathController.deletePath); 

export default router;
