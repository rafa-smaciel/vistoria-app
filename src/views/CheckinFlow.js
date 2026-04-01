// src/modules/VistorIA/pages/CheckinFlow.js
// Checkin flow — Executor A (Portaria) — 4 steps
// Step 1: Identification | Step 2: Guided Video | Step 3: Processing | Step 4: Confirmation

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
  FaCheck, FaSpinner, FaArrowLeft, FaVideo, FaStop, FaCircle,
  FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaRedo,
  FaMapMarkerAlt, FaClock, FaTimes
} from 'react-icons/fa';
import { supabase, VISTORIA_SUPABASE_URL as SUPABASE_URL, VISTORIA_ANON_KEY } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { vistoriaColors as colors } from '../components/theme';
const DEMO_CLIENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const DEMO_VIDEO_URL = `${SUPABASE_URL}/storage/v1/object/public/vistoria-demo/demo-checklist.mp4`;

// ============================================
// ANIMATIONS
// ============================================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.3); }
  50% { box-shadow: 0 0 0 8px rgba(14, 165, 233, 0); }
  100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
`;

const successGlow = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// ============================================
// STYLED COMPONENTS
// ============================================
const Container = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: ${colors.background};
  color: ${colors.textPrimary};
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid ${colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: ${colors.primary};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${colors.textSecondary};
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: ${colors.backgroundAlt};
`;

const StepDot = styled.div`
  width: ${p => p.$active ? '24px' : '8px'};
  height: 8px;
  border-radius: 4px;
  background: ${p => p.$completed ? colors.primary : p.$active ? colors.primary : '#e2e8f0'};
  transition: all 0.3s ease;
`;

const Content = styled.main`
  padding: 20px 16px;
  max-width: 600px;
  margin: 0 auto;
  animation: ${fadeIn} 0.4s ease;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: ${colors.textPrimary};
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 0 0 20px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textSecondary};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 2px solid ${colors.border};
  border-radius: 10px;
  font-size: 16px;
  color: ${colors.textPrimary};
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  &:focus { border-color: ${colors.primary}; }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 14px;
  border: 2px solid ${colors.border};
  border-radius: 10px;
  font-size: 16px;
  color: ${colors.textPrimary};
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  &:focus { border-color: ${colors.primary}; }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  background: ${p => p.$variant === 'outline' ? 'transparent' : p.$danger ? colors.danger : colors.primary};
  color: ${p => p.$variant === 'outline' ? colors.primary : '#fff'};
  border: ${p => p.$variant === 'outline' ? `2px solid ${colors.primary}` : 'none'};
  opacity: ${p => p.disabled ? 0.5 : 1};
  pointer-events: ${p => p.disabled ? 'none' : 'auto'};
  margin-top: ${p => p.$mt || '0'};
  &:active { transform: scale(0.98); }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: ${colors.textSecondary};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${colors.border};
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${colors.textSecondary};
  margin-bottom: 8px;
  svg { color: ${colors.primary}; flex-shrink: 0; }
`;

const DemoButton = styled.button`
  width: 100%;
  padding: 12px;
  border: 2px dashed ${colors.accent};
  border-radius: 12px;
  background: ${colors.warningLight};
  color: #92400e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  transition: all 0.2s;
  &:hover { background: #fde68a; }
  &:disabled { opacity: 0.6; cursor: wait; }
`;

const DemoBanner = styled.div`
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
  .demo-icon { font-size: 18px; }
`;

// Camera
const CameraContainer = styled.div`
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const CameraPreview = styled.video`
  width: 100%;
  max-height: 60vh;
  object-fit: cover;
  display: block;
`;

const RecordingBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fff;
    animation: ${pulse} 1s ease-in-out infinite;
  }
`;

const GuideOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: #fff;
`;

const GuideInstruction = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GuideProgress = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
`;

const GuideDot = styled.div`
  width: ${p => p.$active ? '16px' : '6px'};
  height: 6px;
  border-radius: 3px;
  background: ${p => p.$completed ? colors.success : p.$active ? '#fff' : 'rgba(255,255,255,0.4)'};
  transition: all 0.3s;
`;

const CameraError = styled.div`
  padding: 16px;
  background: ${colors.dangerLight};
  border: 1px solid ${colors.danger};
  border-radius: 10px;
  color: #991b1b;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
`;

const VideoConfirm = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: ${colors.successLight};
  border-radius: 10px;
  color: ${colors.success};
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  .frames { font-weight: 400; color: ${colors.textSecondary}; font-size: 13px; }
`;

// Processing
const ProcessingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
  min-height: 60vh;
`;

