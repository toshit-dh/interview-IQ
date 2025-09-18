import React, { useEffect, useState } from "react";
import { ProfileHeader } from "../components/Profile/ProfileHeader";
import { GrowthProgress } from "../components/Profile/GrowthProgress";
import { EditProfile } from "../components/Profile/EditProfile";
import { UserApi } from "../../api/UserApi";
import { useParams } from "react-router-dom";

export default function Profile() {
  const { id } = useParams();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [header, setHeader] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  const handleSaveProfile = (updatedData) => {
    setHeader((prev) => ({ ...prev, ...updatedData }));
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const data = await UserApi.getProfile(id);
        
        const { name, username, email, avatar,stats } = data;
        const {
          totalInterviews,
          totalScore,
          rank,
          percentile,
          streak,
          longestStreak,
          lastActivity,
          activityLog,
        } = stats || {};

        setHeader({
          name,
          username,
          email,
          avatar,
          totalInterviews,
          totalScore,
          rank,
          percentile,
        });
        setGrowth({ streak, longestStreak, lastActivity, activityLog });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch profile:", err.response?.data || err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading)
    return <p className="text-white text-center mt-20">Loading profile...</p>;
  if (error) return <p className="text-red-500 text-center mt-20">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <ProfileHeader userData={header} onEditProfile={handleOpenDialog} />
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <GrowthProgress userData={growth} />
        </div>
      </div>

      <EditProfile
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        userData={header}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
