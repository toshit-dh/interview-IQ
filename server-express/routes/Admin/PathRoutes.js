// routes/core/pathRoutes.js
import express from "express";
const router = express.Router();
import PathController from "../../controllers/Admin/PathController.js";

// List all paths
router.get("/", PathController.getAllPaths);

// Get a specific path by ID
router.get("/:id", PathController.getPathById);

// Admin: Create a new path
router.post("/", PathController.createPath);

// Admin: Update an existing path
router.put("/:id", PathController.updatePath);

// Admin: Delete a path
router.delete("/:id", PathController.deletePath);

export default router;
