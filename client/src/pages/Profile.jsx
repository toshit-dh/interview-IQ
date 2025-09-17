import { ProfileHeader } from "../components/Profile/ProfileHeader";
import { GrowthProgress } from "../components/Profile/GrowthProgress";

export default function Profile() {
  const sampleUserData = {
    username: "alex_coder",
    fullName: "Alex Johnson",
    rank: 1247,
    percentile: 85.3,
    globalRank: 1247,
    totalInterviews: 127,
    totalScore: 8950,
  };
  const sampleUserData2 = {
    streak: 15,
    longestStreak: 42,
    lastActivity: "2024-01-15T14:30:00.000Z",
    activityLog: [
      {
        date: "2025-03-25T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 90,
        score: 140,
      },
      {
        date: "2025-03-30T00:00:00.000Z",
        interviewsGiven: 1,
        timeSpent: 50,
        score: 80,
      },
      {
        date: "2025-04-05T00:00:00.000Z",
        interviewsGiven: 3,
        timeSpent: 120,
        score: 200,
      },
      {
        date: "2025-04-10T00:00:00.000Z",
        interviewsGiven: 0,
        timeSpent: 0,
        score: 0,
      },
      {
        date: "2025-04-15T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 75,
        score: 130,
      },
      {
        date: "2025-04-20T00:00:00.000Z",
        interviewsGiven: 1,
        timeSpent: 40,
        score: 70,
      },
      {
        date: "2025-04-25T00:00:00.000Z",
        interviewsGiven: 4,
        timeSpent: 160,
        score: 260,
      },
      {
        date: "2025-05-01T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 100,
        score: 150,
      },
      {
        date: "2025-05-07T00:00:00.000Z",
        interviewsGiven: 3,
        timeSpent: 135,
        score: 210,
      },
      {
        date: "2025-05-12T00:00:00.000Z",
        interviewsGiven: 1,
        timeSpent: 45,
        score: 75,
      },
      {
        date: "2025-05-18T00:00:00.000Z",
        interviewsGiven: 0,
        timeSpent: 0,
        score: 0,
      },
      {
        date: "2025-05-24T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 85,
        score: 140,
      },
      {
        date: "2025-05-30T00:00:00.000Z",
        interviewsGiven: 3,
        timeSpent: 150,
        score: 230,
      },
      {
        date: "2025-06-05T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 90,
        score: 145,
      },
      {
        date: "2025-06-10T00:00:00.000Z",
        interviewsGiven: 1,
        timeSpent: 35,
        score: 65,
      },
      {
        date: "2025-06-15T00:00:00.000Z",
        interviewsGiven: 4,
        timeSpent: 175,
        score: 280,
      },
      {
        date: "2025-06-20T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 95,
        score: 150,
      },
      {
        date: "2025-06-25T00:00:00.000Z",
        interviewsGiven: 1,
        timeSpent: 50,
        score: 85,
      },
      {
        date: "2025-07-01T00:00:00.000Z",
        interviewsGiven: 3,
        timeSpent: 125,
        score: 200,
      },
      {
        date: "2025-07-07T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 100,
        score: 155,
      },
      {
        date: "2025-07-12T00:00:00.000Z",
        interviewsGiven: 0,
        timeSpent: 0,
        score: 0,
      },
      {
        date: "2025-07-18T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 80,
        score: 135,
      },
      {
        date: "2025-07-24T00:00:00.000Z",
        interviewsGiven: 3,
        timeSpent: 140,
        score: 220,
      },
      {
        date: "2025-07-30T00:00:00.000Z",
        interviewsGiven: 1,
        timeSpent: 45,
        score: 70,
      },
      {
        date: "2025-08-05T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 95,
        score: 150,
      },
      {
        date: "2025-08-11T00:00:00.000Z",
        interviewsGiven: 4,
        timeSpent: 180,
        score: 290,
      },
      {
        date: "2025-08-17T00:00:00.000Z",
        interviewsGiven: 1,
        timeSpent: 40,
        score: 65,
      },
      {
        date: "2025-08-23T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 85,
        score: 140,
      },
      {
        date: "2025-08-29T00:00:00.000Z",
        interviewsGiven: 3,
        timeSpent: 130,
        score: 210,
      },
      {
        date: "2025-09-04T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 90,
        score: 145,
      },
      {
        date: "2025-09-10T00:00:00.000Z",
        interviewsGiven: 1,
        timeSpent: 50,
        score: 75,
      },
      {
        date: "2025-09-16T00:00:00.000Z",
        interviewsGiven: 3,
        timeSpent: 140,
        score: 220,
      },
      {
        date: "2025-09-21T00:00:00.000Z",
        interviewsGiven: 2,
        timeSpent: 85,
        score: 145,
      },
      {
        date: "2025-09-25T00:00:00.000Z",
        interviewsGiven: 1,
        timeSpent: 40,
        score: 70,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <ProfileHeader userData={sampleUserData} />
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <GrowthProgress userData={sampleUserData2} />
        </div>
      </div>
    </div>
  );
}
