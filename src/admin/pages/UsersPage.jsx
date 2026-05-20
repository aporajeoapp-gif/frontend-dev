import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  ShieldCheck,
  Users,
  UserCog,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  Key,
  CalendarDays,
  Infinity,
  Camera,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import Table from "../components/ui/Table";
import  { useUsers } from "../../hooks/userhook";
import { createUser, updateUser, deleteUser } from "../../api/authApi";
import { confirmDelete, errorAlert, successAlert } from "../../utils/alert";
import { useAuth } from "../../context/AuthContext";

const inp =
  "w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-400 dark:focus:border-primary-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-colors";

const btn = (v = "primary") =>
  ({
    primary:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors",
    secondary:
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors",
    ghost:
      "inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors",
  })[v];

const ROLES = ["super_admin", "admin", "coordinator", "member"];
const STATUSES = ["active", "deactive"];
const RESOURCES = [
  { key: "bus", label: "Bus Routes", group: "Transport" },
  { key: "ferry", label: "Ferry Routes", group: "Transport" },
  { key: "doctors", label: "Doctors", group: "Healthcare" },
  { key: "emergency", label: "Emergency Services", group: "Healthcare" },
  { key: "blood", label: "Blood Donation", group: "Healthcare" },
  { key: "events", label: "Events", group: "Content" },
  { key: "ads", label: "Advertisements", group: "Content" },
];
const ACTIONS = ["create", "read", "update", "delete"];
const pKey = (r, a) => `${r}.${a}`;
const allGroups = [...new Set(RESOURCES.map((r) => r.group))];
const TOTAL = RESOURCES.length * ACTIONS.length;

const emptyUser = {
  name: "",
  email: "",
  password: "",
  role: "member",
  status: "active",
  permissions: [],
  phno: "",
  address: "",
  dob: "",
};

const ROLE_CONFIG = {
  super_admin: {
    icon: ShieldCheck,
    cls: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
  },
  admin: {
    icon: ShieldCheck,
    cls: "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800",
  },
  coordinator: {
    icon: UserCog,
    cls: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700",
  },
  member: {
    icon: Users,
    cls: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
  },
};

const STATUS_CONFIG = {
  active: {
    icon: CheckCircle2,
    cls: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  },
  deactive: {
    icon: XCircle,
    cls: "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800",
  },
  inactive: {
    icon: XCircle,
    cls: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
  },
  suspended: {
    icon: AlertCircle,
    cls: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  },
};

const RoleBadge = ({ value }) => {
  const cfg = ROLE_CONFIG[(value ?? "").toLowerCase()] ?? ROLE_CONFIG.member;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}
    >
      <Icon size={11} /> {value}
    </span>
  );
};

const StatusBadge = ({ value }) => {
  const cfg =
    STATUS_CONFIG[(value ?? "").toLowerCase()] ?? STATUS_CONFIG.inactive;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}
    >
      <Icon size={11} /> {value}
    </span>
  );
};

function PasswordCell({ value }) {
  const [show, setShow] = useState(false);
  if (!value)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs italic border border-slate-200 dark:border-slate-700">
        not set
      </span>
    );
  return (
    <div className="inline-flex items-center gap-0 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/60">
      <div className="px-3 py-1.5 flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-700">
        <Lock size={11} className="text-slate-400 shrink-0" />
        <span className="text-xs font-mono text-slate-700 dark:text-slate-200 tracking-widest min-w-[72px]">
          {show ? value : "••••••••"}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="px-2.5 py-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        title={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
    </div>
  );
}

