// src/modules/VistorIA/pages/InspectionResult.js
// Laudo de inspecao — 2 views: operador (simples) e gestor/admin (completo)
// Inclui bounding box overlay, StarRating por RF, timeline, meta

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FaArrowLeft, FaCheckCircle, FaTimes, FaExclamationTriangle,
  FaPrint, FaShareAlt, FaChevronDown, FaChevronUp,
  FaSpinner, FaTruck, FaMapMarkerAlt, FaClock, FaCog,
  FaClipboardCheck, FaCamera, FaVideo, FaBalanceScale,
  FaBoxes, FaTags, FaShieldAlt, FaHistory, FaInfoCircle
} from 'react-icons/fa';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { vistoriaColors as colors } from '../components/theme';
import StarRating from '../components/StarRating';

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

// ============================================
// RF DESCRIPTIONS (tooltip hover)
// ============================================
const RF_DESCRIPTIONS = {
  rf01: 'Leitura automática da placa do veículo via OCR no vídeo de checkin.',
  rf02: 'Valida se o vídeo tem qualidade suficiente (iluminação, estabilidade, cobertura).',
  rf03: 'Checklist de integridade: carroceria, assoalho, pneus, lanternas, parabrisa.',
  rf04: 'Conciliação visual entre vídeo (checkin) e fotos (checkout) — verifica se é o mesmo veículo.',
  rf05: 'Detecta se há carga visível nas fotos do checkout.',
  rf06: 'Classifica o tipo de carga (paletizada, container, big bag, tambores, etc.).',
  rf07: 'Cobertura de evidências auditáveis — cada decisão tem frame/foto âncora.',
  fotos: 'Análise individual de cada foto do checkout com bounding box e classificação.',
};

// ============================================
// STYLED COMPONENTS
// ============================================
const TooltipWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

const TooltipIcon = styled.span`
  display: inline-flex;
  align-items: center;
  color: ${colors.textSecondary};
  font-size: 12px;
  opacity: 0.5;
  cursor: help;
  transition: opacity 0.2s;
  ${TooltipWrapper}:hover & { opacity: 1; }
`;

const TooltipBox = styled.span`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  min-width: 220px;
  max-width: 300px;
  padding: 8px 12px;
  background: #1e293b;
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  pointer-events: none;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s, transform 0.2s;
  z-index: 1000;
  white-space: normal;
  ${TooltipWrapper}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 16px;
    border: 5px solid transparent;
    border-top-color: #1e293b;
  }
  @media (max-width: 480px) {
    min-width: 180px;
    max-width: 240px;
    font-size: 11px;
  }
`;

const RfTooltip = ({ rfKey, children }) => {
  const desc = RF_DESCRIPTIONS[rfKey];
  if (!desc) return children;
  return (
    <TooltipWrapper>
      {children}
      <TooltipIcon><FaInfoCircle /></TooltipIcon>
      <TooltipBox>{desc}</TooltipBox>
    </TooltipWrapper>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: ${colors.backgroundAlt};
  color: ${colors.textPrimary};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
`;

const Watermark = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
  opacity: 0.04;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 60px;
  padding: 40px;
  transform: rotate(-25deg);
  transform-origin: center center;
  & span {
    font-size: 16px;
    font-weight: 700;
    color: ${colors.textPrimary};
    white-space: nowrap;
    user-select: none;
    -webkit-user-select: none;
  }
  @media print {
    opacity: 0.06;
  }
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

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  background: #fff;
  color: ${colors.textSecondary};
  cursor: pointer;
  &:hover { background: ${colors.backgroundAlt}; }
`;

const Content = styled.main`
  padding: 16px;
  max-width: 700px;
  margin: 0 auto;
  animation: ${fadeIn} 0.4s ease;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: ${colors.textSecondary};
`;

const SpinnerIcon = styled(FaSpinner)`
  font-size: 36px;
  color: ${colors.primary};
  animation: ${spin} 1s linear infinite;
`;

const ErrorBox = styled.div`
  padding: 24px;
  background: ${colors.dangerLight};
  border: 1px solid ${colors.danger};
  border-radius: 12px;
  color: #991b1b;
  text-align: center;
  margin-top: 40px;
`;

// Verdict banner
const VerdictBanner = styled.div`
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
  margin-bottom: 16px;
`;

const VerdictBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: 700;
  background: ${p => p.$approved ? colors.success : p.$inconclusive ? colors.warning : colors.danger};
  color: #fff;
  margin-bottom: 8px;
`;

const PlateText = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.textPrimary};
  font-family: 'Courier New', monospace;
  margin-bottom: 6px;
`;

const ScoreText = styled.div`
  font-size: 40px;
  font-weight: 700;
  color: ${p => p.$score >= 80 ? colors.success : p.$score >= 60 ? colors.warning : colors.danger};
  line-height: 1;
  span { font-size: 18px; color: ${colors.textSecondary}; }
`;

const VerdictMeta = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
  margin-top: 8px;
`;

// Sections
const Section = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const SectionHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  gap: 10px;
  &:hover { background: ${colors.backgroundAlt}; }
`;

const SectionIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: ${p => p.$bg || colors.backgroundAlt};
  color: ${p => p.$color || colors.primary};
  flex-shrink: 0;
`;

const SectionTitle = styled.div`
  flex: 1;
  .title { font-size: 14px; font-weight: 600; color: ${colors.textPrimary}; }
  .subtitle { font-size: 12px; color: ${colors.textSecondary}; margin-top: 2px; }
`;

const SectionBadge = styled.span`
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  background: ${p =>
    p.$status === 'OK' || p.$status === 'APROVADO' || p.$status === 'MESMO_VEICULO' || p.$status === 'SIM' ? colors.successLight :
    p.$status === 'NAO_OK' || p.$status === 'REPROVADO' || p.$status === 'NAO' ? colors.dangerLight :
    colors.warningLight
  };
  color: ${p =>
    p.$status === 'OK' || p.$status === 'APROVADO' || p.$status === 'MESMO_VEICULO' || p.$status === 'SIM' ? '#065f46' :
    p.$status === 'NAO_OK' || p.$status === 'REPROVADO' || p.$status === 'NAO' ? '#991b1b' :
    '#92400e'
  };
`;

const SectionBody = styled.div`
  padding: 0 16px 16px;
  animation: ${fadeIn} 0.2s ease;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px solid ${colors.borderLight};
  &:last-child { border-bottom: none; }
  .label { color: ${colors.textSecondary}; }
  .value { font-weight: 600; color: ${colors.textPrimary}; text-align: right; max-width: 60%; }
`;

const EvidenceText = styled.div`
  font-size: 13px;
  color: ${colors.textPrimary};
  line-height: 1.6;
  background: ${colors.backgroundAlt};
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
`;

// Bounding box overlay
const ImageContainer = styled.div`
  position: relative;
  display: block;
  width: 100%;
  margin: 8px 0;
  border-radius: 8px;
  overflow: hidden;
  line-height: 0;
  img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
  }
`;

const BboxOverlay = styled.div`
  position: absolute;
  border: 2px solid ${p => p.$color || colors.primary};
  background: ${p => p.$color || colors.primary}15;
  border-radius: 4px;
  top: ${p => p.$top}%;
  left: ${p => p.$left}%;
  width: ${p => p.$width}%;
  height: ${p => p.$height}%;
  .bbox-label {
    position: absolute;
    top: -18px;
    left: 0;
    background: ${p => p.$color || colors.primary};
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 3px;
    white-space: nowrap;
  }
`;

// Checklist items
const ChecklistItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid ${colors.borderLight};
  &:last-child { border-bottom: none; }
`;

const ChecklistStatus = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  background: ${p =>
    p.$status === 'OK' ? colors.successLight :
    p.$status === 'NAO_OK' ? colors.dangerLight : '#f3f4f6'
  };
  color: ${p =>
    p.$status === 'OK' ? colors.success :
    p.$status === 'NAO_OK' ? colors.danger : '#9ca3af'
  };
`;

const ChecklistContent = styled.div`
  flex: 1;
  .name { font-size: 14px; font-weight: 600; }
  .confidence { font-size: 12px; color: ${colors.textSecondary}; }
  .evidence { font-size: 12px; color: ${colors.textPrimary}; margin-top: 4px; line-height: 1.4; }
`;

// Timeline
const TimelineContainer = styled.div`
  padding: 0;
`;

const TimelineEntry = styled.div`
  display: flex;
  gap: 12px;
  padding: 8px 0;
  font-size: 12px;
  border-bottom: 1px solid ${colors.borderLight};
  &:last-child { border-bottom: none; }
  .time { color: ${colors.textSecondary}; font-variant-numeric: tabular-nums; min-width: 50px; }
  .actor { color: ${colors.primary}; font-weight: 600; min-width: 80px; }
  .event { color: ${colors.textPrimary}; flex: 1; }
`;

// StarRating section
const FeedbackSection = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${colors.borderLight};
`;

const FeedbackLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${colors.textSecondary};
  margin-bottom: 6px;
`;

// Button
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
  background: ${p => p.$variant === 'outline' ? 'transparent' : colors.primary};
  color: ${p => p.$variant === 'outline' ? colors.primary : '#fff'};
  border: ${p => p.$variant === 'outline' ? `2px solid ${colors.primary}` : 'none'};
  margin-top: ${p => p.$mt || '0'};
  &:active { transform: scale(0.98); }
`;

// ============================================
// HELPERS
// ============================================
const CHECKLIST_LABELS = {
  carroceria: 'Carroceria',
  assoalho: 'Assoalho',
  pneus: 'Pneus',
  lanternas: 'Lanternas',
  parabrisa: 'Parabrisa',
};

const ROLE_HIERARCHY = { admin: 3, gestor: 2, operador: 1 };

const formatDateTime = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('pt-BR');
};

