// src/modules/VistorIA/pages/AdminSettings.js
// Configuracoes VistorIA — 6 abas (Checkin, Checkout, Conciliacao, Laudo, Geral, API)
// Persiste em vistoria_config (config_key/config_value JSONB)
// Acesso: admin only (via VistorIARouteGuard)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FaCog, FaArrowLeft, FaSave, FaUndo, FaCheckCircle,
  FaSpinner, FaExclamationTriangle, FaKey, FaCopy, FaPlay
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { vistoriaColors as colors } from '../components/theme';

const TABS = [
  { id: 'checkin', label: 'Checkin' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'conciliation', label: 'Conciliacao' },
  { id: 'laudo', label: 'Laudo' },
  { id: 'general', label: 'Geral' },
  { id: 'api', label: 'API' },
  { id: 'custos', label: 'Custos' },
  { id: 'motoristas', label: 'Motoristas' },
];

// Pricing per 1M tokens (USD) — updated March 2026
const AI_PRICING = {
  'gemini-2.5-pro': { input: 1.25, output: 10.00, input_image: 1.25, label: 'Gemini 2.5 Pro' },
  'gemini-2.0-flash': { input: 0.10, output: 0.40, input_image: 0.10, label: 'Gemini 2.0 Flash' },
  'gpt-4o': { input: 2.50, output: 10.00, input_image: 2.50, label: 'GPT-4o' },
  'gpt-4o-mini': { input: 0.15, output: 0.60, input_image: 0.15, label: 'GPT-4o Mini' },
};
const USD_TO_BRL = 5.80; // approximate

// ============================================
// STYLED COMPONENTS
// ============================================
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${colors.backgroundAlt};
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

