import React, { useState, useEffect } from "react";

const api = (path, opts = {}) =>
  fetch(path, { headers: { "Content-Type": "application/json" }, ...opts }).then((r) => r.json());

export default function RoleManagementPage() {
  const [pending, setPending] = useState([]);
  const [ghosts, setGhosts] = useState([]);
  const [students, setStudents] = useState([]);

  const loadData = async () => {
    const all = await api("/api/users");
    setPending(all.filter((u) => u.role === "registration"));
    setGhosts(all.filter((u) => u.role === "ghost"));
    setStudents(all.filter((u) => u.role === "student"));
  };

  useEffect(() => { loadData(); }, []);

  const updateRole = async (id, role) => {
    await api(`/api/users/${id}/role`, {
      method: "PUT", body: JSON.stringify({ role }),
    });
    loadData();
  };

  const Column = ({ title, color, count, users, children }) => (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-3 h-3 rounded-full ${color}`}></span>
        <h3 className="font-bold text-sm">{title}</h3>
        <span className={`mr-auto px-2 py-0.5 rounded-full text-xs font-medium ${color.replace("bg-", "bg-").replace("-500", "-100 text-").replace("bg-", "")}`}>
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const UserCard = ({ user, showUpgrade, showDowngrade }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50/50">
      <div className="w-8 h-8 bg-everest-100 rounded-full flex items-center justify-center text-everest-700 font-bold text-sm">
        {user.full_name?.[0] || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.full_name}</p>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
      </div>
      <div className="flex gap-1">
        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="عرض">
          👁️
        </button>
        {showUpgrade && (
          <button
            onClick={() => updateRole(user.id, "student")}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ترقية لطالب
          </button>
        )}
        {showDowngrade && (
          <button
            onClick={() => updateRole(user.id, "ghost")}
            className="px-2 py-1 text-xs border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100"
          >
            جعله Ghost
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🔐 إدارة صلاحيات المستخدمين</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Column title="بانتظار التفعيل" color="bg-orange-500" count={pending.length}>
          {pending.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">لا توجد طلبات</p>}
          {pending.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50/50">
              <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">
                {u.full_name?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
            </div>
          ))}
        </Column>

        <Column title="الحسابات الخفية (Ghosts)" color="bg-gray-500" count={ghosts.length}>
          {ghosts.map((u) => (
            <UserCard key={u.id} user={u} showUpgrade={true} />
          ))}
          {ghosts.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">لا توجد حسابات</p>}
        </Column>

        <Column title="الطلاب المعتمدين" color="bg-green-500" count={students.length}>
          {students.map((u) => (
            <UserCard key={u.id} user={u} showDowngrade={true} />
          ))}
          {students.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">لا يوجد طلاب</p>}
        </Column>
      </div>
    </div>
  );
}