const formatTime = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// ============================================
// BoundingBox component
// ============================================
const BoundingBox = ({ src, boxes = [], alt = '' }) => (
  <ImageContainer>
    <img src={src} alt={alt} />
    {boxes.map((box, i) => (
      <BboxOverlay
        key={i}
        $top={box.y || box.top || 0}
        $left={box.x || box.left || 0}
        $width={box.w || box.width || 0}
        $height={box.h || box.height || 0}
        $color={box.color}
      >
        {box.label && <span className="bbox-label">{box.label}</span>}
      </BboxOverlay>
    ))}
  </ImageContainer>
);

// ============================================
// COMPONENT
// ============================================
export default function InspectionResult() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const isDemo = new URLSearchParams(location.search).get('demo') === '1'
    || localStorage.getItem('vistoria_demo_active') === 'true';

  const [inspection, setInspection] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(isDemo ? 'admin' : 'operador');
  const [expandedSections, setExpandedSections] = useState({});
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [recapturaState, setRecapturaState] = useState('idle'); // 'idle' | 'sending' | 'sent'
  const [photosAnalysisReady, setPhotosAnalysisReady] = useState(false);

  useEffect(() => {
    document.title = 'VistorIA - Resultado';
  }, []);

  // Resolve user role
  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      try {
        // Check vistoria_users first
        const { data: vu } = await supabase
          .from('vistoria_users')
          .select('role')
          .eq('auth_user_id', user.id)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (vu?.role) {
          setUserRole(vu.role);
          return;
        }

        // Fallback to user_profiles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('admin_role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.admin_role) {
          const map = { super_admin: 'admin', admin: 'admin', seller: 'gestor', viewer: 'operador' };
          setUserRole(map[profile.admin_role] || 'operador');
          return;
        }

        // Known admin emails
        const adminEmails = ['vega@vegarobotics.com.br', 'rafael@vegarobotics.com.br'];
        if (adminEmails.includes(user.email)) {
          setUserRole('admin');
        }
      } catch (e) {
        // Default operador
      }
    })();
  }, [authLoading, user]);

  const isGestor = ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY.gestor;

  // Fetch inspection + logs
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error: err } = await supabase
          .from('vistoria_inspections')
          .select('*')
          .eq('id', id)
          .single();

        if (err || !data) {
          setError('Inspecao nao encontrada');
          setLoading(false);
          return;
        }

        setInspection(data);

        // Fetch logs if gestor
        if (isGestor) {
          const { data: logData } = await supabase
            .from('vistoria_logs')
            .select('*')
            .eq('inspection_id', id)
            .order('created_at', { ascending: true });
          setLogs(logData || []);
        }
      } catch (e) {
        setError('Erro ao carregar inspecao');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isGestor]);

  // Polling: aguarda photos_analysis do background task (máx 3 min, intervalo 5s)
  useEffect(() => {
    if (!id || !inspection) return;

    const existingAnalysis = inspection?.result?.photos_analysis;
    if (existingAnalysis && existingAnalysis.length > 0) {
      setPhotosAnalysisReady(true);
      return;
    }

    // photos_analysis ainda não está pronto — iniciar polling
    let attempts = 0;
    const MAX_ATTEMPTS = 36; // 3 min (36 × 5s)

    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data } = await supabase
          .from('vistoria_inspections')
          .select('result')
          .eq('id', id)
          .single();

        const pa = data?.result?.photos_analysis;
        if (pa && pa.length > 0) {
          setInspection(prev => ({
            ...prev,
            result: { ...(prev?.result || {}), photos_analysis: pa },
          }));
          setPhotosAnalysisReady(true);
          clearInterval(interval);
        } else if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval); // desiste após 3 min
        }
      } catch (_) {
        if (attempts >= MAX_ATTEMPTS) clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, inspection?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Extract data (must be before any hooks that use these values) ----
  const result = inspection?.result || {};
  const checkinData = inspection?.checkin_data || {};
  const checkoutData = inspection?.checkout_data || {};
  const plate = inspection?.placa || '';
  const score = inspection?.score || result.score || 0;
  const verdict = inspection?.verdict || result.verdict || 'INCONCLUSIVO';

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // StarRating handler
  const handleStarSubmit = useCallback(async (rfKey, rating, comment) => {
    try {
      await supabase.from('agent_feedback').insert({
        agent_id: 'vistoria',
        action_type: `${rfKey}_review`,
        rating,
        comment: comment || null,
        metadata: { inspection_id: id },
        user_id: user?.id,
      });
    } catch (e) {
      console.error('[InspectionResult] StarRating submit error:', e);
    }
  }, [id, user]);

  const handleRecaptura = useCallback(async () => {
    if (recapturaState !== 'idle') return;
    setRecapturaState('sending');
    try {
      // Log no histórico
      await supabase.from('vistoria_logs').insert({
        inspection_id: id,
        event_type: 'recaptura_solicitada',
        actor_id: user?.id || null,
        actor_name: user?.email || 'Gestor',
        details: { verdict, requested_by: user?.id },
      });

      // Atualizar status para pendente_revisao
      await supabase
        .from('vistoria_inspections')
        .update({ status: 'pendente_revisao' })
        .eq('id', id);

      // Notificar gestor por email
      const { data: configData } = await supabase
        .from('vistoria_config')
        .select('value')
        .eq('key', 'general_notify_email')
        .single();
      const notifyEmail = configData?.value;
      if (notifyEmail) {
        await supabase.functions.invoke('email-sender-resend', {
          body: {
            to: notifyEmail,
            subject: `VistorIA — Recaptura solicitada`,
            body: `Uma inspeção inconclusiva foi marcada para recaptura.\n\nID: ${id}\nVeredicto: ${verdict}\nSolicitado por: ${user?.email || 'Gestor'}\n\nAcesse o painel para revisar: https://vistoria.proagentes.ai/resultado/${id}`,
          },
        });
      }

      setRecapturaState('sent');
    } catch (e) {
      console.error('[recaptura]', e);
      setRecapturaState('idle');
    }
  }, [id, verdict, user, recapturaState]);

  // Confidence values from DB are 0-1 floats; display as %
  const fmtConf = (v) => (v !== undefined && v !== null && v !== '') ? `${Math.round(Number(v) * 100)}%` : '-%';

  // Smart timeline detail formatter — strips verbose fields, formats known event types
  const formatLogDetails = (eventType, details) => {
    if (!details) return '-';
    if (typeof details === 'string') return details;
    if (details.message) return details.message;
    // Strip fields that are always verbose/unreadable
    const skip = new Set(['prompt', 'raw_response', 'ai_usage', 'frames', 'photos', 'checkin_video_frames']);
    const entries = Object.entries(details).filter(([k]) => !skip.has(k));
    if (entries.length === 0) return eventType;
    return entries.map(([k, v]) => {
      if (typeof v === 'object' && v !== null) return `${k}: ${JSON.stringify(v).slice(0, 80)}`;
      return `${k}: ${v}`;
    }).join(' | ');
  };

  const isApproved = verdict === 'APROVADO';
  const isInconclusive = verdict === 'INCONCLUSIVO';

  // Support both key formats: new (rf01_placa) and legacy (rf01)
  const rf01raw = result.rf01_placa || result.rf01 || checkinData.rf01_placa || checkinData.rf01 || {};
  const rf02 = result.rf02_validacao || result.rf02 || checkinData.rf02_validacao || checkinData.rf02 || checkinData.validation || {};
  const rf03raw = result.rf03_checklist || result.rf03 || checkinData.rf03_checklist || checkinData.rf03 || checkinData.checklist || {};
  const rf04 = result.rf04_conciliacao || result.rf04 || {};
  const rf05raw = result.rf05_carga || result.rf05 || {};
  const rf06raw = result.rf06_classificacao || result.rf06 || {};
  const rf07 = result.rf07_evidencias || result.rf07 || {};
  const meta = result.meta || {};

  // Normalize field names: DB uses .text for plate, .present for detection, .class for classification
  const rf01 = rf01raw.text !== undefined && rf01raw.plate === undefined
    ? { ...rf01raw, plate: rf01raw.text } : rf01raw;
  const rf05 = rf05raw.present !== undefined && rf05raw.detected === undefined
    ? {
        ...rf05raw,
        detected: rf05raw.present === 'SIM',
        evidence: rf05raw.evidence || rf05raw.present_evidence,
        confidence: rf05raw.confidence || rf05raw.present_confidence,
        bbox: rf05raw.bbox || rf05raw.present_bbox,
      } : rf05raw;
  const rf06 = rf06raw.class !== undefined && rf06raw.classification === undefined
    ? { ...rf06raw, classification: rf06raw.class } : rf06raw;

  const checkoutPhotoUrls = inspection?.checkout_photo_urls || [];
  const photosAnalysis = result.photos_analysis || [];

  // Checklist: new format has items at top level (rf03_checklist.pneus), old has rf03.checklist.pneus
  const checklist = rf03raw.checklist || rf03raw;
  const checklistEntries = Object.entries(checklist);
  const checklistOk = checklistEntries.filter(([, v]) => (typeof v === 'object' ? v.status : v) === 'OK').length;

  // Watermark with operator/user identification
  const watermarkText = user?.email || inspection?.checkin_data?.operator_name || 'VistorIA';
  const watermarkEl = (
    <Watermark>
      {Array.from({ length: 80 }, (_, i) => (
        <span key={i}>{watermarkText}</span>
      ))}
    </Watermark>
  );

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}><FaArrowLeft /> Voltar</BackButton>
          <Logo>VistorIA</Logo>
          <div style={{ width: 60 }} />
        </Header>
        <LoadingContainer>
          <SpinnerIcon />
          <div>Carregando laudo...</div>
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !inspection) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}><FaArrowLeft /> Voltar</BackButton>
          <Logo>VistorIA</Logo>
          <div style={{ width: 60 }} />
        </Header>
        <Content>
          <ErrorBox>{error || 'Inspecao nao encontrada'}</ErrorBox>
          <Button $mt="16px" onClick={() => navigate(-1)}>Voltar</Button>
        </Content>
      </Container>
    );
  }

  // ---- Determine if awaiting checkout ----
  const awaitingCheckout = inspection?.status === 'checkin_done' || (!inspection?.checkout_at && inspection?.checkin_at);

  // ---- Operador view (simple) ----
  if (!isGestor) {
    return (
      <Container>
        {watermarkEl}
        <Header>
          <BackButton onClick={() => navigate(-1)}><FaArrowLeft /> Voltar</BackButton>
          <Logo>VistorIA</Logo>
          <div style={{ width: 60 }} />
        </Header>
        <Content>
          {awaitingCheckout ? (
            <>
              <VerdictBanner $approved={false} $inconclusive={true}>
                <VerdictBadge $approved={false} $inconclusive={true}>
                  <FaClock />
                  AGUARDANDO CHECKOUT
                </VerdictBadge>
                <PlateText>{plate || 'Sem placa'}</PlateText>
                {checklistEntries.length > 0 && (
                  <VerdictMeta>Checklist: {checklistOk}/{checklistEntries.length} itens OK</VerdictMeta>
                )}
                {inspection.checkin_operator && (
                  <VerdictMeta>Operador: {inspection.checkin_operator}</VerdictMeta>
                )}
                {inspection.cd_name && (
                  <VerdictMeta>CD: {inspection.cd_name}</VerdictMeta>
                )}
                <VerdictMeta style={{ marginTop: 8, opacity: 0.7 }}>
                  O laudo final sera gerado apos o checkout na expedicao
                </VerdictMeta>
              </VerdictBanner>

              {/* Show checkin details */}
              {checklistEntries.length > 0 && (
                <Section style={{ marginTop: 16 }}>
                  <SectionHeader onClick={() => toggleSection('checklist')}>
                    <SectionIcon $bg="#dbeafe" $color="#2563eb"><FaClipboardCheck /></SectionIcon>
                    <SectionTitle>
                      <div className="title">Checklist de Integridade</div>
                      <div className="subtitle">{checklistOk}/{checklistEntries.length} OK</div>
                    </SectionTitle>
                    {expandedSections.checklist ? <FaChevronUp /> : <FaChevronDown />}
                  </SectionHeader>
                  {expandedSections.checklist && (
                    <SectionBody>
                      {checklistEntries.map(([item, val]) => {
                        const status = typeof val === 'object' ? val.status : val;
                        const isOk = status === 'OK';
                        return (
                          <DetailRow key={item}>
                            <span className="label">{item}</span>
                            <span className="value" style={{ color: isOk ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                              {isOk ? 'OK' : 'NAO OK'}
                            </span>
                          </DetailRow>
                        );
                      })}
                    </SectionBody>
                  )}
                </Section>
              )}

              <Button onClick={() => navigate('/checkin')} style={{ marginTop: 16 }}>
                Novo Checkin
              </Button>
            </>
          ) : (
            <>
              <VerdictBanner $approved={isApproved} $inconclusive={isInconclusive}>
                <VerdictBadge $approved={isApproved} $inconclusive={isInconclusive}>
                  {isApproved ? <FaCheckCircle /> : isInconclusive ? <FaExclamationTriangle /> : <FaTimes />}
                  {verdict}
                </VerdictBadge>
                <PlateText>{plate || 'Sem placa'}</PlateText>
                {score > 0 && <VerdictMeta>Score: {Math.round(score)}/100</VerdictMeta>}
                {checklistEntries.length > 0 && (
                  <VerdictMeta>{checklistOk}/{checklistEntries.length} itens OK</VerdictMeta>
                )}
                {rf06.classification && (
                  <VerdictMeta>Carga: {rf06.classification}</VerdictMeta>
                )}
                {rf04.match && (
                  <VerdictMeta>Conciliacao: {rf04.match}</VerdictMeta>
                )}
              </VerdictBanner>

              <Button onClick={() => navigate('/checkin')}>
                Voltar ao Inicio
              </Button>
            </>
          )}
        </Content>
      </Container>
    );
  }

  // ---- Gestor view (complete) ----
  return (
    <Container>
      {watermarkEl}
      <Header>
        <BackButton onClick={() => navigate(-1)}><FaArrowLeft /> Voltar</BackButton>
        <Logo>VistorIA</Logo>
        <HeaderActions>
          <IconButton onClick={() => window.print()} title="Imprimir">
            <FaPrint />
          </IconButton>
          <IconButton onClick={() => {
            if (navigator.share) {
              navigator.share({ title: `Laudo ${plate}`, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }} title="Compartilhar">
            <FaShareAlt />
          </IconButton>
        </HeaderActions>
      </Header>

      <Content>
        {/* Verdict Banner */}
        <VerdictBanner $approved={isApproved} $inconclusive={isInconclusive}>
          <VerdictBadge $approved={isApproved} $inconclusive={isInconclusive}>
            {isApproved ? <FaCheckCircle /> : isInconclusive ? <FaExclamationTriangle /> : <FaTimes />}
            {verdict}
          </VerdictBadge>
          <PlateText>{plate || 'Sem placa'}</PlateText>
          {score > 0 && <ScoreText $score={score}>{Math.round(score)}<span>/100</span></ScoreText>}
          <VerdictMeta>{formatDateTime(inspection.created_at)}</VerdictMeta>
        </VerdictBanner>

        {/* Identification */}
        <Section>
          <SectionHeader onClick={() => toggleSection('id')}>
            <SectionIcon><FaTruck /></SectionIcon>
            <SectionTitle>
              <div className="title">Identificacao</div>
              <div className="subtitle">{plate} | {inspection.cd_name}</div>
            </SectionTitle>
            {expandedSections.id ? <FaChevronUp /> : <FaChevronDown />}
          </SectionHeader>
          {expandedSections.id && (
            <SectionBody>
              <DetailRow><span className="label">Placa</span><span className="value">{plate} ({fmtConf(rf01.confidence)})</span></DetailRow>
              <DetailRow><span className="label">CD</span><span className="value">{inspection.cd_name}</span></DetailRow>
              <DetailRow><span className="label">Tipo Veiculo</span><span className="value">{inspection.vehicle_type || '-'}</span></DetailRow>
              {inspection.os_number && <DetailRow><span className="label">OS</span><span className="value">{inspection.os_number}</span></DetailRow>}
              {inspection.cte_number && <DetailRow><span className="label">CT-e</span><span className="value">{inspection.cte_number}</span></DetailRow>}
              <DetailRow>
                <span className="label">Checkin</span>
                <span className="value">{formatDateTime(inspection.checkin_at)} | {inspection.checkin_operator}</span>
              </DetailRow>
              {inspection.checkin_gps && (
                <DetailRow>
                  <span className="label">GPS Checkin</span>
                  <span className="value">{inspection.checkin_gps.lat?.toFixed(4)}, {inspection.checkin_gps.lng?.toFixed(4)}</span>
                </DetailRow>
              )}
              {inspection.checkout_at && (
                <>
                  <DetailRow>
                    <span className="label">Checkout</span>
                    <span className="value">{formatDateTime(inspection.checkout_at)} | {inspection.checkout_operator}</span>
                  </DetailRow>
                  {inspection.checkout_gps && (
                    <DetailRow>
                      <span className="label">GPS Checkout</span>
                      <span className="value">{inspection.checkout_gps.lat?.toFixed(4)}, {inspection.checkout_gps.lng?.toFixed(4)}</span>
                    </DetailRow>
                  )}
                </>
              )}
            </SectionBody>
          )}
        </Section>

        {/* RF-01: Placa */}
        <Section>
          <SectionHeader onClick={() => toggleSection('rf01')}>
            <SectionIcon $bg="#dbeafe" $color="#2563eb"><FaClipboardCheck /></SectionIcon>
            <SectionTitle>
              <div className="title"><RfTooltip rfKey="rf01">RF-01: Placa</RfTooltip></div>
              <div className="subtitle">{rf01.plate || plate} | {fmtConf(rf01.confidence)}</div>
            </SectionTitle>
            <SectionBadge $status={rf01.plate ? 'OK' : 'INCONCLUSIVO'}>
              {rf01.plate || 'INC'}
            </SectionBadge>
            {expandedSections.rf01 ? <FaChevronUp /> : <FaChevronDown />}
          </SectionHeader>
          {expandedSections.rf01 && (
            <SectionBody>
              <DetailRow><span className="label">Placa detectada</span><span className="value">{rf01.plate || 'Nao identificada'}</span></DetailRow>
              <DetailRow><span className="label">Confianca</span><span className="value">{fmtConf(rf01.confidence)}</span></DetailRow>
              {rf01.frame_index !== undefined && (
                <DetailRow><span className="label">Frame</span><span className="value">#{rf01.frame_index}</span></DetailRow>
              )}
              {rf01.evidence && <EvidenceText>{rf01.evidence}</EvidenceText>}
              {rf01.bbox?.frame_index !== undefined &&
               (rf01.frame_base64 || inspection?.checkin_video_frames?.[rf01.bbox.frame_index]) && (
                <BoundingBox
                  src={`data:image/jpeg;base64,${rf01.frame_base64 || inspection.checkin_video_frames[rf01.bbox.frame_index]}`}
                  boxes={[{ ...rf01.bbox, label: rf01.plate, color: '#2563eb' }]}
                  alt="Placa"
                />
              )}
              <FeedbackSection>
                <FeedbackLabel>Avaliar RF-01</FeedbackLabel>
                <StarRating
                  accentColor={colors.primary}
                  size="18px"
                  onChange={(rating, comment) => handleStarSubmit('rf01', rating, comment)}
                  placeholder="A placa foi identificada corretamente?"
                />
              </FeedbackSection>
            </SectionBody>
          )}
        </Section>

        {/* RF-02: Video Validation */}
        <Section>
          <SectionHeader onClick={() => toggleSection('rf02')}>
            <SectionIcon $bg="#dbeafe" $color="#2563eb"><FaVideo /></SectionIcon>
            <SectionTitle>
              <div className="title"><RfTooltip rfKey="rf02">RF-02: Validacao do Video</RfTooltip></div>
              <div className="subtitle">{rf02.status || '-'} | {fmtConf(rf02.confidence)}</div>
            </SectionTitle>
            <SectionBadge $status={rf02.status === 'APROVADO' ? 'APROVADO' : 'INCONCLUSIVO'}>
              {rf02.status || 'INC'}
            </SectionBadge>
            {expandedSections.rf02 ? <FaChevronUp /> : <FaChevronDown />}
          </SectionHeader>
          {expandedSections.rf02 && (
            <SectionBody>
              <DetailRow><span className="label">Status</span><span className="value">{rf02.status || '-'}</span></DetailRow>
              <DetailRow><span className="label">Confianca</span><span className="value">{fmtConf(rf02.confidence)}</span></DetailRow>
              {rf02.evidence && <EvidenceText>{rf02.evidence}</EvidenceText>}
              {rf02.bbox?.frame_index !== undefined &&
               (rf02.frame_base64 || inspection?.checkin_video_frames?.[rf02.bbox.frame_index]) && (
                <BoundingBox
                  src={`data:image/jpeg;base64,${rf02.frame_base64 || inspection.checkin_video_frames[rf02.bbox.frame_index]}`}
                  boxes={[{ ...rf02.bbox, label: rf02.status || 'Validação', color: rf02.status === 'APROVADO' ? '#22c55e' : '#f59e0b' }]}
                  alt="Validação vídeo"
                />
              )}
              <FeedbackSection>
                <FeedbackLabel>Avaliar RF-02</FeedbackLabel>
                <StarRating
                  accentColor={colors.primary}
                  size="18px"
                  onChange={(rating, comment) => handleStarSubmit('rf02', rating, comment)}
                  placeholder="O video foi avaliado corretamente?"
                />
              </FeedbackSection>
            </SectionBody>
          )}
        </Section>

        {/* RF-03: Checklist */}
        <Section>
          <SectionHeader onClick={() => toggleSection('rf03')}>
            <SectionIcon $bg="#d1fae5" $color={colors.success}><FaShieldAlt /></SectionIcon>
            <SectionTitle>
              <div className="title"><RfTooltip rfKey="rf03">RF-03: Checklist ({checklistEntries.length} itens)</RfTooltip></div>
              <div className="subtitle">{checklistOk}/{checklistEntries.length} OK</div>
            </SectionTitle>
            <SectionBadge $status={checklistOk === checklistEntries.length ? 'OK' : 'INCONCLUSIVO'}>
              {checklistOk}/{checklistEntries.length}
            </SectionBadge>
            {expandedSections.rf03 ? <FaChevronUp /> : <FaChevronDown />}
          </SectionHeader>
          {expandedSections.rf03 && (
            <SectionBody>
              {checklistEntries.map(([key, val]) => {
                const status = typeof val === 'object' ? val.status : val;
                const confidence = typeof val === 'object' ? val.confidence : null;
                const evidence = typeof val === 'object' ? val.evidence : null;
                const bbox = typeof val === 'object' ? val.bbox : null;

                return (
                  <ChecklistItem key={key}>
                    <ChecklistStatus $status={status}>
                      {status === 'OK' ? <FaCheckCircle /> : status === 'NAO_OK' ? <FaTimes /> : <FaExclamationTriangle />}
                    </ChecklistStatus>
                    <ChecklistContent>
                      <div className="name">{CHECKLIST_LABELS[key] || key}: {status}</div>
                      {confidence && <div className="confidence">Confianca: {fmtConf(confidence)}</div>}
                      {evidence && <div className="evidence">{evidence}</div>}
                      {bbox?.frame_index !== undefined &&
                       (inspection?.checkin_video_frames?.[bbox.frame_index]) && (
                        <BoundingBox
                          src={`data:image/jpeg;base64,${inspection.checkin_video_frames[bbox.frame_index]}`}
                          boxes={[{ ...bbox, label: `${CHECKLIST_LABELS[key] || key}: ${status}`, color: status === 'OK' ? '#22c55e' : status === 'NAO_OK' ? '#ef4444' : '#f59e0b' }]}
                          alt={CHECKLIST_LABELS[key] || key}
                        />
                      )}
                      {bbox?.photo_index !== undefined &&
                       checkoutPhotoUrls?.[bbox.photo_index] && (
                        <BoundingBox
                          src={checkoutPhotoUrls[bbox.photo_index]}
                          boxes={[{ ...bbox, label: `${CHECKLIST_LABELS[key] || key}: ${status}`, color: status === 'OK' ? '#22c55e' : status === 'NAO_OK' ? '#ef4444' : '#f59e0b' }]}
                          alt={CHECKLIST_LABELS[key] || key}
                        />
                      )}
                    </ChecklistContent>
                  </ChecklistItem>
                );
              })}
              <FeedbackSection>
                <FeedbackLabel>Avaliar RF-03</FeedbackLabel>
                <StarRating
                  accentColor={colors.primary}
                  size="18px"
                  onChange={(rating, comment) => handleStarSubmit('rf03', rating, comment)}
                  placeholder="O checklist foi avaliado corretamente?"
                />
              </FeedbackSection>
            </SectionBody>
          )}
        </Section>

        {/* RF-04: Conciliation */}
        <Section>
          <SectionHeader onClick={() => toggleSection('rf04')}>
            <SectionIcon $bg="#fef3c7" $color={colors.warning}><FaBalanceScale /></SectionIcon>
            <SectionTitle>
              <div className="title"><RfTooltip rfKey="rf04">RF-04: Conciliacao</RfTooltip></div>
              <div className="subtitle">{rf04.match || '-'} | {fmtConf(rf04.confidence)}</div>
            </SectionTitle>
            <SectionBadge $status={rf04.match === 'MESMO_VEICULO' ? 'MESMO_VEICULO' : rf04.match === 'NAO' ? 'NAO' : 'INCONCLUSIVO'}>
              {rf04.match || 'INC'}
            </SectionBadge>
            {expandedSections.rf04 ? <FaChevronUp /> : <FaChevronDown />}
          </SectionHeader>
          {expandedSections.rf04 && (
            <SectionBody>
              <DetailRow><span className="label">Resultado</span><span className="value">{rf04.match || '-'}</span></DetailRow>
              <DetailRow><span className="label">Confianca</span><span className="value">{fmtConf(rf04.confidence)}</span></DetailRow>
              {rf04.evidence && <EvidenceText>{rf04.evidence}</EvidenceText>}
              {(rf04.visual_signatures || rf04.details) && (
                <div style={{ marginTop: 8 }}>
                  <DetailRow><span className="label">Detalhes visuais</span></DetailRow>
                  {Object.entries(rf04.visual_signatures || rf04.details).map(([k, v]) => (
                    <DetailRow key={k} style={{ paddingLeft: 16 }}>
                      <span className="label" style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                      <span className="value">{
                        typeof v === 'object' && v !== null
                          ? (v.compativel !== undefined
                              ? `${v.compativel ? 'Compatível' : 'Divergente'}${v.obs ? ` — ${v.obs}` : ''}${v.video ? ` (vídeo: ${v.video}, foto: ${v.foto})` : ''}`
                              : JSON.stringify(v))
                          : String(v)
                      }</span>
                    </DetailRow>
                  ))}
                </div>
              )}
              {rf04.bbox?.frame_index !== undefined &&
               inspection?.checkin_video_frames?.[rf04.bbox.frame_index] && (
                <BoundingBox
                  src={`data:image/jpeg;base64,${inspection.checkin_video_frames[rf04.bbox.frame_index]}`}
                  boxes={[{ ...rf04.bbox, label: rf04.match || 'Conciliação', color: rf04.match === 'MESMO_VEICULO' ? '#22c55e' : '#f59e0b' }]}
                  alt="Conciliação vídeo"
                />
              )}
              {rf04.bbox?.photo_index !== undefined &&
               checkoutPhotoUrls?.[rf04.bbox.photo_index] && (
                <BoundingBox
                  src={checkoutPhotoUrls[rf04.bbox.photo_index]}
                  boxes={[{ ...rf04.bbox, label: rf04.match || 'Conciliação', color: rf04.match === 'MESMO_VEICULO' ? '#22c55e' : '#f59e0b' }]}
                  alt="Conciliação foto"
                />
              )}
              <FeedbackSection>
                <FeedbackLabel>Avaliar RF-04</FeedbackLabel>
                <StarRating
                  accentColor={colors.primary}
                  size="18px"
                  onChange={(rating, comment) => handleStarSubmit('rf04', rating, comment)}
                  placeholder="A conciliacao esta correta?"
                />
              </FeedbackSection>
            </SectionBody>
          )}
        </Section>

        {/* RF-05: Cargo Detection */}
        <Section>
          <SectionHeader onClick={() => toggleSection('rf05')}>
            <SectionIcon $bg="#dbeafe" $color="#2563eb"><FaBoxes /></SectionIcon>
            <SectionTitle>
              <div className="title"><RfTooltip rfKey="rf05">RF-05: Deteccao de Carga</RfTooltip></div>
              <div className="subtitle">{rf05.detected ? 'SIM' : 'NAO'} | {fmtConf(rf05.confidence)}</div>
            </SectionTitle>
            <SectionBadge $status={rf05.detected ? 'SIM' : 'INCONCLUSIVO'}>
              {rf05.detected ? 'SIM' : 'NAO'}
            </SectionBadge>
            {expandedSections.rf05 ? <FaChevronUp /> : <FaChevronDown />}
          </SectionHeader>
          {expandedSections.rf05 && (
            <SectionBody>
              <DetailRow><span className="label">Detectada</span><span className="value">{rf05.detected ? 'Sim' : 'Nao'}</span></DetailRow>
              <DetailRow><span className="label">Confianca</span><span className="value">{fmtConf(rf05.confidence)}</span></DetailRow>
              {rf05.evidence && <EvidenceText>{rf05.evidence}</EvidenceText>}
              {rf05.bbox?.frame_index !== undefined &&
               inspection?.checkin_video_frames?.[rf05.bbox.frame_index] && (
                <BoundingBox
                  src={`data:image/jpeg;base64,${inspection.checkin_video_frames[rf05.bbox.frame_index]}`}
                  boxes={[{ ...rf05.bbox, label: rf05.detected ? 'Carga detectada' : 'Sem carga', color: rf05.detected ? '#22c55e' : '#f59e0b' }]}
                  alt="Detecção carga (vídeo)"
                />
              )}
              {rf05.bbox?.photo_index !== undefined &&
               checkoutPhotoUrls?.[rf05.bbox.photo_index] && (
                <BoundingBox
                  src={checkoutPhotoUrls[rf05.bbox.photo_index]}
                  boxes={[{ ...rf05.bbox, label: rf05.detected ? 'Carga detectada' : 'Sem carga', color: rf05.detected ? '#22c55e' : '#f59e0b' }]}
                  alt="Detecção carga (foto)"
                />
              )}
              {!rf05.bbox && rf06.bbox?.photo_index !== undefined &&
               checkoutPhotoUrls?.[rf06.bbox.photo_index] && (
                <BoundingBox
                  src={checkoutPhotoUrls[rf06.bbox.photo_index]}
                  boxes={[{ ...rf06.bbox, label: rf06.classification || 'Carga', color: '#2563eb' }]}
                  alt="Carga (fallback RF-06)"
                />
              )}
              <FeedbackSection>
                <FeedbackLabel>Avaliar RF-05</FeedbackLabel>
                <StarRating
                  accentColor={colors.primary}
                  size="18px"
                  onChange={(rating, comment) => handleStarSubmit('rf05', rating, comment)}
                  placeholder="A deteccao de carga esta correta?"
                />
              </FeedbackSection>
            </SectionBody>
          )}
        </Section>

        {/* RF-06: Classification */}
        <Section>
          <SectionHeader onClick={() => toggleSection('rf06')}>
            <SectionIcon $bg="#fef3c7" $color={colors.warning}><FaTags /></SectionIcon>
            <SectionTitle>
              <div className="title"><RfTooltip rfKey="rf06">RF-06: Classificacao</RfTooltip></div>
              <div className="subtitle">{rf06.classification || '-'} | {fmtConf(rf06.confidence)}</div>
            </SectionTitle>
            <SectionBadge $status={rf06.classification ? 'OK' : 'INCONCLUSIVO'}>
              {rf06.classification || 'INC'}
            </SectionBadge>
            {expandedSections.rf06 ? <FaChevronUp /> : <FaChevronDown />}
          </SectionHeader>
          {expandedSections.rf06 && (
            <SectionBody>
              <DetailRow><span className="label">Classe</span><span className="value">{rf06.classification || '-'}</span></DetailRow>
              <DetailRow><span className="label">Confianca</span><span className="value">{fmtConf(rf06.confidence)}</span></DetailRow>
              {rf06.evidence && <EvidenceText>{rf06.evidence}</EvidenceText>}
              {rf06.bbox?.photo_index !== undefined &&
               checkoutPhotoUrls?.[rf06.bbox.photo_index] && (
                <BoundingBox
                  src={checkoutPhotoUrls[rf06.bbox.photo_index]}
                  boxes={[{ ...rf06.bbox, label: rf06.classification || 'Classificação', color: '#2563eb' }]}
                  alt="Classificação"
                />
              )}
              {rf06.bbox?.frame_index !== undefined &&
               inspection?.checkin_video_frames?.[rf06.bbox.frame_index] && (
                <BoundingBox
                  src={`data:image/jpeg;base64,${inspection.checkin_video_frames[rf06.bbox.frame_index]}`}
                  boxes={[{ ...rf06.bbox, label: rf06.classification || 'Classificação', color: '#2563eb' }]}
                  alt="Classificação"
                />
              )}
              <FeedbackSection>
                <FeedbackLabel>Avaliar RF-06</FeedbackLabel>
                <StarRating
                  accentColor={colors.primary}
                  size="18px"
                  onChange={(rating, comment) => handleStarSubmit('rf06', rating, comment)}
                  placeholder="A classificacao esta correta?"
                />
              </FeedbackSection>
            </SectionBody>
          )}
        </Section>

        {/* Checkout Photos — análise foto a foto com bbox */}
        {checkoutPhotoUrls.length > 0 && (
          <Section>
            <SectionHeader onClick={() => toggleSection('fotos')}>
              <SectionIcon $bg="#f0fdf4" $color="#16a34a"><FaCamera /></SectionIcon>
              <SectionTitle>
                <div className="title"><RfTooltip rfKey="fotos">Análise Foto a Foto</RfTooltip></div>
                <div className="subtitle">
                  {checkoutPhotoUrls.length} foto{checkoutPhotoUrls.length !== 1 ? 's' : ''}
                  {photosAnalysis.length > 0
                    ? ` · ${photosAnalysis.length} analisadas com bbox`
                    : !photosAnalysisReady ? ' · processando bbox...' : ''}
                </div>
              </SectionTitle>
              <SectionBadge $status="OK">{checkoutPhotoUrls.length}</SectionBadge>
              {expandedSections.fotos ? <FaChevronUp /> : <FaChevronDown />}
            </SectionHeader>
            {expandedSections.fotos && (
              <SectionBody>
                {!photosAnalysisReady && photosAnalysis.length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#0f172a', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#94a3b8' }}>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    Análise bbox em processamento — atualiza automaticamente
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {checkoutPhotoUrls.map((url, i) => {
                    const analysis = photosAnalysis.find(p => p.photo_index === i);
                    return (
                      <div key={i} style={{ borderRadius: 10, overflow: 'hidden', background: '#0f172a', border: '1px solid #334155' }}>
                        {analysis?.bbox ? (
                          <div role="button" tabIndex={0} onClick={() => setLightboxPhoto(url)} onKeyDown={e => e.key === 'Enter' && setLightboxPhoto(url)} style={{ cursor: 'pointer' }}>
                            <BoundingBox
                              src={url}
                              alt={`Foto ${i + 1}`}
                              boxes={[{ ...analysis.bbox, label: analysis.label || analysis.detected, color: '#0EA5E9' }]}
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => setLightboxPhoto(url)}
                            style={{ cursor: 'pointer', aspectRatio: '4/3', overflow: 'hidden' }}
                          >
                            <img
                              src={url}
                              alt={`Foto ${i + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div style={{ padding: '6px 10px', borderTop: '1px solid #1e293b' }}>
                          {analysis ? (
                            <>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{analysis.label || `Foto ${i + 1}`}</div>
                              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{analysis.detected}</div>
                              {analysis.confidence && (
                                <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
                                  Confiança: {Math.round(analysis.confidence * 100)}%
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{ fontSize: 11, color: '#64748b' }}>Foto {i + 1}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
                  Toque em uma foto para ampliar
                </div>
              </SectionBody>
            )}
          </Section>
        )}

        {/* RF-07: Evidence Coverage */}
        <Section>
          <SectionHeader onClick={() => toggleSection('rf07')}>
            <SectionIcon $bg="#d1fae5" $color={colors.success}><FaShieldAlt /></SectionIcon>
            <SectionTitle>
              <div className="title"><RfTooltip rfKey="rf07">RF-07: Cobertura de Evidencias</RfTooltip></div>
              <div className="subtitle">
                {rf07.decisions_with_evidence || 0}/{rf07.total_decisions || 0} decisoes com evidencia
              </div>
            </SectionTitle>
            <SectionBadge $status={
              rf07.total_decisions && rf07.decisions_with_evidence === rf07.total_decisions ? 'OK' : 'INCONCLUSIVO'
            }>
              {rf07.total_decisions ? `${Math.round((rf07.decisions_with_evidence / rf07.total_decisions) * 100)}%` : '-'}
            </SectionBadge>
            {expandedSections.rf07 ? <FaChevronUp /> : <FaChevronDown />}
          </SectionHeader>
          {expandedSections.rf07 && (
            <SectionBody>
              <DetailRow>
                <span className="label">Total de decisoes</span>
                <span className="value">{rf07.total_decisions || 0}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">Com evidencia</span>
                <span className="value">{rf07.decisions_with_evidence || 0}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">Cobertura</span>
                <span className="value">
                  {rf07.total_decisions ? `${Math.round((rf07.decisions_with_evidence / rf07.total_decisions) * 100)}%` : '-'}
                </span>
              </DetailRow>
            </SectionBody>
          )}
        </Section>

        {/* Meta */}
        <Section>
          <SectionHeader onClick={() => toggleSection('meta')}>
            <SectionIcon><FaCog /></SectionIcon>
            <SectionTitle>
              <div className="title">Meta</div>
              <div className="subtitle">{meta.engine || '-'} | {meta.model || '-'}</div>
            </SectionTitle>
            {expandedSections.meta ? <FaChevronUp /> : <FaChevronDown />}
          </SectionHeader>
          {expandedSections.meta && (
            <SectionBody>
              <DetailRow><span className="label">Engine</span><span className="value">{meta.engine || '-'}</span></DetailRow>
              <DetailRow><span className="label">Modelo</span><span className="value">{meta.model || '-'}</span></DetailRow>
              <DetailRow><span className="label">Prompt Version</span><span className="value">{meta.prompt_version || '-'}</span></DetailRow>
              <DetailRow><span className="label">Tempo total</span><span className="value">{inspection.processing_time_ms ? `${(inspection.processing_time_ms / 1000).toFixed(1)}s` : '-'}</span></DetailRow>
              <DetailRow><span className="label">ID Inspecao</span><span className="value" style={{ fontSize: 10 }}>{inspection.id}</span></DetailRow>
            </SectionBody>
          )}
        </Section>

        {/* Timeline */}
        {logs.length > 0 && (
          <Section>
            <SectionHeader onClick={() => toggleSection('timeline')}>
              <SectionIcon><FaHistory /></SectionIcon>
              <SectionTitle>
                <div className="title">Timeline</div>
                <div className="subtitle">{logs.length} eventos</div>
              </SectionTitle>
              {expandedSections.timeline ? <FaChevronUp /> : <FaChevronDown />}
            </SectionHeader>
            {expandedSections.timeline && (
              <SectionBody>
                <TimelineContainer>
                  {logs.map((log, i) => (
                    <TimelineEntry key={i}>
                      <span className="time">{formatTime(log.created_at)}</span>
                      <span className="actor">{log.actor_name || log.actor || 'Sistema'}</span>
                      <span className="event">{log.event_type}: {formatLogDetails(log.event_type, log.details)}</span>
                    </TimelineEntry>
                  ))}
                </TimelineContainer>
              </SectionBody>
            )}
          </Section>
        )}

        {/* Actions */}
        {(isInconclusive || verdict === 'REPROVADO') && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#1e293b', borderRadius: 12, border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>Solicitar Recaptura</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Notifica a equipe para repetir a analise</div>
            </div>
            {recapturaState === 'sent' ? (
              <div style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}><FaCheckCircle style={{ marginRight: 4 }} />Solicitado!</div>
            ) : (
              <button
                onClick={handleRecaptura}
                disabled={recapturaState === 'sending'}
                style={{ background: '#f59e0b', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#000', fontWeight: 700, fontSize: 13, cursor: recapturaState === 'sending' ? 'wait' : 'pointer' }}
              >
                {recapturaState === 'sending' ? '...' : 'Solicitar'}
              </button>
            )}
          </div>
        )}

        <Button $mt="8px" onClick={() => navigate(isDemo ? '/dashboard?demo=1' : '/dashboard')}>
          {isDemo ? 'Ver Dashboard' : 'Voltar ao Dashboard'}
        </Button>
      </Content>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <img
            src={lightboxPhoto}
            alt="Foto ampliada"
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, objectFit: 'contain' }}
          />
          <button
            onClick={() => setLightboxPhoto(null)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </Container>
  );
}
