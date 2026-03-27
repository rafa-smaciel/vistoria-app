// src/modules/VistorIA/pages/Dashboard.js
// Dashboard de gestao — 3 secoes: pendentes, completas, expiradas
// Counters + filtros + paginacao + cards mobile + table desktop

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FaTruck, FaCheckCircle, FaTimes, FaExclamationTriangle,
  FaClock, FaChartBar, FaPlus, FaArrowLeft, FaArrowRight,
  FaSearch, FaSpinner, FaTimesCircle, FaBan, FaHome
} from 'react-icons/fa';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { vistoriaColors as colors } from '../components/theme';

// ============================================
// STYLED COMPONENTS
// ============================================
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${colors.backgroundAlt};
  color: ${colors.textPrimary};
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
  @media (min-width: 768px) { padding: 16px 32px; }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: ${colors.primaryDark};
  cursor: pointer;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const NewButton = styled.button`
  padding: 8px 16px;
  background: ${colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover { background: ${colors.primaryDark}; }
`;

const Content = styled.main`
  padding: 20px 16px;
  max-width: 1200px;
  margin: 0 auto;
  @media (min-width: 768px) { padding: 24px 32px; }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Counters
const CounterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 360px) { grid-template-columns: 1fr; }
`;

const CounterCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 2px solid ${p => p.$active ? p.$borderColor || colors.primary : colors.border};
  box-shadow: ${colors.cardShadow};
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${p => p.$borderColor || colors.primary}; }

  .value {
    font-size: 28px;
    font-weight: 700;
    color: ${p => p.$color || colors.textPrimary};
  }
  .label {
    font-size: 12px;
    color: ${colors.textSecondary};
    margin-top: 2px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .period {
    font-size: 11px;
    color: ${colors.textLight};
    margin-top: 4px;
  }
`;

// Filters
const FilterBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
  cursor: pointer;
  outline: none;
  &:focus { border-color: ${colors.primary}; }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  background: #fff;
  flex: 1;
  min-width: 180px;
  input {
    border: none;
    outline: none;
    font-size: 13px;
    flex: 1;
    background: transparent;
  }
  svg { color: ${colors.textSecondary}; font-size: 14px; }
`;

// Section
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 24px 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  svg { color: ${p => p.$color || colors.textSecondary}; }
  .count {
    background: ${p => p.$bg || colors.backgroundAlt};
    color: ${p => p.$countColor || colors.textSecondary};
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
  }
`;

// Cards (mobile + desktop)
const InspectionCard = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: ${colors.cardShadow};
  animation: ${fadeIn} 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: border-color 0.2s;
  &:hover { border-color: ${colors.primary}; }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CardLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardPlate = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.textPrimary};
  font-family: 'Courier New', monospace;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: ${colors.textSecondary};
  margin-top: 4px;
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${p =>
    p.$variant === 'approved' ? colors.successLight :
    p.$variant === 'rejected' ? colors.dangerLight :
    p.$variant === 'pending' ? colors.warningLight :
    '#f3f4f6'
  };
  color: ${p =>
    p.$variant === 'approved' ? '#065f46' :
    p.$variant === 'rejected' ? '#991b1b' :
    p.$variant === 'pending' ? '#92400e' :
    '#374151'
  };
`;

const ScorePill = styled.span`
  font-weight: 700;
  font-size: 14px;
  color: ${p => p.$score >= 80 ? colors.success : p.$score >= 60 ? colors.warning : colors.danger};
`;

const CardAction = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${p => p.$outline ? 'transparent' : colors.primary};
  color: ${p => p.$outline ? colors.primary : '#fff'};
  border: ${p => p.$outline ? `1px solid ${colors.primary}` : 'none'};
  white-space: nowrap;
  &:hover { opacity: 0.9; }
  @media (max-width: 480px) { width: 100%; justify-content: center; }
`;

const SLABadge = styled.span`
  background: ${colors.dangerLight};
  color: #991b1b;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  color: ${colors.primary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  &:hover { background: ${colors.backgroundAlt}; }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: ${colors.primary};
  font-size: 32px;
  svg { animation: ${spin} 1s linear infinite; }
`;

const EmptySection = styled.div`
  text-align: center;
  padding: 24px;
  color: ${colors.textSecondary};
  font-size: 14px;
  background: #fff;
  border: 1px dashed ${colors.border};
  border-radius: 12px;
`;

const AuthGateContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${colors.backgroundAlt};
  color: ${colors.primary};
  gap: 16px;
  svg { font-size: 48px; animation: ${spin} 1s linear infinite; }
  h2 { font-size: 18px; font-weight: 600; color: ${colors.textPrimary}; margin: 0; }
`;

// ============================================
// HELPERS
// ============================================
const formatDateTime = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

const formatTimeOnly = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const getPeriodFilter = (period) => {
  const now = new Date();
  switch (period) {
    case 'today': {
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }
    case 'yesterday': {
      const start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }
    case '7d': {
      const start = new Date(now); start.setDate(start.getDate() - 7);
      return start.toISOString();
    }
    case '30d': {
      const start = new Date(now); start.setDate(start.getDate() - 30);
      return start.toISOString();
    }
    default: return null;
  }
};

const PERIOD_LABELS = {
  today: 'hoje',
  yesterday: 'ontem',
  '7d': 'ultimos 7 dias',
  '30d': 'ultimos 30 dias',
  all: 'todos',
};

const VERDICT_MAP = {
  APROVADO: { variant: 'approved', icon: <FaCheckCircle /> },
  REPROVADO: { variant: 'rejected', icon: <FaTimes /> },
  INCONCLUSIVO: { variant: 'pending', icon: <FaExclamationTriangle /> },
};

// ============================================
// COMPONENT
// ============================================
const BackToSiteButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  color: ${colors.primary};
  border: 1px solid ${colors.primary};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover { background: ${colors.primary}; color: #fff; }
`;

function isDemoMode(location) {
  return new URLSearchParams(location.search).get('demo') === '1'
    || localStorage.getItem('vistoria_demo_active') === 'true';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const isDemo = isDemoMode(location);

  const [pendentes, setPendentes] = useState([]);
  const [completas, setCompletas] = useState([]);
  const [expiradas, setExpiradas] = useState([]);
  const [pendentesRevisao, setPendentesRevisao] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [period, setPeriod] = useState('30d');
  const [cdFilter, setCdFilter] = useState('');
  const [plateSearch, setPlateSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verdictFilter, setVerdictFilter] = useState('all');

  // Pagination
  const [showPendentes, setShowPendentes] = useState(10);
  const [showCompletas, setShowCompletas] = useState(10);
  const [showExpiradas, setShowExpiradas] = useState(5);
  const [showAtencao, setShowAtencao] = useState(10);

  // SLA config
  const [slaMs, setSlaMs] = useState(30000); // 30s default

  // Available CDs
  const [cdList, setCdList] = useState([]);

  useEffect(() => {
    document.title = 'VistorIA - Painel';
  }, []);

  // Safety timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading) setLoading(false);
    }, 8000);
    return () => clearTimeout(timeout);
  }, [authLoading]);

  // Fetch inspections
  const fetchInspections = useCallback(async () => {
    setLoading(true);
    const safetyTimeout = setTimeout(() => setLoading(false), 15000);

    try {
      const periodStart = getPeriodFilter(period);
      const baseQuery = (status) => {
        let q = supabase
          .from('vistoria_inspections')
          .select('id, placa, cd_name, vehicle_type, checkin_operator, checkout_operator, checkin_at, checkout_at, checkin_data, checkout_data, result, status, verdict, score, processing_time_ms, created_at')
          .eq('status', status)
          .order('created_at', { ascending: false })
          .limit(50);

        if (periodStart) q = q.gte('created_at', periodStart);
        if (cdFilter) q = q.eq('cd_name', cdFilter);
        if (plateSearch.trim()) q = q.ilike('placa', `%${plateSearch.trim()}%`);

        return q;
      };

      const [pendRes, compRes, expRes, revisaoRes] = await Promise.all([
        baseQuery('aguardando_checkout'),
        baseQuery('completa'),
        baseQuery('expirada'),
        baseQuery('pendente_revisao'),
      ]);

      setPendentes(pendRes.data || []);
      setCompletas(compRes.data || []);
      setExpiradas(expRes.data || []);
      setPendentesRevisao(revisaoRes.data || []);

      // Extract unique CDs
      const allData = [...(pendRes.data || []), ...(compRes.data || []), ...(expRes.data || []), ...(revisaoRes.data || [])];
      const cds = [...new Set(allData.map(d => d.cd_name).filter(Boolean))];
      setCdList(cds);
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
    } finally {
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  }, [period, cdFilter, plateSearch]);

  useEffect(() => {
    if (!isDemo && authLoading) return;
    fetchInspections();
  }, [isDemo, authLoading, fetchInspections]);

  // Apply status filter
  const filterByStatus = (items) => {
    if (statusFilter === 'all') return items;
    return items.filter(i => {
      if (statusFilter === 'aguardando_checkout') return i.status === 'aguardando_checkout';
      if (statusFilter === 'completa') return i.status === 'completa';
      if (statusFilter === 'expirada') return i.status === 'expirada';
      if (statusFilter === 'pendente_revisao') return i.status === 'pendente_revisao';
      return true;
    });
  };

  const filteredPendentes = filterByStatus(pendentes);
  const filteredExpiradas = filterByStatus(expiradas);

  // "Requer Atenção": inconclusivos + reprovados em completas + itens em pendente_revisao
  const inconclusivosReprovados = completas.filter(i =>
    i.verdict === 'INCONCLUSIVO' || i.verdict === 'REPROVADO'
  );
  const requereAtencao = [
    ...pendentesRevisao,
    ...inconclusivosReprovados.filter(i => !pendentesRevisao.find(r => r.id === i.id)),
  ];

  // Completas exclui os que já aparecem em "Requer Atenção" para evitar duplicação
  const requereAtencaoIds = new Set(requereAtencao.map(i => i.id));
  const filteredCompletas = filterByStatus(completas)
    .filter(i => verdictFilter === 'all' || (i.verdict || i.result?.verdict || '').toUpperCase() === verdictFilter)
    .filter(i => !requereAtencaoIds.has(i.id));

  const getChecklistSummary = (inspection) => {
    const checklist = inspection.checkin_data?.rf03_checklist
      || inspection.checkin_data?.rf03?.checklist
      || inspection.checkin_data?.checklist
      || {};
    const entries = Object.entries(checklist);
    if (entries.length === 0) return '';
    const ok = entries.filter(([, v]) => (typeof v === 'object' ? v.status : v) === 'OK').length;
    const nok = entries.filter(([, v]) => (typeof v === 'object' ? v.status : v) === 'NAO_OK').length;
    const inc = entries.length - ok - nok;
    let parts = [`${ok}/${entries.length} OK`];
    if (nok > 0) parts.push(`${nok} NOK`);
    if (inc > 0) parts.push(`${inc} INC`);
    return parts.join(', ');
  };

  // ---- Render Cards ----
  const renderPendenteCard = (insp) => (
    <InspectionCard key={insp.id} onClick={() => navigate(`/checkout/${insp.id}${isDemo ? '?demo=1' : ''}`)}>
      <CardLeft>
        <CardPlate>
          <FaTruck style={{ color: colors.primary }} />
          {insp.placa || 'Sem placa'}
        </CardPlate>
        <CardMeta>
          <span>{insp.cd_name}</span>
          <span>{formatTimeOnly(insp.checkin_at)}</span>
          <span>{getChecklistSummary(insp)}</span>
          {insp.checkin_operator && <span>{insp.checkin_operator}</span>}
        </CardMeta>
      </CardLeft>
      <CardAction>
        Fazer Checkout <FaArrowRight />
      </CardAction>
    </InspectionCard>
  );

  const renderCompletaCard = (insp) => {
    const v = VERDICT_MAP[insp.verdict] || { variant: 'pending', icon: <FaExclamationTriangle /> };
    const isSlow = insp.processing_time_ms > slaMs;
    const r = insp.result || {};
    const cargoType = r.rf06_classificacao?.class || r.rf06?.classification || null;
    const conciliacao = r.rf04_conciliacao?.match || r.rf04?.match || null;

    return (
      <InspectionCard key={insp.id} onClick={() => navigate(`/resultado/${insp.id}${isDemo ? '?demo=1' : ''}`)}>
        <CardLeft>
          <CardPlate>
            <FaTruck style={{ color: colors.primary }} />
            {insp.placa || 'Sem placa'}
            {isSlow && <SLABadge>SLA</SLABadge>}
          </CardPlate>
          <CardMeta>
            <StatusPill $variant={v.variant}>
              {v.icon} {insp.verdict}
            </StatusPill>
            {insp.score > 0 && <ScorePill $score={insp.score}>{Math.round(insp.score)}</ScorePill>}
            <span>{insp.cd_name}</span>
            <span>{formatTimeOnly(insp.checkout_at || insp.created_at)}</span>
            {cargoType && <span>Carga: {cargoType}</span>}
            {conciliacao && <span>Conciliacao: {conciliacao}</span>}
          </CardMeta>
        </CardLeft>
        <CardAction $outline>
          Ver Laudo <FaArrowRight />
        </CardAction>
      </InspectionCard>
    );
  };

  const renderExpiradaCard = (insp) => (
    <InspectionCard key={insp.id}>
      <CardLeft>
        <CardPlate>
          <FaTruck style={{ color: colors.textSecondary }} />
          {insp.placa || 'Sem placa'}
        </CardPlate>
        <CardMeta>
          <span>{insp.cd_name}</span>
          <span>{formatDateTime(insp.checkin_at)}</span>
          <span>Checkout nao realizado</span>
        </CardMeta>
      </CardLeft>
      <CardAction $outline onClick={() => navigate(`/resultado/${insp.id}${isDemo ? '?demo=1' : ''}`)}>
        Ver Checkin <FaArrowRight />
      </CardAction>
    </InspectionCard>
  );

  return (
    <Container>
      <Header>
        <Logo onClick={() => navigate('/')}>
          VistorIA
        </Logo>
        <HeaderActions>
          {isDemo && (
            <BackToSiteButton onClick={() => {
              localStorage.removeItem('vistoria_demo_active');
              navigate('/');
            }}>
              <FaHome /> Voltar ao Site
            </BackToSiteButton>
          )}
        </HeaderActions>
      </Header>

      <Content>
        <Title>Painel de Inspecoes</Title>

        {/* Counters */}
        <CounterGrid>
          <CounterCard
            $color={colors.warning}
            $borderColor={colors.warning}
            $active={statusFilter === 'aguardando_checkout'}
            onClick={() => setStatusFilter(statusFilter === 'aguardando_checkout' ? 'all' : 'aguardando_checkout')}
          >
            <div className="value">{filteredPendentes.length}</div>
            <div className="label">Pendentes</div>
            <div className="period">({PERIOD_LABELS[period]})</div>
          </CounterCard>

          <CounterCard
            $color={colors.success}
            $borderColor={colors.success}
            $active={statusFilter === 'completa'}
            onClick={() => setStatusFilter(statusFilter === 'completa' ? 'all' : 'completa')}
          >
            <div className="value">{filteredCompletas.length}</div>
            <div className="label">Completas</div>
            <div className="period">({PERIOD_LABELS[period]})</div>
          </CounterCard>

          <CounterCard
            $color={colors.danger}
            $borderColor={colors.danger}
            $active={statusFilter === 'expirada'}
            onClick={() => setStatusFilter(statusFilter === 'expirada' ? 'all' : 'expirada')}
          >
            <div className="value">{filteredExpiradas.length}</div>
            <div className="label">Expiradas</div>
            <div className="period">({PERIOD_LABELS[period]})</div>
          </CounterCard>

          <CounterCard
            $color="#f97316"
            $borderColor="#f97316"
            $active={statusFilter === 'pendente_revisao'}
            onClick={() => setStatusFilter(statusFilter === 'pendente_revisao' ? 'all' : 'pendente_revisao')}
          >
            <div className="value">{requereAtencao.length}</div>
            <div className="label">Requer Atencao</div>
            <div className="period">INC + REP + revisao</div>
          </CounterCard>
        </CounterGrid>

        {/* Filters */}
        <FilterBar>
          <FilterSelect value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="today">Hoje</option>
            <option value="yesterday">Ontem</option>
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="all">Todos</option>
          </FilterSelect>

          <FilterSelect value={verdictFilter} onChange={e => setVerdictFilter(e.target.value)}>
            <option value="all">Todos ▼</option>
            <option value="APROVADO">Aprovado</option>
            <option value="REPROVADO">Reprovado</option>
            <option value="INCONCLUSIVO">Inconclusivo</option>
          </FilterSelect>

          {cdList.length > 0 && (
            <FilterSelect value={cdFilter} onChange={e => setCdFilter(e.target.value)}>
              <option value="">Todos CDs</option>
              {cdList.map(cd => <option key={cd} value={cd}>{cd}</option>)}
            </FilterSelect>
          )}

          <SearchBox>
            <FaSearch />
            <input
              placeholder="Buscar placa..."
              value={plateSearch}
              onChange={e => setPlateSearch(e.target.value.toUpperCase())}
            />
          </SearchBox>
        </FilterBar>

        {/* Loading */}
        {loading && <LoadingState><FaSpinner /></LoadingState>}

        {!loading && (
          <>
            {/* Pendentes */}
            {(statusFilter === 'all' || statusFilter === 'aguardando_checkout') && (
              <>
                <SectionHeader $color={colors.warning} $bg={colors.warningLight} $countColor="#92400e">
                  <FaClock /> Aguardando Checkout
                  <span className="count">{filteredPendentes.length}</span>
                </SectionHeader>

                {filteredPendentes.length === 0 && (
                  <EmptySection>Nenhum checkin pendente de checkout</EmptySection>
                )}

                {filteredPendentes.slice(0, showPendentes).map(renderPendenteCard)}

                {filteredPendentes.length > showPendentes && (
                  <LoadMoreButton onClick={() => setShowPendentes(p => p + 10)}>
                    Carregar mais ({filteredPendentes.length - showPendentes} restantes)
                  </LoadMoreButton>
                )}
              </>
            )}

            {/* Requer Atenção */}
            {(statusFilter === 'all' || statusFilter === 'pendente_revisao') && requereAtencao.length > 0 && (
              <>
                <SectionHeader $color="#f97316" $bg="#fff7ed" $countColor="#9a3412">
                  <FaExclamationTriangle /> Requer Atencao
                  <span className="count">{requereAtencao.length}</span>
                </SectionHeader>

                {requereAtencao.slice(0, showAtencao).map(renderCompletaCard)}

                {requereAtencao.length > showAtencao && (
                  <LoadMoreButton onClick={() => setShowAtencao(p => p + 10)}>
                    Carregar mais ({requereAtencao.length - showAtencao} restantes)
                  </LoadMoreButton>
                )}
              </>
            )}

            {/* Completas */}
            {(statusFilter === 'all' || statusFilter === 'completa') && (
              <>
                <SectionHeader $color={colors.success} $bg={colors.successLight} $countColor="#065f46">
                  <FaCheckCircle /> Completas
                  <span className="count">{filteredCompletas.length}</span>
                </SectionHeader>

                {filteredCompletas.length === 0 && (
                  <EmptySection>Nenhuma inspecao completa no periodo</EmptySection>
                )}

                {filteredCompletas.slice(0, showCompletas).map(renderCompletaCard)}

                {filteredCompletas.length > showCompletas && (
                  <LoadMoreButton onClick={() => setShowCompletas(p => p + 10)}>
                    Carregar mais ({filteredCompletas.length - showCompletas} restantes)
                  </LoadMoreButton>
                )}
              </>
            )}

            {/* Expiradas */}
            {(statusFilter === 'all' || statusFilter === 'expirada') && (
              <>
                <SectionHeader $color={colors.danger} $bg={colors.dangerLight} $countColor="#991b1b">
                  <FaBan /> Expiradas
                  <span className="count">{filteredExpiradas.length}</span>
                </SectionHeader>

                {filteredExpiradas.length === 0 && (
                  <EmptySection>Nenhuma inspecao expirada no periodo</EmptySection>
                )}

                {filteredExpiradas.slice(0, showExpiradas).map(renderExpiradaCard)}

                {filteredExpiradas.length > showExpiradas && (
                  <LoadMoreButton onClick={() => setShowExpiradas(p => p + 5)}>
                    Carregar mais ({filteredExpiradas.length - showExpiradas} restantes)
                  </LoadMoreButton>
                )}
              </>
            )}
          </>
        )}
      </Content>
    </Container>
  );
}