function PermissionMatrix({ permissions, onChange, disabled, requesterPermissions = [] }) {
  const isSuper = requesterPermissions.includes("*") || requesterPermissions.includes("admin_power");
  const canGrant = (r, a) => isSuper || requesterPermissions.includes(pKey(r, a));
  const has = (r, a) => permissions.includes(pKey(r, a));

  const toggle = (r, a) => {
    const k = pKey(r, a);
    onChange(
      permissions.includes(k)
        ? permissions.filter((p) => p !== k)
        : [...permissions, k],
    );
  };

  const toggleRow = (r) => {
    const keys = ACTIONS.map((a) => pKey(r, a));
    const allOn = keys.every((k) => permissions.includes(k));
    onChange(
      allOn
        ? permissions.filter((p) => !keys.includes(p))
        : [...new Set([...permissions, ...keys])],
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Permissions
      </p>
      {allGroups.map((group) => {
        const resources = RESOURCES.filter((r) => r.group === group);
        return (
          <div key={group}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              {group}
            </p>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div
                className="grid bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700"
                style={{ gridTemplateColumns: "1fr repeat(4, 64px)" }}
              >
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Resource
                </div>
                {ACTIONS.map((a) => (
                  <div
                    key={a}
                    className="py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize text-center"
                  >
                    {a}
                  </div>
                ))}
              </div>
              {resources.map((res, i) => {
                const rowOn = ACTIONS.every((a) => has(res.key, a));
                return (
                  <div
                    key={res.key}
                    className={`grid items-center ${i < resources.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}
                    style={{ gridTemplateColumns: "1fr repeat(4, 64px)" }}
                  >
                    <button
                      onClick={() => toggleRow(res.key)}
                      className={`px-3 py-2.5 text-sm text-left font-medium flex items-center gap-1.5 transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${rowOn ? "text-primary-600 dark:text-primary-400" : "text-slate-700 dark:text-slate-300"}`}
                    >
                      {rowOn && (
                        <Check
                          size={11}
                          className="text-primary-500 shrink-0"
                        />
                      )}
                      {res.label}
                    </button>
                    {ACTIONS.map((a) => (
                      <div
                        key={a}
                        className="flex items-center justify-center py-2.5"
                      >
                        <input
                          type="checkbox"
                          disabled={disabled || !canGrant(res.key, a)}
                          checked={has(res.key, a)}
                          onChange={() => toggle(res.key, a)}
                          className={`w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-primary-600 ${disabled || !canGrant(res.key, a) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function UsersPage() {
  const { user } = useAuth();
  const {
    users,
    addUser,
    updateUser: updateUserInList,
    removeUser,
  } = useUsers();
  const [modal, setModal] = useState(null); // null | { mode: "add" } | { mode: "edit", id: string }
  const [form, setForm] = useState(emptyUser);
  const [showPw, setShowPw] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const isCoordinator = user?.role === "coordinator";
  const isAuthorized = isSuperAdmin || isAdmin || isCoordinator;

  // Permissions should be disabled if an admin is editing themselves OR if a coordinator is editing anyone
  const permissionsDisabled = isCoordinator || (isAdmin && modal?.mode === "edit" && modal?.id === user?._id);

  const openAdd = () => {
    setForm({ ...emptyUser });
    setShowPw(false);
    setModal({ mode: "add" });
  };

  const openEdit = (user) => {
    const perms =
      Array.isArray(user.permissions) && user.permissions.includes("*")
        ? RESOURCES.flatMap((r) => ACTIONS.map((a) => pKey(r, a)))
        : (user.permissions ?? []);
    setForm({ ...user, password: "", permissions: perms });
    setShowPw(false);
    setModal({ mode: "edit", id: user._id || user.id });
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      errorAlert("Please fill in all required fields (Name and Email)");
      return;
    }
    if (modal.mode === "add" && (!form.password || form.password.length < 8)) {
      errorAlert("Password must be at least 8 characters");
      return;
    }
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === "permissions" && Array.isArray(form[key])) {
          if (form[key].length === 0) {
            formData.append("permissions[]", "__EMPTY__");
          } else {
            form[key].forEach(p => formData.append("permissions[]", p));
          }
        } else if (key === "avatar") {
           if (form[key] instanceof File) {
             formData.append("avatar", form[key]);
           }
        } else if (form[key] !== undefined && form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      if (modal.mode === "add") {
        const res = await createUser(formData);
        if (res.user) {
          addUser(res.user);
          toast.success(res.message);
          setModal(null);
        }
      } else {
        const res = await updateUser(modal.id, formData);
        if (res.user) {
          updateUserInList(modal.id, res.user);
          toast.success(res.message);
          setModal(null);
        }
      }
    } catch (err) {
      errorAlert(err.response?.data?.message || "Failed to save user");
    }
  };

  const handleDelete = async (user) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;
    const id = user._id || user.id;
    try {
      await deleteUser(id);
      removeUser(id);
      successAlert("User deleted successfully");
    } catch (err) {
      errorAlert("Failed to delete user", err);
    }
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
            {row.avatar ? (
              <img src={row.avatar} alt={v} className="w-full h-full object-cover" />
            ) : (
              v.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {v}
            </p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", label: "Role", render: (v) => <RoleBadge value={v} /> },
    ...(isAdmin || isSuperAdmin
      ? [
          {
            key: "password",
            label: "Password",
            render: (v) => <PasswordCell value={v} />,
          },
        ]
      : []),
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge value={v} />,
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (v = []) => {
        const isFull = Array.isArray(v) && v.includes("*");
        const count = isFull ? TOTAL : Array.isArray(v) ? v.length : 0;
        const pct = Math.round((count / TOTAL) * 100);
        return (
          <div className="flex items-center gap-2 min-w-[110px]">
            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? "bg-emerald-500" : count > TOTAL / 2 ? "bg-primary-500" : "bg-slate-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${isFull ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
            >
              {isFull ? <Infinity size={10} /> : <Key size={10} />}
              {isFull ? "Full" : `${count}/${TOTAL}`}
            </span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (v) => {
        const d = new Date(v);
        const date = d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const time = d.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <CalendarDays size={12} className="text-primary-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-none">
                {date}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                {time}
              </p>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Users
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {users.length} total users
          </p>
        </div>
        {isAuthorized && (
          <button className={btn("primary")} onClick={openAdd}>
            <Plus size={15} /> Add User
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <Table
          columns={columns}
          data={users}
          searchKeys={["name", "email", "role"]}
          actions={
            isAuthorized
              ? (row) => {
                  // Cannot edit/delete super admin unless you are super admin
                  if (row.role === "super_admin" && !isSuperAdmin) return null;
                  
                  return (
                    <>
                      <button
                        className={btn("ghost")}
                        onClick={() => openEdit(row)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className={btn("ghost")}
                        onClick={() => handleDelete(row)}
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </>
                  );
                }
              : undefined
          }
        />
      </div>

      {/* Modal */}
      {!!modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModal(null)}
          />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {modal.mode === "add" ? "Create User" : "Edit User"}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 max-h-[75vh] overflow-y-auto space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-500">
                    {form.avatar ? (
                      <img 
                        src={form.avatar instanceof File ? URL.createObjectURL(form.avatar) : form.avatar} 
                        className="w-full h-full object-cover" 
                        alt="Preview"
                      />
                    ) : (
                      <UserIcon size={32} className="text-slate-300 dark:text-slate-600" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <Camera size={20} className="text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setForm({ ...form, avatar: file });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {form.avatar ? "Click to change picture" : "Upload profile picture"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Full Name
                  </label>
                  <input
                    className={inp}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Email
                  </label>
                  <input
                    className={inp}
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Phone Number
                  </label>
                  <input
                    className={inp}
                    value={form.phno ?? ""}
                    onChange={(e) => setForm({ ...form, phno: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Date of Birth
                  </label>
                  <input
                    className={inp}
                    type="date"
                    value={form.dob ?? ""}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Address
                </label>
                <textarea
                  className={inp}
                  value={form.address ?? ""}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Full Address"
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  {modal.mode === "edit"
                    ? "New Password (leave blank to keep)"
                    : "Password"}
                </label>
                <div className="relative">
                  <input
                    className={inp + " pr-10"}
                    type={showPw ? "text" : "password"}
                    value={form.password ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder={
                      modal.mode === "edit"
                        ? "Leave blank to keep current"
                        : "Min 8 chars"
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Role
                  </label>
                  <select
                    className={inp}
                    value={form.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      let newPerms = form.permissions;
                      
                      if (newRole === "member") {
                        newPerms = [];
                      }
                      
                      setForm({ 
                        ...form, 
                        role: newRole, 
                        permissions: newPerms 
                      });
                    }}
                  >
                    {ROLES.filter(r => {
                      if (isSuperAdmin) return true;
                      if (isAdmin) return r !== "super_admin";
                      return false;
                    }).map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1).replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Status
                  </label>
                  <select
                    className={inp}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {form.role !== "member" && (
                <PermissionMatrix
                  permissions={form.permissions ?? []}
                  onChange={(perms) => setForm({ ...form, permissions: perms })}
                  disabled={permissionsDisabled}
                  requesterPermissions={isSuperAdmin ? ["*"] : isAdmin ? ["admin_power", ...(user?.permissions ?? [])] : (user?.permissions ?? [])}
                />
              )}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  className={btn("secondary")}
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button className={btn("primary")} onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
