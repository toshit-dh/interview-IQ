// controllers/ModuleController.js
import Path from "../../models/Interview/PathSchema.js";

const ModuleController = {
  // Get modules by path ID
  getModulesByPathId: async (req, res, next) => {
    try {
      const { id: pathId } = req.params;

      const path = await Path.findById(pathId).populate("modules");
      
      if (!path) {
        
        return res.status(404).json({
          success: false,
          message: "Path not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: path.modules,
        path
      });
    } catch (error) {
      next(error)
    }
  },

  // TODO: Implement createModule
  // TODO: Implement updateModule
  // TODO: Implement deleteModule
};

export default ModuleController;
