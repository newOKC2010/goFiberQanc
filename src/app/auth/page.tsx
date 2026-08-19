'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/buttonClick/mainButton';
import { InputText } from '@/components/input/text/mainInputText';
import { OtpModal } from '@/app/auth/component/OTP/otpModal';
import { handleLoginRequest } from '@/app/auth/request/handler/handlerReq';
import { handleVerifyOtp } from '@/app/auth/verify/handler/handlerVerify';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useLang } from '@/global/globalLang';
import tr, { t } from '@/global/translations';

import Loading from '@/components/loading/mainLoading';

function ErrorAlertWrapper() {
  useErrorAlert();
  return null;
}

export default function AuthPage() {
  const router = useRouter();
  const { lang, toggleLang } = useLang();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError(t(tr.auth.emailInvalid, lang));
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setEmailError(t(tr.auth.emailRequired, lang));
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError(t(tr.auth.emailInvalid, lang));
      return;
    }
    
    setLoading(true);
    const result = await handleLoginRequest(email);
    if (result.success) {
      setVerifiedEmail(email);
      setShowOtpModal(true);
    }
    setLoading(false);
  };

  const isFormValid = email.trim() !== '' && validateEmail(email) && !emailError;

  const handleOtpVerify = async (otp: string) => {
    setVerifyLoading(true);
    const result = await handleVerifyOtp(verifiedEmail, otp);
    setVerifyLoading(false);

    if (result.success) {
      setShowOtpModal(false);
      setShowLoginSuccess(true);

      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <ErrorAlertWrapper />
      </Suspense>
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 animate-fade-in">
        {/* Top controls */}
        <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
          <button
            onClick={() => router.push('/qanc')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm text-gray-500 text-xs font-bold hover:bg-white/90 hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600", fontSize: '1rem' }}>arrow_back</span>
            {lang === 'th' ? 'หน้าหลัก' : 'Home'}
          </button>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm text-gray-500 text-xs font-bold hover:bg-white/90 hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600", fontSize: '1rem' }}>translate</span>
            {lang === 'th' ? 'EN' : 'ไทย'}
          </button>
        </div>

        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] bg-sky-200/30 rounded-full blur-[80px] animate-bounce duration-[5000ms]" />

        <div className="w-full max-w-md relative z-10 px-4 animate-slide-up-card">
          <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] animate-fade-in delay-200">

            <div className="text-center mb-10 animate-slide-up-card delay-300">
              <div className="relative inline-block mb-6 group animate-scale-in delay-100">
                <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-500 text-white">
                  <span className="material-symbols-outlined text-6xl drop-shadow-sm"
                    style={{
                      fontVariationSettings: "'wght' 700",
                      fontSize: 'clamp(2rem, 5vw, 3rem)',
                      transition: 'all 0.3s ease'
                    }}>
                    pregnant_woman
                  </span>
                </div>
              </div>

              <h1 className="text-3xl text-gray-700 font-bold mb-2 animate-fade-in delay-400">
                {t(tr.auth.title, lang)}
              </h1>
              <p className="text-gray-600 text-sm font-bold animate-fade-in delay-500">
                {t(tr.auth.subtitle, lang)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up-card delay-600">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 ml-4">
                  {t(tr.auth.emailLabel, lang)}
                </label>
                <InputText
                  type="text"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder={t(tr.auth.emailPlaceholder, lang)}
                  maxWidth={400}
                  icon="mail"
                  error={emailError}
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  variant="pastel"
                  size="md"
                  loading={loading}
                  disabled={loading || !isFormValid}
                  className="w-[200px] sm:w-auto sm:min-w-[200px] bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white rounded-2xl"
                  icon="login"
                >
                  {t(tr.auth.loginBtn, lang)}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center animate-fade-in delay-700">
              <p className="text-xs text-slate-400 font-bold">
                {t(tr.auth.onlyStaff, lang)}
              </p>
            </div>
          </div>
        </div>

        <OtpModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          email={verifiedEmail}
          onVerify={handleOtpVerify}
          loading={verifyLoading}
        />

        {showLoginSuccess && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
            <Loading message={t(tr.auth.loggingIn, lang)} delay={2000} fullScreen={false} />
          </div>
        )}
      </div>
    </>
  );
}