const WorkflowBlocks = styled.div`
  width: 100%;
  max-width: 400px;
  margin-top: 32px;
`;

const WorkflowBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${p =>
    p.$status === 'success' ? colors.successLight :
    p.$status === 'running' ? '#eff6ff' : '#fff'
  };
  border: 2px solid ${p =>
    p.$status === 'success' ? colors.success :
    p.$status === 'running' ? colors.primary : colors.border
  };
  border-radius: 10px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  ${p => p.$status === 'running'
    ? css`animation: ${pulseGlow} 1.5s ease-in-out infinite;`
    : p.$status === 'success'
      ? css`animation: ${successGlow} 0.5s ease-in-out forwards;`
      : 'animation: none;'
  }

  .icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    background: ${p =>
      p.$status === 'success' ? colors.success :
      p.$status === 'running' ? colors.primary : colors.backgroundAlt
    };
    color: ${p => (p.$status === 'success' || p.$status === 'running') ? '#fff' : colors.textSecondary};
  }
  .label {
    flex: 1; font-size: 13px; font-weight: 500;
    color: ${p =>
      p.$status === 'success' ? colors.success :
      p.$status === 'running' ? colors.primary : colors.textSecondary
    };
  }
  .duration { font-size: 11px; color: ${colors.textSecondary}; }
`;

const SpinnerIcon = styled(FaSpinner)`
  font-size: 48px;
  color: ${colors.primary};
  animation: ${spin} 1s linear infinite;
  margin-bottom: 24px;
`;

const SmallSpinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

const Timer = styled.div`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-top: 16px;
  font-variant-numeric: tabular-nums;
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: ${colors.border};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 16px;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${p => p.$pct}%;
  background: linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight});
  border-radius: 4px;
  transition: width 0.5s ease;
`;

// Results
const ResultBanner = styled.div`
  background: ${p => p.$success
    ? `linear-gradient(135deg, ${colors.successLight} 0%, #fff 100%)`
    : p.$inconclusive
      ? `linear-gradient(135deg, ${colors.warningLight} 0%, #fff 100%)`
      : `linear-gradient(135deg, ${colors.dangerLight} 0%, #fff 100%)`
  };
  border: 2px solid ${p => p.$success ? colors.success : p.$inconclusive ? colors.warning : colors.danger};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  margin-bottom: 20px;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: 700;
  background: ${p => p.$success ? colors.success : p.$inconclusive ? colors.warning : colors.danger};
  color: #fff;
  margin-bottom: 12px;
`;

const PlateText = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
`;

const ChecklistSummary = styled.div`
  font-size: 16px;
  color: ${colors.textSecondary};
  margin-bottom: 8px;
  span { font-weight: 700; }
`;

const WaitingBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: ${colors.warningLight};
  color: #92400e;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 8px;
`;

const NokList = styled.div`
  text-align: left;
  margin: 12px 0;
`;

const NokItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${colors.dangerLight};
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #991b1b;
  svg { color: ${colors.danger}; }
`;

const ErrorBox = styled.div`
  padding: 16px;
  background: ${colors.dangerLight};
  border: 1px solid ${colors.danger};
  border-radius: 12px;
  color: #991b1b;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
`;

// ============================================
// HELPERS
// ============================================
// Detects the best supported video MIME type for MediaRecorder (cross-platform)
function getSupportedVideoMimeType() {
  const types = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm;codecs=h264',
    'video/webm',
    'video/mp4;codecs=h264',
    'video/mp4',
  ];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

