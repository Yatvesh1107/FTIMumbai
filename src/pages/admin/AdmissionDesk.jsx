import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  UserPlus,
  BookOpen,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CreditCard,
  Percent,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building,
  GraduationCap
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

  // Form State
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Dynamic Pricing State
  const [agreedFee, setAgreedFee] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [numInstallments, setNumInstallments] = useState(2);
  const [installmentsList, setInstallmentsList] = useState([]);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');

  // Student Profile State
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

  // Load Courses
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
      } catch (err) {
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // When course selected, initialize negotiation pricing & default installments
  const handleCourseSelect = (course) => {
    setSelectedCourseId(course._id);
    setSelectedCourse(course);
    setAgreedFee(course.standardFee);
    setDiscountAmount(0);

    // Default down payment = 30% of standard fee rounded to 1000s
    const defaultDp = Math.min(course.standardFee, Math.round((course.standardFee * 0.3) / 500) * 500);
    setDownPayment(defaultDp);
    generateInstallmentSchedule(course.standardFee - defaultDp, 2);
  };

  // Handle Agreed Fee Change with Validation
  const handleAgreedFeeChange = (value) => {
    const val = Number(value);
    setAgreedFee(val);
    if (selectedCourse) {
      const disc = Math.max(0, selectedCourse.standardFee - val);
      setDiscountAmount(disc);
      const remainingBalance = Math.max(0, val - downPayment);
      generateInstallmentSchedule(remainingBalance, numInstallments);
    }
  };

  // Handle Down Payment Change
  const handleDownPaymentChange = (value) => {
    const dp = Number(value);
    setDownPayment(dp);
    const remainingBalance = Math.max(0, agreedFee - dp);
    generateInstallmentSchedule(remainingBalance, numInstallments);
  };

  // Generate Installment Schedule dynamically
  const generateInstallmentSchedule = (balance, count) => {
    if (balance <= 0 || count <= 0) {
      setInstallmentsList([]);
      return;
    }
    const perInstallment = Math.round(balance / count);
    const list = [];
    const today = new Date();

    for (let i = 1; i <= count; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i);
      const amount = i === count ? balance - perInstallment * (count - 1) : perInstallment;
      list.push({
        installmentNo: i,
        amount,
        dueDate: dueDate.toISOString().split('T')[0]
      });
    }
    setInstallmentsList(list);
  };

  const handleInstallmentDateChange = (index, newDate) => {
    const updated = [...installmentsList];
    updated[index].dueDate = newDate;
    setInstallmentsList(updated);
  };

  const handleInstallmentAmountChange = (index, newAmount) => {
    const updated = [...installmentsList];
    updated[index].amount = Number(newAmount);
    setInstallmentsList(updated);
  };

  // Validation Checks
  const isFloorBreached = selectedCourse && agreedFee < selectedCourse.minFloorFee;
  const isDownPaymentInvalid = downPayment > agreedFee;

  const handleSubmitAdmission = async (e) => {
    e.preventDefault();
    if (isFloorBreached) {
      setError(`Cannot register admission! Negotiated fee of ₹${agreedFee} is below the allowable floor limit of ₹${selectedCourse.minFloorFee}.`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        courseId: selectedCourseId,
        agreedTotalFee: agreedFee,
        downPayment,
        paymentMode,
        transactionRef,
        installmentsList
      };

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
          Student file created & portal login credentials dispatched.
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
            <span className="text-slate-500 font-semibold">Down Payment Collected:</span>
            <span className="font-bold text-slate-900">₹{successData.admission.downPayment.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => {
              setSuccessData(null);
              setCurrentStep(1);
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
            New Student Course Admission
          </h1>
          <p className="text-xs text-slate-300">
            Select course, apply authorized fee discounts within allowable floor limits, and set installment plans.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2 backdrop-blur">
          {[1, 2, 3, 4].map((step) => (
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
                return (
                  <div
                    key={c._id}
                    onClick={() => handleCourseSelect(c)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? 'border-[#0b3c68] bg-sky-50/40 ring-2 ring-[#0b3c68]/20 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {c.courseCode}
                      </span>
                      <span className="text-[11px] font-bold text-[#8a6a5b]">{c.duration}</span>
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
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#12518a] transition disabled:opacity-40"
            >
              Next: Student Details <ArrowRight className="h-4 w-4" />
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
                <label className="block text-xs font-bold text-slate-700 uppercase">Batch Preferred Timing</label>
                <select
                  value={formData.batchTiming}
                  onChange={(e) => setFormData({ ...formData, batchTiming: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-[#0b3c68]"
                >
                  <option value="Morning (08:00 AM - 10:00 AM)">Morning (08:00 AM - 10:00 AM)</option>
                  <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (01:00 PM - 03:00 PM)">Afternoon (01:00 PM - 03:00 PM)</option>
                  <option value="Evening (04:00 PM - 06:00 PM)">Evening (04:00 PM - 06:00 PM)</option>
                  <option value="Weekend Special">Weekend Special</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
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

      {/* STEP 4: DOWN PAYMENT & INSTALLMENT SCHEDULE GENERATOR */}
      {currentStep === 4 && (
        <form onSubmit={handleSubmitAdmission} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#0b3c68]" /> 4. Down Payment & Installment Schedule Breakdown
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Payment Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Down Payment / Initial Reg. Fee (₹)</label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => handleDownPaymentChange(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-base font-bold text-slate-900 focus:border-[#0b3c68]"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Remaining Balance to split: <strong className="text-[#0b3c68]">₹{Math.max(0, agreedFee - downPayment).toLocaleString('en-IN')}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                    <label className="block text-xs font-bold text-slate-700 uppercase">Installments Count</label>
                    <select
                      value={numInstallments}
                      onChange={(e) => {
                        const count = Number(e.target.value);
                        setNumInstallments(count);
                        generateInstallmentSchedule(Math.max(0, agreedFee - downPayment), count);
                      }}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold"
                    >
                      <option value={1}>1 Installment</option>
                      <option value={2}>2 Monthly Installments</option>
                      <option value={3}>3 Monthly Installments</option>
                      <option value={4}>4 Monthly Installments</option>
                    </select>
                  </div>
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

              {/* Installment Breakdown Ledger */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                  Scheduled Installments Ledger
                </span>

                {installmentsList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Full payment cleared in down payment.</p>
                ) : (
                  <div className="space-y-2.5">
                    {installmentsList.map((inst, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                        <span className="rounded-md bg-[#0b3c68]/10 px-2 py-1 text-[11px] font-bold text-[#0b3c68]">
                          Inst #{inst.installmentNo}
                        </span>
                        <div className="flex-1">
                          <label className="text-[10px] font-semibold text-slate-400 block">Due Date</label>
                          <input
                            type="date"
                            value={inst.dueDate}
                            onChange={(e) => handleInstallmentDateChange(idx, e.target.value)}
                            className="text-xs font-semibold text-slate-800 bg-transparent border-0 p-0 focus:ring-0"
                          />
                        </div>
                        <div className="w-28 text-right">
                          <label className="text-[10px] font-semibold text-slate-400 block">Amount (₹)</label>
                          <input
                            type="number"
                            value={inst.amount}
                            onChange={(e) => handleInstallmentAmountChange(idx, e.target.value)}
                            className="w-full text-right text-xs font-bold text-slate-900 bg-transparent border-0 p-0 focus:ring-0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Academic Info
            </button>
            <button
              type="submit"
              disabled={submitting || isFloorBreached}
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
