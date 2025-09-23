import React, { useState } from "react";
import { X, Camera, User } from "lucide-react";
import { UserApi } from "../../../api/UserApi";
import toast, { Toaster } from "react-hot-toast";
import { toastStyle } from "../../../utils/toastStyle";

export function EditProfile({ isOpen, onClose, userData, onSave }) {
  const [formData, setFormData] = useState({
    username: userData?.username || "",
    name: userData?.name || "",
    bio:
      userData?.bio ||
      "Software engineer passionate about coding challenges and continuous learning.",
    avatar: null, // store actual File object
    preview: userData?.avatar || null, // store preview URL
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          avatar: file, // store actual file for upload
          preview: e.target.result, // store base64 preview
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("name", formData.name);
      data.append("bio", formData.bio);
      if (formData.avatar) data.append("avatar", formData.avatar);

      const res = await UserApi.updateProfile(data);
      console.log(res);
      
      toast.success(
        res.message || "Profile Updated Successfully",
        toastStyle(true)
      );
      onSave?.(res.user); // pass updated user to parent
      onClose();
    } catch (e) {
      
      toast.error(
        e.response?.data?.message || "Profile Cannot Be Updated",
        toastStyle(false)
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {formData.preview ? (
                  <img
                    src={formData.preview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <button
                onClick={() => document.getElementById("avatar-upload").click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-sm text-white/70 text-center">
              Click the camera icon to change your avatar
            </p>
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter username"
            />
          </div>

          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter full name"
            />
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
