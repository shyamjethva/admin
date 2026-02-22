import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";
import { taskService } from "../services/taskService";
import { whatchatService } from "../services/whatchatservices.ts";

// Simple interfaces
interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  headOfDepartment: string;
  employeeCount: number;
}

interface Designation {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  level: string;
  description: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  status: "open" | "closed";
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  status: "applied" | "screening" | "interview" | "offered" | "rejected";
  appliedDate: string;
  resume?: string;
}

interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  date: string;
  time: string;
  interviewer: string;
  mode: "in-person" | "video" | "phone";
  status: "scheduled" | "completed" | "cancelled";
}

interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "pending" | "processed" | "paid";
}

interface SalaryComponent {
  id: string;
  name: string;
  type: "allowance" | "deduction";
  amount: number;
  isPercentage: boolean;
  description: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  assignedByName: string;
  taskType: "daily" | "weekly";
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
  isTimerRunning?: boolean;
  timerStartTime?: string | null;
  totalTimeSpent?: number;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "hr" | "employee";
  messageType: "text" | "file" | "image" | "system";
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileData?: string;
  timestamp?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category:
  | "company-wide"
  | "department"
  | "hr-updates"
  | "events"
  | "alerts"
  | "achievements"
  | "policy";
  priority: "low" | "medium" | "high" | "urgent";
  department?: string;
  createdBy: string;
  createdAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

interface DataContextType {
  employees: Employee[];
  departments: any[];
  designations: Designation[];
  shifts: Shift[];
  leaveRequests: any[];
  leaveTypes: any[];
  jobPostings: JobPosting[];
  candidates: Candidate[];
  announcements: any[];
  chatMessages: any[];
  tasks: any[];
  clients: any[];
  clockRecords: any[];
  attendance: any[];
  absences: any[];
  interviews: any[];
  payrollEntries: any[];
  salaryComponents: SalaryComponent[];
  birthdays: any[];
  holidays: any[];
  isClockActive: boolean;
  setIsClockActive: (active: boolean) => void;
  toggleClock: () => void;
  workingTime: { hours: number; minutes: number; seconds: number };
  fetchData: (module: string, setter: any, initial: any) => Promise<void>;
  addClockRecord: (data: any) => Promise<any>;
  updateClockRecord: (id: string, data: any) => Promise<any>;
  setClockRecords: any;
  initialClockRecords: any[];
  addEmployee: (employee: any) => Promise<void>;
  updateEmployee: (id: string, employee: any) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addDepartment: (department: any) => Promise<void>;
  updateDepartment: (id: string, department: any) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addDesignation: (designation: any) => Promise<void>;
  updateDesignation: (id: string, designation: any) => Promise<void>;
  deleteDesignation: (id: string) => Promise<void>;
  addShift: (shift: any) => Promise<void>;
  updateShift: (id: string, shift: any) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  addAttendance: (attendance: any) => Promise<void>;
  updateAttendance: (id: string, attendance: any) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  markAbsentEmployees: (date?: string) => Promise<void>;
  addLeaveRequest: (request: any) => Promise<void>;
  updateLeaveRequest: (id: string, request: any) => Promise<void>;
  deleteLeaveRequest: (id: string) => Promise<void>;
  addLeaveType: (leaveType: any) => Promise<void>;
  updateLeaveType: (id: string, leaveType: any) => Promise<void>;
  deleteLeaveType: (id: string) => Promise<void>;
  addCandidate: (candidate: any) => Promise<void>;
  updateCandidate: (id: string, candidate: any) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  addInterview: (interview: any) => Promise<void>;
  updateInterview: (id: string, interview: any) => Promise<void>;
  deleteInterview: (id: string) => Promise<void>;
  addPayrollEntry: (entry: any) => Promise<void>;
  updatePayrollEntry: (id: string, entry: any) => Promise<void>;
  deletePayrollEntry: (id: string) => Promise<void>;
  addSalaryComponent: (component: any) => Promise<void>;
  updateSalaryComponent: (id: string, component: any) => Promise<void>;
  deleteSalaryComponent: (id: string) => Promise<void>;
  addClient: (client: any) => Promise<void>;
  updateClient: (id: string, client: any) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addTask: (payload: any) => Promise<any>;
  updateTask: (id: string, payload: any) => Promise<any>;
  deleteTask: (id: string) => Promise<void>;
  addChatMessage: (payload: any) => Promise<void>;
  updateChatMessage: (id: string, patch: any) => Promise<void>;
  deleteChatMessage: (id: string) => Promise<void>;
  addAnnouncement: (announcement: any) => Promise<any>;
  updateAnnouncement: (id: string, announcement: any) => Promise<any>;
  deleteAnnouncement: (id: string) => Promise<any>;
}

const DataContext = createContext(undefined);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [clockRecords, setClockRecords] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [payrollEntries, setPayrollEntries] = useState([]);
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([]);
  const [birthdays, setBirthdays] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [isClockActive, setIsClockActive] = useState(false);
  const [workingTime, setWorkingTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Initial data arrays
  const initialEmployees = [];
  const initialDepartments = [];
  const initialDesignations = [];
  const initialShifts = [];
  const initialLeaveRequests = [];
  const initialLeaveTypes = [];
  const initialJobPostings = [];
  const initialCandidates = [];
  const initialAnnouncements = [];
  const initialChatMessages = [];
  const initialTasks = [];
  const initialClients = [];
  const initialClockRecords = [];
  const initialAttendance = [];
  const initialAbsences = [];
  const initialInterviews = [];
  const initialPayrollEntries = [];
  const initialBirthdays = [];
  const initialHolidays = [];

  // Toggle clock state
  const toggleClock = useCallback(() => {
    setIsClockActive(prev => !prev);
  }, []);

  // Helper functions
  const isValidObjectId = (id) => {
    if (!id) return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  const capitalizeStatus = (status) => {
    if (!status) return status;
    // Keep status as-is since backend expects lowercase
    return status.toLowerCase();
  };

  // Normalize ID function
  const normalizeId = (item) => ({
    ...item,
    id: item._id || item.id,
  });

  // Employee CRUD functions
  const addEmployee = async (employee) => {
    try {
      const departmentId = employee.departmentId;
      const designationId = employee.designationId;

      if (!isValidObjectId(departmentId)) throw new Error("Valid Department is required");
      if (!isValidObjectId(designationId)) throw new Error("Valid Designation is required");

      const payload = {
        name: employee.name?.trim(),
        email: employee.email?.trim()?.toLowerCase(),
        phone: employee.phone?.trim() || "",
        departmentId,
        designationId,
        joiningDate: employee.joiningDate,
        status: capitalizeStatus(employee.status) || "Active",
        salary: employee.salary || 0,
        role: employee.role || "Employee",
        avatar: employee.avatar || "",
        address: employee.address || "",
        bloodGroup: employee.bloodGroup || "",
        emergencyContact: employee.emergencyContact || "",
      };

      if (!payload.name) throw new Error("Employee name is required");
      if (!payload.email) throw new Error("Employee email is required");

      const res = await api.post("/employees", payload);
      const createdEmp = res?.data?.data ?? res?.data ?? res;
      setEmployees(prev => [normalizeId(createdEmp), ...prev]);
    } catch (err) {
      console.error("addEmployee failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updateEmployee = async (id, employee) => {
    try {
      const departmentId = employee.departmentId;
      const designationId = employee.designationId;

      if (!isValidObjectId(departmentId)) throw new Error("Valid Department is required");
      if (!isValidObjectId(designationId)) throw new Error("Valid Designation is required");

      const payload = {
        name: employee.name?.trim(),
        email: employee.email?.trim()?.toLowerCase(),
        phone: employee.phone?.trim() || "",
        profileImage: employee.profileImage || "",
        departmentId,
        designationId,
        joiningDate: employee.joiningDate,
        status: capitalizeStatus(employee.status) || "Active",
        salary: employee.salary || 0,
        role: employee.role || "Employee",
        avatar: employee.avatar || "",
        address: employee.address || "",
        bloodGroup: employee.bloodGroup || "",
        emergencyContact: employee.emergencyContact || "",
      };

      const res = await api.put(`/employees/${id}`, payload);
      const updatedEmp = res?.data?.data ?? res?.data ?? res;
      setEmployees(prev =>
        prev.map(e => (e.id === id ? normalizeId({ ...e, ...updatedEmp }) : e))
      );
    } catch (err) {
      console.error("updateEmployee failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error("deleteEmployee failed:", err?.response?.data || err);
      throw err;
    }
  };

  // Department CRUD functions
  const addDepartment = async (department) => {
    try {
      const payload = {
        name: department.name?.trim(),
        description: department.description?.trim() || "",
        headOfDepartment: department.headOfDepartment?.trim(),
        employeeCount: Number(department.employeeCount || 0),
      };

      if (!payload.name) throw new Error("Department name is required");
      if (!payload.headOfDepartment) throw new Error("Head of Department is required");

      const res = await api.post("/departments", payload);
      const created = res?.data?.data ?? res?.data ?? res;
      setDepartments(prev => [normalizeId(created), ...prev]);
    } catch (err) {
      console.error("addDepartment failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updateDepartment = async (id, department) => {
    try {
      const payload = {
        name: String(department?.name || "").trim(),
        description: String(department?.description || "").trim(),
        headOfDepartment: String(department?.headOfDepartment || "").trim(),
        employeeCount: Number(department?.employeeCount ?? 0),
      };

      await api.put(`/departments/${id}`, payload);
      await fetchData("departments", setDepartments, initialDepartments);
    } catch (err) {
      console.error("updateDepartment failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      await fetchData("departments", setDepartments, initialDepartments);
    } catch (err) {
      console.error("deleteDepartment failed:", err?.response?.data || err);
      throw err;
    }
  };

  // Designation CRUD functions
  // Shift CRUD functions
  const addShift = async (shift) => {
    try {
      await api.post("/shifts", shift);
      await fetchData("shifts", setShifts, initialShifts);
    } catch (err) {
      console.error("addShift failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updateShift = async (id, shift) => {
    try {
      await api.put(`/shifts/${id}`, shift);
      await fetchData("shifts", setShifts, initialShifts);
    } catch (err) {
      console.error("updateShift failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteShift = async (id) => {
    try {
      await api.delete(`/shifts/${id}`);
      await fetchData("shifts", setShifts, initialShifts);
    } catch (err) {
      console.error("deleteShift failed:", err?.response?.data || err);
      throw err;
    }
  };

  const addDesignation = async (designation) => {
    try {
      const name = designation.name || designation.title;
      const code = designation.code || name?.replace(/\s+/g, "_").toUpperCase().substring(0, 10) || `DESIG_${Date.now()}`;
      const departmentId = designation.departmentId || designation.department;

      if (!name?.trim()) throw new Error("Name is required for designation");
      if (!isValidObjectId(departmentId)) throw new Error("Valid Department is required");

      const payload = {
        name: name.trim(),
        code: code.trim(),
        departmentId,
        level: designation.level || "Entry",
        description: designation.description || "",
      };

      await api.post("/designations", payload);
      await fetchData("designations", setDesignations, initialDesignations);
    } catch (err) {
      console.error("addDesignation failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updateDesignation = async (id, designation) => {
    try {
      const departmentId = designation.departmentId || designation.department;

      const payload = {
        ...designation,
      };

      if (designation.title && !designation.name) {
        payload.name = String(designation.title).trim();
        delete payload.title;
      }

      if (departmentId) {
        payload.departmentId = departmentId;
        delete payload.department;
      }

      await api.put(`/designations/${id}`, payload);
      await fetchData("designations", setDesignations, initialDesignations);
    } catch (err) {
      console.error("updateDesignation failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteDesignation = async (id) => {
    try {
      await api.delete(`/designations/${id}`);
      await fetchData("designations", setDesignations, initialDesignations);
    } catch (err) {
      console.error("deleteDesignation failed:", err?.response?.data || err);
      throw err;
    }
  };

  // Helper function for status mapping
  const mapStatus = (s) => {
    const v = String(s ?? "").trim().toLowerCase();
    if (["present"].includes(v)) return "present";
    if (["absent"].includes(v)) return "absent";
    if (["late"].includes(v)) return "late";
    if (["half day", "half-day", "halfday"].includes(v)) return "half-day";
    if (["on leave", "on-leave", "leave"].includes(v)) return "on-leave";
    return "present"; // default
  };

  // Attendance CRUD functions
  const addAttendance = async (attendanceEntry) => {
    try {
      const checkIn = attendanceEntry.checkIn;
      const checkOut = attendanceEntry.checkOut;

      if (!attendanceEntry.employeeId) throw new Error("employeeId is required");
      if (!attendanceEntry.date) throw new Error("date is required");
      if (!checkIn) throw new Error("checkIn is required");

      let hours = 0;
      if (checkIn && checkOut) {
        const [inHour, inMin] = checkIn.split(":").map(Number);
        const [outHour, outMin] = checkOut.split(":").map(Number);

        // Handle overnight shifts (checkOut < checkIn)
        let totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
        if (totalMinutes < 0) {
          // Add 24 hours (1440 minutes) for overnight shifts
          totalMinutes += 24 * 60;
        }

        hours = Math.max(0, totalMinutes / 60);
      }

      const payload = {
        employeeId: attendanceEntry.employeeId,
        employeeName: attendanceEntry.employeeName || "",
        date: attendanceEntry.date,
        checkIn,
        checkOut: checkOut || undefined,
        status: mapStatus(attendanceEntry.status),
        hours, // ✅ IMPORTANT (backend expects hours)
        notes: attendanceEntry.notes || "",
      };

      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await api.post("/attendance", payload);
      // Force refresh attendance data
      await fetchData("attendance", setAttendance, initialAttendance);

      // Additional force refresh to ensure UI updates
      setTimeout(() => {
        fetchData("attendance", setAttendance, initialAttendance);
      }, 100);
    } catch (err) {
      console.error("addAttendance failed:", err?.response?.data || err);

      // Handle duplicate attendance error
      if (err?.response?.status === 409) {
        const errorMessage = err?.response?.data?.message || "Attendance already exists for this employee on this date";
        // Show user-friendly message
        if (typeof window !== 'undefined' && window.alert) {
          alert(`⚠️ ${errorMessage}`);
        } else {
          console.warn('Duplicate attendance:', errorMessage);
        }
      } else {
        const errorMessage = err?.response?.data?.message || err.message || "Failed to add attendance";
        if (typeof window !== 'undefined' && window.alert) {
          alert(`❌ Error: ${errorMessage}`);
        } else {
          console.error('Attendance error:', errorMessage);
        }
      }
      throw err;
    }
  };

  const updateAttendance = async (id, attendanceEntry) => {
    try {
      const payload = {
        employeeId: attendanceEntry.employeeId,
        employeeName: attendanceEntry.employeeName,
        date: attendanceEntry.date,
        checkIn: attendanceEntry.checkIn,
        checkOut: attendanceEntry.checkOut,
        status: mapStatus(attendanceEntry.status),
        hours: attendanceEntry.hours, // ✅ IMPORTANT
        notes: attendanceEntry.notes,
      };

      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await api.put(`/attendance/${id}`, payload);
      await fetchData("attendance", setAttendance, initialAttendance);
    } catch (err) {
      console.error("updateAttendance failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteAttendance = async (id) => {
    try {
      await api.delete(`/attendance/${id}`);
      await fetchData("attendance", setAttendance, initialAttendance);
    } catch (err) {
      console.error("deleteAttendance failed:", err?.response?.data || err);
      throw err;
    }
  };

  const markAbsentEmployees = async (date?: string) => {
    try {
      const response = await api.post('/attendance/mark-absent', { date });
      console.log('✅ Marked absent employees:', response.data);

      // Refresh attendance data after marking absent employees
      await fetchData("attendance", setAttendance, initialAttendance);

      // Show success message
      if (typeof window !== 'undefined' && window.alert) {
        alert(`✅ Successfully marked ${response.data.data.absentCount} employees as absent for ${response.data.data.date}`);
      }
    } catch (err) {
      console.error("markAbsentEmployees failed:", err?.response?.data || err);

      // Show error message
      const errorMessage = err?.response?.data?.message || err.message || "Failed to mark absent employees";
      if (typeof window !== 'undefined' && window.alert) {
        alert(`❌ Error: ${errorMessage}`);
      }

      throw err;
    }
  };

  // Leave Request CRUD functions
  const addLeaveRequest = async (request) => {
    try {
      // Map frontend fields to backend model
      const payload = {
        employeeId: request.employeeId || request.employee,
        employeeName: request.employeeName || "",
        leaveTypeId: request.leaveTypeId || request.leaveType,
        leaveTypeName: "", // Will be populated by backend
        fromDate: request.fromDate || request.startDate,
        toDate: request.toDate || request.endDate,
        reason: request.reason || "",
        status: "pending", // Must be lowercase to match backend enum
        createdBy: request.employeeId || "",
      };

      // Validation
      if (!payload.employeeId) {
        throw new Error("Employee is required");
      }
      if (!payload.leaveTypeId) {
        throw new Error("Leave type is required");
      }
      if (!payload.fromDate || !payload.toDate) {
        throw new Error("Start date and end date are required");
      }

      console.log('🔄 Adding leave request with payload:', payload);
      await api.post("/leaves", payload);
      await fetchData("leaveRequests", setLeaveRequests, initialLeaveRequests);
    } catch (err) {
      console.error("addLeaveRequest failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updateLeaveRequest = async (id, request) => {
    try {
      const payload: any = {};
      if (request.status) payload.status = request.status.toLowerCase(); // Keep lowercase to match backend enum
      if (request.reason) payload.reason = request.reason;

      console.log('🔄 Updating leave request with payload:', payload);
      await api.put(`/leaves/${id}`, payload);
      await fetchData("leaveRequests", setLeaveRequests, initialLeaveRequests);
    } catch (err) {
      console.error("updateLeaveRequest failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteLeaveRequest = async (id) => {
    try {
      console.log('🔄 Deleting leave request with id:', id);
      await api.delete(`/leaves/${id}`);
      await fetchData("leaveRequests", setLeaveRequests, initialLeaveRequests);
    } catch (err) {
      console.error("deleteLeaveRequest failed:", err?.response?.data || err);
      throw err;
    }
  };

  // Leave Type CRUD functions
  const addLeaveType = async (leaveType) => {
    try {
      // Generate code from name if not provided
      const name = leaveType.name?.trim();
      let code = leaveType.code?.trim();

      if (!code && name) {
        // Generate code from first letters of each word
        code = name.split(' ')
          .map((word) => word.charAt(0).toUpperCase())
          .join('')
          .substring(0, 4)
          .toUpperCase();
      }

      const payload = {
        name: name,
        code: code,
        description: leaveType.description,
        isPaid: leaveType.isPaid,
        maxDays: leaveType.maxDays,
      };

      if (!payload.name || !payload.code) {
        throw new Error("Name and Code are required");
      }

      console.log('🔄 Adding leave type with payload:', payload);
      await api.post("/leave-types", payload);
      await fetchData("leave-types", setLeaveTypes, initialLeaveTypes);
    } catch (err) {
      console.error("addLeaveType failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updateLeaveType = async (id, leaveType) => {
    try {
      // Validate required fields
      if (!leaveType.name || !leaveType.name.trim()) {
        throw new Error("Name is required");
      }

      if (!leaveType.code || !leaveType.code.trim()) {
        throw new Error("Code is required");
      }

      const payload = {
        name: leaveType.name.trim(),
        code: leaveType.code.trim().toUpperCase(),
        description: leaveType.description,
        isPaid: leaveType.isPaid,
        maxDays: leaveType.maxDays,
      };

      console.log('🔄 Updating leave type with payload:', payload);
      await api.put(`/leave-types/${id}`, payload);
      await fetchData("leave-types", setLeaveTypes, initialLeaveTypes);
    } catch (err) {
      console.error("updateLeaveType failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteLeaveType = async (id) => {
    try {
      console.log('🔄 Deleting leave type with id:', id);
      await api.delete(`/leave-types/${id}`);
      await fetchData("leave-types", setLeaveTypes, initialLeaveTypes);
    } catch (err) {
      console.error("deleteLeaveType failed:", err?.response?.data || err);
      throw err;
    }
  };

  // Job Posting CRUD functions
  const addJobPosting = async (job) => {
    try {
      await api.post("/recruitment/jobs", job);
      await fetchData("recruitment/jobs", setJobPostings, initialJobPostings);
    } catch (err) {
      console.error("addJobPosting failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updateJobPosting = async (id, job) => {
    try {
      await api.put(`/recruitment/jobs/${id}`, job);
      await fetchData("recruitment/jobs", setJobPostings, initialJobPostings);
    } catch (err) {
      console.error("updateJobPosting failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteJobPosting = async (id) => {
    try {
      await api.delete(`/recruitment/jobs/${id}`);
      await fetchData("recruitment/jobs", setJobPostings, initialJobPostings);
    } catch (err) {
      console.error("deleteJobPosting failed:", err?.response?.data || err);
      throw err;
    }
  };

  // Candidate CRUD functions
  const addCandidate = async (candidate) => {
    try {
      await api.post("/recruitment/candidates", candidate);
      await fetchData("recruitment/candidates", setCandidates, initialCandidates);
    } catch (err) {
      console.error("addCandidate failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updateCandidate = async (id, candidate) => {
    try {
      await api.put(`/recruitment/candidates/${id}`, candidate);
      await fetchData("recruitment/candidates", setCandidates, initialCandidates);
    } catch (err) {
      console.error("updateCandidate failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteCandidate = async (id) => {
    try {
      await api.delete(`/recruitment/candidates/${id}`);
      await fetchData("recruitment/candidates", setCandidates, initialCandidates);
    } catch (err) {
      console.error("deleteCandidate failed:", err?.response?.data || err);
      throw err;
    }
  };

  // Interview CRUD functions
  const addInterview = async (interview) => {
    try {
      await api.post("/recruitment/interviews", interview);
      await fetchData("recruitment/interviews", setInterviews, initialInterviews);
    } catch (err) {
      console.error("addInterview failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updateInterview = async (id, interview) => {
    try {
      await api.put(`/recruitment/interviews/${id}`, interview);
      await fetchData("recruitment/interviews", setInterviews, initialInterviews);
    } catch (err) {
      console.error("updateInterview failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteInterview = async (id) => {
    try {
      await api.delete(`/recruitment/interviews/${id}`);
      await fetchData("recruitment/interviews", setInterviews, initialInterviews);
    } catch (err) {
      console.error("deleteInterview failed:", err?.response?.data || err);
      throw err;
    }
  };

  // Payroll CRUD functions
  const addPayrollEntry = async (entry) => {
    try {
      await api.post("/payroll", entry);
      await fetchData("payroll", setPayrollEntries, []);
    } catch (err) {
      console.error("addPayrollEntry failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updatePayrollEntry = async (id, entry) => {
    try {
      await api.put(`/payroll/${id}`, entry);
      await fetchData("payroll", setPayrollEntries, []);
    } catch (err) {
      console.error("updatePayrollEntry failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deletePayrollEntry = async (id) => {
    try {
      await api.delete(`/payroll/${id}`);
      await fetchData("payroll", setPayrollEntries, []);
    } catch (err) {
      console.error("deletePayrollEntry failed:", err?.response?.data || err);
      throw err;
    }
  };

  // Salary Component CRUD functions
  const addSalaryComponent = async (component) => {
    try {
      await api.post("/salary-components", component);
      await fetchData("salary-components", setSalaryComponents, []);
    } catch (err) {
      console.error("addSalaryComponent failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updateSalaryComponent = async (id, component) => {
    try {
      await api.put(`/salary-components/${id}`, component);
      await fetchData("salary-components", setSalaryComponents, []);
    } catch (err) {
      console.error("updateSalaryComponent failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteSalaryComponent = async (id) => {
    try {
      await api.delete(`/salary-components/${id}`);
      await fetchData("salary-components", setSalaryComponents, []);
    } catch (err) {
      console.error("deleteSalaryComponent failed:", err?.response?.data || err);
      throw err;
    }
  };

  // Client CRUD functions
  const addClient = async (client) => {
    try {
      const payload = {
        company: client.company,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone,
        industry: client.industry ?? "general",
        projects: client.projects ?? 0,
        address: client.address ?? "",
        status: client.status ?? "active",
      };
      await api.post("/clients", payload);
      await fetchData("clients", setClients, initialClients);
    } catch (err) {
      console.error("addClient failed:", err?.response?.data || err);
      throw err;
    }
  };

  const updateClient = async (id, client) => {
    try {
      const payload = {
        company: client.company,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone,
        industry: client.industry ?? "general",
        projects: client.projects ?? 0,
        address: client.address ?? "",
        status: client.status ?? "active",
      };
      await api.put(`/clients/${id}`, payload);
      await fetchData("clients", setClients, initialClients);
    } catch (err) {
      console.error("updateClient failed:", err?.response?.data || err);
      throw err;
    }
  };

  const deleteClient = async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      await fetchData("clients", setClients, initialClients);
    } catch (err) {
      console.error("deleteClient failed:", err?.response?.data || err);
      throw err;
    }
  };

  // Task CRUD functions
  const addTask = async (payload) => {
    try {
      const created = await taskService.create(payload);

      if (created) {
        const normalized = { ...created, id: created._id || created.id };

        // Instant UI update
        setTasks((prev) => [normalized, ...prev]);
      }

      // Also refetch to keep perfect sync
      await fetchData("tasks", setTasks, initialTasks);

      return created;
    } catch (e) {
      console.error("addTask failed:", e?.response?.data || e);
      throw e;
    }
  };

  const updateTask = async (id, payload) => {
    try {
      const updated = await taskService.update(id, payload); // PUT /tasks/:id
      await fetchData("tasks", setTasks, initialTasks); // refresh
      return updated;
    } catch (e) {
      console.error("updateTask failed:", e?.response?.data || e);
      throw e;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskService.remove(id);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      await fetchData("tasks", setTasks, initialTasks);
    } catch (e) {
      console.error("deleteTask failed:", e?.response?.data || e);
      throw e;
    }
  };

  // Chat Message CRUD functions
  const addChatMessage = async (payload) => {
    try {
      await whatchatService.create(payload);
      await fetchData("chat", setChatMessages, []);
    } catch (e) {
      console.error("addChatMessage failed:", e?.response?.data || e);
      throw e;
    }
  };

  const updateChatMessage = async (id, patch) => {
    try {
      await api.put(`/chat/${id}`, patch); // PUT /chat/:id
      await fetchData("chat", setChatMessages, []);
    } catch (e) {
      console.error("updateChatMessage failed:", e?.response?.data || e);
      throw e;
    }
  };

  const deleteChatMessage = async (id) => {
    try {
      await api.delete(`/chat/${id}`); // DELETE /chat/:id
      await fetchData("chat", setChatMessages, []);
    } catch (e) {
      console.error("deleteChatMessage failed:", e?.response?.data || e);
      throw e;
    }
  };

  // Announcement CRUD functions
  const addAnnouncement = async (announcement) => {
    try {
      // Check user authentication and role
      const currentUser = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");

      if (!token) {
        console.error('❌ No authentication token found');
        alert('Authentication required. Please log in again.');
        throw new Error('Authentication required');
      }

      let userId = "";
      if (currentUser) {
        const user = JSON.parse(currentUser);
        userId = user.id || user._id;

        if (user.role !== 'admin' && user.role !== 'hr') {
          console.error('🚫 User role not authorized for announcements:', user.role);
          alert('Permission denied. Only Admin and HR users can create announcements.');
          throw new Error('Permission denied');
        }
      }

      // Map frontend categories to backend types
      const categoryToTypeMap = {
        "company-wide": "general",
        "department": "department",
        "hr-updates": "hr",
        "events": "event",
        "alerts": "alert",
        "achievements": "achievement",
        "policy": "policy"
      };

      const payload = {
        title: announcement.title,
        content: announcement.content,
        type: categoryToTypeMap[announcement.category] || "general",
        department: announcement.department || "",
        priority: announcement.priority || "medium",
        startDate: announcement.createdAt || new Date().toISOString().split("T")[0],
        endDate: announcement.expiresAt || "",
        isActive: true,
        createdBy: userId,
        audience: announcement.category === 'company-wide' ? 'all' :
          announcement.category === 'hr-updates' ? 'hr' : 'employee'
      };

      console.log('📤 Sending announcement payload:', payload);

      const response = await api.post("/announcements", payload);
      await fetchData("announcements", setAnnouncements, []);
      return response;
    } catch (err) {
      console.error("addAnnouncement failed:", err);
      throw err;
    }
  };

  const updateAnnouncement = async (id, announcement) => {
    try {
      // Map frontend categories to backend types
      const categoryToTypeMap = {
        "company-wide": "general",
        "department": "department",
        "hr-updates": "hr",
        "events": "event",
        "alerts": "alert",
        "achievements": "achievement",
        "policy": "policy"
      };

      // Create a clean payload without problematic fields
      const payload = {};

      // Handle all fields that might be updated
      if ('title' in announcement) (payload as any).title = announcement.title;
      if ('content' in announcement) (payload as any).content = announcement.content;

      // Handle category mapping
      if ('category' in announcement && announcement.category !== undefined) {
        (payload as any).type = categoryToTypeMap[announcement.category] || "general";
        (payload as any).audience = announcement.category === 'company-wide' ? 'all' :
          announcement.category === 'hr-updates' ? 'hr' : 'employee';
      }

      if ('department' in announcement) (payload as any).department = announcement.department;
      if ('priority' in announcement) (payload as any).priority = announcement.priority;

      // Handle date fields
      if ('createdAt' in announcement) {
        (payload as any).startDate = announcement.createdAt || null;
      }
      if ('expiresAt' in announcement) {
        (payload as any).endDate = announcement.expiresAt || null;
      }
      if ('isActive' in announcement) (payload as any).isActive = announcement.isActive;

      console.log('📤 Sending update payload:', payload);

      const response = await api.put(`/announcements/${id}`, payload);
      await fetchData("announcements", setAnnouncements, []);
      return response;
    } catch (err) {
      console.error("updateAnnouncement failed:", err);
      throw err;
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      const response = await api.delete(`/announcements/${id}`);
      await fetchData("announcements", setAnnouncements, []);
      return response;
    } catch (err) {
      console.error("deleteAnnouncement failed:", err);
      throw err;
    }
  };

  // Fetch data function
  const fetchData = useCallback(async (module, setter, initial) => {
    if (!user) return;

    try {
      console.log(`🔄 Fetching data for module: ${module}`);
      const response = await api.get(`/${module}`);

      const data = response.data;
      let list = Array.isArray(data) ? data : data.data || [];
      // Special normalization for tasks: assignedTo and assignedBy may be objects (populated) or strings (ids)
      if (module === 'tasks') {
        list = list.map((task) => {
          let assignedTo = task.assignedTo;
          let assignedBy = task.assignedBy;
          let assignedByName = task.assignedByName;

          if (assignedTo && typeof assignedTo === 'object') {
            assignedTo = assignedTo._id || assignedTo.id || assignedTo;
          }

          if (assignedBy && typeof assignedBy === 'object') {
            assignedBy = assignedBy._id || assignedBy.id || assignedBy;
            // If assignedBy was an object with a name, use it
            if (assignedBy.name) {
              assignedByName = assignedBy.name;
            }
          }

          return {
            ...task,
            assignedTo,
            assignedBy,
            assignedByName: assignedByName || (assignedBy ? 'Admin' : 'System')
          };
        });
      }
      console.log(`✅ Fetched ${module}:`, list);
      setter(list.map(normalizeId));
    } catch (err: any) {
      // Don't log 403 errors for unauthorized access - this is expected for some roles
      if (err.response?.status !== 403) {
        console.error(`Error fetching ${module}:`, err.response?.data || err.message);
      }
      setter(initial);
    }
  }, [user]);

  // Clock record functions
  const addClockRecord = async (data) => {
    try {
      const response = await api.post("/attendance", data);
      const result = response.data;
      setClockRecords(prev => [...prev, normalizeId(result)]);
      return result;
    } catch (error: any) {
      console.error("Error adding clock record:", error);
      throw error;
    }
  };

  const updateClockRecord = async (id, data) => {
    try {
      const response = await api.put(`/attendance/${id}`, data);
      const result = response.data;
      setClockRecords(prev =>
        prev.map(record => (record.id === id ? normalizeId(result) : record))
      );
      return result;
    } catch (error: any) {
      console.error("Error updating clock record:", error);
      throw error;
    }
  };

  // Working time calculation
  useEffect(() => {
    let interval;
    if (isClockActive) {
      interval = setInterval(() => {
        setWorkingTime(prev => {
          let { hours, minutes, seconds } = prev;
          seconds++;
          if (seconds >= 60) {
            seconds = 0;
            minutes++;
            if (minutes >= 60) {
              minutes = 0;
              hours++;
            }
          }
          return { hours, minutes, seconds };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockActive]);

  // Load initial data
  useEffect(() => {
    if (user) {
      // Fetch employees data for all users (needed for task filtering)
      fetchData("employees", setEmployees, initialEmployees);

      // Only fetch admin/HR specific data for admin/HR users
      if (user.role === 'admin' || user.role === 'hr') {
        fetchData("departments", setDepartments, initialDepartments);
        fetchData("designations", setDesignations, initialDesignations);
        fetchData("shifts", setShifts, initialShifts);
        fetchData("announcements", setAnnouncements, initialAnnouncements);
      }

      // These are accessible to all users
      fetchData("chat", setChatMessages, initialChatMessages);
      fetchData("tasks", setTasks, initialTasks);
      fetchData("clients", setClients, initialClients);
      fetchData("attendance", setClockRecords, initialClockRecords);
      fetchData("leave-types", setLeaveTypes, initialLeaveTypes); // Add this line to fetch leaveTypes for all users

      // Only admins/hr can access absences (uses /leaves endpoint)
      if (user.role === 'admin' || user.role === 'hr') {
        fetchData("leaves", setAbsences, initialAbsences);
      }

      fetchData("leaves", setLeaveRequests, initialLeaveRequests);
      fetchData("attendance", setAttendance, initialAttendance);
      fetchData("recruitment/jobs", setJobPostings, initialJobPostings);
      fetchData("recruitment/candidates", setCandidates, initialCandidates);
      fetchData("recruitment/interviews", setInterviews, initialInterviews);
      fetchData("payroll", setPayrollEntries, initialPayrollEntries);
      fetchData("salary-components", setSalaryComponents, []);
      fetchData("announcements", setAnnouncements, initialAnnouncements);
    }
  }, [user, fetchData]);

  const value = {
    employees,
    departments,
    designations,
    shifts,
    leaveRequests,
    leaveTypes,
    jobPostings,
    candidates,
    announcements,
    chatMessages,
    tasks,
    clients,
    clockRecords,
    absences,
    attendance,
    interviews,
    payrollEntries,
    salaryComponents,
    birthdays,
    holidays,
    isClockActive,
    setIsClockActive,
    toggleClock,
    workingTime,
    fetchData,
    addClockRecord,
    updateClockRecord,
    setClockRecords,
    initialClockRecords,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addDesignation,
    updateDesignation,
    deleteDesignation,
    addShift,
    updateShift,
    deleteShift,
    addAttendance,
    updateAttendance,
    deleteAttendance,
    markAbsentEmployees,
    addLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    addLeaveType,
    updateLeaveType,
    deleteLeaveType,
    addJobPosting,
    updateJobPosting,
    deleteJobPosting,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    addInterview,
    updateInterview,
    deleteInterview,
    addPayrollEntry,
    updatePayrollEntry,
    deletePayrollEntry,
    addSalaryComponent,
    updateSalaryComponent,
    deleteSalaryComponent,
    addClient,
    updateClient,
    deleteClient,
    addTask,
    updateTask,
    deleteTask,
    addChatMessage,
    updateChatMessage,
    deleteChatMessage,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};