import express from "express";
import cors from "cors";

import authRoutes from "./routes/authroutes.js";
import employeeRoutes from "./routes/employeeroutes.js";
import attendanceRoutes from "./routes/attendanceroutes.js";
import clockRoutes from "./routes/clockroutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import announcementRoutes from "./routes/announcementroutes.js";
import taskRoutes from "./routes/taskroutes.js";

import departmentRoutes from "./routes/departmentroutes.js";
import designationRoutes from "./routes/designationroutes.js";
import shiftRoutes from "./routes/shiftroutes.js";
import leaveTypeRoutes from "./routes/leaveTypeRoutes.js";
import weeklyPlanRoutes from "./routes/weeklyplanroutes.js";

import recruitmentRoutes from "./routes/recruitmentroutes.js";
import reportRoutes from "./routes/reportroutes.js";
import candidateRoutes from "./routes/candidateroutes.js";
import payrollRoutes from "./routes/payrollroutes.js";
import chatRoutes from "./routes/whatchatroutes.js";

import clientRoutes from "./routes/clientroutes.js";
import celebrationroutes from "./routes/celebrationroutes.js";
import notificationroutes from "./routes/notificationroutes.js";
import interviewRoutes from "./routes/interviewroutes.js";
import salaryComponentRoutes from "./routes/salarycomponentsroutes.js";
import settingsRoutes from "./routes/settingsroutes.js";

import { errorMiddleware } from "./middleware/errormiddleware.js";

const app = express();

// Frontend is Vite by default (5173). Keep 3000 too (sometimes people run React on 3000).
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/", (req, res) => res.send("✅ API is running"));



app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/clock", clockRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/tasks", taskRoutes);

app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/leave-types", leaveTypeRoutes);
app.use("/api/weekly-plans", weeklyPlanRoutes);
app.use("/api/chat", chatRoutes);


app.use("/api/payroll", payrollRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/recruitment/candidates", candidateRoutes);
app.use("/api/recruitment/interviews", interviewRoutes);
app.use("/api/payroll", payrollRoutes);


app.use("/api/clients", clientRoutes);
app.use("/api/celebrations", celebrationroutes);
app.use("/api/notifications", notificationroutes);
app.use("/api/salary-components", salaryComponentRoutes);
app.use("/api/settings", settingsRoutes);

app.use(errorMiddleware)

export default app;