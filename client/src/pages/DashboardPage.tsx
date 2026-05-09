// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Users, GraduationCap, ShieldCheck, BookOpen,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import StudentList from '../components/StudentList';
import StudentForm from '../components/StudentForm';
import Modal from '../components/Modal';
import StatsCard from '../components/StatsCard';
import { getStudentsApi } from '../utils/api';
import { decryptData } from '../utils/crypto';
import type{ Student } from '../types';

// ─── Types ────
interface DashboardStats {
  total: number;
  courses: number;
  latestName: string;
}

const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    courses: 0,
    latestName: '—',
  });

  // ─── Load stats ────
  const loadStats = useCallback(async () => {
    try {
      const res = await getStudentsApi();
      if (res.success && res.data) {
        const decryptedNames = res.data.map((s) => ({
          fullName: decryptData(s.fullName),
          courseEnrolled: decryptData(s.courseEnrolled),
          createdAt: s.createdAt,
        }));

        const uniqueCourses = new Set(decryptedNames.map((s) => s.courseEnrolled));

        // Latest student by createdAt
        const sorted = [...decryptedNames].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setStats({
          total: res.data.length,
          courses: uniqueCourses.size,
          latestName: sorted[0]?.fullName || '—',
        });
      }
    } catch {
      // silently fail for stats
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshTrigger]);

  // ─── Handlers ────
  const handleOpenRegister = () => {
    setEditStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditStudent(student);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditStudent(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditStudent(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ─── Page header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 leading-tight">
              Student <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-slate-500 text-sm font-body mt-1">
              Manage all student records — encrypted at rest & in transit
            </p>
          </div>
          <button
            onClick={handleOpenRegister}
            className="btn-primary py-3 px-5 self-start sm:self-auto"
          >
            <UserPlus size={17} />
            Register Student
          </button>
        </div>

        {/* ─── Stats ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <StatsCard
            title="Total Students"
            value={stats.total}
            subtitle="Registered in the system"
            icon={<Users size={22} />}
            color="blue"
          />
          <StatsCard
            title="Courses"
            value={stats.courses}
            subtitle="Unique courses enrolled"
            icon={<BookOpen size={22} />}
            color="green"
          />
          <StatsCard
            title="Latest Student"
            value={stats.total > 0 ? '✓' : '—'}
            subtitle={stats.latestName}
            icon={<GraduationCap size={22} />}
            color="purple"
          />
          <StatsCard
            title="Encryption"
            value="2-Layer"
            subtitle="AES-256-CBC active"
            icon={<ShieldCheck size={22} />}
            color="orange"
          />
        </div>



        {/* ─── Student List ─── */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary-400" />
            <h2 className="font-display text-lg font-semibold text-slate-100">
              Student Records
            </h2>
          </div>
          <StudentList
            onEdit={handleEdit}
            refreshTrigger={refreshTrigger}
          />
        </section>
      </main>

      {/* ─── Register / Edit Modal ─── */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editStudent ? 'Edit Student Record' : 'Register New Student'}
        size="lg"
      >
        <StudentForm
          editStudent={editStudent}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default DashboardPage;
