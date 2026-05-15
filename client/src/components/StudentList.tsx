// src/components/StudentList.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  MapPin,
  ShieldOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import ConfirmDialog from "./ConfirmDialog";
import { getStudentsApi, deleteStudentApi } from "../utils/api";
import { decryptData } from "../utils/crypto";
import type { Student } from "../types";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ─── Props ───
interface StudentListProps {
  onEdit: (student: Student) => void;
  refreshTrigger: number; // increment from parent to force refresh
}

// ─── Helpers ──
function decryptStudent(raw: Student): Student {
  return {
    ...raw,
    fullName: decryptData(raw.fullName),
    email: decryptData(raw.email),
    phoneNumber: decryptData(raw.phoneNumber),
    dateOfBirth: decryptData(raw.dateOfBirth),
    gender: decryptData(raw.gender),
    address: decryptData(raw.address),
    courseEnrolled: decryptData(raw.courseEnrolled),
    // password intentionally not shown
    password: "••••••••",
  };
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const PAGE_SIZE_OPTIONS = [5, 10, 20];

// ─── Component ─────────────────────────────────────────────────────────────────
const StudentList: React.FC<StudentListProps> = ({
  onEdit,
  refreshTrigger,
}) => {
  const { user, forceLogout } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ─── Fetch ───
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudentsApi();
      if (res.success && res.data) {
        const decrypted = res.data.map(decryptStudent);
        setStudents(decrypted);
      } else {
        toast.error(res.message || "Failed to load students");
      }
    } catch {
      toast.error("Failed to connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, refreshTrigger]);

  // ─── Filter & Search ───
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter((s) => {
      const matchSearch =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phoneNumber.includes(q) ||
        s.courseEnrolled.toLowerCase().includes(q);
      const matchGender = !filterGender || s.gender === filterGender;
      const matchCourse = !filterCourse || s.courseEnrolled === filterCourse;
      return matchSearch && matchGender && matchCourse;
    });
  }, [students, search, filterGender, filterCourse]);

  // Unique values for filter dropdowns
  const uniqueGenders = useMemo(
    () => [...new Set(students.map((s) => s.gender))],
    [students],
  );
  const uniqueCourses = useMemo(
    () => [...new Set(students.map((s) => s.courseEnrolled))],
    [students],
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterGender, filterCourse, pageSize]);

  const handleDeleteConfirm = async () => {
    if (!confirmId) return;

    // ── Detect self-deletion before making the API call ─────
    const isSelfDeletion = user !== null && user._id === confirmId;

    setDeleting(confirmId);
    setConfirmId(null);

    try {
      const res = await deleteStudentApi(confirmId);

      if (res.success) {
        // ── Case 1: User deleted SOMEONE ELSE'S account ─────
        if (!isSelfDeletion) {
          setStudents((prev) => prev.filter((s) => s._id !== confirmId));
          toast.success("Student deleted successfully");
          return;
        }

        // ── Case 2: User deleted THEIR OWN account ────
        toast.success("Your account has been deleted. Redirecting to login…", {
          duration: 3000,
        });

        setTimeout(() => {
          forceLogout();
          navigate("/login");
        }, 1500);
      } else {
        toast.error(res.message || "Delete failed");
      }
    } catch {
      toast.error("Failed to delete student");
    } finally {
      setDeleting(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterGender("");
    setFilterCourse("");
  };

  // ─── Render ───
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, course…"
            className="input-base pl-10 py-2.5"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary py-2.5 px-4 text-sm ${showFilters ? "border-primary-500/50 text-primary-400" : ""}`}
        >
          <Filter size={15} />
          Filters
          {(filterGender || filterCourse) && (
            <span className="ml-1 w-2 h-2 rounded-full bg-primary-400 inline-block" />
          )}
        </button>

        {/* Refresh */}
        <button
          onClick={fetchStudents}
          disabled={loading}
          className="btn-secondary py-2.5 px-4 text-sm"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 animate-slide-up">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="form-label text-xs mb-1">Gender</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="input-base py-2 text-sm"
              >
                <option value="">All Genders</option>
                {uniqueGenders.map((g) => (
                  <option key={g} value={g} className="bg-slate-800">
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="form-label text-xs mb-1">Course</label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="input-base py-2 text-sm"
              >
                <option value="">All Courses</option>
                {uniqueCourses.map((c) => (
                  <option key={c} value={c} className="bg-slate-800">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {(filterGender || filterCourse) && (
              <button
                onClick={clearFilters}
                className="btn-secondary py-2 px-3 text-xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-body px-1">
        <span>
          {loading ? (
            "Loading…"
          ) : (
            <>
              Showing{" "}
              <span className="text-slate-300 font-medium">
                {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="text-slate-300 font-medium">
                {filtered.length}
              </span>{" "}
              {filtered.length !== students.length &&
                `(filtered from ${students.length})`}
            </>
          )}
        </span>
        <div className="flex items-center gap-2">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-xs"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Loading state ─── */}
      {loading && (
        <div className="card py-20 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Decrypting student records…" />
        </div>
      )}

      {/* ─── Empty state ─── */}
      {!loading && filtered.length === 0 && (
        <div className="card py-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center">
            {students.length === 0 ? (
              <Users size={28} className="text-slate-500" />
            ) : (
              <ShieldOff size={28} className="text-slate-500" />
            )}
          </div>
          <div>
            <p className="text-slate-300 font-display font-semibold text-lg">
              {students.length === 0 ? "No students yet" : "No results found"}
            </p>
            <p className="text-slate-500 text-sm font-body mt-1">
              {students.length === 0
                ? "Register your first student using the button above"
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
          {(search || filterGender || filterCourse) && (
            <button
              onClick={clearFilters}
              className="btn-secondary text-sm py-2"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ─── Desktop Table ─── */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="hidden md:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/40">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                      #
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                      Student
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                      Phone
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                      Course
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                      Gender
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                      DOB
                    </th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {paginated.map((student, idx) => (
                    <tr
                      key={student._id}
                      className="hover:bg-slate-800/30 transition-colors duration-150 group"
                    >
                      <td className="px-5 py-4 text-slate-500 text-sm font-mono">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700/50 to-primary-900/50 border border-primary-700/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-300 font-display font-semibold text-sm">
                              {student.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-slate-100 font-body font-medium text-sm leading-tight">
                              {student.fullName}
                            </p>
                            <p className="text-slate-500 text-xs font-body mt-0.5">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm font-mono">
                        {student.phoneNumber}
                      </td>
                      <td className="px-5 py-4">
                        <span className="badge bg-primary-500/10 text-primary-300 border border-primary-500/20 text-xs">
                          {student.courseEnrolled}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm font-body">
                        {student.gender}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-sm font-body">
                        {formatDate(student.dateOfBirth)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEdit(student)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                       text-primary-400 hover:text-primary-300 text-xs
                                       bg-primary-500/10 hover:bg-primary-500/20
                                       border border-primary-500/20 hover:border-primary-500/40
                                       transition-all duration-200 font-body font-medium"
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmId(student._id)}
                            disabled={deleting === student._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                       text-red-400 hover:text-red-300 text-xs
                                       bg-red-500/10 hover:bg-red-500/20
                                       border border-red-500/20 hover:border-red-500/40
                                       transition-all duration-200 font-body font-medium
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleting === student._id ? (
                              <span className="w-3 h-3 border border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── Mobile Cards ─── */}
          <div className="md:hidden space-y-3">
            {paginated.map((student, idx) => (
              <div
                key={student._id}
                className="card p-4 space-y-3 animate-fade-in"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-700/50 to-primary-900/50 border border-primary-700/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-300 font-display font-semibold">
                        {student.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-100 font-body font-semibold text-sm truncate">
                        {student.fullName}
                      </p>
                      <p className="text-slate-500 text-xs font-mono truncate">
                        #{(page - 1) * pageSize + idx + 1}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === student._id ? null : student._id,
                      )
                    }
                    className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0 p-1"
                  >
                    {expandedId === student._id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>

                {/* Always visible quick info */}
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-primary-500/10 text-primary-300 border border-primary-500/20">
                    {student.courseEnrolled}
                  </span>
                  <span className="badge bg-slate-700/60 text-slate-300 border border-slate-600/40">
                    {student.gender}
                  </span>
                </div>

                {/* Expanded details */}
                {expandedId === student._id && (
                  <div className="space-y-2 pt-2 border-t border-slate-700/40 animate-slide-up">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Mail
                        size={13}
                        className="text-slate-500 flex-shrink-0"
                      />
                      <span className="font-body truncate">
                        {student.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Phone
                        size={13}
                        className="text-slate-500 flex-shrink-0"
                      />
                      <span className="font-mono">{student.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar
                        size={13}
                        className="text-slate-500 flex-shrink-0"
                      />
                      <span className="font-body">
                        {formatDate(student.dateOfBirth)}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-slate-300">
                      <MapPin
                        size={13}
                        className="text-slate-500 flex-shrink-0 mt-0.5"
                      />
                      <span className="font-body">{student.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <BookOpen
                        size={13}
                        className="text-slate-500 flex-shrink-0"
                      />
                      <span className="font-body">
                        {student.courseEnrolled}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onEdit(student)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg
                               text-primary-400 text-sm bg-primary-500/10 hover:bg-primary-500/20
                               border border-primary-500/20 hover:border-primary-500/40
                               transition-all duration-200 font-body font-medium"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmId(student._id)}
                    disabled={deleting === student._id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg
                               text-red-400 text-sm bg-red-500/10 hover:bg-red-500/20
                               border border-red-500/20 hover:border-red-500/40
                               transition-all duration-200 font-body font-medium
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting === student._id ? (
                      <span className="w-3.5 h-3.5 border border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─── Pagination ─── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && (arr[idx - 1] as number) !== p - 1)
                  acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`dots-${idx}`}
                    className="text-slate-500 px-1 text-sm"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-body font-medium transition-all duration-200 ${
                      page === p
                        ? "bg-primary-600 text-white shadow-glow"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/60"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ─── Confirm Delete Dialog ─── */}
      <ConfirmDialog
        isOpen={!!confirmId}
        title="Delete Student"
        message="This will permanently remove the student record from the database. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmId(null)}
        isLoading={!!deleting}
      />
    </div>
  );
};

export default StudentList;
