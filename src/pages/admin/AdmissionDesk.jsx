import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  UserPlus,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Search,
  Users,
  X
} from 'lucide-react';

export default function AdmissionDesk() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  // Step wizard: 1. Course & Dynamic Price Negotiation, 2. Personal & Guardian, 3. Academic & ID, 4. Down Payment & Installments
  const [currentStep, setCurrentStep] = useState(1);

  // Admission mode: new student vs existing student (add another course)
  const [admissionMode, setAdmissionMode] = useState('new');
  const [existingStudent, setExistingStudent] = useState(null);
  const [existingAdmissions, setExistingAdmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Form State
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Dynamic Pricing State
  const [agreedFee, setAgreedFee] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [paymentType, setPaymentType] = useState('installment');
  const [nextDueDate, setNextDueDate] = useState('');
  const [nextDueDateManual, setNextDueDateManual] = useState(false);
  const [installmentsList, setInstallmentsList] = useState([]);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');

  // Magma-style helper: next due date is 30 days from the joining date
  const calculateNextDueDate = (joiningDate) => {
    const date = new Date(joiningDate || new Date());
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  // Remaining balance after received amount
  const remainingBalance = Math.max(0, (agreedFee || 0) - (downPayment || 0));

  // Student Profile State
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    dob: '',
    bloodGroup: '',
    mobile: '',
    whatsappMobile: '',
    email: '',
    currentAddress: '',
    permanentAddress: '',
    guardianName: '',
    guardianRelation: 'Parent',
    guardianMobile: '',
    guardianOccupation: '',
    highestQualification: '12th Pass',
    schoolOrCollege: '',
    passingYear: 2024,
    idProofType: 'Aadhar Card',
    idProofNumber: '',
    batchTiming: 'Morning (10:00 AM - 12:00 PM)',
    joiningDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const fetchCourseBatches = async (courseId) => {
    try {
      const res = await apiRequest(`/batches/course/${courseId}`);
      if (res.success && res.batches.length > 0) {
        setBatches(res.batches);
        setSelectedBatchId(res.batches[0]._id);
      } else {
        setBatches([]);
        setSelectedBatchId('');
      }
    } catch (e) {
      console.error('Error fetching batches:', e);
    }
  };

  // When course selected, initialize negotiation pricing & default installments
  const handleCourseSelect = (course) => {
    setSelectedCourseId(course._id);
    setSelectedCourse(course);
    setAgreedFee(course.standardFee);
    setDiscountAmount(0);
    setNextDueDateManual(false);
    setNextDueDate(calculateNextDueDate(formData.joiningDate));
    fetchCourseBatches(course._id);

    // Default received amount = 30% of standard fee rounded to 500s (locked to full fee in Full Payment mode)
    const defaultDp = paymentType === 'full'
      ? course.standardFee
      : Math.min(course.standardFee, Math.round((course.standardFee * 0.3) / 500) * 500);
    setDownPayment(defaultDp);
    setInstallmentsList(buildDefaultSchedule(course.standardFee - defaultDp, calculateNextDueDate(formData.joiningDate)));
  };

  // Handle Agreed Fee Change with Validation
  const handleAgreedFeeChange = (value) => {
    const val = Number(value);
    setAgreedFee(val);
    if (selectedCourse) {
      const disc = Math.max(0, selectedCourse.standardFee - val);
      setDiscountAmount(disc);

      if (paymentType === 'full') {
        setDownPayment(Math.max(0, val));
        setInstallmentsList([]);
        return;
      }

      let received = downPayment;
      if (received > val) {
        received = val;
        setDownPayment(val);
      }
      setInstallmentsList(buildDefaultSchedule(Math.max(0, val - received), nextDueDate));
    }
  };

  // Payment Type switch: full locks the received amount to the final fee (Magma-style)
  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    if (type === 'full') {
      setDownPayment(agreedFee || 0);
      setInstallmentsList([]);
    } else {
      const received = !downPayment || downPayment >= agreedFee ? 0 : downPayment;
      setDownPayment(received);
      setInstallmentsList(buildDefaultSchedule(Math.max(0, agreedFee - received), nextDueDate));
    }
  };

  // Handle Received Amount Change with Magma-style validation
  const handleReceivedAmountChange = (value) => {
    const val = Number(value);
    if (Number.isNaN(val) || val < 0) return;
    if (agreedFee > 0 && val > agreedFee) {
      alert(`Received Amount cannot exceed Final Fee (₹${agreedFee.toLocaleString('en-IN')})`);
      return;
    }
    setDownPayment(val);
    setInstallmentsList(buildDefaultSchedule(Math.max(0, agreedFee - val), nextDueDate));
  };

  // Joining date drives the auto-calculated next due date (until manually edited)
  const handleJoiningDateChange = (value) => {
    setFormData({ ...formData, joiningDate: value });
    if (!nextDueDateManual) {
      const autoDue = calculateNextDueDate(value);
      setNextDueDate(autoDue);
      rebaseInstallmentDates(autoDue, remainingBalance);
    }
  };

  const handleNextDueDateChange = (value) => {
    setNextDueDateManual(true);
    setNextDueDate(value);
    rebaseInstallmentDates(value, remainingBalance);
  };

  // Manual ledger helpers — admin enters each installment amount + its due date
  function buildDefaultSchedule(balance, startDate) {
    if (!balance || balance <= 0) return [];
    const base = new Date(startDate || new Date());
    return [{ amount: Math.round(balance), dueDate: base.toISOString().split('T')[0] }];
  }

  // Keep amounts, shift due dates so the first row starts at the given date (monthly cadence)
  function rebaseInstallmentDates(startDate, balance) {
    const base = new Date(startDate || new Date());
    if (!installmentsList.length) {
      setInstallmentsList(buildDefaultSchedule(balance, startDate));
      return;
    }
    setInstallmentsList(
      installmentsList.map((inst, i) => {
        const due = new Date(base);
        due.setMonth(base.getMonth() + i);
        return { ...inst, dueDate: due.toISOString().split('T')[0] };
      })
    );
  }

  const handleAddInstallment = () => {
    const allocated = installmentsList.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
    const left = Math.round(remainingBalance - allocated);
    if (left <= 0) {
      alert('Balance Amount is already fully covered by the existing installments.');
      return;
    }
    const last = installmentsList[installmentsList.length - 1];
    const due = new Date(last ? new Date(last.dueDate) : (nextDueDate ? new Date(nextDueDate) : new Date()));
    if (last) due.setMonth(due.getMonth() + 1);
    setInstallmentsList([...installmentsList, { amount: left, dueDate: due.toISOString().split('T')[0] }]);
  };

  const handleRemoveInstallment = (index) => {
    setInstallmentsList(installmentsList.filter((_, i) => i !== index));
  };

  // Load Courses (declared after handlers so handler references resolve safely)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiRequest('/courses');
        if (res.success) {
          setCourses(res.courses);
          if (res.courses.length > 0) {
            handleCourseSelect(res.courses[0]);
          }
        }
      } catch {
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced student search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      const timer = setTimeout(() => {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }, 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      (async () => {
        setSearching(true);
        try {
          const res = await apiRequest(`/admissions/student/search?q=${encodeURIComponent(searchQuery.trim())}`);
          if (res.success) {
            setSearchResults(res.students);
            setShowSearchDropdown(true);
          }
        } catch {
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      })();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectExistingStudent = (student) => {
    setExistingStudent(student);
    setExistingAdmissions(student.admissions || []);
    setShowSearchDropdown(false);
    setSearchQuery('');
    // Pre-fill formData from existing student
    setFormData({
      fullName: student.fullName || '',
      gender: student.gender || 'Male',
      dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
      bloodGroup: student.bloodGroup || '',
      mobile: student.mobile || '',
      whatsappMobile: student.whatsappMobile || student.mobile || '',
      email: student.email || '',
      currentAddress: student.currentAddress || '',
      permanentAddress: student.permanentAddress || '',
      guardianName: student.guardianName || '',
      guardianRelation: student.guardianRelation || 'Parent',
      guardianMobile: student.guardianMobile || '',
      guardianOccupation: student.guardianOccupation || '',
      highestQualification: student.highestQualification || '12th Pass',
      schoolOrCollege: student.schoolOrCollege || '',
      passingYear: student.passingYear || 2024,
      idProofType: student.idProofType || 'Aadhar Card',
      idProofNumber: student.idProofNumber || '',
      batchTiming: 'Morning (10:00 AM - 12:00 PM)',
      joiningDate: new Date().toISOString().split('T')[0],
      remarks: ''
    });
  };

  const handleClearExistingStudent = () => {
    setExistingStudent(null);
    setExistingAdmissions([]);
    setCurrentStep(1);
  };

  const handleInstallmentDateChange = (index, newDate) => {
    setInstallmentsList(installmentsList.map((inst, i) => (i === index ? { ...inst, dueDate: newDate } : inst)));
  };

  const handleInstallmentAmountChange = (index, newAmount) => {
    setInstallmentsList(installmentsList.map((inst, i) => (i === index ? { ...inst, amount: Number(newAmount) } : inst)));
  };

  // Validation Checks
  const isFloorBreached = selectedCourse && agreedFee < selectedCourse.minFloorFee;
  const isReceivedInvalid = downPayment > agreedFee;

  // Magma-style: installment ledger must exactly cover the pending balance
  const scheduledTotal = installmentsList.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
  const hasInstallmentMismatch = paymentType === 'installment' && remainingBalance > 0 && Math.abs(scheduledTotal - remainingBalance) > 1;
  const hasInvalidInstallments = paymentType === 'installment' && installmentsList.some((inst) => !inst.dueDate || Number(inst.amount) <= 0);

  const handleSubmitAdmission = async (e) => {
    e.preventDefault();
    if (isFloorBreached) {
      setError(`Cannot register admission! Negotiated fee of ₹${agreedFee} is below the allowable floor limit of ₹${selectedCourse.minFloorFee}.`);
      return;
    }

    // Magma-style fee validation before submission
    if (paymentType === 'installment') {
      if (remainingBalance > 0 && installmentsList.length === 0) {
        setError('Please add at least one installment covering the pending Balance Amount.');
        return;
      }
      if (hasInvalidInstallments) {
        setError('Every installment must have an amount greater than 0 and a valid due date.');
        return;
      }
      if (hasInstallmentMismatch) {
        setError(`Installment amounts total (₹${scheduledTotal.toLocaleString('en-IN')}) must match the pending Balance Amount (₹${remainingBalance.toLocaleString('en-IN')}).`);
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        courseId: selectedCourseId,
        batchId: selectedBatchId || undefined,
        agreedTotalFee: agreedFee,
        downPayment,
        paymentType,
        nextDueDate: paymentType === 'installment' && remainingBalance > 0 ? nextDueDate : null,
        paymentMode,
        transactionRef,
        installmentsList: paymentType === 'full'
          ? []
          : installmentsList.map((inst, i) => ({ installmentNo: i + 1, amount: Number(inst.amount), dueDate: inst.dueDate }))
      };

      // For existing student, only send studentId (skip personal details creation)
      if (existingStudent) {
        payload.studentId = existingStudent._id;
        delete payload.fullName;
        delete payload.mobile;
        delete payload.email;
        delete payload.gender;
        delete payload.dob;
        delete payload.bloodGroup;
        delete payload.whatsappMobile;
        delete payload.currentAddress;
        delete payload.permanentAddress;
        delete payload.guardianName;
        delete payload.guardianRelation;
        delete payload.guardianMobile;
        delete payload.guardianOccupation;
        delete payload.highestQualification;
        delete payload.schoolOrCollege;
        delete payload.passingYear;
        delete payload.idProofType;
        delete payload.idProofNumber;
      }

      const res = await apiRequest('/admissions', 'POST', payload);
      if (res.success) {
        setSuccessData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit admission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0b3c68] border-t-transparent"></div>
      </div>
    );
  }

  // Success Confirmation Screen
  if (successData) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 shadow-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-black text-slate-800">
          Admission Registered Successfully!
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          {existingStudent ? 'New course added to existing student account.' : 'Student file created & portal login credentials dispatched.'}
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">Admission No:</span>
            <span className="font-bold text-slate-900">{successData.admission.admissionNo}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">Enrollment No:</span>
            <span className="font-bold text-[#0b3c68]">{successData.student.enrollmentNo}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">Student Name:</span>
            <span className="font-bold text-slate-900">{successData.student.fullName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">Course:</span>
            <span className="font-bold text-slate-900">{selectedCourse?.name}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">Agreed Fee:</span>
            <span className="font-bold text-emerald-700">₹{successData.admission.agreedTotalFee.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-semibold">Payment Type:</span>
            <span className={`font-bold ${successData.admission.paymentType === 'full' ? 'text-emerald-600' : 'text-[#0b3c68]'}`}>
              {successData.admission.paymentType === 'full' ? 'Full Payment' : 'Installment'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">Received Amount:</span>
            <span className="font-bold text-slate-900">₹{successData.admission.downPayment.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-semibold">
              {successData.admission.totalBalance > 0 ? 'Next Due Date:' : 'Balance Status:'}
            </span>
            {successData.admission.totalBalance > 0 ? (
              <span className="font-bold text-orange-600">
                {successData.admission.nextDueDate
                  ? new Date(successData.admission.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'}
              </span>
            ) : (
              <span className="font-bold text-emerald-600">Fully Paid ✓</span>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => {
              setSuccessData(null);
              setCurrentStep(1);
              if (existingStudent) {
                handleClearExistingStudent();
              }
            }}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            + Register Another Admission
          </button>
          <button
            onClick={() => navigate('/admin/admissions')}
            className="rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#12518a] shadow"
          >
            View Students Register →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#082c4d] to-[#0b3c68] p-6 text-white shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur border border-white/10 text-sky-200">
            <UserPlus className="h-3.5 w-3.5" /> Receptionist & Admission Desk
          </div>
          <h1 className="mt-2 font-display text-2xl font-black tracking-tight text-white">
            {existingStudent ? `Add Course to ${existingStudent.fullName}` : 'New Student Course Admission'}
          </h1>
          <p className="text-xs text-slate-300">
            {existingStudent
              ? 'Select a new course and configure the fee plan for this student.'
              : 'Select course, apply authorized fee discounts within allowable floor limits, and set installment plans.'
            }
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2 backdrop-blur">
          {existingStudent ? [1, 2].map((step) => {
            const label = step === 1 ? 1 : 4;
            const isActive = (step === 1 && currentStep === 1) || (step === 2 && currentStep === 4);
            const isDone = (step === 1 && currentStep === 4);
            return (
              <div
                key={step}
                onClick={() => setCurrentStep(label)}
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xs font-bold transition ${
                  isActive ? 'bg-sky-400 text-slate-950 font-black shadow' : isDone ? 'bg-emerald-500 text-white' : 'bg-white/20 text-slate-300'
                }`}
              >
                {step}
              </div>
            );
          }) : [1, 2, 3, 4].map((step) => (
            <div
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xs font-bold transition ${
                currentStep === step
                  ? 'bg-sky-400 text-slate-950 font-black shadow'
                  : currentStep > step
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/20 text-slate-300'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-bold text-red-800 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ADMISSION MODE TOGGLE + STUDENT SEARCH (only when no existing student selected) */}
      {!existingStudent && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setAdmissionMode('new')}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                  admissionMode === 'new' ? 'bg-[#0b3c68] text-white shadow' : 'text-slate-600 hover:bg-white'
                }`}
              >
                <UserPlus className="inline h-3.5 w-3.5 mr-1.5" />
                New Student
              </button>
              <button
                onClick={() => setAdmissionMode('existing')}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                  admissionMode === 'existing' ? 'bg-[#0b3c68] text-white shadow' : 'text-slate-600 hover:bg-white'
                }`}
              >
                <Users className="inline h-3.5 w-3.5 mr-1.5" />
                Existing Student
              </button>
            </div>

            {admissionMode === 'existing' && (
              <div className="relative flex-1" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, mobile, or enrollment number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm font-medium focus:border-[#0b3c68] focus:outline-none"
                    autoFocus
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0b3c68] border-t-transparent" />
                    </div>
                  )}
                </div>

                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                    {searchResults.map((s) => (
                      <button
                        key={s._id}
                        onClick={() => handleSelectExistingStudent(s)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm text-slate-900">{s.fullName}</span>
                            <span className="ml-2 text-[10px] text-slate-400">{s.enrollmentNo}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {s.mobile}
                          </span>
                        </div>
                        {s.admissions && s.admissions.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Enrolled in: {s.admissions.map((a) => a.courseId?.name).filter(Boolean).join(', ')}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {showSearchDropdown && searchResults.length === 0 && !searching && searchQuery.trim().length >= 2 && (
                  <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white p-4 text-center shadow-xl">
                    <p className="text-xs text-slate-500 font-semibold">No students found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXISTING STUDENT INFO CARD (shown when student is selected) */}
      {existingStudent && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">{existingStudent.fullName}</span>
              <span className="ml-2 text-[10px] text-slate-500">{existingStudent.enrollmentNo} &middot; {existingStudent.mobile}</span>
              {existingAdmissions.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {existingAdmissions.map((adm) => (
                    <span key={adm._id} className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                      {adm.courseId?.name || 'Course'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleClearExistingStudent}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-600 transition"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 1: COURSE SELECTION & DYNAMIC FLOOR NEGOTIATION MATRIX */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#0b3c68]" /> 1. Select Course & Configure Fee Negotiation
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Each course has an official MRP and an authorized minimum negotiable floor price set by the Admin.
            </p>

            {/* Course Cards Grid */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => {
                const isSelected = selectedCourseId === c._id;
                const maxDiscount = c.standardFee - c.minFloorFee;
                const isAlreadyEnrolled = existingStudent && existingAdmissions.some((a) => a.courseId?._id === c._id);
                return (
                  <div
                    key={c._id}
                    onClick={() => !isAlreadyEnrolled && handleCourseSelect(c)}
                    className={`rounded-2xl border p-4 transition-all ${
                      isAlreadyEnrolled
                        ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                        : `cursor-pointer ${
                          isSelected
                            ? 'border-[#0b3c68] bg-sky-50/40 ring-2 ring-[#0b3c68]/20 shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {c.courseCode}
                      </span>
                      {isAlreadyEnrolled ? (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          Already Enrolled
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-[#8a6a5b]">{c.duration}</span>
                      )}
                    </div>

                    <h4 className="mt-2 font-display text-sm font-bold text-slate-900 line-clamp-1">{c.name}</h4>

                    <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Standard MRP:</span>
                        <span className="font-bold text-slate-800">₹{c.standardFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1">
                        <span className="text-slate-500 font-semibold">Min Floor Limit:</span>
                        <span className="font-bold text-amber-700">₹{c.minFloorFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-emerald-700">
                        <span>Max Disc. Allowed:</span>
                        <span className="font-bold">₹{maxDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Course Pricing & Negotiation Calculator */}
            {selectedCourse && (
              <div className="mt-6 rounded-2xl border-2 border-slate-200 bg-slate-50/70 p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Program</span>
                    <h3 className="text-lg font-bold text-slate-900 font-display">{selectedCourse.name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block font-semibold">Standard MRP Fee</span>
                      <span className="text-base font-black text-slate-700 line-through">₹{selectedCourse.standardFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-amber-600 block font-bold">Authorized Floor Limit</span>
                      <span className="text-base font-black text-amber-700">₹{selectedCourse.minFloorFee.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Negotiation Input & Real-time Validation */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Negotiated Final Course Fee (₹)
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      Amount agreed with student during counseling.
                    </p>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        value={agreedFee}
                        onChange={(e) => handleAgreedFeeChange(e.target.value)}
                        className={`w-full rounded-xl border py-3 pl-8 pr-4 text-base font-bold transition focus:outline-none ${
                          isFloorBreached
                            ? 'border-red-500 bg-red-50/50 text-red-900 ring-2 ring-red-300'
                            : 'border-slate-300 bg-white text-slate-900 focus:border-[#0b3c68] focus:ring-2 focus:ring-[#0b3c68]/20'
                        }`}
                      />
                    </div>

                    {isFloorBreached ? (
                      <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1.5 animate-pulse">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        Discount Exceeds Limit! Minimum bottom price allowed is ₹{selectedCourse.minFloorFee.toLocaleString('en-IN')}.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        Within authorized limit. (Discount Offered: ₹{discountAmount.toLocaleString('en-IN')})
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">Fee Breakdown Preview</span>
                    <div className="flex justify-between text-slate-600">
                      <span>Standard Course Fee:</span>
                      <span className="font-bold text-slate-800">₹{selectedCourse.standardFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount Given:</span>
                      <span className="font-bold">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-sm text-[#0b3c68]">
                      <span>Total Agreed Amount:</span>
                      <span>₹{agreedFee.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isFloorBreached || !selectedCourse}
              onClick={() => existingStudent ? setCurrentStep(4) : setCurrentStep(2)}
              className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#12518a] transition disabled:opacity-40"
            >
              {existingStudent ? 'Next: Payment & Installments' : 'Next: Student Details'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: STUDENT PERSONAL & GUARDIAN DETAILS */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#0b3c68]" /> 2. Student Personal & Guardian Details
            </h3>

            {/* Personal Info Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul S. Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:border-[#0b3c68] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:border-[#0b3c68] focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Mobile Number (Calling) *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:border-[#0b3c68] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="WhatsApp mobile"
                  value={formData.whatsappMobile}
                  onChange={(e) => setFormData({ ...formData, whatsappMobile: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:border-[#0b3c68] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="student@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:border-[#0b3c68] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">Current Residential Address</label>
                <textarea
                  rows={2}
                  placeholder="Room/Flat No, Building, Area, Mumbai"
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:border-[#0b3c68] focus:outline-none"
                />
              </div>
            </div>

            {/* Guardian Info */}
            <div className="border-t border-slate-200 pt-5">
              <h4 className="font-display text-xs font-bold uppercase text-slate-500 tracking-wider">Parent / Guardian Contact</h4>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Guardian Name</label>
                  <input
                    type="text"
                    placeholder="Father/Mother/Guardian"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Relation</label>
                  <input
                    type="text"
                    placeholder="e.g. Father"
                    value={formData.guardianRelation}
                    onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Guardian Mobile</label>
                  <input
                    type="tel"
                    placeholder="Guardian Contact"
                    value={formData.guardianMobile}
                    onChange={(e) => setFormData({ ...formData, guardianMobile: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Pricing
            </button>
            <button
              type="button"
              disabled={!formData.fullName || !formData.mobile || !formData.email}
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#12518a] transition disabled:opacity-40"
            >
              Next: Academic & ID <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ACADEMIC BACKGROUND & ID PROOF */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#0b3c68]" /> 3. Academic Background & Batch Timing
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Highest Qualification</label>
                <select
                  value={formData.highestQualification}
                  onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                >
                  <option value="10th Pass">10th Pass</option>
                  <option value="12th Pass">12th Pass</option>
                  <option value="Undergraduate / Pursuing">Undergraduate / Pursuing</option>
                  <option value="Graduate (B.Sc / B.Com / B.A / B.E)">Graduate (B.Sc / B.Com / B.A / B.E)</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">College / Institute Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai University"
                  value={formData.schoolOrCollege}
                  onChange={(e) => setFormData({ ...formData, schoolOrCollege: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Passing Year</label>
                <input
                  type="number"
                  value={formData.passingYear}
                  onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Assigned Training Batch *</label>
                {batches.length > 0 ? (
                  <select
                    required
                    value={selectedBatchId}
                    onChange={(e) => {
                      setSelectedBatchId(e.target.value);
                      const b = batches.find(item => item._id === e.target.value);
                      if (b) setFormData({ ...formData, batchTiming: `${b.batchName} (${b.timing})` });
                    }}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-[#0b3c68] bg-white"
                  >
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.batchName} ({b.timing}) [{b.batchCode}] - {b.days}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1.5 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 font-semibold">
                    No active batches found for this course. Please create a batch in Batch Management or select timing below.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => handleJoiningDateChange(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">ID Proof Type</label>
                <select
                  value={formData.idProofType}
                  onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                >
                  <option value="Aadhar Card">Aadhar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="College ID">College ID</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Student Details
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#12518a] transition"
            >
              Next: Payment & Installments <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: FEE DETAILS — PAYMENT TYPE, RECEIVED AMOUNT, BALANCE & NEXT DUE DATE (Magma-style) */}
      {currentStep === 4 && (
        <form onSubmit={handleSubmitAdmission} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#0b3c68]" /> 4. Fee Details & Payment Schedule
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Payment Configuration */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Payment Type</label>
                  <select
                    value={paymentType}
                    onChange={(e) => handlePaymentTypeChange(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-xs font-bold focus:border-[#0b3c68]"
                  >
                    <option value="installment">Installment</option>
                    <option value="full">Full Payment</option>
                  </select>
                </div>

                {paymentType === 'full' ? (
                  /* FULL PAYMENT: Received amount auto-locked to final fee (readonly) */
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Received Amount (₹)</label>
                    <input
                      type="number"
                      value={downPayment}
                      readOnly
                      title="Full payment selected — received amount is locked to the final fee"
                      className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-slate-300 bg-emerald-50 p-3 text-base font-bold text-emerald-800"
                    />
                  </div>
                ) : (
                  /* INSTALLMENT: editable received amount with validation */
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Received Amount (₹)</label>
                    <input
                      type="number"
                      min={0}
                      max={agreedFee}
                      value={downPayment}
                      onChange={(e) => handleReceivedAmountChange(e.target.value)}
                      className={`mt-1.5 w-full rounded-xl border p-3 text-base font-bold text-slate-900 focus:border-[#0b3c68] ${isReceivedInvalid ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-300'}`}
                    />
                    {isReceivedInvalid && (
                      <p className="mt-1 text-[11px] font-semibold text-red-600">Received Amount cannot exceed the Final Fee.</p>
                    )}
                  </div>
                )}

                {/* Balance Amount: green when cleared, red when pending */}
                <div
                  className={`rounded-xl border p-3 ${remainingBalance === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Balance Amount</span>
                  <span className={`text-lg font-extrabold ${remainingBalance === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ₹{remainingBalance.toLocaleString('en-IN')}
                    {remainingBalance === 0 && <span className="ml-2 text-xs font-bold">— Fully Paid ✓</span>}
                  </span>
                </div>

                {/* Next Due Date: auto = Joining Date + 30 days (Magma-style) */}
                <div>
                  <label className="block text-xs font-bold text-orange-600 uppercase">
                    Next Due Date {paymentType === 'full' || remainingBalance === 0 ? '(N/A)' : ''}
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    disabled={paymentType === 'full' || remainingBalance === 0}
                    value={paymentType === 'full' || remainingBalance === 0 ? '' : nextDueDate}
                    onChange={(e) => handleNextDueDateChange(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-orange-300 bg-orange-50 p-3 text-xs font-bold text-orange-800 focus:border-orange-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <p className="mt-1 text-[11px] text-orange-600 italic">
                    Auto-calculated as Joining Date + 30 days. Editable if needed.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold"
                  >
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Card">Credit/Debit Card (POS)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Transaction ID / UTR / Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref #98729384"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Right column: fee breakdown + installment ledger */}
              <div className="space-y-4">
                {/* Final Fee Breakdown Summary */}
                <div className="rounded-2xl border border-slate-200 bg-[#0b3c68]/[0.03] p-4 space-y-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">Final Fee Breakdown</span>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Standard Course Fee</span>
                    <span className="font-bold">₹{(selectedCourse?.standardFee || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Negotiated Discount</span>
                    <span className="font-bold text-emerald-600">− ₹{(discountAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="flex justify-between text-xs text-slate-800">
                    <span className="font-bold">Final Payable Fee</span>
                    <span className="font-extrabold text-[#0b3c68]">₹{agreedFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Received Now ({paymentType === 'full' ? 'Full Payment' : 'Down Payment'})</span>
                    <span className="font-bold text-emerald-600">₹{(downPayment || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={`font-bold ${remainingBalance === 0 ? 'text-emerald-600' : 'text-red-600'}`}>Balance Due</span>
                    <span className={`font-extrabold ${remainingBalance === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ₹{remainingBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {hasInstallmentMismatch && (
                    <p className="rounded-lg bg-red-100 px-2 py-1.5 text-[11px] font-semibold text-red-700">
                      Installment total (₹{scheduledTotal.toLocaleString('en-IN')}) does not match Balance (₹{remainingBalance.toLocaleString('en-IN')}).
                    </p>
                  )}
                </div>

                {/* Scheduled Installments Ledger — manual amount + due date entry */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Scheduled Installments Ledger
                    </span>
                    {paymentType === 'installment' && remainingBalance > 0 && (
                      <button
                        type="button"
                        onClick={handleAddInstallment}
                        className="flex items-center gap-1 rounded-lg bg-[#0b3c68] px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-[#12518a] transition"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Installment
                      </button>
                    )}
                  </div>

                  {paymentType === 'full' || installmentsList.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      {paymentType === 'full'
                        ? 'Full payment selected — no installments required.'
                        : 'No installments added yet. Click "Add Installment" to schedule the pending balance.'}
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {installmentsList.map((inst, idx) => (
                        <div key={idx} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                          <span className="rounded-md bg-[#0b3c68]/10 px-2 py-1 text-[11px] font-bold text-[#0b3c68]">
                            Inst #{idx + 1}
                          </span>
                          <div className="w-32 text-right">
                            <label className="text-[10px] font-semibold text-slate-400 block">Amount (₹)</label>
                            <input
                              type="number"
                              min={0}
                              value={inst.amount}
                              onChange={(e) => handleInstallmentAmountChange(idx, e.target.value)}
                              className={`w-full text-right text-xs font-bold border-b p-0.5 focus:outline-none focus:border-[#0b3c68] ${Number(inst.amount) <= 0 ? 'text-red-500 border-red-300' : 'text-slate-900 border-transparent'}`}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-semibold text-slate-400 block">Next Installment Date</label>
                            <input
                              type="date"
                              value={inst.dueDate}
                              onChange={(e) => handleInstallmentDateChange(idx, e.target.value)}
                              className={`text-xs font-semibold border-b p-0.5 bg-transparent focus:outline-none focus:border-[#0b3c68] ${!inst.dueDate ? 'text-red-500 border-red-300' : 'text-slate-800 border-transparent'}`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveInstallment(idx)}
                            title="Remove this installment"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {/* Running allocation summary */}
                      <div className={`flex justify-between rounded-xl px-3 py-2 text-[11px] font-bold ${
                        Math.abs(scheduledTotal - remainingBalance) <= 1
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span>Scheduled: ₹{scheduledTotal.toLocaleString('en-IN')}</span>
                        <span>
                          {Math.abs(scheduledTotal - remainingBalance) <= 1
                            ? '✓ Fully covers Balance Amount'
                            : `Unallocated: ₹${(remainingBalance - scheduledTotal).toLocaleString('en-IN')}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => existingStudent ? setCurrentStep(1) : setCurrentStep(3)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> {existingStudent ? 'Back to Pricing' : 'Back to Academic Info'}
            </button>
            <button
              type="submit"
              disabled={submitting || isFloorBreached || isReceivedInvalid || hasInstallmentMismatch || hasInvalidInstallments}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-95 transition disabled:opacity-40"
            >
              {submitting ? 'Registering Admission...' : 'Confirm & Register Student Admission'}
              <CheckCircle2 className="h-5 w-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
