import { useMemo, useState } from "react";
import { Plus, Check, X as XIcon } from "lucide-react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { Modal } from "../Modal";

type FormState = {
  employeeId: string;
  employeeName: string;
  leaveTypeId: string; // ✅ ObjectId string
  leaveTypeCode: string; // Added leave type code
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: string;
};

const safeISO = (value?: any) => {
  const d = value ? new Date(value) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const safeDateOnly = (value?: any) => safeISO(value).split("T")[0];

export function LeaveRequests() {
  const { leaveRequests, addLeaveRequest, updateLeaveRequest, leaveTypes, employees } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Log for debugging
  console.log('LeaveRequests component - leaveRequests:', leaveRequests);
  console.log('LeaveRequests component - leaveTypes:', leaveTypes);
  console.log('LeaveRequests component - employees:', employees);

  // Defensive programming: ensure arrays are always arrays
  const safeLeaveRequests = Array.isArray(leaveRequests) ? leaveRequests : [];
  const safeLeaveTypes = Array.isArray(leaveTypes) ? leaveTypes : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];

  // Log the safe arrays
  console.log('LeaveRequests component - safeLeaveRequests:', safeLeaveRequests);
  console.log('LeaveRequests component - safeLeaveTypes:', safeLeaveTypes);
  console.log('LeaveRequests component - safeEmployees:', safeEmployees);

  const canManageLeaves = user?.role === "admin" || user?.role === "hr";

  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const [formData, setFormData] = useState<FormState>({
    employeeId: user?.id || "",
    employeeName: user?.name || "",
    leaveTypeId: "",
    leaveTypeCode: "",
    startDate: "",
    endDate: "",
    days: 1,
    reason: "",
    status: "pending",
    appliedOn: safeDateOnly(new Date()),
  });

  // ----------------------------
  // Helpers: normalize ids/labels
  // ----------------------------
  const getId = (v: any) => String(v?._id || v?.id || v || "");

  const getLeaveTypeLabel = (v: any) => {
    // Log for debugging
    console.log('getLeaveTypeLabel called with:', v);
    console.log('Available leaveTypes:', safeLeaveTypes);

    // v could be: string(ObjectId), string(name), or object populated
    if (!v) return "-";
    if (typeof v === "object") return v.name || v.title || v._id || "-";

    // if string => try match by id in leaveTypes
    const found = (safeLeaveTypes as any[]).find((lt) => String(lt.id) === String(v) || String(lt._id) === String(v));
    console.log('Found leave type:', found);
    return found?.name || v;
  };

  const getEmployeeName = (v: any) => {
    if (!v) return "-";
    if (typeof v === "object") return v.name || "-";
    const found = (safeEmployees as any[]).find((e) => String(e.id) === String(v) || String(e._id) === String(v));
    return found?.name || "-";
  };

  const calcDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  const normalizeRequest = (lr: any) => {
    const start = lr.startDate || lr.fromDate || "";
    const end = lr.endDate || lr.toDate || "";
    const leaveTypeObjOrId = lr.leaveTypeId ?? lr.leaveType; // both possible
    const leaveTypeLabel = getLeaveTypeLabel(leaveTypeObjOrId);
    const leaveTypeCode = lr.leaveTypeCode || "";

    const employeeId = getId(lr.employeeId);
    const employeeName = lr.employeeName || getEmployeeName(lr.employeeId);

    return {
      ...lr,
      id: String(lr.id || lr._id),
      employeeId,
      employeeName,
      startDate: start,
      endDate: end,
      leaveTypeLabel,
      leaveTypeCode,
      appliedOn: lr.appliedOn || safeDateOnly(lr.createdAt || lr.updatedAt || new Date()),
      status: lr.status || "pending",
      days: Number(lr.days || calcDays(start, end) || 1),
    };
  };

  // ----------------------------
  // Filtered list
  // ----------------------------
  const filteredRequests = useMemo(() => {
    const list = (safeLeaveRequests as any[]).map(normalizeRequest);

    return list.filter((lr) => {
      if (!canManageLeaves && String(lr.employeeId) !== String(user?.id)) return false;
      if (filterStatus !== "all" && lr.status !== filterStatus) return false;
      return true;
    });
  }, [leaveRequests, canManageLeaves, user?.id, filterStatus]);

  // ----------------------------
  // Actions
  // ----------------------------
  const handleAdd = () => {
    setFormData({
      employeeId: user?.id || "",
      employeeName: user?.name || "",
      leaveTypeId: "",
      leaveTypeCode: "",
      startDate: "",
      endDate: "",
      days: 1,
      reason: "",
      status: "pending",
      appliedOn: safeDateOnly(new Date()),
    });
    setShowModal(true);
  };

  const handleEmployeeChange = (employeeId: string) => {
    const emp = (safeEmployees as any[]).find((e) => String(e.id) === String(employeeId) || String(e._id) === String(employeeId));
    setFormData((p) => ({
      ...p,
      employeeId,
      employeeName: emp?.name || p.employeeName,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const days = calcDays(formData.startDate, formData.endDate);

    // ✅ backend payload keys (common)
    const payload: any = {
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      leaveTypeId: formData.leaveTypeId,
      leaveTypeCode: formData.leaveTypeCode, // Added leave type code
      fromDate: formData.startDate,
      toDate: formData.endDate,
      reason: formData.reason,
      days,
      status: "pending",
      appliedOn: formData.appliedOn,
    };

    addLeaveRequest(payload);
    setShowModal(false);

    const leaveTypeName = getLeaveTypeLabel(formData.leaveTypeId);

    addNotification({
      type: "leave",
      title: "New Leave Request",
      message: `${formData.employeeName} has requested ${leaveTypeName} from ${formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-GB') : ''} to ${formData.endDate ? new Date(formData.endDate).toLocaleDateString('en-GB') : ''}`,
      priority: "high",
      relatedId: Date.now().toString(),
      actionUrl: "leave-requests",
    });
  };

  const handleApprove = (id: string) => {
    const reqRaw: any = (leaveRequests as any[]).find((lr) => String(lr.id || lr._id) === String(id));
    const req = normalizeRequest(reqRaw || {});

    updateLeaveRequest(id, { status: "approved" } as any);

    addNotification({
      type: "leave",
      title: "Leave Request Approved",
      message: `Leave approved for ${req.employeeName} (${req.leaveTypeLabel}) from ${req.startDate ? new Date(req.startDate).toLocaleDateString('en-GB') : ''} to ${req.endDate ? new Date(req.endDate).toLocaleDateString('en-GB') : ''}`,
      priority: "medium",
      relatedId: id,
      actionUrl: "leave-requests",
    });
  };

  const handleReject = (id: string) => {
    const reqRaw: any = (leaveRequests as any[]).find((lr) => String(lr.id || lr._id) === String(id));
    const req = normalizeRequest(reqRaw || {});

    updateLeaveRequest(id, { status: "rejected" } as any);

    addNotification({
      type: "leave",
      title: "Leave Request Rejected",
      message: `Leave rejected for ${req.employeeName} (${req.leaveTypeLabel}) from ${req.startDate ? new Date(req.startDate).toLocaleDateString('en-GB') : ''} to ${req.endDate ? new Date(req.endDate).toLocaleDateString('en-GB') : ''}`,
      priority: "high",
      relatedId: id,
      actionUrl: "leave-requests",
    });
  };

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leave Requests</h1>
          <p className="text-gray-600 mt-1">Manage leave applications</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Apply Leave
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map((req: any) => (
          <div key={req.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{req.employeeName}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${req.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : req.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Leave Type</p>
                    <p className="text-sm font-medium text-gray-800">{req.leaveTypeLabel} {req.leaveTypeCode && `(${req.leaveTypeCode})`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="text-sm font-medium text-gray-800">{req.startDate ? new Date(req.startDate).toLocaleDateString('en-GB') : "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="text-sm font-medium text-gray-800">{req.endDate ? new Date(req.endDate).toLocaleDateString('en-GB') : "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days</p>
                    <p className="text-sm font-medium text-gray-800">{req.days} days</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">Reason</p>
                  <p className="text-sm text-gray-800 mt-1">{req.reason || "-"}</p>
                </div>

                <p className="text-xs text-gray-500 mt-3">Applied on: {req.appliedOn ? new Date(req.appliedOn).toLocaleDateString('en-GB') : '-'}</p>
              </div>

              {canManageLeaves && req.status === "pending" && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XIcon size={16} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Apply for Leave">
          <form onSubmit={handleSubmit} className="space-y-4">
            {canManageLeaves && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {safeEmployees.map((emp: any) => (
                    <option key={emp.id || emp._id} value={emp.id || emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                value={formData.leaveTypeId}
                onChange={(e) => {
                  const selectedLeaveType = safeLeaveTypes.find((lt: any) => (lt.id || lt._id) === e.target.value);
                  setFormData((p) => ({
                    ...p,
                    leaveTypeId: e.target.value,
                    leaveTypeCode: selectedLeaveType ? (selectedLeaveType.code || '') : ''
                  }));
                }}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Leave Type</option>
                {safeLeaveTypes.map((lt: any) => (
                  <option key={lt.id || lt._id} value={lt.id || lt._id}>
                    {lt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Leave Type Code - Hidden input to store the code */}
            <input
              type="hidden"
              value={formData.leaveTypeCode}
              readOnly
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