const Logo = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TabBar = styled.div`
  display: flex;
  background: #fff;
  border-bottom: 1px solid ${colors.border};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button`
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid ${p => p.$active ? colors.primary : 'transparent'};
  color: ${p => p.$active ? colors.primary : colors.textSecondary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  &:hover { color: ${colors.primary}; }
`;

const Content = styled.main`
  padding: 20px 16px;
  max-width: 700px;
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease;
`;

const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 24px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${colors.border};
  &:first-child { margin-top: 0; }
`;

const FieldGroup = styled.div`
  margin-bottom: 16px;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin-bottom: 4px;
`;

const FieldHint = styled.div`
  font-size: 11px;
  color: ${colors.textSecondary};
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  background: #fff;
  &:focus { border-color: ${colors.primary}; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  background: #fff;
  font-family: 'Courier New', monospace;
  min-height: 120px;
  resize: vertical;
  &:focus { border-color: ${colors.primary}; }
`;

const PromptDefault = styled.div`
  background: #f8fafc;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: #64748b;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  line-height: 1.5;
  margin-bottom: 8px;
`;

const PromptOverrideToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px dashed ${colors.border};
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  color: ${colors.primary};
  cursor: pointer;
  margin-bottom: 8px;
  &:hover { background: #f0f9ff; }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
  &:focus { border-color: ${colors.primary}; }
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Slider = styled.input`
  flex: 1;
  accent-color: ${colors.primary};
`;

const SliderValue = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${colors.primary};
  min-width: 40px;
  text-align: right;
`;

const Toggle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  .switch {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: ${p => p.$on ? colors.primary : '#d1d5db'};
    position: relative;
    transition: background 0.2s;
    &::after {
      content: '';
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      position: absolute;
      top: 2px;
      left: ${p => p.$on ? '22px' : '2px'};
      transition: left 0.2s;
    }
  }
  .label { font-size: 13px; color: ${colors.textPrimary}; }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: ${colors.backgroundAlt};
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 12px;
  .remove {
    cursor: pointer;
    color: ${colors.danger};
    font-weight: 700;
  }
`;

const AddTagRow = styled.div`
  display: flex;
  gap: 8px;
  input { flex: 1; }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid ${colors.border};
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  background: ${p => p.$variant === 'outline' ? 'transparent' : p.$danger ? colors.danger : colors.primary};
  color: ${p => p.$variant === 'outline' ? colors.textSecondary : '#fff'};
  border: ${p => p.$variant === 'outline' ? `1px solid ${colors.border}` : 'none'};
  opacity: ${p => p.disabled ? 0.5 : 1};
  &:active { transform: scale(0.98); }
`;

const AuditFooter = styled.div`
  font-size: 11px;
  color: ${colors.textLight};
  text-align: center;
  margin-top: 12px;
  padding: 8px 0;
`;

const Toast = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: ${p => p.$error ? colors.danger : colors.success};
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: ${colors.primary};
  svg { font-size: 32px; animation: ${spin} 1s linear infinite; }
`;

const ApiEndpoint = styled.div`
  background: #1e293b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  .method { color: #10b981; font-weight: 700; font-size: 12px; }
  .url { color: #e2e8f0; font-size: 13px; font-family: 'Courier New', monospace; word-break: break-all; }
  .desc { color: #94a3b8; font-size: 11px; margin-top: 4px; }
`;

const ApiKeyDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: ${colors.backgroundAlt};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  .key { flex: 1; overflow: hidden; text-overflow: ellipsis; }
  button {
    background: none;
    border: none;
    color: ${colors.primary};
    cursor: pointer;
    font-size: 14px;
    padding: 4px;
  }
`;

// ============================================
// DEFAULT PROMPTS (espelho do que está hardcoded nas Edge Functions)
// ============================================
const DEFAULT_PROMPTS = {
  checkin: `Voce e um sistema de inspecao veicular por visao computacional para transportadoras.
Estas imagens sao FRAMES extraidos de um VIDEO de varredura do veiculo filmado pelo operador.

ANALISE TODOS OS FRAMES E RETORNE UM UNICO JSON CONSOLIDADO:

1. PLACA (OCR):
   - text: string da placa (formato antigo ABC-1234 ou Mercosul ABC1D23) ou null
   - confidence: 0.0 a 1.0
   - status: "OK" se leu com confianca >= 0.8, "INCONCLUSIVO" se abaixo ou nao visivel

2. CHECKLIST DE INTEGRIDADE (avaliar o que for visivel nos frames):
   Para cada item retorne status "OK", "NAO_OK" ou "INCONCLUSIVO":
   - carroceria, assoalho, pneus, lanternas, parabrisa
   Cada item deve ter: status + evidence + confidence + bbox

3. VALIDACAO DO VEICULO:
   - vehicle_consistent: "APROVADO" / "REPROVADO" / "INCONCLUSIVO"

4. ASSINATURA VISUAL:
   - cor_predominante, tipo_implemento, eixos, adesivos_logotipos, marcas_permanentes

Retorne APENAS JSON estruturado.`,

  checkout: `Analise as fotos do veiculo carregado e retorne JSON com:

1. CARGA (RF-05/RF-06):
   - detected: true/false
   - type: classe da carga (Paletizada, Granel, Volumes, etc.)
   - confidence: 0.0 a 1.0
   - evidence: descricao do que observou

2. DETALHES POR FOTO:
   - Para cada foto: elementos visiveis, qualidade, observacoes

3. CONCILIACAO (RF-04):
   - Comparar assinatura visual do checkin com fotos do checkout
   - status: "MESMO" / "PROVAVEL" / "NAO" / "INCONCLUSIVO"

Retorne APENAS JSON estruturado.`,

  conciliation: `Compare as assinaturas visuais entre o video do checkin e as fotos do checkout.

Avalie: cor predominante, tipo de implemento, numero de eixos, marcas visuais, adesivos.

Retorne JSON com:
- status: "MESMO" / "PROVAVEL" / "NAO" / "INCONCLUSIVO"
- confidence: 0.0 a 1.0
- evidence: justificativa da decisao
- matches: lista de criterios que correspondem
- mismatches: lista de criterios divergentes`,
};

// ============================================
// PROMPT FIELD COMPONENT
// ============================================
function PromptField({ configKey, label, defaultPrompt, getStringVal, setVal }) {
  const [showOverride, setShowOverride] = useState(false);
  const customValue = getStringVal(configKey, '');
  const hasCustom = customValue.length > 0;

  return (
    <FieldGroup>
      <FieldLabel>{label}</FieldLabel>
      <FieldHint>Prompt padrao (read-only) — usado quando o campo customizado esta vazio</FieldHint>
      <PromptDefault>{defaultPrompt}</PromptDefault>
      {!showOverride && !hasCustom ? (
        <PromptOverrideToggle onClick={() => setShowOverride(true)}>
          ✏️ Personalizar prompt
        </PromptOverrideToggle>
      ) : (
        <>
          <FieldHint style={{ marginTop: 8 }}>
            Prompt customizado {hasCustom ? '(ativo — sobrescreve o padrao)' : '(vazio = usa o padrao acima)'}
          </FieldHint>
          <TextArea
            value={customValue}
            onChange={e => setVal(configKey, e.target.value)}
            placeholder="Deixe vazio para usar o prompt padrao..."
            style={{ borderColor: hasCustom ? '#f59e0b' : undefined }}
          />
          {hasCustom && (
            <PromptOverrideToggle onClick={() => { setVal(configKey, ''); setShowOverride(false); }}>
              🔄 Restaurar prompt padrao
            </PromptOverrideToggle>
          )}
        </>
      )}
    </FieldGroup>
  );
}

// ============================================
// COMPONENT
// ============================================
export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'checkin';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [config, setConfig] = useState({});
  const [originalConfig, setOriginalConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [costData, setCostData] = useState(null);
  const [costLoading, setCostLoading] = useState(false);
  const [driversData, setDriversData] = useState({ clients: [], drivers: [] });
  const [driversLoading, setDriversLoading] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', cpf: '', phone: '' });
  const [selectedClientId, setSelectedClientId] = useState('');
  const [savingDriver, setSavingDriver] = useState(false);

  useEffect(() => {
    document.title = 'VistorIA - Configuracoes';
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', url);
  }, [activeTab]);

  // Fetch all config
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vistoria_config')
          .select('config_key, config_value, updated_at, updated_by');

        if (error) throw error;

        const configMap = {};
        (data || []).forEach(row => {
          configMap[row.config_key] = {
            value: row.config_value,
            updated_at: row.updated_at,
            updated_by: row.updated_by,
          };
        });
        setConfig(configMap);
        setOriginalConfig(JSON.parse(JSON.stringify(configMap)));
      } catch (err) {
        console.error('[Settings] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch cost data for Custos tab
  useEffect(() => {
    if (activeTab !== 'custos') return;
    (async () => {
      setCostLoading(true);
      try {
        const { data } = await supabase
          .from('vistoria_inspections')
          .select('id, status, model_used, ai_usage, processing_time_ms, checkin_at, checkout_at, checkin_data, checkout_data')
          .order('created_at', { ascending: false })
          .limit(100);
        setCostData(data || []);
      } catch (e) {
        console.error('Cost fetch error:', e);
      } finally {
        setCostLoading(false);
      }
    })();
  }, [activeTab]);

  // Fetch drivers data for Motoristas tab
  useEffect(() => {
    if (activeTab !== 'motoristas') return;
    (async () => {
      setDriversLoading(true);
      try {
        const [{ data: clients }, { data: drivers }] = await Promise.all([
          supabase.from('vistoria_clients').select('id, name').eq('is_active', true).order('name'),
          supabase.from('vistoria_drivers').select('id, client_id, name, cpf, phone, license_number, license_category, is_active').order('name'),
        ]);
        setDriversData({ clients: clients || [], drivers: drivers || [] });
        if (!selectedClientId && clients?.length > 0) setSelectedClientId(clients[0].id);
      } catch (e) {
        console.error('Drivers fetch error:', e);
      } finally {
        setDriversLoading(false);
      }
    })();
  }, [activeTab]);

  // Helper to get/set config values
  const getVal = (key, defaultVal = '') => {
    const entry = config[key];
    if (!entry) return defaultVal;
    const v = entry.value;
    if (v === null || v === undefined) return defaultVal;
    if (typeof v === 'object') return v;
    return v;
  };

  const setVal = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  const getNumVal = (key, defaultVal = 0) => {
    const v = getVal(key, defaultVal);
    return typeof v === 'number' ? v : Number(v) || defaultVal;
  };

  const getBoolVal = (key, defaultVal = false) => {
    const v = getVal(key, defaultVal);
    return v === true || v === 'true';
  };

  const getArrayVal = (key, defaultVal = []) => {
    const v = getVal(key, defaultVal);
    return Array.isArray(v) ? v : defaultVal;
  };

  const getStringVal = (key, defaultVal = '') => {
    const v = getVal(key, defaultVal);
    return typeof v === 'string' ? v : String(v || defaultVal);
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      // Find changed keys
      const changedKeys = Object.keys(config).filter(key => {
        const curr = JSON.stringify(config[key]?.value);
        const orig = JSON.stringify(originalConfig[key]?.value);
        return curr !== orig;
      });

      if (changedKeys.length === 0) {
        showToast('Nenhuma alteracao detectada');
        setSaving(false);
        return;
      }

      // Upsert changed configs
      const upserts = changedKeys.map(key => ({
        config_key: key,
        config_value: config[key].value,
        updated_by: user?.email || 'unknown',
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('vistoria_config')
        .upsert(upserts, { onConflict: 'config_key' });

      if (error) throw error;

      // Log config change
      await supabase.from('vistoria_logs').insert({
        event_type: 'config_changed',
        actor_name: user?.email,
        details: { changed_keys: changedKeys, tab: activeTab },
      });

      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      showToast('Configuracoes salvas!');
    } catch (err) {
      console.error('[Settings] Save error:', err);
      showToast('Erro ao salvar', true);
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = () => {
    setConfig(JSON.parse(JSON.stringify(originalConfig)));
    showToast('Valores restaurados');
  };

  const showToast = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  const addTag = (key) => {
    if (!newTagInput.trim()) return;
    const arr = getArrayVal(key);
    if (!arr.includes(newTagInput.trim())) {
      setVal(key, [...arr, newTagInput.trim()]);
    }
    setNewTagInput('');
  };

  const removeTag = (key, idx) => {
    const arr = getArrayVal(key);
    setVal(key, arr.filter((_, i) => i !== idx));
  };

  const getLastUpdate = (prefix) => {
    const keys = Object.keys(config).filter(k => k.startsWith(prefix));
    let latest = null;
    let latestBy = null;
    keys.forEach(k => {
      if (config[k]?.updated_at && (!latest || config[k].updated_at > latest)) {
        latest = config[k].updated_at;
        latestBy = config[k].updated_by;
      }
    });
    if (!latest) return '';
    return `Ultima alteracao: ${latestBy || 'desconhecido'} | ${new Date(latest).toLocaleString('pt-BR')}`;
  };

  // ============================================
  // TAB RENDERERS
  // ============================================
  const renderCheckinTab = () => (
    <>
      <SectionLabel>RF-01: Leitura de Placa (OCR)</SectionLabel>
      <FieldGroup>
        <FieldLabel>Confianca minima para aceitar placa</FieldLabel>
        <FieldHint>Abaixo desse valor → INCONCLUSIVO + recaptura</FieldHint>
        <SliderRow>
          <Slider type="range" min={50} max={100} value={getNumVal('checkin_plate_confidence', 80)} onChange={e => setVal('checkin_plate_confidence', Number(e.target.value))} />
          <SliderValue>{getNumVal('checkin_plate_confidence', 80)}%</SliderValue>
        </SliderRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Tentativas de recaptura</FieldLabel>
        <Input type="number" min={0} max={10} value={getNumVal('checkin_recapture_attempts', 2)} onChange={e => setVal('checkin_recapture_attempts', Number(e.target.value))} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Permitir checkin sem placa?</FieldLabel>
        <Toggle $on={getBoolVal('checkin_allow_no_plate')} onClick={() => setVal('checkin_allow_no_plate', !getBoolVal('checkin_allow_no_plate'))}>
          <div className="switch" />
          <span className="label">{getBoolVal('checkin_allow_no_plate') ? 'SIM' : 'NAO'}</span>
        </Toggle>
      </FieldGroup>

      <SectionLabel>RF-02: Validacao do Video</SectionLabel>
      <FieldGroup>
        <FieldLabel>Duracao minima do video (s)</FieldLabel>
        <Input type="number" min={5} max={120} value={getNumVal('checkin_video_min_duration', 10)} onChange={e => setVal('checkin_video_min_duration', Number(e.target.value))} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Duracao maxima do video (s)</FieldLabel>
        <Input type="number" min={10} max={300} value={getNumVal('checkin_video_max_duration', 60)} onChange={e => setVal('checkin_video_max_duration', Number(e.target.value))} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Quantidade de frames extraidos</FieldLabel>
        <Input type="number" min={3} max={20} value={getNumVal('checkin_num_frames', 8)} onChange={e => setVal('checkin_num_frames', Number(e.target.value))} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Confianca minima validacao video</FieldLabel>
        <SliderRow>
          <Slider type="range" min={50} max={100} value={getNumVal('checkin_video_confidence', 70)} onChange={e => setVal('checkin_video_confidence', Number(e.target.value))} />
          <SliderValue>{getNumVal('checkin_video_confidence', 70)}%</SliderValue>
        </SliderRow>
      </FieldGroup>

      <SectionLabel>RF-03: Checklist de Integridade</SectionLabel>
      <FieldGroup>
        <FieldLabel>Itens do checklist</FieldLabel>
        <TagList>
          {getArrayVal('checkin_checklist_items', ['carroceria', 'assoalho', 'pneus', 'lanternas', 'parabrisa']).map((item, i) => (
            <Tag key={i}>{item} <span className="remove" role="button" tabIndex={0} aria-label="Remover item" onClick={() => removeTag('checkin_checklist_items', i)} onKeyDown={e => e.key === 'Enter' && removeTag('checkin_checklist_items', i)}>x</span></Tag>
          ))}
        </TagList>
        <AddTagRow>
          <Input value={newTagInput} onChange={e => setNewTagInput(e.target.value)} placeholder="Adicionar item" onKeyDown={e => e.key === 'Enter' && addTag('checkin_checklist_items')} />
          <Button style={{ flex: 0, padding: '10px 16px' }} onClick={() => addTag('checkin_checklist_items')}>+</Button>
        </AddTagRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Confianca minima por item</FieldLabel>
        <SliderRow>
          <Slider type="range" min={50} max={100} value={getNumVal('checkin_item_confidence', 70)} onChange={e => setVal('checkin_item_confidence', Number(e.target.value))} />
          <SliderValue>{getNumVal('checkin_item_confidence', 70)}%</SliderValue>
        </SliderRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Minimo de itens OK para aprovar</FieldLabel>
        <Input type="number" min={1} max={10} value={getNumVal('checkin_min_ok_items', 3)} onChange={e => setVal('checkin_min_ok_items', Number(e.target.value))} />
      </FieldGroup>

      <PromptField configKey="checkin_prompt" label="Prompt do Checkin" defaultPrompt={DEFAULT_PROMPTS.checkin} getStringVal={getStringVal} setVal={setVal} />
    </>
  );

  const renderCheckoutTab = () => (
    <>
      <SectionLabel>RF-05: Deteccao de Carga</SectionLabel>
      <FieldGroup>
        <FieldLabel>Confianca minima deteccao carga</FieldLabel>
        <SliderRow>
          <Slider type="range" min={50} max={100} value={getNumVal('checkout_cargo_confidence', 70)} onChange={e => setVal('checkout_cargo_confidence', Number(e.target.value))} />
          <SliderValue>{getNumVal('checkout_cargo_confidence', 70)}%</SliderValue>
        </SliderRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Minimo de fotos</FieldLabel>
        <Input type="number" min={1} max={20} value={getNumVal('checkout_min_photos', 3)} onChange={e => setVal('checkout_min_photos', Number(e.target.value))} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Maximo de fotos</FieldLabel>
        <Input type="number" min={3} max={50} value={getNumVal('checkout_max_photos', 20)} onChange={e => setVal('checkout_max_photos', Number(e.target.value))} />
      </FieldGroup>

      <SectionLabel>RF-06: Classificacao de Carga</SectionLabel>
      <FieldGroup>
        <FieldLabel>Confianca minima classificacao</FieldLabel>
        <SliderRow>
          <Slider type="range" min={50} max={100} value={getNumVal('checkout_classification_confidence', 70)} onChange={e => setVal('checkout_classification_confidence', Number(e.target.value))} />
          <SliderValue>{getNumVal('checkout_classification_confidence', 70)}%</SliderValue>
        </SliderRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Taxonomia de carga</FieldLabel>
        <TagList>
          {getArrayVal('checkout_cargo_taxonomy', ['Paletizada', 'Granel Solido', 'Granel Liquido', 'Volumes Avulsos', 'Carga Viva', 'Frigorificada', 'Container', 'Veiculos', 'Perigosa', 'Vazio']).map((item, i) => (
            <Tag key={i}>{item} <span className="remove" role="button" tabIndex={0} aria-label="Remover item" onClick={() => removeTag('checkout_cargo_taxonomy', i)} onKeyDown={e => e.key === 'Enter' && removeTag('checkout_cargo_taxonomy', i)}>x</span></Tag>
          ))}
        </TagList>
        <AddTagRow>
          <Input value={newTagInput} onChange={e => setNewTagInput(e.target.value)} placeholder="Adicionar classe" onKeyDown={e => e.key === 'Enter' && addTag('checkout_cargo_taxonomy')} />
          <Button style={{ flex: 0, padding: '10px 16px' }} onClick={() => addTag('checkout_cargo_taxonomy')}>+</Button>
        </AddTagRow>
      </FieldGroup>

      <PromptField configKey="checkout_prompt" label="Prompt do Checkout" defaultPrompt={DEFAULT_PROMPTS.checkout} getStringVal={getStringVal} setVal={setVal} />
    </>
  );

  const renderConciliationTab = () => (
    <>
      <SectionLabel>RF-04: Conciliacao Visual</SectionLabel>
      <FieldGroup>
        <FieldLabel>Confianca para MESMO VEICULO</FieldLabel>
        <SliderRow>
          <Slider type="range" min={50} max={100} value={getNumVal('conciliation_same_confidence', 85)} onChange={e => setVal('conciliation_same_confidence', Number(e.target.value))} />
          <SliderValue>{getNumVal('conciliation_same_confidence', 85)}%</SliderValue>
        </SliderRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Confianca para PROVAVEL</FieldLabel>
        <SliderRow>
          <Slider type="range" min={30} max={90} value={getNumVal('conciliation_probable_confidence', 60)} onChange={e => setVal('conciliation_probable_confidence', Number(e.target.value))} />
          <SliderValue>{getNumVal('conciliation_probable_confidence', 60)}%</SliderValue>
        </SliderRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Assinaturas visuais comparadas</FieldLabel>
        <TagList>
          {getArrayVal('conciliation_visual_signatures', ['cor', 'tipo_veiculo', 'num_eixos', 'marca_logo', 'adesivos']).map((item, i) => (
            <Tag key={i}>{item} <span className="remove" role="button" tabIndex={0} aria-label="Remover item" onClick={() => removeTag('conciliation_visual_signatures', i)} onKeyDown={e => e.key === 'Enter' && removeTag('conciliation_visual_signatures', i)}>x</span></Tag>
          ))}
        </TagList>
        <AddTagRow>
          <Input value={newTagInput} onChange={e => setNewTagInput(e.target.value)} placeholder="Adicionar assinatura" onKeyDown={e => e.key === 'Enter' && addTag('conciliation_visual_signatures')} />
          <Button style={{ flex: 0, padding: '10px 16px' }} onClick={() => addTag('conciliation_visual_signatures')}>+</Button>
        </AddTagRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Bloquear checkout se conciliacao = NAO?</FieldLabel>
        <Toggle $on={getBoolVal('conciliation_block_on_mismatch', true)} onClick={() => setVal('conciliation_block_on_mismatch', !getBoolVal('conciliation_block_on_mismatch', true))}>
          <div className="switch" />
          <span className="label">{getBoolVal('conciliation_block_on_mismatch', true) ? 'SIM' : 'NAO'}</span>
        </Toggle>
      </FieldGroup>

      <PromptField configKey="conciliation_prompt" label="Prompt de Conciliacao" defaultPrompt={DEFAULT_PROMPTS.conciliation} getStringVal={getStringVal} setVal={setVal} />
    </>
  );

  const renderLaudoTab = () => (
    <>
      <SectionLabel>Veredicto Final</SectionLabel>
      <FieldGroup>
        <FieldLabel>Score minimo para APROVADO</FieldLabel>
        <SliderRow>
          <Slider type="range" min={0} max={100} value={getNumVal('laudo_approved_threshold', 70)} onChange={e => setVal('laudo_approved_threshold', Number(e.target.value))} />
          <SliderValue>{getNumVal('laudo_approved_threshold', 70)}</SliderValue>
        </SliderRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Score minimo para INCONCLUSIVO (abaixo = REPROVADO)</FieldLabel>
        <SliderRow>
          <Slider type="range" min={0} max={100} value={getNumVal('laudo_inconclusive_threshold', 40)} onChange={e => setVal('laudo_inconclusive_threshold', Number(e.target.value))} />
          <SliderValue>{getNumVal('laudo_inconclusive_threshold', 40)}</SliderValue>
        </SliderRow>
      </FieldGroup>

      <SectionLabel>Pesos por RF no Score</SectionLabel>
      {[
        { key: 'laudo_weight_rf01', label: 'RF-01 Placa', def: 15 },
        { key: 'laudo_weight_rf02', label: 'RF-02 Validacao', def: 10 },
        { key: 'laudo_weight_rf03', label: 'RF-03 Checklist', def: 30 },
        { key: 'laudo_weight_rf04', label: 'RF-04 Conciliacao', def: 20 },
        { key: 'laudo_weight_rf05', label: 'RF-05 Carga', def: 15 },
        { key: 'laudo_weight_rf06', label: 'RF-06 Classificacao', def: 10 },
      ].map(rf => (
        <FieldGroup key={rf.key}>
          <FieldLabel>{rf.label}</FieldLabel>
          <SliderRow>
            <Slider type="range" min={0} max={50} value={getNumVal(rf.key, rf.def)} onChange={e => setVal(rf.key, Number(e.target.value))} />
            <SliderValue>{getNumVal(rf.key, rf.def)}%</SliderValue>
          </SliderRow>
        </FieldGroup>
      ))}

      <SectionLabel>Expiracao</SectionLabel>
      <FieldGroup>
        <FieldLabel>Tempo maximo entre checkin e checkout (horas)</FieldLabel>
        <Input type="number" min={1} max={168} value={getNumVal('laudo_expiration_hours', 24)} onChange={e => setVal('laudo_expiration_hours', Number(e.target.value))} />
      </FieldGroup>

      <SectionLabel>Evidencias (RF-07 / RNF-03)</SectionLabel>
      <FieldGroup>
        <FieldLabel>Persistir frames/fotos no Storage?</FieldLabel>
        <Toggle $on={getBoolVal('laudo_persist_storage', true)} onClick={() => setVal('laudo_persist_storage', !getBoolVal('laudo_persist_storage', true))}>
          <div className="switch" />
          <span className="label">{getBoolVal('laudo_persist_storage', true) ? 'SIM' : 'NAO'}</span>
        </Toggle>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Retencao de evidencias (dias)</FieldLabel>
        <FieldHint>0 = indefinido</FieldHint>
        <Input type="number" min={0} max={365} value={getNumVal('laudo_retention_days', 90)} onChange={e => setVal('laudo_retention_days', Number(e.target.value))} />
      </FieldGroup>
    </>
  );

  const renderGeneralTab = () => (
    <>
      <SectionLabel>Operacao</SectionLabel>
      <FieldGroup>
        <FieldLabel>CDs cadastrados</FieldLabel>
        <TagList>
          {getArrayVal('general_cds', ['CD Sao Paulo', 'CD Campinas']).map((cd, i) => (
            <Tag key={i}>{cd} <span className="remove" role="button" tabIndex={0} aria-label="Remover item" onClick={() => removeTag('general_cds', i)} onKeyDown={e => e.key === 'Enter' && removeTag('general_cds', i)}>x</span></Tag>
          ))}
        </TagList>
        <AddTagRow>
          <Input value={newTagInput} onChange={e => setNewTagInput(e.target.value)} placeholder="Adicionar CD" onKeyDown={e => e.key === 'Enter' && addTag('general_cds')} />
          <Button style={{ flex: 0, padding: '10px 16px' }} onClick={() => addTag('general_cds')}>+</Button>
        </AddTagRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Tipos de veiculo</FieldLabel>
        <TagList>
          {getArrayVal('general_vehicle_types', ['Carreta', 'Truck', 'Toco', 'VUC', 'Bitrem', 'Van']).map((t, i) => (
            <Tag key={i}>{t} <span className="remove" role="button" tabIndex={0} aria-label="Remover item" onClick={() => removeTag('general_vehicle_types', i)} onKeyDown={e => e.key === 'Enter' && removeTag('general_vehicle_types', i)}>x</span></Tag>
          ))}
        </TagList>
        <AddTagRow>
          <Input value={newTagInput} onChange={e => setNewTagInput(e.target.value)} placeholder="Adicionar tipo" onKeyDown={e => e.key === 'Enter' && addTag('general_vehicle_types')} />
          <Button style={{ flex: 0, padding: '10px 16px' }} onClick={() => addTag('general_vehicle_types')}>+</Button>
        </AddTagRow>
      </FieldGroup>

      <SectionLabel>Modelo de IA</SectionLabel>
      <FieldGroup>
        <FieldLabel>Provider primario</FieldLabel>
        <Select value={getStringVal('general_primary_provider', 'gemini')} onChange={e => setVal('general_primary_provider', e.target.value)}>
          <option value="gemini">Google Gemini</option>
          <option value="openai">OpenAI</option>
        </Select>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Provider fallback</FieldLabel>
        <Select value={getStringVal('general_fallback_provider', 'openai')} onChange={e => setVal('general_fallback_provider', e.target.value)}>
          <option value="openai">OpenAI</option>
          <option value="gemini">Google Gemini</option>
          <option value="none">Nenhum</option>
        </Select>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Temperature</FieldLabel>
        <SliderRow>
          <Slider type="range" min={0} max={100} value={getNumVal('general_temperature', 20)} onChange={e => setVal('general_temperature', Number(e.target.value))} />
          <SliderValue>{(getNumVal('general_temperature', 20) / 100).toFixed(2)}</SliderValue>
        </SliderRow>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Max Tokens</FieldLabel>
        <Input type="number" min={500} max={10000} value={getNumVal('general_max_tokens', 4000)} onChange={e => setVal('general_max_tokens', Number(e.target.value))} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Solicitar bounding box?</FieldLabel>
        <Toggle $on={getBoolVal('general_request_bbox', true)} onClick={() => setVal('general_request_bbox', !getBoolVal('general_request_bbox', true))}>
          <div className="switch" />
          <span className="label">{getBoolVal('general_request_bbox', true) ? 'SIM' : 'NAO'}</span>
        </Toggle>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Logica de "aplicavel"?</FieldLabel>
        <Toggle $on={getBoolVal('general_applicable_logic', true)} onClick={() => setVal('general_applicable_logic', !getBoolVal('general_applicable_logic', true))}>
          <div className="switch" />
          <span className="label">{getBoolVal('general_applicable_logic', true) ? 'SIM' : 'NAO'}</span>
        </Toggle>
      </FieldGroup>

      <SectionLabel>Logs (RNF-02)</SectionLabel>
      <FieldGroup>
        <FieldLabel>Nivel de log</FieldLabel>
        <Select value={getStringVal('general_log_level', 'normal')} onChange={e => setVal('general_log_level', e.target.value)}>
          <option value="minimal">Minimal</option>
          <option value="normal">Normal</option>
          <option value="detailed">Detailed (salva prompts + respostas raw)</option>
        </Select>
      </FieldGroup>

      <SectionLabel>Notificacoes</SectionLabel>
      <FieldGroup>
        <FieldLabel>Notificar gestor em caso de REPROVADO?</FieldLabel>
        <Toggle $on={getBoolVal('general_notify_rejected', true)} onClick={() => setVal('general_notify_rejected', !getBoolVal('general_notify_rejected', true))}>
          <div className="switch" />
          <span className="label">{getBoolVal('general_notify_rejected', true) ? 'SIM' : 'NAO'}</span>
        </Toggle>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Notificar se conciliacao = NAO?</FieldLabel>
        <Toggle $on={getBoolVal('general_notify_mismatch', true)} onClick={() => setVal('general_notify_mismatch', !getBoolVal('general_notify_mismatch', true))}>
          <div className="switch" />
          <span className="label">{getBoolVal('general_notify_mismatch', true) ? 'SIM' : 'NAO'}</span>
        </Toggle>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Email do gestor</FieldLabel>
        <Input type="email" value={getStringVal('general_gestor_email', '')} onChange={e => setVal('general_gestor_email', e.target.value)} placeholder="gestor@empresa.com.br" />
      </FieldGroup>
    </>
  );

  const renderApiTab = () => (
    <>
      <SectionLabel>Endpoints da API</SectionLabel>
      <ApiEndpoint>
        <div className="method">GET</div>
        <div className="url">/functions/v1/vistoria-api/inspections/:id</div>
        <div className="desc">Retorna laudo completo de uma inspecao</div>
      </ApiEndpoint>
      <ApiEndpoint>
        <div className="method">GET</div>
        <div className="url">/functions/v1/vistoria-api/inspections?placa=X&status=Y&cd=Z</div>
        <div className="desc">Lista inspecoes com filtros</div>
      </ApiEndpoint>
      <ApiEndpoint>
        <div className="method">GET</div>
        <div className="url">/functions/v1/vistoria-api/health</div>
        <div className="desc">Health check do servico</div>
      </ApiEndpoint>

      <SectionLabel>API Key</SectionLabel>
      <FieldGroup>
        <FieldLabel>Chave de acesso (header: x-api-key)</FieldLabel>
        <FieldHint>Service: vistoria_tms na tabela api_keys</FieldHint>
        <ApiKeyDisplay>
          <span className="key">{getStringVal('api_key_preview', 'vst-••••••••••••')}</span>
          <button onClick={() => { navigator.clipboard.writeText(getStringVal('api_key_preview', '')); showToast('Copiado!'); }} title="Copiar">
            <FaCopy />
          </button>
        </ApiKeyDisplay>
      </FieldGroup>

      <SectionLabel>Campos Retornados</SectionLabel>
      <FieldGroup>
        <FieldLabel>Selecione os campos incluidos na resposta da API</FieldLabel>
        {['placa', 'verdict', 'score', 'checklist', 'cargo_type', 'conciliation', 'rf_details', 'meta', 'timeline'].map(field => (
          <Toggle
            key={field}
            $on={getArrayVal('api_response_fields', ['placa', 'verdict', 'score', 'checklist', 'cargo_type', 'conciliation']).includes(field)}
            onClick={() => {
              const fields = getArrayVal('api_response_fields', ['placa', 'verdict', 'score', 'checklist', 'cargo_type', 'conciliation']);
              if (fields.includes(field)) {
                setVal('api_response_fields', fields.filter(f => f !== field));
              } else {
                setVal('api_response_fields', [...fields, field]);
              }
            }}
            style={{ marginBottom: 8 }}
          >
            <div className="switch" />
            <span className="label">{field}</span>
          </Toggle>
        ))}
      </FieldGroup>

      <SectionLabel>Mapeamento de Campos</SectionLabel>
      <FieldGroup>
        <FieldLabel>Campo VistorIA → Campo TMS/ERP</FieldLabel>
        <FieldHint>JSON com mapeamento customizado</FieldHint>
        <TextArea
          value={typeof getVal('api_field_mapping', {}) === 'object' ? JSON.stringify(getVal('api_field_mapping', {}), null, 2) : getStringVal('api_field_mapping', '{}')}
          onChange={e => {
            try { setVal('api_field_mapping', JSON.parse(e.target.value)); } catch (err) { /* invalid json, keep as string */ }
          }}
          placeholder='{"placa": "license_plate", "verdict": "status"}'
          style={{ minHeight: 80 }}
        />
      </FieldGroup>
    </>
  );

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}><FaArrowLeft /> Voltar</BackButton>
          <Logo><FaCog /> Configuracoes</Logo>
          <div style={{ width: 60 }} />
        </Header>
        <LoadingOverlay><FaSpinner /></LoadingOverlay>
      </Container>
    );
  }

  // ---- Custos Tab ----
  const calcCostUSD = (usage) => {
    if (!usage) return 0;
    const model = usage.model || 'gemini-2.5-pro';
    const pricing = AI_PRICING[model] || AI_PRICING['gemini-2.5-pro'];
    const inputCost = ((usage.prompt_tokens || 0) / 1_000_000) * pricing.input;
    const outputCost = ((usage.completion_tokens || 0) / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  };

  const calcInspectionCost = (inspection) => {
    const usage = inspection.ai_usage;
    if (!usage) return { checkin: 0, checkout: 0, total: 0 };

    // Checkin: ai_usage is stored at checkin time (flat: provider, model, prompt_tokens...)
    // Checkout: ai_usage is stored at checkout time (has cargo + conciliation sub-objects)
    let checkinUSD = 0;
    let checkoutUSD = 0;

    if (usage.provider && usage.prompt_tokens) {
      // This is a checkin-only record
      checkinUSD = calcCostUSD(usage);
    }
    if (usage.cargo) {
      checkoutUSD += calcCostUSD(usage.cargo);
    }
    if (usage.conciliation) {
      checkoutUSD += calcCostUSD(usage.conciliation);
    }
    if (usage.total_tokens && !usage.provider) {
      // Checkout combined — estimate from totals using cargo model
      const model = usage.cargo?.model || 'gemini-2.5-pro';
      const pricing = AI_PRICING[model] || AI_PRICING['gemini-2.5-pro'];
      checkoutUSD = ((usage.total_prompt_tokens || 0) / 1_000_000) * pricing.input +
                    ((usage.total_completion_tokens || 0) / 1_000_000) * pricing.output;
    }

    return {
      checkin: checkinUSD,
      checkout: checkoutUSD,
      total: checkinUSD + checkoutUSD,
    };
  };

  const renderCustosTab = () => {
    if (costLoading) {
      return (
        <FieldGroup>
          <FieldLabel>Carregando dados de custo...</FieldLabel>
        </FieldGroup>
      );
    }

    const inspections = costData || [];
    const withUsage = inspections.filter(i => i.ai_usage);
    const withoutUsage = inspections.length - withUsage.length;

    let totalCheckinUSD = 0;
    let totalCheckoutUSD = 0;
    let totalTokens = 0;
    let completedCount = 0;

    const rows = withUsage.map(i => {
      const cost = calcInspectionCost(i);
      totalCheckinUSD += cost.checkin;
      totalCheckoutUSD += cost.checkout;
      if (i.status === 'completa') completedCount++;

      const usage = i.ai_usage;
      const tokens = usage.total_tokens || (usage.prompt_tokens || 0) + (usage.completion_tokens || 0) || 0;
      totalTokens += tokens;

      return { ...i, cost, tokens };
    });

    const totalUSD = totalCheckinUSD + totalCheckoutUSD;
    const totalBRL = totalUSD * USD_TO_BRL;
    const avgCostBRL = withUsage.length > 0 ? totalBRL / withUsage.length : 0;

    // Estimate per complete inspection (checkin + checkout)
    const avgCheckinBRL = withUsage.length > 0 ? (totalCheckinUSD * USD_TO_BRL) / withUsage.length : 0;
    const avgCheckoutBRL = completedCount > 0 ? (totalCheckoutUSD * USD_TO_BRL) / completedCount : 0;
    const avgCompleteBRL = avgCheckinBRL + avgCheckoutBRL;

    // Current model
    const currentModel = getVal('general_primary_model', 'gemini-2.5-pro');
    const currentPricing = AI_PRICING[currentModel] || AI_PRICING['gemini-2.5-pro'];

    return (
      <>
        <SectionLabel>Modelo Atual</SectionLabel>
        <FieldGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>Modelo</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0369a1' }}>{currentPricing.label || currentModel}</div>
            </div>
            <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>Cambio</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0369a1' }}>US$ 1 = R$ {USD_TO_BRL.toFixed(2)}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Input: US$ {currentPricing.input}/1M tokens | Output: US$ {currentPricing.output}/1M tokens
          </div>
        </FieldGroup>

        <SectionLabel>Custo por Etapa (media)</SectionLabel>
        <FieldGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>Checkin</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0ea5e9' }}>R$ {avgCheckinBRL.toFixed(2)}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>video → 40 frames</div>
            </div>
            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>Checkout</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>R$ {avgCheckoutBRL.toFixed(2)}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>fotos + conciliacao</div>
            </div>
            <div style={{ padding: 12, background: '#ecfdf5', borderRadius: 8, textAlign: 'center', border: '2px solid #10b981' }}>
              <div style={{ fontSize: 11, color: '#064e3b', fontWeight: 600 }}>Completa</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>R$ {avgCompleteBRL.toFixed(2)}</div>
              <div style={{ fontSize: 10, color: '#6ee7b7' }}>checkin + checkout</div>
            </div>
          </div>
        </FieldGroup>

        <SectionLabel>Resumo Geral ({inspections.length} inspecoes)</SectionLabel>
        <FieldGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>Total gasto</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>R$ {totalBRL.toFixed(2)}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>US$ {totalUSD.toFixed(4)}</div>
            </div>
            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>Total tokens</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{totalTokens.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{withUsage.length} com dados | {withoutUsage} sem dados</div>
            </div>
          </div>
        </FieldGroup>

        {rows.length > 0 && (
          <>
            <SectionLabel>Historico por Inspecao</SectionLabel>
            <FieldGroup>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {rows.slice(0, 20).map((r, idx) => (
                  <div key={r.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: idx < 19 ? '1px solid #f1f5f9' : 'none',
                    fontSize: 13,
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>
                        {r.status === 'completa' ? 'Completa' : 'Checkin'}
                        <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 8 }}>
                          {r.checkin_at ? new Date(r.checkin_at).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {r.tokens.toLocaleString()} tokens | {r.model_used || '-'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#059669' }}>R$ {(r.cost.total * USD_TO_BRL).toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>US$ {r.cost.total.toFixed(4)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FieldGroup>
          </>
        )}

        {withUsage.length === 0 && (
          <FieldGroup>
            <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
              Nenhuma inspecao com dados de custo encontrada.
              <br />Os dados aparecerao apos a proxima analise com a edge function atualizada.
            </div>
          </FieldGroup>
        )}
      </>
    );
  };

  const renderMotoristasTab = () => {
    const clientDrivers = driversData.drivers.filter(d => d.client_id === selectedClientId);
    const activeDrivers = clientDrivers.filter(d => d.is_active);
    const inactiveDrivers = clientDrivers.filter(d => !d.is_active);

    const handleAddDriver = async () => {
      if (!newDriver.name.trim() || !selectedClientId) return;
      setSavingDriver(true);
      try {
        const { error } = await supabase.from('vistoria_drivers').insert({
          client_id: selectedClientId,
          name: newDriver.name.trim(),
          cpf: newDriver.cpf.trim() || null,
          phone: newDriver.phone.trim() || null,
          is_active: true,
        });
        if (error) throw error;
        setNewDriver({ name: '', cpf: '', phone: '' });
        // Refresh
        const { data } = await supabase.from('vistoria_drivers').select('id, client_id, name, cpf, phone, license_number, license_category, is_active').order('name');
        setDriversData(prev => ({ ...prev, drivers: data || [] }));
        setToast({ type: 'success', msg: 'Motorista adicionado!' });
      } catch (e) {
        setToast({ type: 'error', msg: `Erro: ${e.message}` });
      } finally {
        setSavingDriver(false);
      }
    };

    const handleToggleDriver = async (driver) => {
      try {
        const { error } = await supabase.from('vistoria_drivers').update({ is_active: !driver.is_active }).eq('id', driver.id);
        if (error) throw error;
        setDriversData(prev => ({
          ...prev,
          drivers: prev.drivers.map(d => d.id === driver.id ? { ...d, is_active: !d.is_active } : d),
        }));
      } catch (e) {
        setToast({ type: 'error', msg: `Erro: ${e.message}` });
      }
    };

    if (driversLoading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Carregando...</div>;

    return (
      <>
        <FieldGroup>
          <SectionLabel>Gerenciar Motoristas</SectionLabel>
          {driversData.clients.length > 1 && (
            <div>
              <FieldLabel>Cliente</FieldLabel>
              <Select
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                style={{ maxWidth: 320 }}
              >
                {driversData.clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
          )}
        </FieldGroup>

        <FieldGroup>
          <SectionLabel>Adicionar Motorista</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <FieldLabel>Nome *</FieldLabel>
              <Input
                value={newDriver.name}
                onChange={e => setNewDriver(p => ({ ...p, name: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <FieldLabel>CPF</FieldLabel>
              <Input
                value={newDriver.cpf}
                onChange={e => setNewDriver(p => ({ ...p, cpf: e.target.value }))}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <FieldLabel>Telefone</FieldLabel>
              <Input
                value={newDriver.phone}
                onChange={e => setNewDriver(p => ({ ...p, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          <Button
            onClick={handleAddDriver}
            disabled={savingDriver || !newDriver.name.trim() || !selectedClientId}
            style={{ width: 'auto' }}
          >
            {savingDriver ? <FaSpinner style={{ animation: `${spin} 1s linear infinite` }} /> : null}
            {savingDriver ? ' Salvando...' : '+ Adicionar'}
          </Button>
        </FieldGroup>

        <FieldGroup>
          <SectionLabel>Motoristas Ativos ({activeDrivers.length})</SectionLabel>
          {activeDrivers.length === 0 ? (
            <div style={{ color: '#94a3b8', padding: '8px 0' }}>Nenhum motorista ativo.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeDrivers.map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#1e293b', borderRadius: 8, border: '1px solid #334155' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{d.name}</span>
                    {d.cpf && <span style={{ color: '#94a3b8', marginLeft: 12, fontSize: 13 }}>{d.cpf}</span>}
                    {d.phone && <span style={{ color: '#94a3b8', marginLeft: 12, fontSize: 13 }}>{d.phone}</span>}
                  </div>
                  <button
                    onClick={() => handleToggleDriver(d)}
                    style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}
                  >
                    Desativar
                  </button>
                </div>
              ))}
            </div>
          )}
        </FieldGroup>

        {inactiveDrivers.length > 0 && (
          <FieldGroup>
            <SectionLabel>Inativos ({inactiveDrivers.length})</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inactiveDrivers.map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', opacity: 0.6 }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>{d.name}</span>
                    {d.cpf && <span style={{ color: '#64748b', marginLeft: 12, fontSize: 13 }}>{d.cpf}</span>}
                  </div>
                  <button
                    onClick={() => handleToggleDriver(d)}
                    style={{ background: 'transparent', border: '1px solid #22c55e', color: '#22c55e', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}
                  >
                    Reativar
                  </button>
                </div>
              ))}
            </div>
          </FieldGroup>
        )}
      </>
    );
  };

  const tabRenderers = {
    checkin: renderCheckinTab,
    checkout: renderCheckoutTab,
    conciliation: renderConciliationTab,
    laudo: renderLaudoTab,
    general: renderGeneralTab,
    api: renderApiTab,
    custos: renderCustosTab,
    motoristas: renderMotoristasTab,
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}><FaArrowLeft /> Voltar</BackButton>
        <Logo><FaCog /> Configuracoes</Logo>
        <div style={{ width: 60 }} />
      </Header>

      <TabBar>
        {TABS.map(tab => (
          <Tab
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </TabBar>

      <Content key={activeTab}>
        {tabRenderers[activeTab]?.()}

        {activeTab !== 'custos' && activeTab !== 'motoristas' && (
          <>
            <ButtonRow>
              <Button $variant="outline" onClick={handleRestore}>
                <FaUndo /> Restaurar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <FaSpinner style={{ animation: `${spin} 1s linear infinite` }} /> : <FaSave />}
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </ButtonRow>

            <AuditFooter>{getLastUpdate(activeTab)}</AuditFooter>
          </>
        )}
      </Content>

      {toast && (
        <Toast $error={toast.error}>
          {toast.error ? <FaExclamationTriangle /> : <FaCheckCircle />}
          {toast.msg}
        </Toast>
      )}
    </Container>
  );
}