// Accepts either a File/Blob or a direct URL string
function extractFramesFromVideo(videoSource, numFrames = 40) {
  return new Promise((resolve, reject) => {
    const isUrl = typeof videoSource === 'string';
    const videoUrl = isUrl ? videoSource : URL.createObjectURL(videoSource);
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    // Preload enough data for seeking
    video.preload = 'auto';

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        const canvas = document.createElement('canvas');
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const MAX = isIOS ? 720 : 1024;
        let w = video.videoWidth || 640, h = video.videoHeight || 480;
        if (w > h) { if (w > MAX) { h = (h * MAX) / w; w = MAX; } }
        else { if (h > MAX) { w = (w * MAX) / h; h = MAX; } }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        // Front-weighted frame distribution: extract more frames from the
        // beginning of the video where the cab plate is visible on entry.
        // 60% of frames from first 40% of video, 40% from the rest.
        // Start at 0s — the cab plate may only be visible in the very first frames.
        const earlyCount = Math.round(numFrames * 0.6);
        const lateCount = numFrames - earlyCount;
        const earlyStart = 0;
        const earlyEnd = duration * 0.40;
        const lateStart = duration * 0.40;
        const lateEnd = duration * 0.95;
        const earlyInterval = (earlyEnd - earlyStart) / Math.max(earlyCount - 1, 1);
        const lateInterval = (lateEnd - lateStart) / Math.max(lateCount - 1, 1);

        const timePoints = [];
        for (let i = 0; i < earlyCount; i++) timePoints.push(earlyStart + i * earlyInterval);
        for (let i = 0; i < lateCount; i++) timePoints.push(lateStart + i * lateInterval);

        const frames = [];
        for (let i = 0; i < timePoints.length; i++) {
          video.currentTime = timePoints[i];
          await new Promise(r => {
            const t = setTimeout(r, isIOS ? 1500 : 800);
            video.onseeked = () => { clearTimeout(t); r(); };
          });
          if (video.readyState < 2) await new Promise(r => { video.oncanplay = r; setTimeout(r, 1000); });
          ctx.drawImage(video, 0, 0, w, h);
          const base64 = canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
          frames.push({ base64, preview: `data:image/jpeg;base64,${base64}` });
        }

        if (!isUrl) URL.revokeObjectURL(videoUrl);
        resolve({ frames, duration });
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () => reject(new Error('Erro ao carregar video'));
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const CHECKLIST_LABELS = {
  carroceria: 'Carroceria',
  assoalho: 'Assoalho',
  pneus: 'Pneus',
  lanternas: 'Lanternas',
  parabrisa: 'Parabrisa',
};

const VIDEO_GUIDES = [
  { icon: '📋', label: 'Placa', instruction: 'Filme a placa de perto', seconds: 5 },
  { icon: '🚛', label: 'Frente', instruction: 'Filme a frente do veiculo', seconds: 5 },
  { icon: '◀️', label: 'Lateral Esq.', instruction: 'Caminhe filmando a lateral esquerda', seconds: 7 },
  { icon: '🔄', label: 'Traseira', instruction: 'Filme a traseira com lanternas', seconds: 5 },
  { icon: '▶️', label: 'Lateral Dir.', instruction: 'Caminhe filmando a lateral direita', seconds: 7 },
  { icon: '🛞', label: 'Pneus', instruction: 'Aproxime dos pneus visiveis', seconds: 5 },
  { icon: '✅', label: 'Livre', instruction: 'Filme detalhes adicionais', seconds: 0 },
];

const VEHICLE_TYPES = [
  'Carreta', 'Truck', 'Toco', 'VUC', 'Bitrem', 'Rodotrem', 'Van', 'Outro'
];

const DEFAULT_CDS = [
  'CD Sao Paulo', 'CD Campinas', 'CD Rio de Janeiro', 'CD Curitiba',
  'CD Belo Horizonte', 'CD Salvador', 'CD Recife', 'CD Fortaleza'
];

// ============================================
// COMPONENT
// ============================================
export default function CheckinFlow() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    document.title = 'VistorIA - Checkin';
  }, []);

  // Steps: 1=Identification, 2=Video, 3=Processing, 4=Confirmation
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [countdown, setCountdown] = useState(null);

  // Step 1: Form
  const [cdName, setCdName] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [vehicleType, setVehicleType] = useState('Carreta');
  const [osNumber, setOsNumber] = useState('');
  const [cteNumber, setCteNumber] = useState('');
  const [cdList, setCdList] = useState(DEFAULT_CDS);

  // RF-08: Driver selection
  const [driversList, setDriversList] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedDriverName, setSelectedDriverName] = useState('');

  // GPS
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [capturedAt, setCapturedAt] = useState(null);

  // Step 2: Video
  const [videoFrames, setVideoFrames] = useState([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState(null);
  const [guideIndex, setGuideIndex] = useState(0);
  const [guideSecondsLeft, setGuideSecondsLeft] = useState(0);
  const [minDuration] = useState(10); // seconds — could come from config
  const videoInputRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const guideTimerRef = useRef(null);

  // Step 3: Processing
  const [workflowBlocks, setWorkflowBlocks] = useState([
    { id: 1, label: 'Extraindo frames...', status: 'pending' },
    { id: 2, label: 'Identificando placa...', status: 'pending' },
    { id: 3, label: 'Avaliando checklist...', status: 'pending' },
    { id: 4, label: 'Finalizando...', status: 'pending' },
  ]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  // Step 4: Result
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Demo mode (from URL param)
  const isDemo = new URLSearchParams(window.location.search).get('demo') === '1';

  // ---- RF-08: Load active drivers for this operator's client ----
  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const { data: vUser } = await supabase
          .from('vistoria_users')
          .select('client_id')
          .eq('auth_user_id', user?.id || 'demo')
          .eq('is_active', true)
          .maybeSingle();
        if (vUser?.client_id) {
          const { data: drivers } = await supabase
            .from('vistoria_drivers')
            .select('id, name')
            .eq('client_id', vUser.client_id)
            .eq('is_active', true)
            .order('name');
          if (drivers?.length > 0) setDriversList(drivers);
        }
      } catch (_e) {
        // driver selection is optional — silently fail
      }
    })();
  }, [authLoading, user]);

  // ---- Load config from DB (CDs list) ----
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('vistoria_config')
          .select('config_value')
          .eq('config_key', 'general_cds')
          .maybeSingle();
        if (data?.config_value) {
          const parsed = typeof data.config_value === 'string'
            ? JSON.parse(data.config_value)
            : data.config_value;
          if (Array.isArray(parsed) && parsed.length > 0) setCdList(parsed);
        }
      } catch (e) {
        // Use defaults
      }
    })();
  }, []);

  // ---- Prefill operator name from auth profile ----
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setOperatorName(user.user_metadata.full_name);
    } else if (user?.email) {
      setOperatorName(user.email.split('@')[0]);
    }
  }, [user]);

  // ---- GPS capture ----
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('GPS nao disponivel');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
        setGpsError(null);
      },
      (err) => {
        console.warn('[CheckinFlow] GPS error:', err.message);
        setGpsError('Localizacao nao disponivel');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // ---- Camera helpers ----
  const startCamera = async () => {
    try {
      setCameraError(null);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const maxRes = isIOS ? 1280 : 1920;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: maxRes }, height: { ideal: isIOS ? 720 : 1080 } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        await new Promise((resolve) => {
          const el = videoPreviewRef.current;
          if (el.readyState >= 2) return resolve();
          el.onloadeddata = () => resolve();
          setTimeout(resolve, 3000);
        });
      }
      return stream;
    } catch (err) {
      console.error('[CheckinFlow] Camera error:', err);
      setCameraError('Nao foi possivel acessar a camera. Verifique as permissoes.');
      return null;
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      clearInterval(guideTimerRef.current);
      clearInterval(recordingTimerRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  // Stop camera when leaving step 2
  useEffect(() => {
    if (step !== 2) stopCamera();
  }, [step]);

  // Assign stream to video element when cameraActive renders the <video> in the DOM
  useEffect(() => {
    if (cameraActive && cameraStreamRef.current && videoPreviewRef.current && !videoPreviewRef.current.srcObject) {
      videoPreviewRef.current.srcObject = cameraStreamRef.current;
      videoPreviewRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  // ---- Camera & Recording handlers ----
  const handleOpenCamera = async () => {
    const stream = await startCamera();
    if (!stream) return;
    setCameraActive(true);

    recordedChunksRef.current = [];
    const supportedMime = getSupportedVideoMimeType();
    const recorder = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : {});
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      stopCamera();

      const mimeType = recorder.mimeType || supportedMime || 'video/webm';
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const file = new File([blob], `recording.${ext}`, { type: mimeType });

      setLoadingVideo(true);
      try {
        const { frames, duration } = await extractFramesFromVideo(file, 40);
        setVideoFrames(frames);
        setVideoDuration(duration);
      } catch (err) {
        console.error('[CheckinFlow] Frame extraction error:', err);
        setCameraError('Erro ao processar video. Tente novamente.');
      } finally {
        setLoadingVideo(false);
      }
    };
  };

  const startGuideTimer = () => {
    setGuideIndex(0);
    setGuideSecondsLeft(VIDEO_GUIDES[0].seconds);
    clearInterval(guideTimerRef.current);
    guideTimerRef.current = setInterval(() => {
      setGuideSecondsLeft(prev => {
        if (prev <= 1) {
          setGuideIndex(gi => {
            const next = gi + 1;
            if (next < VIDEO_GUIDES.length) {
              setGuideSecondsLeft(VIDEO_GUIDES[next].seconds);
              return next;
            }
            clearInterval(guideTimerRef.current);
            return gi;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartRecording = () => {
    if (!mediaRecorderRef.current) return;
    recordedChunksRef.current = [];
    mediaRecorderRef.current.start(1000);
    setIsRecording(true);
    setRecordingTime(0);
    startGuideTimer();
    const t0 = Date.now();
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(Math.floor((Date.now() - t0) / 1000));
    }, 1000);
  };

  const handleStopRecording = () => {
    clearInterval(guideTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setLoadingVideo(true);
    try {
      const { frames, duration } = await extractFramesFromVideo(file, 40);
      setVideoFrames(frames);
      setVideoDuration(duration);
    } catch (err) {
      console.error('[CheckinFlow] Video error:', err);
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleLoadDemo = async () => {
    // Auto-fill form fields for demo convenience
    if (!cdName && cdList.length > 0) setCdName(cdList[0]);
    if (!operatorName) setOperatorName('Operador Demo');
    setLoadingDemo(true);
    try {
      // Pass URL directly — no fetch() needed, <video> element handles streaming
      const { frames, duration } = await extractFramesFromVideo(DEMO_VIDEO_URL, 40);
      setVideoFrames(frames);
      setVideoDuration(duration);
      // Auto-advance from step 1 to step 2 after loading demo
      if (step === 1) setCapturedAt(new Date().toISOString());
      if (step === 1) setStep(2);
    } catch (err) {
      console.error('[CheckinFlow] Demo load error:', err);
      setCameraError('Erro ao carregar video demo. Verifique sua conexao e tente novamente.');
    } finally {
      setLoadingDemo(false);
    }
  };

  // ---- Workflow helpers ----
  const updateBlock = (id, status) => {
    setWorkflowBlocks(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const getProgress = () => {
    const done = workflowBlocks.filter(b => b.status === 'success').length;
    const running = workflowBlocks.filter(b => b.status === 'running').length;
    return Math.round(((done + running * 0.5) / workflowBlocks.length) * 100);
  };

  // ---- Step handlers ----
  const canProceedForm = cdName.trim() && operatorName.trim();

  const handleFormNext = () => {
    if (!canProceedForm) return;
    setCapturedAt(new Date().toISOString());
    setStep(2);
  };

  const handleVideoNext = () => {
    if (videoFrames.length === 0) return;
    handleStartAnalysis();
  };

  const handleStartAnalysis = async () => {
    setStep(3);
    setError(null);
    setElapsedTime(0);
    setWorkflowBlocks(prev => prev.map(b => ({ ...b, status: 'pending' })));

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      // Step 1: extracting frames (already done)
      updateBlock(1, 'running');
      await sleep(500);
      updateBlock(1, 'success');

      // Step 2: identifying plate — call edge function
      updateBlock(2, 'running');

      const token = (await supabase.auth.getSession())?.data?.session?.access_token || VISTORIA_ANON_KEY;

      // 180s timeout for the edge function call (AI analysis can take 2-3 min)
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 180000);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/vistoria-checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': VISTORIA_ANON_KEY,
        },
        signal: controller.signal,
        body: JSON.stringify({
          video_frames: videoFrames.map(f => f.base64),
          cd_name: cdName,
          operator_name: operatorName,
          vehicle_type: vehicleType,
          os_number: osNumber || undefined,
          cte_number: cteNumber || undefined,
          gps: gpsCoords || null,
          captured_at: capturedAt || new Date().toISOString(),
          user_id: user?.id || undefined,
          client_id: isDemo ? DEMO_CLIENT_ID : undefined,
          driver_id: selectedDriverId || undefined,
          driver_name: selectedDriverName || undefined,
        }),
      });

      clearTimeout(fetchTimeout);

      updateBlock(2, 'success');
      updateBlock(3, 'running');

      const data = await response.json();

      updateBlock(3, 'success');
      updateBlock(4, 'running');
      await sleep(400);
      updateBlock(4, 'success');

      clearInterval(timerRef.current);

      if (!response.ok || data.error) {
        setError(data.error || data.message || 'Erro ao processar checkin');
        setStep(4);
        return;
      }

      setResult(data);
      setStep(4);
    } catch (err) {
      console.error('[CheckinFlow] Analysis error:', err);
      clearInterval(timerRef.current);
      const msg = err.name === 'AbortError'
        ? 'Tempo limite excedido (3 min). Tente com um video mais curto ou verifique sua conexao.'
        : 'Erro de conexao. Verifique sua internet e tente novamente.';
      setError(msg);
      updateBlock(workflowBlocks.find(b => b.status === 'running')?.id || 4, 'error');
      setStep(4);
    }
  };

  const handleReset = () => {
    setStep(1);
    setVideoFrames([]);
    setVideoDuration(0);
    setResult(null);
    setError(null);
    setCapturedAt(null);
    setOsNumber('');
    setCteNumber('');
    setSelectedDriverId('');
    setSelectedDriverName('');
    setWorkflowBlocks(prev => prev.map(b => ({ ...b, status: 'pending' })));
  };

  // ---- Auto-redirect após resultado ----
  useEffect(() => {
    if (step !== 4) { setCountdown(null); return; }
    if (isDemo && result?.inspection_id && !error) {
      // Demo: navega para checkout com o inspection_id
      setCountdown(3);
      const tick = setInterval(() => setCountdown(c => c - 1), 1000);
      const redirect = setTimeout(() => { clearInterval(tick); navigate(`/checkout/${result.inspection_id}?demo=1`); }, 3000);
      return () => { clearInterval(tick); clearTimeout(redirect); };
    }
    setCountdown(5);
    const tick = setInterval(() => setCountdown(c => c - 1), 1000);
    const redirect = setTimeout(() => { clearInterval(tick); handleReset(); }, 5000);
    return () => { clearInterval(tick); clearTimeout(redirect); };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Derive result state ----
  const extractPlateText = (checkin) => {
    // Edge function returns placa as object { text, confidence, status } or string
    const raw = checkin?.rf01?.plate || checkin?.plate || checkin?.placa;
    if (!raw) return null;
    if (typeof raw === 'object') return raw.text || null;
    return raw;
  };

  const getResultVariant = () => {
    if (!result) return 'error';
    const checkin = result.checkin_data || result;
    const plateText = extractPlateText(checkin);
    const checklist = checkin?.rf03?.checklist || checkin?.checklist || {};

    const hasPlate = plateText && plateText !== 'NAO_IDENTIFICADA' && plateText !== 'ILEGIVEL';
    const nokItems = Object.entries(checklist).filter(([, v]) => {
      const status = typeof v === 'object' ? v.status : v;
      return status === 'NAO_OK';
    });

    if (!hasPlate) return 'inconclusive';
    if (nokItems.length > 0) return 'attention';
    return 'success';
  };

  const getPlate = () => {
    if (!result) return '';
    const checkin = result.checkin_data || result;
    return extractPlateText(checkin) || '';
  };

  const getChecklist = () => {
    if (!result) return {};
    const checkin = result.checkin_data || result;
    return checkin?.rf03?.checklist || checkin?.checklist || {};
  };

  const getChecklistCounts = () => {
    const checklist = getChecklist();
    const entries = Object.entries(checklist);
    let ok = 0, nok = 0, inc = 0;
    entries.forEach(([, v]) => {
      const status = typeof v === 'object' ? v.status : v;
      if (status === 'OK') ok++;
      else if (status === 'NAO_OK') nok++;
      else inc++;
    });
    return { total: entries.length, ok, nok, inc };
  };

  // ============================================
  // RENDER
  // ============================================
  const renderStep = () => {
    switch (step) {
      case 1: return renderIdentification();
      case 2: return renderVideo();
      case 3: return renderProcessing();
      case 4: return renderConfirmation();
      default: return null;
    }
  };

  // ---- Step 1: Identification ----
  const renderIdentification = () => (
    <Content key="step1">
      <Title>Identificacao do Veiculo</Title>
      <Subtitle>Preencha os dados antes de iniciar a filmagem</Subtitle>

      <FormGroup>
        <Label>Centro de Distribuicao *</Label>
        <Select value={cdName} onChange={e => setCdName(e.target.value)}>
          <option value="">Selecione o CD</option>
          {cdList.map(cd => (
            <option key={cd} value={cd}>{cd}</option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Nome do Operador *</Label>
        <Input
          value={operatorName}
          onChange={e => setOperatorName(e.target.value)}
          placeholder="Seu nome"
        />
      </FormGroup>

      {driversList.length > 0 && (
        <FormGroup>
          <Label>Motorista</Label>
          <Select
            value={selectedDriverId}
            onChange={e => {
              setSelectedDriverId(e.target.value);
              const d = driversList.find(x => x.id === e.target.value);
              setSelectedDriverName(d?.name || '');
            }}
          >
            <option value="">Selecione o motorista (opcional)</option>
            {driversList.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </FormGroup>
      )}

      <FormGroup>
        <Label>Tipo de Veiculo</Label>
        <Select value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
          {VEHICLE_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </FormGroup>

      <Divider>Metadados (opcional)</Divider>

      <FormGroup>
        <Label>OS</Label>
        <Input
          value={osNumber}
          onChange={e => setOsNumber(e.target.value)}
          placeholder="Numero da OS"
        />
      </FormGroup>

      <FormGroup>
        <Label>CT-e</Label>
        <Input
          value={cteNumber}
          onChange={e => setCteNumber(e.target.value)}
          placeholder="Numero do CT-e"
        />
      </FormGroup>

      <InfoRow>
        <FaMapMarkerAlt />
        {gpsCoords
          ? `GPS: ${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)} (${gpsCoords.accuracy}m)`
          : gpsError || 'Obtendo localizacao...'
        }
      </InfoRow>
      <InfoRow>
        <FaClock />
        {new Date().toLocaleString('pt-BR')}
      </InfoRow>

      <Button
        onClick={handleFormNext}
        disabled={!canProceedForm}
        $mt="20px"
      >
        Iniciar Filmagem <FaArrowRight />
      </Button>

      {isDemo && (
        <DemoButton onClick={handleLoadDemo} disabled={loadingDemo}>
          {loadingDemo ? <><SmallSpinner /> Carregando demo...</> : '🎬 Carregar Video Demo'}
        </DemoButton>
      )}
    </Content>
  );

  // ---- Step 2: Guided Video ----
  const renderVideo = () => (
    <Content key="step2">
      {!cameraActive && videoFrames.length === 0 && (
        <>
          <Title>Video do Veiculo</Title>
          <Subtitle>Filme o veiculo seguindo as orientacoes na tela</Subtitle>

          {cameraError && <CameraError>{cameraError}</CameraError>}

          <Button onClick={handleOpenCamera}>
            <FaVideo /> Abrir Camera
          </Button>

          <Button
            $variant="outline"
            $mt="12px"
            onClick={() => videoInputRef.current?.click()}
          >
            Enviar Video Gravado
          </Button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleVideoUpload}
          />

          <DemoButton onClick={handleLoadDemo} disabled={loadingDemo}>
            {loadingDemo ? <><SmallSpinner /> Carregando...</> : '🎬 Usar Video Demo'}
          </DemoButton>
        </>
      )}

      {cameraActive && (
        <CameraContainer>
          <CameraPreview
            ref={videoPreviewRef}
            autoPlay
            playsInline
            muted
          />

          {isRecording && (
            <>
              <RecordingBadge>
                <span className="dot" />
                {formatTime(recordingTime)}
              </RecordingBadge>

              <GuideOverlay>
                <GuideProgress>
                  {VIDEO_GUIDES.map((g, i) => (
                    <GuideDot
                      key={i}
                      $active={i === guideIndex}
                      $completed={i < guideIndex}
                    />
                  ))}
                </GuideProgress>
                <GuideInstruction>
                  <span>{VIDEO_GUIDES[guideIndex]?.icon}</span>
                  {VIDEO_GUIDES[guideIndex]?.instruction}
                </GuideInstruction>
                {guideSecondsLeft > 0 && (
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Proximo em {guideSecondsLeft}s
                  </div>
                )}
              </GuideOverlay>
            </>
          )}

          {!isRecording && (
            <GuideOverlay>
              <GuideInstruction>
                Toque em GRAVAR para iniciar
              </GuideInstruction>
            </GuideOverlay>
          )}
        </CameraContainer>
      )}

      {cameraActive && !isRecording && (
        <Button onClick={handleStartRecording}>
          <FaCircle style={{ color: '#ef4444' }} /> GRAVAR
        </Button>
      )}

      {cameraActive && isRecording && (
        <Button
          $danger
          onClick={handleStopRecording}
          disabled={recordingTime < minDuration}
        >
          <FaStop /> PARAR {recordingTime < minDuration && `(min. ${minDuration}s)`}
        </Button>
      )}

      {loadingVideo && (
        <ProcessingContainer style={{ minHeight: '30vh', padding: '20px' }}>
          <SpinnerIcon />
          <div>Extraindo frames do video...</div>
        </ProcessingContainer>
      )}

      {videoFrames.length > 0 && !cameraActive && !loadingVideo && (
        <>
          <VideoConfirm>
            <FaCheckCircle />
            Video capturado ({Math.round(videoDuration)}s)
          </VideoConfirm>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16 }}>
            {videoFrames.map((f, i) => (
              <img
                key={i}
                src={f.preview}
                alt={`Frame ${i + 1}`}
                style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
              />
            ))}
          </div>

          <Button onClick={handleVideoNext}>
            Enviar para Analise <FaArrowRight />
          </Button>

          <Button
            $variant="outline"
            $mt="8px"
            onClick={() => { setVideoFrames([]); setVideoDuration(0); }}
          >
            <FaRedo /> Refazer Video
          </Button>
        </>
      )}
    </Content>
  );

  // ---- Step 3: Processing ----
  const renderProcessing = () => (
    <ProcessingContainer key="step3">
      <SpinnerIcon />
      <Title style={{ marginBottom: 4 }}>Processando...</Title>
      <Subtitle style={{ margin: 0 }}>Analisando video do veiculo</Subtitle>

      <ProgressBar>
        <ProgressFill $pct={getProgress()} />
      </ProgressBar>

      <WorkflowBlocks>
        {workflowBlocks.map(block => (
          <WorkflowBlock key={block.id} $status={block.status}>
            <div className="icon">
              {block.status === 'success' ? <FaCheck /> :
               block.status === 'running' ? <SmallSpinner /> :
               <FaCircle style={{ fontSize: 8 }} />}
            </div>
            <div className="label">{block.label}</div>
          </WorkflowBlock>
        ))}
      </WorkflowBlocks>

      <Timer>{formatTime(elapsedTime)}</Timer>
    </ProcessingContainer>
  );

  // ---- Step 4: Confirmation ----
  const renderConfirmation = () => {
    if (error) {
      return (
        <Content key="step4-error">
          <ErrorBox>{error}</ErrorBox>
          <Button onClick={handleReset}>
            <FaRedo /> Tentar Novamente
          </Button>
          {countdown !== null && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
              Redirecionando em {countdown}s...
            </div>
          )}
        </Content>
      );
    }

    const variant = getResultVariant();
    const plate = getPlate();
    const counts = getChecklistCounts();
    const checklist = getChecklist();

    if (variant === 'inconclusive') {
      return (
        <Content key="step4-inc">
          <ResultBanner $inconclusive>
            <StatusBadge $inconclusive>
              <FaExclamationTriangle /> INCONCLUSIVO
            </StatusBadge>
            <PlateText>Placa nao identificada</PlateText>
            <ChecklistSummary>
              Sem placa, o checkout nao podera ser vinculado.
            </ChecklistSummary>
          </ResultBanner>

          <Button onClick={() => { setVideoFrames([]); setVideoDuration(0); setStep(2); }}>
            <FaRedo /> Refazer Video
          </Button>
          <Button $variant="outline" $mt="8px" onClick={handleReset}>
            Novo Checkin
          </Button>
          {countdown !== null && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
              Redirecionando em {countdown}s...
            </div>
          )}
        </Content>
      );
    }

    // Attention + Success → tela simples de confirmação
    return (
      <Content key="step4-done" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 48 }}>
        <FaCheckCircle style={{ fontSize: 72, color: '#16a34a', marginBottom: 20 }} />
        <Title style={{ fontSize: 22, marginBottom: 8 }}>Checkin Realizado com Sucesso</Title>
        <Button $mt="32px" onClick={handleReset}>
          Novo Checkin
        </Button>
        {countdown !== null && (
          <div style={{ marginTop: 16, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
            Redirecionando em {countdown}s...
          </div>
        )}
      </Content>
    );
  };

  return (
    <Container>
      <Header>
        {step < 4 ? (
          <BackButton onClick={() => step === 1 ? navigate(-1) : setStep(Math.max(1, step - 1))}>
            <FaArrowLeft /> {step === 1 ? 'Voltar' : 'Anterior'}
          </BackButton>
        ) : (
          <div style={{ width: 60 }} />
        )}
        <Logo>VistorIA</Logo>
        <div style={{ width: 60 }} />
      </Header>

      {isDemo && (
        <DemoBanner>
          <span className="demo-icon">&#9888;</span>
          Modo Demonstracao — dados nao serao persistidos em producao
        </DemoBanner>
      )}

      {step !== 3 && (
        <StepIndicator>
          {Array.from({ length: totalSteps }, (_, i) => (
            <StepDot
              key={i}
              $active={i + 1 === step}
              $completed={i + 1 < step}
            />
          ))}
        </StepIndicator>
      )}

      {renderStep()}
    </Container>
  );
}
