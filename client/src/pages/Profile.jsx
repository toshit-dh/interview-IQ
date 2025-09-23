import React, { useEffect, useState } from "react";
import { ProfileHeader } from "../components/Profile/ProfileHeader";
import { GrowthProgress } from "../components/Profile/GrowthProgress";
import { EditProfile } from "../components/Profile/EditProfile";
import { UserApi } from "../../api/UserApi";
import { useParams } from "react-router-dom";
import { TimeInsights } from "../components/Profile/TimeInsights";
import { PathDomainStats } from "../components/Profile/PathDomainStats";
import { Achievements } from "../components/Profile/Acheivements";
import { DifficultyBreakdown } from "../components/Profile/DifficultyBreakdown";
import { BehavioralAnalytics } from "../components/Profile/BehavioralAnalytics";

const sampleUserData = {
    totalTimeSpent: 111240, // in seconds (30.9 hours)
    averageTimePerInterview: 46, // in minutes
    totalInterviews: 127,
    pathStats: [
      {
        path: "60d5ecb54b24a000123456001",
        pathName: "Frontend Development",
        interviewsGiven: 45,
        totalScore: 3200,
        averageScore: 71.1,
      },
      {
        path: "60d5ecb54b24a000123456002",
        pathName: "System Design",
        interviewsGiven: 32,
        totalScore: 2400,
        averageScore: 75.0,
      },
      {
        path: "60d5ecb54b24a000123456003",
        pathName: "Backend Development",
        interviewsGiven: 28,
        totalScore: 1950,
        averageScore: 69.6,
      },
      {
        path: "60d5ecb54b24a000123456004",
        pathName: "Machine Learning",
        interviewsGiven: 22,
        totalScore: 1400,
        averageScore: 63.6,
      },
    ],
  };

  const sampleUserData2 = {
    completedPaths: ["60d5ecb54b24a000123456001", "60d5ecb54b24a000123456002"],
    activePaths: ["60d5ecb54b24a000123456003", "60d5ecb54b24a000123456004"],
    pathStats: [
      {
        path: "60d5ecb54b24a000123456001",
        interviewsGiven: 45,
        totalScore: 3200,
        averageScore: 71.1,
        badges: ["badge1", "badge2", "badge3", "badge4", "badge5"],
      },
      {
        path: "60d5ecb54b24a000123456002",
        interviewsGiven: 32,
        totalScore: 2400,
        averageScore: 75.0,
        badges: ["badge1", "badge2", "badge3"],
      },
      {
        path: "60d5ecb54b24a000123456003",
        interviewsGiven: 28,
        totalScore: 1950,
        averageScore: 69.6,
        badges: ["badge1", "badge2"],
      },
      {
        path: "60d5ecb54b24a000123456004",
        interviewsGiven: 22,
        totalScore: 1400,
        averageScore: 63.6,
        badges: ["badge1"],
      },
    ],
  };

  const sampleUserData3 = {
    totalInterviews: 127,
    totalScore: 8950,
    longestStreak: 42,
    averageTimePerInterview: 18, // Fast completion
    completedPaths: ["60d5ecb54b24a000123456001", "60d5ecb54b24a000123456002"],
    pathStats: [
      { path: "60d5ecb54b24a000123456001" },
      { path: "60d5ecb54b24a000123456002" },
      { path: "60d5ecb54b24a000123456003" },
      { path: "60d5ecb54b24a000123456004" },
    ],
  };

  const sampleUserData4 = {
    difficultyStats: {
      easy: 42,
      medium: 58,
      hard: 27,
    },
  };

  const sampleUserData5 = {
    behavioralStats: {
      avgResponseTime: 12.4,
      fillerWordsCount: 145,
      avgConfidenceScore: 78,
      sentimentScore: 0.65,
      speechClarity: 85,
      toneVariation: 72,
    },
  };

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
        console.log(data);
        
        const { name, username, email, bio,  avatar,stats } = data;
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
          bio,
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
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <TimeInsights userData={sampleUserData} />
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <PathDomainStats userData={sampleUserData2} />
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <Achievements userData={sampleUserData3} />
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <DifficultyBreakdown userData={sampleUserData4} />
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <BehavioralAnalytics userData={sampleUserData5}/>
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
