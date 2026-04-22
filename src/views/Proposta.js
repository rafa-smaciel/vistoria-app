// src/modules/VistorIA/pages/Proposta.js
// Proposta comercial VistorIA × Auto-o-Matic — acesso público
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FaCheckCircle, FaArrowRight, FaTruck, FaChartBar,
  FaShieldAlt, FaBrain, FaClock, FaRocket, FaHandshake,
  FaWhatsapp, FaChevronDown, FaChevronUp, FaMicrochip, FaCoins,
  FaDatabase, FaCode, FaLayerGroup,
} from 'react-icons/fa';
import { vistoriaColors as colors } from '../components/theme';

// ============================================================
// ANIMATIONS
// ============================================================
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

// ============================================================
// LAYOUT
// ============================================================
const Page = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1e293b;
`;

// ============================================================
// HERO
// ============================================================
const Hero = styled.section`
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0c4a6e 100%);
  color: #fff;
  padding: 64px 24px 56px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 70% 50%, rgba(14,165,233,0.15) 0%, transparent 60%);
  }

  @media (min-width: 768px) { padding: 80px 48px 72px; }
`;

const HeroLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 24px;
  position: relative;
`;

const HeroTitle = styled.h1`
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 16px;
  position: relative;
  span { color: #38bdf8; }
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  color: rgba(255,255,255,0.75);
  max-width: 560px;
  margin: 0 auto 40px;
  line-height: 1.6;
  position: relative;
`;

