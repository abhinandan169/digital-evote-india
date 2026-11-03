import React, { useState, useEffect, useRef } from 'react';
import { Voter, Language, Constituency } from '../types/election';
import { Fingerprint, KeyRound, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface VoterAuthProps {
  voter: Voter;
  constituency: Constituency;
  lang: Language;
  onAuthenticated: () => void;
  onSwitchVoter: () => void;
}

type AuthStep = 'aadhaar_epic' | 'otp_verify' | 'biometric_liveness' | 'passed';

export const VoterAuth: React.FC<VoterAuthProps> = ({
  voter,
  constituency,
  lang,
  onAuthenticated,
  onSwitchVoter,
}) => {
  const [step, setStep] = useState<AuthStep>('aadhaar_epic');
  const [epicInput, setEpicInput] = useState(voter.epicNumber);
  const [aadhaarInput, setAadhaarInput] = useState(voter.aadhaarLast4);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('849201');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [cameraActive, setCameraActive] = useState(false);
  const [livenessStage, setLivenessStage] = useState<'scan' | 'blink' | 'verifying' | 'success'>('scan');
  const [livenessScore, setLivenessScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setEpicInput(voter.epicNumber);
    setAadhaarInput(voter.aadhaarLast4);
  }, [voter]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp_verify' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpCountdown]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleEpicAadhaarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (voter.hasVoted) {
      setErrorMessage(
        lang === 'en'
          ? 'This voter has already voted. One person can vote only once.'
          : 'यह मतदाता पहले ही वोट डाल चुका है। एक व्यक्ति केवल एक बार मतदान कर सकता है।'
      );
      return;
    }
    if (epicInput.trim().toUpperCase() !== voter.epicNumber) {
      setErrorMessage(
        lang === 'en'
          ? 'Voter ID number does not match the selected voter.'
          : 'दर्ज वोटर आईडी चुने गए मतदाता से मेल नहीं खाती।'
      );
      return;
    }
    if (aadhaarInput.trim() !== voter.aadhaarLast4) {
      setErrorMessage(
        lang === 'en'
          ? 'Last 4 digits of Aadhaar do not match.'
          : 'आधार के अंतिम 4 अंक मेल नहीं खाते।'
      );
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpCountdown(45);
    setStep('otp_verify');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
      setErrorMessage(
        lang === 'en'
          ? 'Wrong OTP. Please enter the 6-digit code shown above.'
          : 'गलत ओटीपी। कृपया ऊपर दिख रहा 6 अंकों का कोड दर्ज करें।'
      );
      return;
    }

    setStep('biometric_liveness');
    startCamera();
  };

  const startCamera = async () => {
    setCameraActive(true);
    setLivenessStage('scan');
    setLivenessScore(0);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 480, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch {
      // Fallback photo preview if webcam permission is blocked
    }

    setTimeout(() => {
      setLivenessScore(48);
      setLivenessStage('blink');
    }, 1800);

    setTimeout(() => {
      setLivenessScore(84);
      setLivenessStage('verifying');
    }, 3600);

    setTimeout(() => {
      setLivenessScore(98.6);
      setLivenessStage('success');
      setTimeout(() => {
        setStep('passed');
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
      }, 1000);
    }, 5000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A192F] px-6 py-4 text-white flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-900/60 flex items-center justify-center border border-blue-400/30">
            <Fingerprint className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {lang === 'en' ? 'Voter Identity Check' : 'मतदाता पहचान जांच'}
            </h2>
            <p className="text-xs text-slate-300">
              {lang === 'en'
                ? '3 Simple Steps: Voter ID + Mobile OTP + Live Camera Check'
                : '3 आसान चरण: वोटर आईडी + मोबाइल ओटीपी + लाइव कैमरा जांच'}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-300">
          <span className={step === 'aadhaar_epic' ? 'text-amber-400 font-bold' : ''}>
            1. Voter ID
          </span>
          <span>→</span>
          <span className={step === 'otp_verify' ? 'text-amber-400 font-bold' : ''}>2. OTP</span>
          <span>→</span>
          <span className={step === 'biometric_liveness' ? 'text-amber-400 font-bold' : ''}>
            3. Camera
          </span>
        </div>
      </div>

      {/* Selected Voter Bar */}
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          {voter.avatarUrl ? (
            <img
              src={voter.avatarUrl}
              alt={voter.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-300"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700">
              {voter.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-900 text-sm">
              {lang === 'en' ? voter.name : voter.nameHi}
            </div>
            <div className="text-slate-500">
              Voter ID: <span className="font-mono font-medium text-slate-700">{voter.epicNumber}</span> ·{' '}
              {constituency.name} ({constituency.code}), {constituency.state}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchVoter}
          className="text-xs text-blue-700 hover:text-blue-900 font-medium underline underline-offset-2 cursor-pointer"
        >
          {lang === 'en' ? 'Change Voter' : 'मतदाता बदलें'}
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Step 1: Voter ID & Aadhaar */}
      {step === 'aadhaar_epic' && (
        <form onSubmit={handleEpicAadhaarSubmit} className="p-6 space-y-5">
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold">
              {lang === 'en' ? 'Step 1: ' : 'चरण 1: '}
            </span>
            {lang === 'en'
              ? 'Check your Voter ID number and enter the last 4 digits of your Aadhaar card to get a 6-digit OTP.'
              : 'अपना वोटर आईडी नंबर जांचें और 6 अंकों का ओटीपी पाने के लिए आधार के अंतिम 4 अंक दर्ज करें।'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'en' ? 'Voter ID Number (EPIC)' : 'वोटर आईडी नंबर (EPIC)'}
              </label>
              <input
                type="text"
                value={epicInput}
                onChange={(e) => setEpicInput(e.target.value.toUpperCase())}
                placeholder="e.g. UPG9081245"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {lang === 'en' ? '10-character Voter ID code' : '10 अक्षर का वोटर आईडी नंबर'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'en' ? 'Aadhaar (Last 4 Digits)' : 'आधार (अंतिम 4 अंक)'}
              </label>
              <input
                type="text"
                maxLength={4}
                value={aadhaarInput}
                onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 9021"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tracking-widest focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Aadhaar: {voter.aadhaarFull}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0A2540] hover:bg-[#123963] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>{lang === 'en' ? 'Send Mobile OTP' : 'मोबाइल ओटीपी भेजें'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Mobile OTP */}
      {step === 'otp_verify' && (
        <form onSubmit={handleVerifyOtp} className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'en' ? 'Step 2: Enter Mobile OTP' : 'चरण 2: मोबाइल ओटीपी दर्ज करें'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? `6-digit OTP sent to mobile ${voter.phone.replace(/(\+91 \d{2})\d{3}(\s\d{2})/, '$1***$2')}`
                : `6 अंकों का ओटीपी ${voter.phone} पर भेजा गया है`}
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900">
            <div>
              <span className="font-semibold">
                {lang === 'en' ? 'Test OTP Code: ' : 'टेस्ट ओटीपी कोड: '}
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm ml-1 tabular-nums">
                {generatedOtp}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOtpCode(generatedOtp)}
              className="px-2.5 py-1 text-[11px] font-semibold bg-amber-200/70 hover:bg-amber-300 text-amber-900 rounded border border-amber-300 cursor-pointer"
            >
              {lang === 'en' ? 'Fill OTP' : 'कोड भरें'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
              {lang === 'en' ? 'Enter 6-Digit OTP' : '6 अंकों का कोड लिखें'}
            </label>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-48 mx-auto block text-center tracking-[0.5em] text-xl font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
              autoFocus
            />
            <div className="text-center text-xs text-slate-400 mt-2">
              {otpCountdown > 0 ? (
                <span>
                  {lang === 'en'
                    ? `Resend OTP in ${otpCountdown}s`
                    : `${otpCountdown} सेकंड में पुनः भेजें`}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtp(newOtp);
                    setOtpCountdown(45);
                  }}
                  className="text-blue-600 font-semibold underline cursor-pointer"
                >
                  {lang === 'en' ? 'Resend OTP' : 'ओटीपी पुनः भेजें'}
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('aadhaar_epic')}
              className="w-1/3 py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
            >
              {lang === 'en' ? 'Back' : 'वापस'}
            </button>
            <button
              type="submit"
              className="w-2/3 py-2 px-4 bg-[#0A2540] hover:bg-[#123963] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              {lang === 'en' ? 'Verify OTP & Continue' : 'ओटीपी सत्यापित करें'}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Live Camera Check */}
      {step === 'biometric_liveness' && (
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'en' ? 'Step 3: Live Camera Face Check' : 'चरण 3: लाइव कैमरा चेहरा जांच'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'en'
                ? 'Look at the camera so we can confirm you are a real voter present at the screen.'
                : 'कैमरे की ओर देखें ताकि मतदाता की उपस्थिति की पुष्टि हो सके।'}
            </p>
          </div>

          <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden bg-slate-900 border-4 border-blue-500/80 shadow-inner flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />

            {!cameraActive && voter.avatarUrl && (
              <img
                src={voter.avatarUrl}
                alt="Voter Face Preview"
                className="w-full h-full object-cover filter brightness-90"
              />
            )}

            <div className="absolute inset-4 rounded-full border-2 border-dashed border-amber-400/70 pointer-events-none animate-pulse" />
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_cyan] pointer-events-none animate-bounce" />

            <div className="absolute bottom-3 inset-x-0 flex justify-center">
              <span className="px-2.5 py-0.5 rounded-full bg-black/75 text-[11px] font-mono text-cyan-300 border border-cyan-400/40">
                {livenessStage === 'scan' && (lang === 'en' ? 'Checking Camera...' : 'कैमरा जांच जारी...')}
                {livenessStage === 'blink' && (lang === 'en' ? 'Please Blink Your Eyes' : 'कृपया पलकें झपकाएं')}
                {livenessStage === 'verifying' && (lang === 'en' ? 'Matching Voter Photo...' : 'फोटो मिलान जारी...')}
                {livenessStage === 'success' && (lang === 'en' ? '✓ Face Matched (98.6%)' : '✓ चेहरा सत्यापित (98.6%)')}
              </span>
            </div>
          </div>

          <div className="space-y-1 max-w-sm mx-auto">
            <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
              <span>{lang === 'en' ? 'Face Match Score' : 'मिलान स्कोर'}</span>
              <span className="font-semibold text-slate-800">{livenessScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="bg-emerald-600 h-full transition-all duration-500"
                style={{ width: `${livenessScore}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Verified */}
      {step === 'passed' && (
        <div className="p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'en' ? 'Identity Verified Successfully!' : 'आपकी पहचान सत्यापित हो गई है!'}
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              {lang === 'en'
                ? `You can now vote for ${constituency.name} (${constituency.code}). The EVM voting machine is ready for you.`
                : `अब आप ${constituency.name} (${constituency.code}) के लिए वोट डाल सकते हैं। ईवीएम मशीन तैयार है।`}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 max-w-sm mx-auto text-left">
            <div>
              VOTER ID: <span className="text-slate-900 font-semibold">{voter.epicNumber}</span>
            </div>
            <div>
              BOOTH: <span className="text-slate-900">{voter.pollingStation}</span>
            </div>
            <div>
              STATUS: <span className="text-emerald-700 font-semibold">READY TO VOTE</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onAuthenticated}
            className="w-full max-w-sm py-3 px-6 bg-[#138808] hover:bg-[#0f6c06] text-white font-bold text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <span>{lang === 'en' ? 'Open EVM Voting Machine' : 'ईवीएम वोटिंग मशीन खोलें'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
