import React, { useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: "أحمد",
    lastName: "المستخدم",
    email: "admin@everest.com",
    bio: "مدير المنصة التعليمية",
  });
  const [balance, setBalance] = useState(6278);
  const [points] = useState(12400);
  const [updateType, setUpdateType] = useState("add");
  const [updateAmount, setUpdateAmount] = useState("");

  const handleUpdateBalance = () => {
    const amt = parseFloat(updateAmount) || 0;
    setBalance((prev) => (updateType === "add" ? prev + amt : prev - amt));
    setUpdateAmount("");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">⚙️ الإعدادات الشخصية والمحفظة</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-bold mb-4">👤 الملف الشخصي</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">الاسم الأول</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">الاسم الأخير</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg mt-1"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium">البريد الإلكتروني</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium">السيرة الذاتية (Bio)</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg mt-1"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">الصورة الشخصية</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-everest-200 rounded-full flex items-center justify-center text-everest-700 font-bold text-xl">
                {profile.firstName[0]}
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                رفع صورة
              </button>
            </div>
          </div>
        </div>

        {/* Wallet & Points */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-bold mb-4">💰 محفظة إيفرست (E-Money)</h3>
            <p className="text-3xl font-bold text-amber-600 mb-4">{balance} E-Money</p>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium mb-3">تحديث الرصيد</p>
              <div className="flex gap-2 mb-2">
                <select
                  value={updateType}
                  onChange={(e) => setUpdateType(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="add">إضافة (+)</option>
                  <option value="deduct">خصم (-)</option>
                </select>
                <input
                  type="number"
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  placeholder="المبلغ"
                  className="flex-1 px-4 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={handleUpdateBalance}
                  className="px-4 py-2 bg-everest-600 text-white rounded-lg text-sm hover:bg-everest-700"
                >
                  تحديث
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-bold mb-4">🏆 النقاط الأكاديمية (Leaderboard)</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-everest-600">{points.toLocaleString()}</span>
              <span className="text-gray-500 text-sm">نقطة</span>
            </div>
            <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-everest-500 to-everest-300 rounded-full transition-all"
                style={{ width: `${Math.min((points / 20000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">من أصل 20,000 نقطة للتقدم للرتبة التالية</p>
          </div>
        </div>
      </div>
    </div>
  );
}