const HeroMeta = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  position: relative;
`;

const HeroMetaItem = styled.div`
  text-align: center;
  .value { font-size: 28px; font-weight: 800; color: #38bdf8; }
  .label { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.04em; }
`;

// ============================================================
// SHARED
// ============================================================
const Section = styled.section`
  max-width: 860px;
  margin: 0 auto;
  padding: 56px 24px;
  animation: ${fadeUp} 0.5s ease;

  @media (min-width: 768px) { padding: 64px 32px; }
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${colors.primary};
  margin-bottom: 8px;
`;

const SectionTitle = styled.h2`
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 800;
  margin: 0 0 8px;
  color: #0f172a;
`;

const SectionDesc = styled.p`
  font-size: 15px;
  color: #64748b;
  margin: 0 0 32px;
  line-height: 1.6;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 0;
`;

// ============================================================
// CONTEXTO DO CLIENTE
// ============================================================
const ContextGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  @media (min-width: 640px) { grid-template-columns: repeat(4, 1fr); }
`;

const ContextCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);

  .icon { font-size: 22px; color: ${colors.primary}; margin-bottom: 8px; }
  .value { font-size: 22px; font-weight: 800; color: #0f172a; }
  .label { font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.4; }
`;

// ============================================================
// ESCOPO (INCLUDES)
// ============================================================
const IncludesList = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
  @media (min-width: 640px) { grid-template-columns: 1fr 1fr; }
`;

const IncludeItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);

  .icon { color: #16a34a; font-size: 15px; margin-top: 2px; flex-shrink: 0; }
  .text { font-size: 14px; color: #334155; line-height: 1.4; }
`;

// ============================================================
// PRECIFICAÇÃO
// ============================================================
const PricingGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
  @media (min-width: 640px) { grid-template-columns: 1fr 1fr; }
`;

const PricingCard = styled.div`
  background: #fff;
  border: 2px solid ${p => p.$highlight ? colors.primary : '#e2e8f0'};
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: ${p => p.$highlight ? `0 4px 20px rgba(14,165,233,0.15)` : '0 1px 4px rgba(0,0,0,0.06)'};
  position: relative;

  .badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors.primary};
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 14px;
    border-radius: 100px;
    white-space: nowrap;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .card-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 8px; }
  .card-title { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .card-desc  { font-size: 13px; color: #64748b; margin-bottom: 20px; line-height: 1.5; }
  .price      { font-size: 36px; font-weight: 800; color: #0f172a; line-height: 1; }
  .price-label { font-size: 13px; color: #64748b; margin-top: 4px; }
  .price-sub  { font-size: 12px; color: #94a3b8; margin-top: 4px; }
`;

const ExpansionTable = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  background: ${p => p.$header ? '#f8fafc' : (p.$highlight ? '#f0f9ff' : '#fff')};
  font-weight: ${p => p.$header ? '700' : '400'};
  color: ${p => p.$header ? '#475569' : '#334155'};
  align-items: center;

  &:last-child { border-bottom: none; }

  .accent { color: ${colors.primary}; font-weight: 700; }
  .muted  { color: #94a3b8; font-size: 13px; }
`;

// ============================================================
// MARGEM DO PARCEIRO
// ============================================================
const MargemGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  @media (min-width: 640px) { grid-template-columns: 1fr 1fr 1fr; }
`;

const MargemCard = styled.div`
  background: ${p => p.$accent ? 'linear-gradient(135deg, #0f172a, #1e3a5f)' : '#fff'};
  color: ${p => p.$accent ? '#fff' : '#0f172a'};
  border: 2px solid ${p => p.$accent ? 'transparent' : '#e2e8f0'};
  border-radius: 14px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: ${p => p.$accent ? '0 4px 24px rgba(14,165,233,0.2)' : '0 1px 4px rgba(0,0,0,0.06)'};

  .m-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.6; margin-bottom: 8px; }
  .m-value { font-size: 28px; font-weight: 800; color: ${p => p.$accent ? '#38bdf8' : '#0f172a'}; }
  .m-sub   { font-size: 12px; margin-top: 6px; opacity: 0.7; line-height: 1.4; }
`;

const MargemNote = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 16px 20px;
  font-size: 14px;
  color: #166534;
  line-height: 1.6;
  margin-top: 20px;
`;

// ============================================================
// SLA
// ============================================================
const SlaGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
  @media (min-width: 640px) { grid-template-columns: 1fr 1fr; }
`;

const SlaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);

  .icon  { font-size: 18px; color: ${colors.primary}; flex-shrink: 0; }
  .right { display: flex; flex-direction: column; }
  .title { font-size: 13px; font-weight: 700; color: #0f172a; }
  .value { font-size: 13px; color: #64748b; margin-top: 2px; }
`;

// ============================================================
// CUSTO POR INSPEÇÃO
// ============================================================
const CostGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  @media (min-width: 640px) { grid-template-columns: 1fr 1fr; }
`;

const CostCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);

  .cost-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px; }
  .cost-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
`;

const CostTable = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  font-size: 13px;
`;

const CostRow = styled.div`
  display: grid;
  grid-template-columns: ${p => p.$cols || '2fr 1fr 1fr 1fr'};
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
  background: ${p => p.$header ? '#f8fafc' : (p.$highlight ? '#f0f9ff' : '#fff')};
  font-weight: ${p => p.$header ? '700' : '400'};
  color: ${p => p.$header ? '#475569' : '#334155'};
  align-items: center;
  gap: 8px;

  &:last-child { border-bottom: none; }
  .accent { color: ${colors.primary}; font-weight: 700; }
  .green  { color: #16a34a; font-weight: 700; }
  .muted  { color: #94a3b8; }
`;

const CostHighlight = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 20px;

  @media (max-width: 480px) { grid-template-columns: 1fr 1fr; }
`;

const CostStat = styled.div`
  background: ${p => p.$green ? '#f0fdf4' : (p.$blue ? '#f0f9ff' : '#fff')};
  border: 1px solid ${p => p.$green ? '#bbf7d0' : (p.$blue ? '#bae6fd' : '#e2e8f0')};
  border-radius: 10px;
  padding: 16px 14px;
  text-align: center;

  .cs-value { font-size: 20px; font-weight: 800; color: ${p => p.$green ? '#16a34a' : (p.$blue ? colors.primary : '#0f172a')}; }
  .cs-label { font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.4; }
`;

const CostNote = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 13px;
  color: #92400e;
  margin-top: 16px;
  line-height: 1.6;
`;

// ============================================================
// ROADMAP
// ============================================================
const Phases = styled.div`
  display: grid;
  gap: 12px;
`;

const Phase = styled.div`
  display: flex;
  gap: 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 35px;
    top: 60px;
    bottom: -12px;
    width: 2px;
    background: #e2e8f0;
    display: ${p => p.$last ? 'none' : 'block'};
  }
`;

const PhaseNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${p => p.$active ? colors.primary : '#f1f5f9'};
  color: ${p => p.$active ? '#fff' : '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
  margin-top: 2px;
`;

const PhaseContent = styled.div`
  flex: 1;
  .phase-tag   { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${p => p.$active ? colors.primary : '#94a3b8'}; margin-bottom: 4px; }
  .phase-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .phase-desc  { font-size: 13px; color: #64748b; line-height: 1.5; }
  .phase-price { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 10px; }
`;

// ============================================================
// CTA FOOTER
// ============================================================
const CtaSection = styled.section`
  background: linear-gradient(135deg, #0f172a, #1e3a5f);
  color: #fff;
  padding: 64px 24px;
  text-align: center;
`;

const CtaTitle = styled.h2`
  font-size: clamp(22px, 4vw, 34px);
  font-weight: 800;
  margin: 0 0 12px;
  span { color: #38bdf8; }
`;

const CtaDesc = styled.p`
  font-size: 16px;
  color: rgba(255,255,255,0.7);
  margin: 0 0 36px;
`;

const CtaButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const CtaBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  background: ${p => p.$primary ? '#0ea5e9' : 'rgba(255,255,255,0.1)'};
  color: #fff;
  border: ${p => p.$primary ? 'none' : '2px solid rgba(255,255,255,0.3)'};

  &:hover {
    transform: translateY(-2px);
    background: ${p => p.$primary ? '#0284c7' : 'rgba(255,255,255,0.2)'};
  }
`;

const Footer = styled.footer`
  background: #0f172a;
  color: rgba(255,255,255,0.4);
  text-align: center;
  padding: 20px 24px;
  font-size: 12px;
`;

// ============================================================
// COLLAPSIBLE (mobile helper)
// ============================================================
const CollapseToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.primary};
  padding: 0;
  margin-top: 16px;
`;

// ============================================================
// COMPONENT
// ============================================================
const INCLUDES = [
  'Checkin com vídeo — placa OCR + checklist de integridade',
  'Checkout com fotos — detecção e classificação de carga',
  'Laudo auditável permanente (URL por inspeção)',
  'Dashboard gestor — pendentes, completas, expiradas',
  'Configurações de IA — prompts, thresholds, taxonomia',
  'API REST para integração TMS/ERP',
  'Armazenamento de evidências em nuvem (90 dias)',
  'Documentação técnica em /docs',
  'Painel admin — usuários, CDs, roles por função',
  'Suporte via canal dedicado (WhatsApp ou e-mail)',
];

const SLA_ITEMS = [
  { icon: <FaClock />, title: 'Laudo completo (checkin + checkout)', value: '≤ 45 segundos' },
  { icon: <FaShieldAlt />, title: 'Disponibilidade mensal', value: '99,5%' },
  { icon: <FaBrain />, title: 'Modelo de IA', value: 'Gemini 2.5 Pro + GPT-4V fallback' },
  { icon: <FaHandshake />, title: 'Resposta de suporte', value: '4h em dias úteis' },
  { icon: <FaRocket />, title: 'Prazo de ativação do piloto', value: '5–10 dias úteis' },
  { icon: <FaChartBar />, title: 'Retenção de evidências', value: '90 dias (configurável)' },
];

const EXPANSION_ROWS = [
  { cds: '1 CD (piloto UI)',          licenca: 'R$ 39,90/vistoria', parceiro: 'Preço final ao cliente', highlight: true },
  { cds: '50 vistorias/mês',          licenca: '≈ R$ 2.000/mês',    parceiro: 'R$ 39,90/cada' },
  { cds: '100 vistorias/mês',         licenca: '≈ R$ 3.990/mês',    parceiro: 'R$ 39,90/cada' },
  { cds: '250+ vistorias/mês (UI)',   licenca: 'Ver Proposta 2',    parceiro: 'Volume alto → API Corporate' },
];

const PHASES = [
  {
    tag: 'Agora — Piloto',
    title: 'Validação no 1º CD',
    desc: 'Ativação completa da plataforma. Sem custo de setup — o piloto é nosso investimento conjunto. O cliente valida a ferramenta e dá feedback. Cobrança por vistoria realizada.',
    price: 'Setup: ZERO | R$ 39,90 por vistoria',
    active: true,
  },
  {
    tag: 'Mês 1–2 — Feedback',
    title: 'Reunião de resultados',
    desc: 'Rafael + Fábio + transportadora revisam métricas: acurácia OCR, taxa de conciliação, tempo médio de laudo, ROI real. Ajustes finos nos prompts e configurações.',
    price: 'Incluído',
    active: false,
  },
  {
    tag: 'Pós-validação — Contrato',
    title: 'Formalização + expansão',
    desc: 'Validação aprovada → contrato direto. Proposta 1 (UI) com desconto por volume acima de 250/mês, ou migração para Proposta 2 (API Corporate) com integração ao TMS/ERP do cliente. Preço final sob contrato Auto-o-Matic.',
    price: 'Proposta 1 ou 2, conforme escolha do cliente',
    active: false,
  },
  {
    tag: 'Fase Futura',
    title: 'Detecção de Avarias (Módulo 2)',
    desc: 'Segunda oportunidade: detecção de avarias no manuseio entre CDs. Fábio já automatizou o pós-avaria — falta a ponta de detecção.',
    price: 'Proposta separada',
    active: false,
    last: true,
  },
];

export default function Proposta() {
  const [showExpansion, setShowExpansion] = useState(false);

  return (
    <Page>
      {/* ── HERO ── */}
      <Hero>
        <HeroLabel><FaHandshake /> Proposta Comercial Confidencial</HeroLabel>
        <HeroTitle>
          VistorIA<br />
          <span>Validação Veicular com IA</span>
        </HeroTitle>
        <HeroSubtitle>
          Proposta comercial para validação veicular com inteligência artificial.
          Dois modelos: <strong>Plataforma UI</strong> (portal web pronto para uso)
          ou <strong>API Corporate</strong> (integração direta ao TMS/ERP do cliente).
          Piloto em 1 CD, com roadmap de expansão para toda a operação.
        </HeroSubtitle>
        <HeroMeta>
          <HeroMetaItem>
            <div className="value">7/7</div>
            <div className="label">RFs atendidos</div>
          </HeroMetaItem>
          <HeroMetaItem>
            <div className="value">&lt;45s</div>
            <div className="label">Laudo completo</div>
          </HeroMetaItem>
          <HeroMetaItem>
            <div className="value">MVP</div>
            <div className="label">Em produção</div>
          </HeroMetaItem>
          <HeroMetaItem>
            <div className="value">5–10d</div>
            <div className="label">Ativação do piloto</div>
          </HeroMetaItem>
        </HeroMeta>
      </Hero>

      {/* ── CONTEXTO DO CLIENTE ── */}
      <Section>
        <SectionLabel>Contexto</SectionLabel>
        <SectionTitle>A operação da transportadora</SectionTitle>
        <SectionDesc>
          Frota 100% terceirizada, sem veículos próprios. Hoje, motoristas enviam qualquer
          foto para passar nos checkpoints — sem validação real, sem auditoria, sem compliance.
        </SectionDesc>
        <ContextGrid>
          <ContextCard>
            <div className="icon"><FaTruck /></div>
            <div className="value">250</div>
            <div className="label">Vistorias por mês</div>
          </ContextCard>
          <ContextCard>
            <div className="icon"><FaChartBar /></div>
            <div className="value">100+</div>
            <div className="label">CDs no Brasil</div>
          </ContextCard>
          <ContextCard>
            <div className="icon"><FaClock /></div>
            <div className="value">7d/sem</div>
            <div className="label">Operação contínua</div>
          </ContextCard>
          <ContextCard>
            <div className="icon"><FaShieldAlt /></div>
            <div className="value">0%</div>
            <div className="label">Validação atual</div>
          </ContextCard>
        </ContextGrid>
      </Section>

      <Divider />

      {/* ── ESCOPO DO PILOTO ── */}
      <Section>
        <SectionLabel>Escopo do piloto</SectionLabel>
        <SectionTitle>O que está incluído</SectionTitle>
        <SectionDesc>
          Plataforma VistorIA completa para 1 CD — do checkin na portaria ao laudo auditável,
          com configurações de IA e API para integração futura com TMS/ERP.
        </SectionDesc>
        <IncludesList>
          {INCLUDES.map((item, i) => (
            <IncludeItem key={i}>
              <FaCheckCircle className="icon" />
              <span className="text">{item}</span>
            </IncludeItem>
          ))}
        </IncludesList>
      </Section>

      <Divider />

      {/* ── PRECIFICAÇÃO ── */}
      <Section>
        <SectionLabel>Proposta 1 — Plataforma completa com UI</SectionLabel>
        <SectionTitle>Para CDs que operam manualmente via portal web</SectionTitle>
        <SectionDesc>
          Plataforma pronta para uso imediato. Operadores da portaria filmam, operadores da expedição fotografam, gestor acompanha o laudo em tempo real pelo dashboard. Sem integração técnica exigida. Pague apenas pelo que usar — sem mensalidade fixa, sem setup. Cada vistoria completa (checkin + checkout + laudo) é uma transação.
        </SectionDesc>

        <PricingGrid>
          <PricingCard>
            <div className="card-label">Piloto</div>
            <div className="card-title">Setup &amp; Onboarding</div>
            <div className="card-desc">
              Configuração da plataforma, usuários e CDs. Ajuste de prompts.
              Treinamento remoto dos operadores. Investimento nosso no piloto.
            </div>
            <div className="price">ZERO</div>
            <div className="price-label">sem custo de setup</div>
          </PricingCard>

          <PricingCard $highlight>
            <div className="badge">Por vistoria</div>
            <div className="card-label">Usa → paga</div>
            <div className="card-title">Plataforma VistorIA</div>
            <div className="card-desc">
              Checkin (vídeo + OCR + checklist) + Checkout (fotos + carga + conciliação)
              + Laudo completo com evidência auditável. Tudo incluso.
            </div>
            <div className="price">R$ 39,90</div>
            <div className="price-label">por vistoria completa</div>
            <div className="price-sub">sem mínimo · sem contrato longo · cancele quando quiser</div>
          </PricingCard>
        </PricingGrid>

        <CollapseToggle onClick={() => setShowExpansion(v => !v)}>
          {showExpansion ? <FaChevronUp /> : <FaChevronDown />}
          {showExpansion ? 'Ocultar' : 'Ver'} projeção de expansão (múltiplos CDs)
        </CollapseToggle>

        {showExpansion && (
          <ExpansionTable style={{ marginTop: 16 }}>
            <TableRow $header>
              <span>Volume</span>
              <span>Investimento</span>
              <span>Preço unitário</span>
            </TableRow>
            {EXPANSION_ROWS.map((r, i) => (
              <TableRow key={i} $highlight={r.highlight}>
                <span>{r.cds}</span>
                <span className="accent">{r.licenca}</span>
                <span className="muted">{r.parceiro}</span>
              </TableRow>
            ))}
          </ExpansionTable>
        )}
      </Section>

      <Divider />

      {/* ── INVESTIMENTO PROPOSTA 1 ── */}
      <Section>
        <SectionLabel>Investimento — Proposta 1</SectionLabel>
        <SectionTitle>Preço direto ao cliente final</SectionTitle>
        <SectionDesc>
          Preço único e transparente para uso via portal — sem intermediários, sem markup.
          R$ 39,90 por vistoria completa é o valor final que o cliente paga quando opera manualmente pela plataforma web.
        </SectionDesc>

        <MargemGrid>
          <MargemCard $accent>
            <div className="m-label">Preço por vistoria</div>
            <div className="m-value">R$ 39,90</div>
            <div className="m-sub">checkin + checkout + laudo completo</div>
          </MargemCard>
          <MargemCard>
            <div className="m-label">250 vistorias/mês</div>
            <div className="m-value">≈ R$ 9.975</div>
            <div className="m-sub">investimento mensal estimado</div>
          </MargemCard>
          <MargemCard>
            <div className="m-label">Acima de 250/mês</div>
            <div className="m-value">Desconto</div>
            <div className="m-sub">valor unitário reduzido por volume</div>
          </MargemCard>
        </MargemGrid>

        <MargemNote>
          <strong>Piloto sem compromisso:</strong>{' '}
          Setup zero, sem contrato longo, cancele quando quiser.
          Hora técnica para customizações: R$ 220/h.
        </MargemNote>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          TRANSIÇÃO NARRATIVA PARA PROPOSTA 2
          ═══════════════════════════════════════════════════════ */}
      <Section>
        <SectionLabel>Quando a operação pede outro formato</SectionLabel>
        <SectionTitle>Integração via API para clientes com TMS/ERP próprio</SectionTitle>
        <SectionDesc>
          A Proposta 1 é completa, mas pressupõe que operadores vão usar nosso portal web.
          Clientes corporativos com software legado em operação (TMS, ERP, sistema de pátio dedicado) muitas vezes não querem adicionar nova interface ao dia-a-dia — preferem que a inteligência de inspeção seja <strong>chamada pelo próprio sistema</strong>, de dentro do fluxo que eles já dominam.
          Para esse caso, oferecemos a <strong>Proposta 2: API Corporate</strong>. O produto técnico é o mesmo — mas o modelo de entrega, precificação e SLA são adaptados para integração programática.
        </SectionDesc>
      </Section>

      {/* ── PROPOSTA 2: API CORPORATE ── */}
      <Section>
        <SectionLabel>Proposta 2 — API Corporate</SectionLabel>
        <SectionTitle>Sua infraestrutura chama nossa IA</SectionTitle>
        <SectionDesc>
          3 endpoints REST autenticados por API key. Seu TMS/ERP envia vídeo e fotos; recebe placa OCR, checklist de integridade, detecção e classificação de carga, conciliação vídeo×foto e veredicto — tudo com evidência visual (bounding boxes) e confiança por decisão. Webhook opcional para resultado assíncrono.
        </SectionDesc>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 12 }}>
            Endpoints principais
          </div>
          <CostTable>
            <CostRow $header $cols="2fr 3fr">
              <span>Endpoint</span>
              <span>O que faz</span>
            </CostRow>
            <CostRow $cols="2fr 3fr">
              <span style={{ fontFamily: 'Monaco, monospace', fontSize: 12 }}>POST /v1/inspections/checkin</span>
              <span>Recebe vídeo (URL ou base64) → retorna placa + checklist + bbox</span>
            </CostRow>
            <CostRow $cols="2fr 3fr">
              <span style={{ fontFamily: 'Monaco, monospace', fontSize: 12 }}>POST /v1/inspections/:id/checkout</span>
              <span>Recebe fotos → retorna verdict + cargo classificada + conciliação</span>
            </CostRow>
            <CostRow $cols="2fr 3fr">
              <span style={{ fontFamily: 'Monaco, monospace', fontSize: 12 }}>GET /v1/inspections/:id</span>
              <span>Retorna laudo completo com todas as evidências persistidas</span>
            </CostRow>
          </CostTable>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 12 }}>
            SLA técnico contratual
          </div>
          <CostTable>
            <CostRow $header $cols="2fr 1fr">
              <span>Métrica</span>
              <span>Garantia</span>
            </CostRow>
            <CostRow $cols="2fr 1fr">
              <span>Disponibilidade mensal</span>
              <span className="accent">99,5%</span>
            </CostRow>
            <CostRow $cols="2fr 1fr">
              <span>Latência p99 (checkin ou checkout)</span>
              <span className="accent">&lt; 60 segundos</span>
            </CostRow>
            <CostRow $cols="2fr 1fr">
              <span>Rate limit padrão</span>
              <span className="accent">50 req/segundo</span>
            </CostRow>
            <CostRow $cols="2fr 1fr">
              <span>Suporte técnico dedicado</span>
              <span className="accent">resposta &lt; 4h úteis</span>
            </CostRow>
          </CostTable>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 12 }}>
            Tiers de volume — contratação via canal Auto-o-Matic
          </div>
          <CostTable>
            <CostRow $header $cols="1fr 2fr">
              <span>Faixa de volume mensal</span>
              <span>Modalidade de contratação</span>
            </CostRow>
            <CostRow $cols="1fr 2fr">
              <span style={{ fontWeight: 700 }}>Até 250 auditorias</span>
              <span className="muted">Contrato mensal padrão, sob proposta da Auto-o-Matic</span>
            </CostRow>
            <CostRow $cols="1fr 2fr" $highlight>
              <span style={{ fontWeight: 700 }}>250 a 1.000 auditorias</span>
              <span className="muted">Contrato mensal com escalonamento por volume, sob proposta da Auto-o-Matic</span>
            </CostRow>
            <CostRow $cols="1fr 2fr">
              <span style={{ fontWeight: 700 }}>Acima de 1.000 auditorias</span>
              <span className="muted">Contrato dedicado com SLA reforçado, sob proposta da Auto-o-Matic</span>
            </CostRow>
          </CostTable>
        </div>

        <CostNote style={{ marginTop: 16 }}>
          <strong>Setup técnico one-time: R$ 3.000</strong> — provisioning de API key dedicada, ambiente sandbox, 2 sessões de integração (~8h) com time técnico do cliente, revisão de payload/webhook e documentação customizada com exemplos do stack em uso.
          Modelo customizado ao cliente (fine-tuning com dados reais da operação) entra como entrega recorrente do contrato — sem custo adicional, absorvido pela Vega como investimento na qualidade contratual.
          <br /><br />
          <strong>Precificação de venda definida pela Auto-o-Matic.</strong>{' '}
          A Vega publica os custos de entrega (próxima seção "Transparência de custos") como base de cálculo. O preço final ao cliente é formulado pela Auto-o-Matic no papel de canal comercial, considerando volume, complexidade da integração e contexto competitivo da operação do cliente.
        </CostNote>
      </Section>

      {/* ── MODELO DE PARCERIA AUTO-O-MATIC ── */}
      <Section>
        <SectionLabel>Modelo de Parceria</SectionLabel>
        <SectionTitle>Licença Vega + markup Auto-o-Matic</SectionTitle>
        <SectionDesc>
          A Vega licencia a API Corporate à Auto-o-Matic por um valor fixo por auditoria.
          A Auto-o-Matic revende ao cliente final pelo preço que determinar, adicionando o markup necessário para remunerar o trabalho de canal
          (prospecção, qualificação, relacionamento, suporte comercial). A diferença é a margem bruta da Auto-o-Matic em cada operação.
        </SectionDesc>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 12 }}>
            Estrutura do modelo
          </div>
          <CostTable>
            <CostRow $header $cols="2fr 3fr">
              <span>Item</span>
              <span>Descrição</span>
            </CostRow>
            <CostRow $cols="2fr 3fr">
              <span style={{ fontWeight: 700 }}>Licença Vega</span>
              <span className="muted"><strong>R$ 9,90 por auditoria</strong> — valor cobrado da Auto-o-Matic pelo uso da API Corporate</span>
            </CostRow>
            <CostRow $cols="2fr 3fr">
              <span style={{ fontWeight: 700 }}>Preço ao cliente final</span>
              <span className="muted">Determinado pela Auto-o-Matic — adiciona markup sobre R$ 9,90 conforme contexto do prospect</span>
            </CostRow>
            <CostRow $cols="2fr 3fr">
              <span style={{ fontWeight: 700 }}>Margem Auto-o-Matic</span>
              <span className="muted">Diferença entre preço de venda e licença Vega (R$ 9,90) × volume mensal</span>
            </CostRow>
            <CostRow $cols="2fr 3fr">
              <span style={{ fontWeight: 700 }}>Faturamento</span>
              <span className="muted">Auto-o-Matic fatura diretamente o cliente final e paga Vega mensalmente conforme volume consumido</span>
            </CostRow>
            <CostRow $cols="2fr 3fr">
              <span style={{ fontWeight: 700 }}>Escopo</span>
              <span className="muted">Contratos Proposta 2 (API Corporate) indicados pela Auto-o-Matic. Proposta 1 (UI) segue modelo direto Vega → cliente.</span>
            </CostRow>
            <CostRow $cols="2fr 3fr">
              <span style={{ fontWeight: 700 }}>Distribuição interna</span>
              <span className="muted">A critério exclusivo da Auto-o-Matic (Fábio, Ramiro ou demais envolvidos)</span>
            </CostRow>
          </CostTable>
        </div>

        <CostNote style={{ marginTop: 16 }}>
          <strong>Canal Vega preferencial para logística.</strong>{' '}
          A Auto-o-Matic recebe suporte comercial dedicado, materiais de apoio para vendas, treinamento técnico do time e co-branding nas apresentações a clientes indicados.
          O modelo é <strong>recorrente e escalável</strong>: cada contrato fechado gera margem permanente enquanto o cliente permanece ativo.
          <br /><br />
          <strong>A Auto-o-Matic forma o preço de venda.</strong>{' '}
          A Vega publica apenas a licença Vega (R$ 9,90) e o custo rateado de entrega (seção "Transparência de custos" abaixo).
          O quanto o cliente final paga é decisão exclusiva de canal — a Auto-o-Matic ajusta o markup conforme volume, complexidade e relacionamento com cada prospect.
        </CostNote>
      </Section>

      <Divider />

      {/* ── SLA ── */}
      <Section>
        <SectionLabel>Compromissos</SectionLabel>
        <SectionTitle>SLA e entregáveis</SectionTitle>
        <SectionDesc>
          Métricas de performance garantidas contratualmente — aplicáveis a ambas as propostas (UI e API Corporate).
        </SectionDesc>
        <SlaGrid>
          {SLA_ITEMS.map((item, i) => (
            <SlaRow key={i}>
              <div className="icon">{item.icon}</div>
              <div className="right">
                <span className="title">{item.title}</span>
                <span className="value">{item.value}</span>
              </div>
            </SlaRow>
          ))}
        </SlaGrid>
      </Section>

      <Divider />

      {/* ── CUSTO POR INSPEÇÃO ── */}
      <Section>
        <SectionLabel>Transparência de custos</SectionLabel>
        <SectionTitle>Quanto custa cada inspeção para a Vega</SectionTitle>
        <SectionDesc>
          Estudo de custo baseado em dados reais do ciclo E2E completo em produção (17/03/2026),
          usando Gemini 2.5 Pro como modelo primário. Mostra por que o modelo de licença mensal é sustentável.
        </SectionDesc>

        <CostGrid>
          {/* Checkin — dados reais */}
          <CostCard>
            <div className="cost-label"><FaMicrochip style={{ marginRight: 4 }} />Checkin — dados reais</div>
            <div className="cost-title">Log do E2E em produção</div>
            <CostTable>
              <CostRow $header $cols="2fr 1fr 1fr">
                <span>Tipo</span><span>Tokens</span><span>Custo</span>
              </CostRow>
              <CostRow $cols="2fr 1fr 1fr">
                <span>Input (frames + prompt)</span>
                <span className="muted">11.321</span>
                <span>$0,0142</span>
              </CostRow>
              <CostRow $cols="2fr 1fr 1fr">
                <span>Output (JSON laudo)</span>
                <span className="muted">880</span>
                <span>$0,0088</span>
              </CostRow>
              <CostRow $cols="2fr 1fr 1fr">
                <span>Thinking (Gemini 2.5)</span>
                <span className="muted">2.275</span>
                <span>$0,0080</span>
              </CostRow>
              <CostRow $cols="2fr 1fr 1fr" $highlight>
                <span style={{ fontWeight: 700 }}>Total checkin</span>
                <span className="muted">14.476</span>
                <span className="accent">$0,031</span>
              </CostRow>
            </CostTable>
          </CostCard>

          {/* Checkout — estimativa por nº de fotos */}
          <CostCard>
            <div className="cost-label"><FaMicrochip style={{ marginRight: 4 }} />Checkout — estimativa por nº de fotos</div>
            <div className="cost-title">Varia com o volume de fotos capturadas</div>
            <CostTable>
              <CostRow $header $cols="1.5fr 1fr 1fr 1fr">
                <span>Cenário</span><span>Fotos</span><span>Tokens</span><span>Custo</span>
              </CostRow>
              <CostRow $cols="1.5fr 1fr 1fr 1fr">
                <span>Mínimo</span><span className="muted">3</span><span className="muted">~3.200</span><span>$0,015</span>
              </CostRow>
              <CostRow $cols="1.5fr 1fr 1fr 1fr" $highlight>
                <span style={{ fontWeight: 700 }}>Típico</span><span className="muted">8</span><span className="muted">~5.500</span><span className="accent">$0,020</span>
              </CostRow>
              <CostRow $cols="1.5fr 1fr 1fr 1fr">
                <span>Máximo</span><span className="muted">40</span><span className="muted">~22.000</span><span>$0,060</span>
              </CostRow>
            </CostTable>
          </CostCard>
        </CostGrid>

        {/* Total por inspeção completa */}
        <div style={{ marginTop: 20 }}>
          <CostTable>
            <CostRow $header $cols="2fr 1fr 1fr 1fr 1fr">
              <span>Cenário completo</span>
              <span>Checkin</span>
              <span>Checkout</span>
              <span>Total USD</span>
              <span>Total BRL*</span>
            </CostRow>
            <CostRow $cols="2fr 1fr 1fr 1fr 1fr">
              <span>Mínimo (3 fotos)</span>
              <span className="muted">$0,031</span>
              <span className="muted">$0,015</span>
              <span>$0,046</span>
              <span>≈ R$ 0,28</span>
            </CostRow>
            <CostRow $cols="2fr 1fr 1fr 1fr 1fr" $highlight>
              <span style={{ fontWeight: 700 }}>Típico (8 fotos)</span>
              <span className="muted">$0,031</span>
              <span className="muted">$0,020</span>
              <span className="accent">$0,051</span>
              <span className="accent">≈ R$ 0,31</span>
            </CostRow>
            <CostRow $cols="2fr 1fr 1fr 1fr 1fr">
              <span>Máximo (40 fotos)</span>
              <span className="muted">$0,031</span>
              <span className="muted">$0,060</span>
              <span>$0,091</span>
              <span>≈ R$ 0,55</span>
            </CostRow>
          </CostTable>
        </div>

        {/* Impacto na margem */}
        <CostHighlight>
          <CostStat $blue>
            <div className="cs-value">≈ R$ 0,31</div>
            <div className="cs-label">custo IA por inspeção (típico)</div>
          </CostStat>
          <CostStat>
            <div className="cs-value">≈ R$ 93</div>
            <div className="cs-label">custo IA total para 300 inspeções/mês</div>
          </CostStat>
          <CostStat $green>
            <div className="cs-value">~96%</div>
            <div className="cs-label">margem bruta sobre custo de IA</div>
          </CostStat>
          <CostStat>
            <div className="cs-value">≈ R$ 270</div>
            <div className="cs-label">infra fixa mensal (Supabase + Vercel)</div>
          </CostStat>
          <CostStat $green>
            <div className="cs-value">≈ R$ 1.757</div>
            <div className="cs-label">margem operacional por CD/mês (AI + infra)</div>
          </CostStat>
          <CostStat $blue>
            <div className="cs-value">89%</div>
            <div className="cs-label">margem bruta em 100 CDs ativos</div>
          </CostStat>
        </CostHighlight>

        {/* Infraestrutura da plataforma */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 12 }}>
            <FaDatabase style={{ marginRight: 6 }} />Infraestrutura da plataforma — custo fixo mensal
          </div>
          <CostTable>
            <CostRow $header $cols="2fr 1fr 1fr">
              <span>Serviço</span><span>O que cobre</span><span>Custo/mês</span>
            </CostRow>
            <CostRow $cols="2fr 1fr 1fr">
              <span>Supabase Pro</span>
              <span className="muted">DB, Auth, Storage (fotos/vídeos), Edge Functions</span>
              <span>R$ 150</span>
            </CostRow>
            <CostRow $cols="2fr 1fr 1fr">
              <span>Vercel Pro</span>
              <span className="muted">Frontend, CDN global, deploys contínuos</span>
              <span>R$ 120</span>
            </CostRow>
            <CostRow $cols="2fr 1fr 1fr">
              <span>OpenAI API (fallback)</span>
              <span className="muted">GPT-4V — ativado apenas se Gemini falhar</span>
              <span>≈ R$ 20</span>
            </CostRow>
            <CostRow $cols="2fr 1fr 1fr" $highlight>
              <span style={{ fontWeight: 700 }}>Total infra fixa</span>
              <span className="muted">independente do nº de inspeções</span>
              <span className="accent">R$ 290/mês</span>
            </CostRow>
          </CostTable>
        </div>

        {/* Custo total por CD — Proposta 1 (UI) */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 8 }}>
            Proposta 1 — Plataforma UI (cenário piloto)
          </div>
          <CostTable>
            <CostRow $header $cols="2fr 1fr 1fr 1fr">
              <span>Cenário</span>
              <span>IA</span>
              <span>Infra fixa</span>
              <span>Total Vega</span>
            </CostRow>
            <CostRow $cols="2fr 1fr 1fr 1fr" $highlight>
              <span style={{ fontWeight: 700 }}>1 CD · 200 vistorias/mês</span>
              <span className="muted">R$ 62</span>
              <span className="muted">R$ 290</span>
              <span className="accent">R$ 352/mês</span>
            </CostRow>
            <CostRow $cols="2fr 1fr 1fr 1fr">
              <span>Receita (200 × R$ 39,90)</span>
              <span className="muted">—</span>
              <span className="muted">—</span>
              <span className="green">R$ 7.980/mês</span>
            </CostRow>
            <CostRow $cols="2fr 1fr 1fr 1fr">
              <span>Margem operacional Vega (bruta)</span>
              <span className="muted">—</span>
              <span className="muted">—</span>
              <span className="green">R$ 7.628 (96%)</span>
            </CostRow>
          </CostTable>
        </div>

        {/* Custo total — Proposta 2 (API Corporate) */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 8 }}>
            Proposta 2 — API Corporate: custo rateado por 500 auditorias/mês
          </div>
          <CostTable>
            <CostRow $header $cols="2fr 1fr">
              <span>Componente de custo</span>
              <span>Mensal</span>
            </CostRow>
            <CostRow $cols="2fr 1fr">
              <span>Supabase (projeto isolado vistoria-demo)</span>
              <span className="muted">R$ 120 <small style={{opacity:0.6}}>(≈ US$ 20)</small></span>
            </CostRow>
            <CostRow $cols="2fr 1fr">
              <span>Vercel Pro (deploys + CDN)</span>
              <span className="muted">R$ 120</span>
            </CostRow>
            <CostRow $cols="2fr 1fr">
              <span>OpenAI API (fallback GPT-4V)</span>
              <span className="muted">R$ 20</span>
            </CostRow>
            <CostRow $cols="2fr 1fr">
              <span>Gemini 2.5 Pro VLM (500 × R$ 0,31 típico)</span>
              <span className="muted">R$ 155</span>
            </CostRow>
            <CostRow $cols="2fr 1fr" $highlight>
              <span style={{ fontWeight: 700 }}>Custo mensal total Vega</span>
              <span className="accent">R$ 415/mês</span>
            </CostRow>
            <CostRow $cols="2fr 1fr" $highlight>
              <span style={{ fontWeight: 700 }}>Custo rateado por auditoria (÷ 500)</span>
              <span className="accent">≈ R$ 0,83</span>
            </CostRow>
            <CostRow $cols="2fr 1fr">
              <span>Licença Vega API para Auto-o-Matic (por auditoria)</span>
              <span className="accent" style={{fontWeight:700}}>R$ 9,90</span>
            </CostRow>
          </CostTable>
        </div>

        <CostNote style={{ marginTop: 16 }}>
          <strong>Licença Vega API: R$ 9,90 por auditoria</strong> — valor cobrado da Auto-o-Matic pelo uso dos endpoints da API Corporate. Sobre essa base, a Auto-o-Matic adiciona seu markup e forma o preço final ao cliente conforme volume, contexto e complexidade da integração.
          <br /><br />
          <strong>* Taxa de câmbio estimada em R$ 6,00/USD.</strong> O projeto VistorIA opera em infraestrutura Supabase dedicada (projeto isolado <code>cxlzhmelcvjubebvfchf</code>), com Vercel Pro e Gemini 2.5 Pro como VLM primário. Infra atual suporta até ~5.000 auditorias/mês sem upgrade.
        </CostNote>
      </Section>

      <Divider />

      {/* ── MVP DEVELOPMENT COST ── */}
      <Section>
        <SectionLabel><FaCode style={{ marginRight: 6 }} />Desenvolvimento</SectionLabel>
        <SectionTitle>Custo do MVP — o que foi construído</SectionTitle>
        <SectionDesc>
          A plataforma VistorIA foi desenvolvida em 12 sprints, do zero à produção.
          Transparência total: esforço de engenharia, escopo entregue e valor de mercado equivalente.
        </SectionDesc>

        {/* Esforço por fase */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 12 }}>
            <FaLayerGroup style={{ marginRight: 6 }} />Esforço de engenharia por fase
          </div>
          <CostTable>
            <CostRow $header $cols="3fr 1fr 1fr">
              <span>Fase</span><span>Sprints</span><span>Horas estimadas</span>
            </CostRow>
            <CostRow $cols="3fr 1fr 1fr">
              <span>Backend — Edge Functions, pipeline de IA, banco de dados</span>
              <span className="muted">S1–S6</span><span>~80h</span>
            </CostRow>
            <CostRow $cols="3fr 1fr 1fr">
              <span>Frontend — Checkin, Checkout, Laudo, Dashboard</span>
              <span className="muted">S4–S9</span><span>~90h</span>
            </CostRow>
            <CostRow $cols="3fr 1fr 1fr">
              <span>Integrações — Gemini 2.5 Pro, Storage, Auth, multi-tenant</span>
              <span className="muted">S3–S8</span><span>~40h</span>
            </CostRow>
            <CostRow $cols="3fr 1fr 1fr">
              <span>Testes E2E, bounding boxes, correções de produção</span>
              <span className="muted">S10–S12</span><span>~30h</span>
            </CostRow>
            <CostRow $cols="3fr 1fr 1fr" $highlight>
              <span style={{ fontWeight: 700 }}>Total — plataforma full-stack em produção</span>
              <span className="muted">12 sprints</span>
              <span className="accent">~240h</span>
            </CostRow>
          </CostTable>
        </div>

        {/* RFs entregues */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 12 }}>
            <FaCheckCircle style={{ marginRight: 6, color: '#22c55e' }} />Requisitos funcionais — 8/8 atendidos em produção
          </div>
          <CostTable>
            <CostRow $header $cols="0.6fr 2.8fr 0.8fr">
              <span>RF</span><span>Entregável</span><span>Status</span>
            </CostRow>
            <CostRow $cols="0.6fr 2.8fr 0.8fr">
              <span style={{ fontWeight: 700, color: '#0ea5e9' }}>RF-01</span>
              <span>Check-in por vídeo com análise de IA (Gemini 2.5 Pro, thinking)</span>
              <span style={{ color: '#22c55e', fontSize: 12 }}>✅ Produção</span>
            </CostRow>
            <CostRow $cols="0.6fr 2.8fr 0.8fr">
              <span style={{ fontWeight: 700, color: '#0ea5e9' }}>RF-02</span>
              <span>Resultado estruturado com checklist (JSON → laudo visual)</span>
              <span style={{ color: '#22c55e', fontSize: 12 }}>✅ Produção</span>
            </CostRow>
            <CostRow $cols="0.6fr 2.8fr 0.8fr">
              <span style={{ fontWeight: 700, color: '#0ea5e9' }}>RF-03</span>
              <span>Checkout com fotos por categoria + análise automática de divergências</span>
              <span style={{ color: '#22c55e', fontSize: 12 }}>✅ Produção</span>
            </CostRow>
            <CostRow $cols="0.6fr 2.8fr 0.8fr">
              <span style={{ fontWeight: 700, color: '#0ea5e9' }}>RF-04</span>
              <span>Dashboard do gestor com histórico e status de inspeções</span>
              <span style={{ color: '#22c55e', fontSize: 12 }}>✅ Produção</span>
            </CostRow>
            <CostRow $cols="0.6fr 2.8fr 0.8fr">
              <span style={{ fontWeight: 700, color: '#0ea5e9' }}>RF-05</span>
              <span>Multi-tenant com perfis separados (portaria / expedição / admin por CD)</span>
              <span style={{ color: '#22c55e', fontSize: 12 }}>✅ Produção</span>
            </CostRow>
            <CostRow $cols="0.6fr 2.8fr 0.8fr">
              <span style={{ fontWeight: 700, color: '#0ea5e9' }}>RF-06</span>
              <span>Upload incremental de fotos com retry automático</span>
              <span style={{ color: '#22c55e', fontSize: 12 }}>✅ Produção</span>
            </CostRow>
            <CostRow $cols="0.6fr 2.8fr 0.8fr">
              <span style={{ fontWeight: 700, color: '#0ea5e9' }}>RF-07</span>
              <span>Bounding boxes em todas as fotos do laudo (frame âncora com região destacada)</span>
              <span style={{ color: '#22c55e', fontSize: 12 }}>✅ Produção</span>
            </CostRow>
            <CostRow $cols="0.6fr 2.8fr 0.8fr">
              <span style={{ fontWeight: 700, color: '#0ea5e9' }}>RF-08</span>
              <span>Análise foto a foto (até 40 fotos) com polling automático no laudo</span>
              <span style={{ color: '#22c55e', fontSize: 12 }}>✅ Produção</span>
            </CostRow>
          </CostTable>
        </div>

        {/* Valor de mercado */}
        <CostHighlight>
          <CostStat>
            <div className="cs-value">~240h</div>
            <div className="cs-label">engenharia full-stack entregue</div>
          </CostStat>
          <CostStat $blue>
            <div className="cs-value">12 sprints</div>
            <div className="cs-label">do zero à produção em ~30 dias</div>
          </CostStat>
          <CostStat $green>
            <div className="cs-value">R$ 48–60k</div>
            <div className="cs-label">valor de mercado equivalente (R$ 200–250/h)</div>
          </CostStat>
          <CostStat>
            <div className="cs-value">8/8 RFs</div>
            <div className="cs-label">todos os requisitos funcionais em produção</div>
          </CostStat>
        </CostHighlight>

        <CostNote>
          <strong>Modelo de parceria estratégica.</strong> O MVP foi desenvolvido pela Vega como investimento na
          parceria com a Auto-o-Matic — sem custo de desenvolvimento antecipado para o cliente piloto.
          Valor de mercado calculado com base em taxa de engenharia especializada em IA (R$ 200–250/h),
          referência para projetos similares no mercado brasileiro. A plataforma está em produção ativa,
          com dados reais e laudos gerados.
        </CostNote>
      </Section>

      <Divider />

      {/* ── ROADMAP ── */}
      <Section>
        <SectionLabel>Roadmap</SectionLabel>
        <SectionTitle>Da prova de conceito à escala</SectionTitle>
        <SectionDesc>
          Expansão faseada — piloto valida a tecnologia, resultados sustentam a proposta
          de rollout para os 100+ CDs da transportadora.
        </SectionDesc>
        <Phases>
          {PHASES.map((p, i) => (
            <Phase key={i} $last={p.last}>
              <PhaseNumber $active={p.active}>{i + 1}</PhaseNumber>
              <PhaseContent $active={p.active}>
                <div className="phase-tag">{p.tag}</div>
                <div className="phase-title">{p.title}</div>
                <div className="phase-desc">{p.desc}</div>
                <div className="phase-price">{p.price}</div>
              </PhaseContent>
            </Phase>
          ))}
        </Phases>
      </Section>

      {/* ── CTA ── */}
      <CtaSection>
        <CtaTitle>
          Pronto para <span>ativar o piloto?</span>
        </CtaTitle>
        <CtaDesc>
          Ativação em 5–10 dias úteis após alinhamento comercial.
          A plataforma já está em produção — basta configurar o tenant.
        </CtaDesc>
        <CtaButtons>
          <CtaBtn $primary href="https://wa.me/5511944271000" target="_blank" rel="noopener noreferrer">
            <FaWhatsapp /> Falar com Rafael
          </CtaBtn>
          <CtaBtn href="https://vistoria.proagentes.ai" target="_blank" rel="noopener noreferrer">
            <FaArrowRight /> Ver a plataforma ao vivo
          </CtaBtn>
        </CtaButtons>
      </CtaSection>

      <Footer>
        Proposta confidencial — VistorIA by Vega Robotics × Auto-o-Matic · {new Date().getFullYear()}
      </Footer>
    </Page>
  );
}
