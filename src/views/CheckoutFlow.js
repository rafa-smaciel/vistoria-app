// src/modules/VistorIA/pages/CheckoutFlow.js
// Checkout flow — Executor B (Expedicao) — 5 steps
// Step 1: Select Checkin | Step 2: Confirm Vehicle | Step 3: Guided Photos
// Step 4: Processing | Step 5: Result

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  FaCheck, FaSpinner, FaArrowLeft, FaCamera, FaStop,
  FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaRedo,
  FaMapMarkerAlt, FaClock, FaTimes, FaSearch, FaTruck,
  FaTrash, FaCircle
} from 'react-icons/fa';
import { supabase, VISTORIA_SUPABASE_URL as SUPABASE_URL, VISTORIA_ANON_KEY } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { vistoriaColors as colors } from '../components/theme';
const DEMO_STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/vistoria-demo`;
// 10 fotos selecionadas para demo — SELEÇÃO pasta ESTOFOQUE
const DEMO_PHOTOS = [
  `${DEMO_STORAGE_URL}/demo-checkout-01.png`,
  ...([2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `${DEMO_STORAGE_URL}/demo-checkout-${String(i).padStart(2, '0')}.jpeg`)),
];

// ============================================
// ANIMATIONS — plain CSS names (no styled-components keyframes to avoid v6 error #12)
// ============================================
const CHECKOUT_KEYFRAMES = `
  @keyframes co-fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes co-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes co-pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(14,165,233,.3); } 50% { box-shadow: 0 0 0 8px rgba(14,165,233,0); } 100% { box-shadow: 0 0 0 0 rgba(14,165,233,0); } }
  @keyframes co-successGlow { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
  @keyframes co-shimmer { 0% { background-position: -200px 0; } 100% { background-position: calc(200px + 100%) 0; } }
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

const DemoBanner = styled.div`
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 10px 16px;
  margin: 0 16px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
  .demo-icon { font-size: 18px; }
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
  animation: co-fadeIn 0.4s ease;
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

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 16px;
  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.textSecondary};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 14px 12px 40px;
  border: 2px solid ${colors.border};
  border-radius: 10px;
  font-size: 16px;
  color: ${colors.textPrimary};
  background: #fff;
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: ${colors.primary}; }
`;

const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${colors.border};
`;

const CheckinCard = styled.div`
  background: #fff;
  border: 2px solid ${p => p.$selected ? colors.primary : colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${colors.primary}; }
  ${p => p.$selected && `box-shadow: 0 0 0 3px ${colors.primary}20;`}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CardPlate = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: ${colors.textPrimary};
  font-family: 'Courier New', monospace;
  svg { color: ${colors.primary}; }
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: ${colors.textSecondary};
  flex-wrap: wrap;
`;

const CardBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: ${p => p.$ok ? colors.successLight : colors.warningLight};
  color: ${p => p.$ok ? '#065f46' : '#92400e'};
`;

const SelectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:active { transform: scale(0.97); }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 16px;
  color: ${colors.textSecondary};
  h3 { color: ${colors.textPrimary}; margin-bottom: 8px; }
  p { font-size: 14px; line-height: 1.5; }
`;

const SkeletonCard = styled.div`
  background: #fff;
  border: 2px solid ${colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
`;

const SkeletonLine = styled.div`
  height: ${p => p.$h || '14px'};
  width: ${p => p.$w || '100%'};
  border-radius: 4px;
  margin-bottom: ${p => p.$mb || '8px'};
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200px 100%;
  animation: co-shimmer 1.5s ease-in-out infinite;
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

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${colors.textSecondary};
  margin-bottom: 8px;
  svg { color: ${colors.primary}; flex-shrink: 0; }
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
  box-sizing: border-box;
  &:focus { border-color: ${colors.primary}; }
`;

const ConfirmCard = styled.div`
  background: #fff;
  border: 2px solid ${colors.primary};
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
`;

const ConfirmRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
  .label { color: ${colors.textSecondary}; }
  .value { font-weight: 600; color: ${colors.textPrimary}; }
`;

// Camera & Photos
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
  max-height: 50vh;
  object-fit: cover;
  display: block;
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

const PhotoGuide = styled.div`
  background: ${colors.backgroundAlt};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 16px;
  text-align: center;
  .step { font-size: 12px; color: ${colors.textSecondary}; margin-bottom: 4px; }
  .instruction { font-size: 15px; font-weight: 600; color: ${colors.textPrimary}; }
`;

const PhotoCount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  .check { color: ${colors.success}; }
  span { color: ${colors.textSecondary}; font-weight: 400; }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
  @media (max-width: 380px) { grid-template-columns: repeat(3, 1fr); }
`;

const PhotoSlot = styled.div`
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background: #000;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const PhotoUploadOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${p => p.$error ? 'rgba(220,38,38,.7)' : 'rgba(0,0,0,.55)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
`;

const PhotoRemove = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: ${p => p.$mt || '0'};
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
  &[data-running] { animation: co-pulseGlow 1.5s ease-in-out infinite; }
  &[data-success] { animation: co-successGlow 0.5s ease-in-out forwards; }

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
`;

const SpinnerIcon = styled(FaSpinner)`
  font-size: 48px;
  color: ${colors.primary};
  animation: co-spin 1s linear infinite;
  margin-bottom: 24px;
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
  background: ${p => p.$approved
    ? `linear-gradient(135deg, ${colors.successLight} 0%, #fff 100%)`
    : p.$inconclusive
      ? `linear-gradient(135deg, ${colors.warningLight} 0%, #fff 100%)`
      : `linear-gradient(135deg, ${colors.dangerLight} 0%, #fff 100%)`
  };
  border: 2px solid ${p => p.$approved ? colors.success : p.$inconclusive ? colors.warning : colors.danger};
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
  background: ${p => p.$approved ? colors.success : p.$inconclusive ? colors.warning : colors.danger};
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

const ScoreValue = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: ${p => p.$score >= 80 ? colors.success : p.$score >= 60 ? colors.warning : colors.danger};
  line-height: 1;
  margin-bottom: 4px;
  span { font-size: 20px; color: ${colors.textSecondary}; }
`;

const ResultDetail = styled.div`
  font-size: 15px;
  color: ${colors.textSecondary};
  margin-bottom: 6px;
  span { font-weight: 600; color: ${colors.textPrimary}; }
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
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const formatDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
};

function resizeImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1024;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = (h * MAX) / w; w = MAX; } }
        else { if (h > MAX) { w = (w * MAX) / h; h = MAX; } }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
        resolve(base64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const PHOTO_GUIDES = [
  { label: 'Lateral com carga', instruction: 'Enquadre toda a area de carga do veiculo' },
  { label: 'Traseira', instruction: 'Fotografe a traseira mostrando a carga' },
  { label: 'Detalhes', instruction: 'Fotografe detalhes da carga (etiquetas, lacres)' },
  { label: 'Adicional', instruction: 'Fotos adicionais (opcional)' },
];

const CHECKLIST_LABELS = {
  carroceria: 'Carroceria',
  assoalho: 'Assoalho',
  pneus: 'Pneus',
  lanternas: 'Lanternas',
  parabrisa: 'Parabrisa',
};

// ============================================
// COMPONENT
// ============================================
export default function CheckoutFlow() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    document.title = 'VistorIA - Checkout';
  }, []);

  // Steps: 1=Select, 2=Confirm, 3=Photos, 4=Processing, 5=Result
  const [step, setStep] = useState(paramId ? 2 : 1);
  const totalSteps = 5;
  const [countdown, setCountdown] = useState(null);

  // Step 1: Select checkin
  const [searchPlate, setSearchPlate] = useState('');
  const [pendingCheckins, setPendingCheckins] = useState([]);
  const [loadingCheckins, setLoadingCheckins] = useState(true);
  const [selectedCheckin, setSelectedCheckin] = useState(null);

  // Step 2: Confirm
  const [operatorName, setOperatorName] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsError, setGpsError] = useState(null);

  // Step 3: Photos
  const [cargoPhotos, setCargoPhotos] = useState([]); // [{ base64, preview }]
  const [minPhotos] = useState(3);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const cameraStreamRef = useRef(null);
  const photoCameraRef = useRef(null);
  const photoInputRef = useRef(null);
  const photoCounterRef = useRef(0);

  // Step 4: Processing
  const [workflowBlocks, setWorkflowBlocks] = useState([
    { id: 1, label: 'Analisando fotos...', status: 'pending' },
    { id: 2, label: 'Detectando carga...', status: 'pending' },
    { id: 3, label: 'Classificando carga...', status: 'pending' },
    { id: 4, label: 'Conciliando com checkin...', status: 'pending' },
    { id: 5, label: 'Gerando veredicto...', status: 'pending' },
  ]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  // Step 5: Result
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Demo
  const isDemo = new URLSearchParams(window.location.search).get('demo') === '1';
  const [loadingDemo, setLoadingDemo] = useState(false);

  // ---- Prefill operator name from auth ----
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setOperatorName(user.user_metadata.full_name);
    } else if (user?.email) {
      setOperatorName(user.email.split('@')[0]);
    }
  }, [user]);

  // ---- GPS ----
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
      },
      () => setGpsError('Localizacao nao disponivel'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // ---- Fetch pending checkins ----
  const fetchPendingCheckins = useCallback(async () => {
    setLoadingCheckins(true);
    try {
      let query = supabase
        .from('vistoria_inspections')
        .select('id, placa, cd_name, vehicle_type, checkin_operator, checkin_at, checkin_data, status')
        .eq('status', 'aguardando_checkout')
        .order('checkin_at', { ascending: false })
        .limit(50);

      if (searchPlate.trim()) {
        query = query.ilike('placa', `%${searchPlate.trim()}%`);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setPendingCheckins(data || []);
    } catch (err) {
      console.error('[CheckoutFlow] Fetch checkins error:', err);
      setPendingCheckins([]);
    } finally {
      setLoadingCheckins(false);
    }
  }, [searchPlate]);

  useEffect(() => {
    if (step === 1) fetchPendingCheckins();
  }, [step, fetchPendingCheckins]);

  // ---- Load checkin by ID from URL param ----
  useEffect(() => {
    if (!paramId) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('vistoria_inspections')
          .select('*')
          .eq('id', paramId)
          .single();
        if (data) {
          setSelectedCheckin(data);
          setStep(2);
        }
      } catch (err) {
        console.error('[CheckoutFlow] Load by ID error:', err);
      }
    })();
  }, [paramId]);

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
      if (photoCameraRef.current) {
        photoCameraRef.current.srcObject = stream;
        await new Promise((resolve) => {
          const el = photoCameraRef.current;
          if (el.readyState >= 2) return resolve();
          el.onloadeddata = () => resolve();
          setTimeout(resolve, 3000);
        });
      }
      return stream;
    } catch (err) {
      setCameraError('Nao foi possivel acessar a camera.');
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

  useEffect(() => {
    return () => { stopCamera(); clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (step !== 3) stopCamera();
  }, [step]);

  // Assign stream to video element when cameraActive renders the <video> in the DOM
  useEffect(() => {
    if (cameraActive && cameraStreamRef.current && photoCameraRef.current && !photoCameraRef.current.srcObject) {
      photoCameraRef.current.srcObject = cameraStreamRef.current;
      photoCameraRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  const handleOpenCamera = async () => {
    const stream = await startCamera();
    if (stream) setCameraActive(true);
  };

  const uploadPhotoToStorage = async (base64, photoKey) => {
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let j = 0; j < binaryStr.length; j++) bytes[j] = binaryStr.charCodeAt(j);
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const path = `${selectedCheckin.id}/foto-${String(photoKey).padStart(3, '0')}.jpg`;
    const { error } = await supabase.storage.from('vistoria-photos').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('vistoria-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCapturePhoto = () => {
    const video = photoCameraRef.current;
    if (!video) return;
    if (!video.videoWidth || !video.videoHeight) {
      console.warn('[CheckoutFlow] videoWidth/Height is 0, camera not ready');
      setCameraError('Camera ainda carregando. Tente novamente.');
      return;
    }

    const canvas = document.createElement('canvas');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const MAX = isIOS ? 720 : 1024;
    let w = video.videoWidth, h = video.videoHeight;
    if (w > h) { if (w > MAX) { h = (h * MAX) / w; w = MAX; } }
    else { if (h > MAX) { w = (w * MAX) / h; h = MAX; } }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    const photoKey = ++photoCounterRef.current;
    setCargoPhotos(prev => [...prev, { key: photoKey, preview: `data:image/jpeg;base64,${base64}`, uploading: true, uploaded: false, error: null }]);
    stopCamera();
    uploadPhotoToStorage(base64, photoKey)
      .then(url => setCargoPhotos(prev => prev.map(p => p.key === photoKey ? { ...p, storagePath: url, uploading: false, uploaded: true } : p)))
      .catch(err => setCargoPhotos(prev => prev.map(p => p.key === photoKey ? { ...p, uploading: false, error: err.message } : p)));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const base64 = await resizeImage(file);
    const photoKey = ++photoCounterRef.current;
    setCargoPhotos(prev => [...prev, { key: photoKey, preview: `data:image/jpeg;base64,${base64}`, uploading: true, uploaded: false, error: null }]);
    uploadPhotoToStorage(base64, photoKey)
      .then(url => setCargoPhotos(prev => prev.map(p => p.key === photoKey ? { ...p, storagePath: url, uploading: false, uploaded: true } : p)))
      .catch(err => setCargoPhotos(prev => prev.map(p => p.key === photoKey ? { ...p, uploading: false, error: err.message } : p)));
  };

  const handleRemovePhoto = (idx) => {
    setCargoPhotos(prev => prev.filter((_, i) => i !== idx));
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
  const handleSelectCheckin = (checkin) => {
    setSelectedCheckin(checkin);
    setStep(2);
  };

  const handleConfirmNext = () => {
    if (!operatorName.trim()) return;
    setStep(3);
  };

  const handleLoadDemoPhotos = () => {
    // Demo photos are already in Storage — use URLs directly, no download needed
    const photos = DEMO_PHOTOS.map((url, i) => ({
      key: i + 1,
      preview: url,
      storagePath: url,
      uploading: false,
      uploaded: true,
      error: null,
    }));
    photoCounterRef.current = DEMO_PHOTOS.length;
    setCargoPhotos(photos);
  };

  const handleStartAnalysis = async () => {
    setStep(4);
    setError(null);
    setElapsedTime(0);
    setWorkflowBlocks(prev => prev.map(b => ({ ...b, status: 'pending' })));

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      updateBlock(1, 'running');

      const token = (await supabase.auth.getSession())?.data?.session?.access_token || VISTORIA_ANON_KEY;

      // SUPABASE_URL already imported from ../config
      const uploadedPhotos = cargoPhotos.filter(p => p.uploaded).map(p => p.storagePath);

      // 180s hard timeout via Promise.race (AbortController alone can hang)
      const controller = new AbortController();
      const fetchPromise = fetch(`${SUPABASE_URL}/functions/v1/vistoria-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': VISTORIA_ANON_KEY,
        },
        signal: controller.signal,
        body: JSON.stringify({
          inspection_id: selectedCheckin.id,
          photo_paths: uploadedPhotos,
          operator_name: operatorName,
          gps: gpsCoords || null,
        }),
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => { controller.abort(); reject(new Error('AbortError')); }, 180000);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      updateBlock(1, 'success');
      updateBlock(2, 'running');

      const data = await response.json();

      updateBlock(2, 'success');
      updateBlock(3, 'running');
      await sleep(400);
      updateBlock(3, 'success');
      updateBlock(4, 'running');
      await sleep(300);
      updateBlock(4, 'success');
      updateBlock(5, 'running');
      await sleep(300);
      updateBlock(5, 'success');

      clearInterval(timerRef.current);

      if (!response.ok || data.error) {
        setError(data.error || data.message || 'Erro ao processar checkout');
        setStep(5);
        return;
      }

      setResult(data);
      setStep(5);
    } catch (err) {
      console.error('[CheckoutFlow] Analysis error:', err);
      clearInterval(timerRef.current);
      const isTimeout = err.name === 'AbortError' || err.message === 'AbortError';
      const msg = isTimeout
        ? `Tempo limite excedido (3 min). Enviadas ${cargoPhotos.filter(p => p.uploaded).length} fotos. Tente com menos fotos.`
        : 'Erro de conexao. Verifique sua internet e tente novamente.';
      setError(msg);
      setStep(5);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedCheckin(null);
    setCargoPhotos([]);
    photoCounterRef.current = 0;
    setResult(null);
    setError(null);
    setWorkflowBlocks(prev => prev.map(b => ({ ...b, status: 'pending' })));
  };

  // ---- Auto-redirect após resultado ----
  useEffect(() => {
    if (step !== 5) { setCountdown(null); return; }
    if (isDemo && selectedCheckin?.id && !error) {
      // Demo: navega para laudo completo
      setCountdown(3);
      const tick = setInterval(() => setCountdown(c => c - 1), 1000);
      const redirect = setTimeout(() => { clearInterval(tick); navigate(`/resultado/${selectedCheckin.id}?demo=1`); }, 3000);
      return () => { clearInterval(tick); clearTimeout(redirect); };
    }
    setCountdown(5);
    const tick = setInterval(() => setCountdown(c => c - 1), 1000);
    const redirect = setTimeout(() => { clearInterval(tick); handleReset(); }, 5000);
    return () => { clearInterval(tick); clearTimeout(redirect); };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Derive result state ----
  const getResultVariant = () => {
    if (!result) return 'error';
    const r = result.result || result;
    const verdict = r.verdict || result.verdict;
    const conciliationMatch = r.rf04_conciliacao?.match || r.rf04?.match || r.conciliation_match;
    const cargoPresent = r.rf05_carga?.present ?? r.cargo?.present;

    if (conciliationMatch === 'NAO') return 'mismatch';
    if (verdict === 'INCONCLUSIVO') {
      if (cargoPresent === false) return 'inconclusive';
      return 'inconclusive_score';
    }
    if (verdict === 'REPROVADO') return 'rejected';
    return 'approved';
  };

  const getPlate = () => selectedCheckin?.placa || '';

  const getCargoType = () => {
    if (!result) return '';
    const r = result.result || result;
    return r.rf06?.classification || r.cargo_type || '';
  };

  const getScore = () => {
    if (!result) return 0;
    return result.score || result.result?.score || 0;
  };

  const getVerdict = () => {
    if (!result) return '';
    return result.verdict || result.result?.verdict || '';
  };

  // ============================================
  // RENDER
  // ============================================
  const renderStep = () => {
    switch (step) {
      case 1: return renderSelectCheckin();
      case 2: return renderConfirmVehicle();
      case 3: return renderPhotos();
      case 4: return renderProcessing();
      case 5: return renderResult();
      default: return null;
    }
  };

  // ---- Step 1: Select Checkin ----
  const renderSelectCheckin = () => (
    <Content key="step1">
      <Title>Selecionar Veiculo</Title>
      <Subtitle>Escolha o checkin para realizar o checkout</Subtitle>

      <SearchBox>
        <FaSearch />
        <SearchInput
          value={searchPlate}
          onChange={e => setSearchPlate(e.target.value.toUpperCase())}
          placeholder="Buscar por placa"
        />
      </SearchBox>

      <SectionLabel>
        Aguardando Checkout ({loadingCheckins ? '...' : pendingCheckins.length})
      </SectionLabel>

      {loadingCheckins && (
        <>
          {[1, 2, 3].map(i => (
            <SkeletonCard key={i}>
              <SkeletonLine $h="20px" $w="40%" $mb="12px" />
              <SkeletonLine $h="14px" $w="70%" $mb="6px" />
              <SkeletonLine $h="14px" $w="50%" />
            </SkeletonCard>
          ))}
        </>
      )}

      {!loadingCheckins && pendingCheckins.length === 0 && (
        <EmptyState>
          <h3>Nenhum checkin pendente</h3>
          <p>O veiculo precisa passar pela portaria antes do checkout.</p>
        </EmptyState>
      )}

      {!loadingCheckins && pendingCheckins.map(checkin => {
        const checklistData = checkin.checkin_data?.rf03?.checklist || {};
        const entries = Object.entries(checklistData);
        const okCount = entries.filter(([, v]) => (typeof v === 'object' ? v.status : v) === 'OK').length;
        const totalCount = entries.length;
        const allOk = okCount === totalCount && totalCount > 0;

        return (
          <CheckinCard key={checkin.id} onClick={() => handleSelectCheckin(checkin)}>
            <CardHeader>
              <CardPlate><FaTruck /> {checkin.placa || 'Sem placa'}</CardPlate>
              <SelectButton onClick={(e) => { e.stopPropagation(); handleSelectCheckin(checkin); }}>
                Selecionar <FaArrowRight />
              </SelectButton>
            </CardHeader>
            <CardMeta>
              <span>{checkin.cd_name}</span>
              <span>{formatDateTime(checkin.checkin_at)}</span>
              {totalCount > 0 && (
                <CardBadge $ok={allOk}>
                  {okCount}/{totalCount} OK
                </CardBadge>
              )}
              {checkin.checkin_operator && <span>{checkin.checkin_operator}</span>}
            </CardMeta>
          </CheckinCard>
        );
      })}
    </Content>
  );

  // ---- Step 2: Confirm Vehicle ----
  const renderConfirmVehicle = () => {
    if (!selectedCheckin) return null;

    const checklistData = selectedCheckin.checkin_data?.rf03?.checklist || {};
    const entries = Object.entries(checklistData);
    const okCount = entries.filter(([, v]) => (typeof v === 'object' ? v.status : v) === 'OK').length;

    return (
      <Content key="step2">
        <Title>Veiculo Selecionado</Title>
        <Subtitle>Confirme que este e o veiculo correto</Subtitle>

        <ConfirmCard>
          <CardPlate style={{ marginBottom: 12, fontSize: 22 }}>
            <FaTruck /> {selectedCheckin.placa || 'Sem placa'}
          </CardPlate>
          <ConfirmRow>
            <span className="label">CD</span>
            <span className="value">{selectedCheckin.cd_name}</span>
          </ConfirmRow>
          <ConfirmRow>
            <span className="label">Checkin</span>
            <span className="value">{formatDateTime(selectedCheckin.checkin_at)}</span>
          </ConfirmRow>
          <ConfirmRow>
            <span className="label">Operador A</span>
            <span className="value">{selectedCheckin.checkin_operator || '-'}</span>
          </ConfirmRow>
          <ConfirmRow>
            <span className="label">Tipo</span>
            <span className="value">{selectedCheckin.vehicle_type || '-'}</span>
          </ConfirmRow>
          {entries.length > 0 && (
            <ConfirmRow>
              <span className="label">Checklist</span>
              <CardBadge $ok={okCount === entries.length}>
                {okCount}/{entries.length} OK
              </CardBadge>
            </ConfirmRow>
          )}
        </ConfirmCard>

        <div style={{ marginBottom: 16 }}>
          <Label>Nome do Operador (Checkout) *</Label>
          <Input
            value={operatorName}
            onChange={e => setOperatorName(e.target.value)}
            placeholder="Seu nome"
          />
        </div>

        <InfoRow>
          <FaMapMarkerAlt />
          {gpsCoords
            ? `GPS: ${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}`
            : gpsError || 'Obtendo localizacao...'
          }
        </InfoRow>
        <InfoRow>
          <FaClock />
          {new Date().toLocaleString('pt-BR')}
        </InfoRow>

        <ButtonRow $mt="20px">
          <Button $variant="outline" onClick={() => { setSelectedCheckin(null); setStep(1); }} style={{ flex: 1 }}>
            <FaArrowLeft /> Trocar
          </Button>
          <Button onClick={handleConfirmNext} disabled={!operatorName.trim()} style={{ flex: 2 }}>
            Iniciar Fotos <FaArrowRight />
          </Button>
        </ButtonRow>
      </Content>
    );
  };

  // ---- Step 3: Guided Photos ----
  const renderPhotos = () => {
    const currentGuide = PHOTO_GUIDES[Math.min(cargoPhotos.length, PHOTO_GUIDES.length - 1)];
    const uploadedCount = cargoPhotos.filter(p => p.uploaded).length;
    const enoughPhotos = uploadedCount >= minPhotos;

    return (
      <Content key="step3">
        {cameraActive ? (
          <>
            <CameraContainer>
              <CameraPreview
                ref={photoCameraRef}
                autoPlay
                playsInline
                muted
              />
            </CameraContainer>
            <Button onClick={handleCapturePhoto}>
              <FaCamera /> Capturar
            </Button>
            <Button $variant="outline" $mt="8px" onClick={stopCamera}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            {cameraError && <CameraError>{cameraError}</CameraError>}

            <PhotoGuide>
              <div className="step">Foto {cargoPhotos.length + 1}: {currentGuide.label}</div>
              <div className="instruction">{currentGuide.instruction}</div>
            </PhotoGuide>

            <PhotoCount>
              {uploadedCount} foto{uploadedCount !== 1 ? 's' : ''} enviada{uploadedCount !== 1 ? 's' : ''}
              {enoughPhotos && <FaCheckCircle className="check" />}
            </PhotoCount>

            {cargoPhotos.length > 0 && (
              <PhotoGrid>
                {cargoPhotos.map((photo, i) => (
                  <PhotoSlot key={photo.key || i}>
                    <img src={photo.preview} alt={`Foto ${i + 1}`} />
                    {photo.uploading && (
                      <PhotoUploadOverlay>
                        <FaSpinner style={{ animation: 'co-spin 1s linear infinite' }} />
                      </PhotoUploadOverlay>
                    )}
                    {photo.error && (
                      <PhotoUploadOverlay $error>
                        <FaTimes />
                      </PhotoUploadOverlay>
                    )}
                    {!photo.uploading && !photo.error && (
                      <PhotoRemove onClick={() => handleRemovePhoto(i)}>
                        <FaTimes />
                      </PhotoRemove>
                    )}
                  </PhotoSlot>
                ))}
              </PhotoGrid>
            )}

            <Button onClick={handleOpenCamera}>
              <FaCamera /> {cargoPhotos.length > 0 ? '+ Foto' : 'Abrir Camera'}
            </Button>

            <Button $variant="outline" $mt="8px" onClick={() => photoInputRef.current?.click()}>
              Enviar da Galeria
            </Button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />

            {cargoPhotos.length === 0 && (
              <Button $variant="outline" $mt="8px" onClick={handleLoadDemoPhotos}>
                Carregar Fotos Demonstracao
              </Button>
            )}

            {enoughPhotos && (
              <Button $mt="16px" onClick={handleStartAnalysis}>
                Enviar para analise <FaArrowRight />
              </Button>
            )}
          </>
        )}
      </Content>
    );
  };

  // ---- Step 4: Processing ----
  const renderProcessing = () => (
    <ProcessingContainer key="step4">
      <SpinnerIcon />
      <Title style={{ marginBottom: 4 }}>Processando...</Title>
      <Subtitle style={{ margin: 0 }}>Analisando fotos + conciliando com checkin</Subtitle>

      <ProgressBar>
        <ProgressFill $pct={getProgress()} />
      </ProgressBar>

      <WorkflowBlocks>
        {workflowBlocks.map(block => (
          <WorkflowBlock
            key={block.id}
            $status={block.status}
            data-running={block.status === 'running' || undefined}
            data-success={block.status === 'success' || undefined}
          >
            <div className="icon">
              {block.status === 'success' ? <FaCheck /> :
               block.status === 'running' ? <FaSpinner style={{ animation: 'co-spin 1s linear infinite' }} /> :
               <FaCircle style={{ fontSize: 8 }} />}
            </div>
            <div className="label">{block.label}</div>
          </WorkflowBlock>
        ))}
      </WorkflowBlocks>

      <Timer>{formatTime(elapsedTime)}</Timer>
    </ProcessingContainer>
  );

  // ---- Step 5: Result ----
  const renderResult = () => {
    if (error) {
      return (
        <Content key="step5-error">
          <ErrorBox>{error}</ErrorBox>
          <Button onClick={() => setStep(3)}>
            <FaRedo /> Tentar Novamente
          </Button>
          <Button $variant="outline" $mt="8px" onClick={handleReset}>
            Novo Checkout
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
    const score = getScore();
    const verdict = getVerdict();
    const cargoType = getCargoType();

    if (variant === 'mismatch') {
      return (
        <Content key="step5-mismatch">
          <ResultBanner>
            <StatusBadge>
              <FaTimes /> ATENCAO
            </StatusBadge>
            <PlateText>{plate}</PlateText>
            <ResultDetail>
              <span>NAO E O MESMO VEICULO</span>
            </ResultDetail>
            <ResultDetail>
              O veiculo das fotos nao corresponde ao do checkin.
            </ResultDetail>
          </ResultBanner>

          <ButtonRow>
            <Button $variant="outline" onClick={() => { setCargoPhotos([]); photoCounterRef.current = 0; setStep(3); }} style={{ flex: 1 }}>
              <FaRedo /> Refazer Fotos
            </Button>
            <Button onClick={() => { setSelectedCheckin(null); setStep(1); }} style={{ flex: 1 }}>
              Trocar Checkin
            </Button>
          </ButtonRow>
          {countdown !== null && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
              Redirecionando em {countdown}s...
            </div>
          )}
        </Content>
      );
    }

    if (variant === 'inconclusive') {
      return (
        <Content key="step5-inc">
          <ResultBanner $inconclusive>
            <StatusBadge $inconclusive>
              <FaExclamationTriangle /> INCONCLUSIVO
            </StatusBadge>
            <PlateText>{plate}</PlateText>
            <ResultDetail>Carga nao identificada nas fotos</ResultDetail>
            <ResultDetail>Fotografe novamente a area de carga</ResultDetail>
          </ResultBanner>

          <Button onClick={() => { setCargoPhotos([]); photoCounterRef.current = 0; setStep(3); }}>
            <FaRedo /> Refazer Fotos
          </Button>
          <Button $variant="outline" $mt="8px" onClick={handleReset}>
            Novo Checkout
          </Button>
          {countdown !== null && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
              Redirecionando em {countdown}s...
            </div>
          )}
        </Content>
      );
    }

    if (variant === 'inconclusive_score') {
      return (
        <Content key="step5-inc-score">
          <ResultBanner $inconclusive>
            <StatusBadge $inconclusive>
              <FaExclamationTriangle /> INCONCLUSIVO
            </StatusBadge>
            <PlateText>{plate}</PlateText>
            {score > 0 && (
              <ScoreValue $score={score}>
                {Math.round(score)}<span>/100</span>
              </ScoreValue>
            )}
            <ResultDetail>Score insuficiente para conclusao automatica</ResultDetail>
            <ResultDetail>Solicite revisao manual ao supervisor</ResultDetail>
          </ResultBanner>

          <Button onClick={() => { setCargoPhotos([]); photoCounterRef.current = 0; setStep(3); }}>
            <FaRedo /> Refazer Fotos
          </Button>
          <Button $variant="outline" $mt="8px" onClick={handleReset}>
            Novo Checkout
          </Button>
          {countdown !== null && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
              Redirecionando em {countdown}s...
            </div>
          )}
        </Content>
      );
    }

    // Approved or Rejected
    const isApproved = variant === 'approved';
    return (
      <Content key="step5-result">
        <ResultBanner $approved={isApproved}>
          <StatusBadge $approved={isApproved}>
            {isApproved ? <FaCheckCircle /> : <FaTimes />}
            {verdict || (isApproved ? 'APROVADO' : 'REPROVADO')}
          </StatusBadge>
          <PlateText>{plate}</PlateText>
          {score > 0 && (
            <ScoreValue $score={score}>
              {Math.round(score)}<span>/100</span>
            </ScoreValue>
          )}
          {cargoType && (
            <ResultDetail>Carga: <span>{cargoType}</span></ResultDetail>
          )}
        </ResultBanner>

        <Button onClick={handleReset}>
          Novo Checkout
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
      <style>{CHECKOUT_KEYFRAMES}</style>
      <Header>
        {step < 5 ? (
          <BackButton onClick={() => {
            if (step === 1) navigate(-1);
            else if (step === 2) { setSelectedCheckin(null); setStep(1); }
            else setStep(Math.max(1, step - 1));
          }}>
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

      {step !== 4 && (
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
