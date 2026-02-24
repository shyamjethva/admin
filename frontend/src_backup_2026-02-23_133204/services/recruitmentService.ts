// Recruitment Service
import api from './api';

export interface JobPosting {
    _id?: string;
    jobId: string;
    title: string;
    department: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
    experience: string;
    salary: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    status: 'Open' | 'Closed' | 'On Hold';
    postedDate: string;
    closingDate: string;
    openings: number;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Candidate {
    _id?: string;
    candidateId: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    experience: number;
    currentCompany?: string;
    currentSalary?: string;
    expectedSalary?: string;
    noticePeriod?: string;
    resumeUrl?: string;
    status: 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected' | 'On Hold';
    appliedDate: string;
    skills?: string[];
    education?: string;
    notes?: string;
    source?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Interview {
    _id?: string;
    candidateId: string;
    candidateName: string;
    position: string;
    interviewDate: string;
    interviewTime: string;
    interviewType: 'Phone' | 'Video' | 'In-person' | 'Technical' | 'HR' | 'Final';
    interviewer: string;
    location?: string;
    meetingLink?: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
    feedback?: string;
    rating?: number;
    result?: 'Selected' | 'Rejected' | 'On Hold';
    createdAt?: string;
    updatedAt?: string;
}

export interface JobResponse {
    success: boolean;
    data?: JobPosting | JobPosting[];
    message?: string;
}

export interface CandidateResponse {
    success: boolean;
    data?: Candidate | Candidate[];
    message?: string;
}

export interface InterviewResponse {
    success: boolean;
    data?: Interview | Interview[];
    message?: string;
}

export const recruitmentService = {
    // Job Postings
    getAllJobs: async (): Promise<JobResponse> => {
        return await api.get<JobResponse>('/recruitment/jobs');
    },

    getJobById: async (id: string): Promise<JobResponse> => {
        return await api.get<JobResponse>(`/recruitment/jobs/${id}`);
    },

    createJob: async (data: JobPosting): Promise<JobResponse> => {
        return await api.post<JobResponse>('/recruitment/jobs', data);
    },

    updateJob: async (id: string, data: Partial<JobPosting>): Promise<JobResponse> => {
        return await api.put<JobResponse>(`/recruitment/jobs/${id}`, data);
    },

    deleteJob: async (id: string): Promise<JobResponse> => {
        return await api.delete<JobResponse>(`/recruitment/jobs/${id}`);
    },

    // Candidates
    getAllCandidates: async (params?: { position?: string; status?: string }): Promise<CandidateResponse> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<CandidateResponse>(`/recruitment/candidates${query ? `?${query}` : ''}`);
    },

    getCandidateById: async (id: string): Promise<CandidateResponse> => {
        return await api.get<CandidateResponse>(`/recruitment/candidates/${id}`);
    },

    createCandidate: async (data: Candidate): Promise<CandidateResponse> => {
        return await api.post<CandidateResponse>('/recruitment/candidates', data);
    },

    updateCandidate: async (id: string, data: Partial<Candidate>): Promise<CandidateResponse> => {
        return await api.put<CandidateResponse>(`/recruitment/candidates/${id}`, data);
    },

    deleteCandidate: async (id: string): Promise<CandidateResponse> => {
        return await api.delete<CandidateResponse>(`/recruitment/candidates/${id}`);
    },

    // Interviews
    getAllInterviews: async (): Promise<InterviewResponse> => {
        return await api.get<InterviewResponse>('/recruitment/interviews');
    },

    getInterviewById: async (id: string): Promise<InterviewResponse> => {
        return await api.get<InterviewResponse>(`/recruitment/interviews/${id}`);
    },

    createInterview: async (data: Interview): Promise<InterviewResponse> => {
        return await api.post<InterviewResponse>('/recruitment/interviews', data);
    },

    updateInterview: async (id: string, data: Partial<Interview>): Promise<InterviewResponse> => {
        return await api.put<InterviewResponse>(`/recruitment/interviews/${id}`, data);
    },

    deleteInterview: async (id: string): Promise<InterviewResponse> => {
        return await api.delete<InterviewResponse>(`/recruitment/interviews/${id}`);
    },
};

export default recruitmentService;
