// src/modules/VistorIA/pages/Docs.js
// Documentacao tecnica completa da aplicacao VistorIA
// Atualizado em 17/03/2026 — pos Sprints 1-12 + 17 fixes de producao

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaArrowLeft, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { vistoriaColors as colors } from '../components/theme';

// ============================================
// ANIMATIONS
// ============================================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ============================================
// STYLED COMPONENTS
// ============================================
const Container = styled.div`
  min-height: 100vh;
  background: ${colors.backgroundAlt};
  color: ${colors.textPrimary};
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
  color: ${colors.primary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 16px;
  color: ${colors.textPrimary};
`;

const Content = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 16px 60px;
  animation: ${fadeIn} 0.3s ease;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 4px;
  color: ${colors.textPrimary};
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: ${colors.textSecondary};
  margin: 0 0 24px;
`;

const TOC = styled.nav`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  h3 {
    font-size: 14px;
    font-weight: 700;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 12px;
  }
  ol {
    margin: 0;
    padding-left: 20px;
    li {
      margin-bottom: 6px;
      a {
        color: ${colors.primary};
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        &:hover { text-decoration: underline; }
      }
    }
  }
`;

const Section = styled.section`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  h2 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 12px;
    color: ${colors.textPrimary};
    scroll-margin-top: 70px;
  }
  h3 {
    font-size: 16px;
    font-weight: 700;
    margin: 16px 0 8px;
    color: ${colors.textPrimary};
  }
  p, li {
    font-size: 14px;
    line-height: 1.6;
    color: ${colors.textSecondary};
  }
  ul, ol {
    padding-left: 20px;
    margin: 8px 0;
  }
  a {
    color: ${colors.primary};
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 12px 0;
  th, td {
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid ${colors.borderLight};
  }
  th {
    font-weight: 700;
    color: ${colors.textPrimary};
    background: ${colors.backgroundAlt};
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  td { color: ${colors.textSecondary}; }
  tr:last-child td { border-bottom: none; }
  code {
    background: ${colors.backgroundAlt};
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12px;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
`;

const CodeBlock = styled.pre`
  background: #1e293b;
  color: #e2e8f0;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  margin: 12px 0;
  font-family: 'SF Mono', 'Fira Code', monospace;
  white-space: pre-wrap;
  word-break: break-word;
`;

const FlowDiagram = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  margin: 12px 0;
`;

const FlowStep = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${p => p.$active ? colors.primary : colors.backgroundAlt};
  color: ${p => p.$active ? '#fff' : colors.textSecondary};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

const FlowArrow = styled.span`
  color: ${colors.textLight};
  font-size: 12px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: ${p =>
    p.$s === 'done' ? '#d1fae5' :
    p.$s === 'partial' ? '#fef3c7' :
    p.$s === 'stub' ? '#fee2e2' : colors.backgroundAlt};
  color: ${p =>
    p.$s === 'done' ? '#065f46' :
    p.$s === 'partial' ? '#92400e' :
    p.$s === 'stub' ? '#991b1b' : colors.textSecondary};
`;

const Collapsible = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <CollapsibleWrapper>
      <CollapsibleHeader onClick={() => setOpen(!open)}>
        {open ? <FaChevronDown /> : <FaChevronRight />}
        <span>{title}</span>
      </CollapsibleHeader>
      {open && <CollapsibleContent>{children}</CollapsibleContent>}
    </CollapsibleWrapper>
  );
};

const CollapsibleWrapper = styled.div`
  border: 1px solid ${colors.borderLight};
  border-radius: 8px;
  margin: 8px 0;
  overflow: hidden;
`;

const CollapsibleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: ${colors.backgroundAlt};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textPrimary};
  svg { font-size: 12px; color: ${colors.textSecondary}; }
  &:hover { background: ${colors.borderLight}; }
`;

const CollapsibleContent = styled.div`
  padding: 14px;
`;

const VersionInfo = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 12px;
  color: ${colors.textLight};
`;

const InfoBox = styled.div`
  background: ${p => p.$color || '#eff6ff'};
  border-left: 3px solid ${p => p.$border || colors.primary};
  border-radius: 6px;
  padding: 10px 14px;
  margin: 10px 0;
  font-size: 13px;
  color: ${colors.textSecondary};
  line-height: 1.5;
`;

// ============================================
// COMPONENT
// ============================================
export default function Docs() {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/')}>
          <FaArrowLeft /> Voltar
        </BackButton>
        <Logo>VistorIA — Documentacao Tecnica</Logo>
        <div style={{ width: 80 }} />
      </Header>

      <Content>
        <Title>Documentacao Tecnica</Title>
        <Subtitle>VistorIA v2.0 — Validacao Veicular com Inteligencia Artificial · 17/03/2026</Subtitle>

        {/* ---- TOC ---- */}
        <TOC>
          <h3>Indice</h3>
          <ol>
            <li><a href="#visao-geral">Visao Geral</a></li>
            <li><a href="#arquitetura">Arquitetura</a></li>
            <li><a href="#dois-momentos">Modelo de Dois Momentos</a></li>
            <li><a href="#fluxo-checkin">Fluxo de Checkin (Executor A)</a></li>
            <li><a href="#fluxo-checkout">Fluxo de Checkout (Executor B)</a></li>
            <li><a href="#pipeline-ia">Pipeline de IA (RF-01 a RF-07)</a></li>
            <li><a href="#upload-incremental">Upload Incremental</a></li>
            <li><a href="#laudo">Laudo de Inspecao</a></li>
            <li><a href="#rotas">Rotas e Paginas</a></li>
            <li><a href="#banco-dados">Banco de Dados</a></li>
            <li><a href="#edge-functions">Edge Functions</a></li>
            <li><a href="#configuracoes">Configuracoes (vistoria_config)</a></li>
            <li><a href="#autenticacao">Autenticacao e Roles</a></li>
            <li><a href="#api-rest">API REST para TMS/ERP</a></li>
            <li><a href="#design-system">Design System</a></li>
            <li><a href="#deploy">Deploy e Infraestrutura</a></li>
            <li><a href="#excecoes">Tabela de Excecoes</a></li>
            <li><a href="#historico">Historico de Implementacao</a></li>
          </ol>
        </TOC>

        {/* ---- 1. VISAO GERAL ---- */}
        <Section>
          <h2 id="visao-geral">1. Visao Geral</h2>
          <p>
            <strong>VistorIA</strong> e um SaaS de inspecao veicular com visao computacional para transportadoras
            e operadores logisticos em Centros de Distribuicao (CDs). A IA analisa video e fotos do veiculo
            em dois momentos operacionais distintos — chegada (checkin) e saida com carga (checkout) —
            gerando um laudo digital completo e auditavel com evidencias visuais, GPS e cadeia de custodia.
          </p>

          <h3>Problema que resolve</h3>
          <ul>
            <li>Inspecoes manuais em papel sao lentas, inconsistentes e nao rastreiaveis</li>
            <li>Fraude por troca de veiculo entre checkin e checkout</li>
            <li>Falta de evidencias visuais para disputas de avaria</li>
            <li>Ausencia de padronizacao no processo de vistoria nos CDs</li>
          </ul>

          <h3>Proposta de valor</h3>
          <ul>
            <li>Checkin completo em ~2 min (video + IA); checkout em ~3 min (fotos + IA)</li>
            <li>Laudo digital com evidencias, bounding box, GPS e timestamp</li>
            <li>Conciliacao anti-fraude automatica (video x fotos — RF-04)</li>
            <li>URL permanente e auditavel por inspecao (<code>/resultado/:id</code>)</li>
            <li>API REST para integracao com TMS/ERP</li>
          </ul>

          <h3>Status do Projeto (17/03/2026)</h3>
          <Table>
            <thead>
              <tr><th>Componente</th><th>Status</th><th>Versao / Detalhe</th></tr>
            </thead>
            <tbody>
              <tr><td>Banco de dados (4 tabelas)</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>vistoria_inspections, logs, config, users</td></tr>
              <tr><td>Edge Function checkin</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>v10 — Gemini 2.5 Pro + fallback GPT-4V</td></tr>
              <tr><td>Edge Function checkout</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>v10 — photo_paths incremental + status processando</td></tr>
              <tr><td>Edge Function API REST</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>GET /inspections (por id, placa, status, cd)</td></tr>
              <tr><td>Fluxo CheckinFlow</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>4 steps — video guiado + OCR placa + checklist</td></tr>
              <tr><td>Fluxo CheckoutFlow</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>5 steps — upload incremental por foto</td></tr>
              <tr><td>Laudo InspectionResult</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>2 views (operador/gestor) + bbox + StarRating</td></tr>
              <tr><td>Dashboard</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>Pendentes / Completas / Expiradas + filtros</td></tr>
              <tr><td>Configuracoes AdminSettings</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>8 abas — 51 hiperparametros em vistoria_config</td></tr>
              <tr><td>Landing page</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>Demo por persona (Portaria / Expedicao)</td></tr>
              <tr><td>Auth + RouteGuard</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>Roles operador / gestor / admin + function</td></tr>
              <tr><td>Teste E2E ciclo completo</td><td><StatusBadge $s="done">Completo</StatusBadge></td><td>17/03/2026 — 19 screenshots, todos 7 RFs validados</td></tr>
              <tr><td>LGPD (RNF-05)</td><td><StatusBadge $s="stub">Futuro</StatusBadge></td><td>A definir contratualmente</td></tr>
              <tr><td>Webhook TMS (push)</td><td><StatusBadge $s="stub">Futuro</StatusBadge></td><td>API pull ja disponivel</td></tr>
            </tbody>
          </Table>
        </Section>

        {/* ---- 2. ARQUITETURA ---- */}
        <Section>
          <h2 id="arquitetura">2. Arquitetura</h2>

          <h3>Stack Tecnologico</h3>
          <Table>
            <thead>
              <tr><th>Camada</th><th>Tecnologia</th><th>Detalhes</th></tr>
            </thead>
            <tbody>
              <tr><td>Frontend</td><td>React 18 + styled-components</td><td>SPA dentro do Next.js 14 (client-side)</td></tr>
              <tr><td>Routing</td><td>React Router v6</td><td>Subdomain: <code>vistoria.proagentes.ai</code></td></tr>
              <tr><td>Backend</td><td>Supabase Edge Functions (Deno)</td><td>3 functions: checkin, checkout, api</td></tr>
              <tr><td>Banco de dados</td><td>PostgreSQL (Supabase)</td><td>RLS enforced, 4 tabelas principais</td></tr>
              <tr><td>Storage</td><td>Supabase Storage</td><td>Bucket: <code>vistoria-photos</code></td></tr>
              <tr><td>Auth</td><td>Supabase Auth</td><td>Email/password, JWT, roles em vistoria_users</td></tr>
              <tr><td>IA primaria</td><td>Gemini 2.5 Pro (Google)</td><td><code>responseMimeType: application/json</code> obrigatorio</td></tr>
              <tr><td>IA fallback</td><td>GPT-4V (OpenAI)</td><td>Acionado em timeout ou erro do primario</td></tr>
              <tr><td>Hosting</td><td>Vercel</td><td>Next.js 14, auto-deploy no push para master</td></tr>
              <tr><td>DNS</td><td>Cloudflare</td><td>CNAME vistoria.proagentes.ai → Vercel</td></tr>
            </tbody>
          </Table>

          <h3>Diagrama de Fluxo</h3>
          <CodeBlock>{`
[Dispositivo Movel do Operador]
      |
      v
[React SPA — vistoria.proagentes.ai]
      |
      |-- getUserMedia() --> Camera nativa (video/foto)
      |-- navigator.geolocation --> GPS automatico
      |-- MediaRecorder --> Video WebM (checkin)
      |-- supabase.storage.upload() --> Upload incremental (checkout)
      |
      +-----------[CHECKIN]-----------+    +-----------[CHECKOUT]-----------+
      |                               |    |                                |
      v                               |    v                                |
[Edge: vistoria-checkin v10]          |  [Edge: vistoria-checkout v10]      |
      |                               |    |                                |
      |-- Gemini 2.5 Pro              |    |-- Gemini 2.5 Pro               |
      |   (fallback: GPT-4V)          |    |   (fallback: GPT-4V)           |
      |-- RF-01: OCR placa            |    |-- RF-05: deteccao carga        |
      |-- RF-02: validacao video      |    |-- RF-06: classificacao carga   |
      |-- RF-03: checklist 5 itens    |    |-- RF-04: conciliacao video×foto|
      |-- frame_base64 para bbox      |    |-- score ponderado + veredicto  |
      |                               |    |                                |
      v                               |    v                                |
[Supabase PostgreSQL]                 |  [Supabase PostgreSQL]              |
  vistoria_inspections                |    vistoria_inspections (atualiza)  |
  (status: aguardando_checkout)       |    (status: completa + result JSON) |
      |                               |    |                                |
      +-------------------------------+    +--------------------------------+

[Edge: vistoria-api]
  GET /inspections/:id       --> laudo completo
  GET /inspections?placa=X   --> busca por placa
  Autenticacao: x-api-key: vst-*
          `.trim()}</CodeBlock>
        </Section>

        {/* ---- 3. DOIS MOMENTOS ---- */}
        <Section>
          <h2 id="dois-momentos">3. Modelo de Dois Momentos</h2>
          <p>
            Uma inspecao completa consiste em <strong>duas etapas obrigatórias</strong> realizadas por personas distintas.
            O laudo completo so existe quando as duas estao completas.
          </p>

          <Table>
            <thead>
              <tr><th>Momento</th><th>Persona</th><th>Local</th><th>Rota</th><th>Captura</th><th>IA processa</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Checkin</strong> (chegada)</td>
                <td>Executor A — Portaria/Seguranca</td>
                <td>Portaria do CD</td>
                <td><code>/checkin</code></td>
                <td>1 video (10–60s)</td>
                <td>RF-01, RF-02, RF-03</td>
              </tr>
              <tr>
                <td><strong>Checkout</strong> (saida)</td>
                <td>Executor B — Expedicao/Doca</td>
                <td>Doca de carregamento</td>
                <td><code>/checkout</code></td>
                <td>3–20 fotos</td>
                <td>RF-05, RF-06, RF-04</td>
              </tr>
            </tbody>
          </Table>

          <h3>Regras do modelo</h3>
          <ul>
            <li><strong>Checkin sozinho</strong> NAO gera veredicto — apenas confirmacao de registro ("Aguardando checkout")</li>
            <li><strong>Checkout</strong> dispara o processamento final e gera o laudo completo</li>
            <li>Vinculacao checkin ↔ checkout e feita pela <strong>placa OCR</strong> do video</li>
            <li>Checkout sem checkin previo <strong>nao e permitido</strong></li>
            <li>Checkin expira apos 24h sem checkout (configuravel) → status <code>expirada</code></li>
          </ul>

          <h3>Vinculacao</h3>
          <CodeBlock>{`
Checkin cria:  vistoria_inspections { id, placa, status: 'aguardando_checkout', checkin_data: {...} }
                        |
                        | placa OCR
                        v
Checkout busca: SELECT * FROM vistoria_inspections WHERE status = 'aguardando_checkout'
Operador B seleciona o checkin correto pela placa
Checkout atualiza: { checkout_data, result, status: 'completa', verdict, score }
          `.trim()}</CodeBlock>
        </Section>

        {/* ---- 4. FLUXO CHECKIN ---- */}
        <Section>
          <h2 id="fluxo-checkin">4. Fluxo de Checkin — Executor A (Portaria)</h2>
          <p>4 steps. Tempo estimado: ~2 minutos.</p>

          <FlowDiagram>
            <FlowStep $active>1. Identificacao</FlowStep>
            <FlowArrow>→</FlowArrow>
            <FlowStep>2. Video Guiado</FlowStep>
            <FlowArrow>→</FlowArrow>
            <FlowStep>3. Processamento IA</FlowStep>
            <FlowArrow>→</FlowArrow>
            <FlowStep>4. Confirmacao</FlowStep>
          </FlowDiagram>

          <h3>Step 1 — Identificacao</h3>
          <ul>
            <li><strong>CD / Centro de Distribuicao:</strong> select com lista da config</li>
            <li><strong>Nome do Operador:</strong> preenchido automaticamente do perfil logado</li>
            <li><strong>Tipo de Veiculo:</strong> Caminhao, Carreta, Bitrem, Van, VUC</li>
            <li><strong>Metadados opcionais:</strong> OS (Ordem de Servico), CT-e (Conhecimento de Transporte)</li>
            <li><strong>GPS:</strong> capturado automaticamente via <code>navigator.geolocation</code></li>
            <li><strong>Timestamp:</strong> registrado automaticamente</li>
          </ul>

          <h3>Step 2 — Video Guiado</h3>
          <ul>
            <li>Camera traseira via <code>getUserMedia</code> com MediaRecorder (WebM/VP8)</li>
            <li>Duracao minima: 10s (configuravel) | Duracao maxima: 60s (configuravel)</li>
            <li>Guia de filmagem progressivo: Placa → Frente → Lateral Esq. → Traseira → Lateral Dir. → Pneus</li>
            <li>Botao PARAR habilitado somente apos duracao minima</li>
            <li>Demo: video pre-carregado do Supabase Storage (<code>?demo=1</code>)</li>
          </ul>

          <h3>Step 3 — Processamento IA</h3>
          <ul>
            <li>Frames extraidos do video (quantidade configuravel, default: 8)</li>
            <li>Frames enviados para Edge Function <code>vistoria-checkin</code></li>
            <li>Barra de progresso com steps descritivos: Extraindo frames → Identificando placa → Avaliando checklist → Finalizando</li>
            <li>Timeout: 45s (Gemini 2.5 Pro pode levar ~30s com multiplos frames)</li>
          </ul>

          <h3>Step 4 — Confirmacao (3 variantes)</h3>
          <Table>
            <thead><tr><th>Variante</th><th>Condicao</th><th>Acao disponivel</th></tr></thead>
            <tbody>
              <tr><td>Sucesso</td><td>Placa lida + checklist ok</td><td>[Novo Checkin]</td></tr>
              <tr><td>Inconclusivo — placa</td><td>OCR abaixo do threshold ou nulo</td><td>[Refazer Video]</td></tr>
              <tr><td>Atencao — itens NOK</td><td>1 ou mais itens do checklist NOK</td><td>[Novo Checkin] com alerta</td></tr>
            </tbody>
          </Table>
          <InfoBox>
            Sem placa identificada, o checkout nao pode ser vinculado por placa.
            O operador pode refazer o video ou (se configurado) registrar sem placa.
          </InfoBox>
        </Section>

        {/* ---- 5. FLUXO CHECKOUT ---- */}
        <Section>
          <h2 id="fluxo-checkout">5. Fluxo de Checkout — Executor B (Expedicao)</h2>
          <p>5 steps. Tempo estimado: ~3 minutos.</p>

          <FlowDiagram>
            <FlowStep $active>1. Selecionar Checkin</FlowStep>
            <FlowArrow>→</FlowArrow>
            <FlowStep>2. Confirmar Veiculo</FlowStep>
            <FlowArrow>→</FlowArrow>
            <FlowStep>3. Fotos Guiadas</FlowStep>
            <FlowArrow>→</FlowArrow>
            <FlowStep>4. Processamento IA</FlowStep>
            <FlowArrow>→</FlowArrow>
            <FlowStep>5. Resultado</FlowStep>
          </FlowDiagram>

          <h3>Step 1 — Selecionar Checkin</h3>
          <ul>
            <li>Lista de checkins com <code>status = 'aguardando_checkout'</code></li>
            <li>Busca por placa (input com filtro em tempo real)</li>
            <li>Cards: placa, CD, hora checkin, resumo checklist, operador A</li>
            <li>Via URL <code>/checkout/:id</code>: pre-seleciona o checkin direto (atalho do Dashboard)</li>
          </ul>

          <h3>Step 2 — Confirmar Veiculo</h3>
          <ul>
            <li>Card com dados do checkin: placa, CD, hora, operador A, tipo veiculo, checklist resumido</li>
            <li>Campo Operador B (preenchido do perfil logado)</li>
            <li>GPS capturado automaticamente</li>
            <li>Botao [← Trocar] volta ao Step 1</li>
          </ul>

          <h3>Step 3 — Fotos Guiadas (Upload Incremental)</h3>
          <ul>
            <li>Camera in-app (<code>getUserMedia</code>) ou galeria (file input)</li>
            <li>Cada foto e <strong>enviada para o Storage imediatamente</strong> apos captura (upload incremental)</li>
            <li>Cada thumbnail mostra: spinner (enviando), check (confirmado), X vermelho (erro)</li>
            <li>Minimo de fotos configuravel (default: 3). Botao "Analisar" habilitado quando min. atingido com fotos confirmadas</li>
            <li>Demo: URLs do Storage setadas diretamente (instantaneo, sem download)</li>
          </ul>

          <h3>Step 4 — Processamento IA</h3>
          <ul>
            <li>Envia apenas <code>{'{ inspection_id, photo_paths[] }'}</code> — Edge Function baixa do Storage</li>
            <li>Status intermediario <code>'processando'</code> gravado no banco antes de chamar Gemini</li>
            <li>Steps: Analisando fotos → Detectando carga → Classificando → Conciliando com checkin → Gerando veredicto</li>
          </ul>

          <h3>Step 5 — Resultado (3 variantes)</h3>
          <Table>
            <thead><tr><th>Variante</th><th>Condicao</th><th>Acoes</th></tr></thead>
            <tbody>
              <tr><td>Aprovado / Reprovado</td><td>Ciclo completo com veredicto definido</td><td>[Novo Checkout] [Ver Laudo]</td></tr>
              <tr><td>Nao e o mesmo veiculo</td><td>Conciliacao = NAO</td><td>[Refazer Fotos] [Trocar Checkin]</td></tr>
              <tr><td>Carga nao identificada</td><td>RF-05 = INCONCLUSIVO</td><td>[Refazer Fotos]</td></tr>
            </tbody>
          </Table>
        </Section>

        {/* ---- 6. PIPELINE DE IA ---- */}
        <Section>
          <h2 id="pipeline-ia">6. Pipeline de IA (RF-01 a RF-07)</h2>
          <p>
            Provider primario: <strong>Gemini 2.5 Pro</strong> (Google). Fallback: <strong>GPT-4V</strong> (OpenAI).
            Todos os prompts configuraveis via <code>/configuracoes</code>. Outputs sempre em JSON
            (<code>responseMimeType: 'application/json'</code> no Gemini).
          </p>

          <Collapsible title="RF-01 — Leitura de Placa (OCR) — Checkin" defaultOpen>
            <p><strong>Input:</strong> Frames do video (base64) — 8 por default</p>
            <p><strong>Output:</strong></p>
            <CodeBlock>{`{
  "placa": {
    "text": "ABC1D23",        // string — null se nao identificada
    "confidence": 0.97,      // 0.0 a 1.0
    "status": "OK",          // OK | INCONCLUSIVO
    "bbox": {                // bounding box em % da imagem
      "x": 15, "y": 40, "w": 25, "h": 8,
      "frame_index": 2       // frame do video onde foi detectada
    }
  }
}`}</CodeBlock>
            <p><strong>Pos-processamento:</strong> <code>normalizePlate()</code> corrige deterministicamente confusoes O↔0 baseado na posicao (Mercosul: L L L N L N N).</p>
            <p><strong>Threshold:</strong> confidence {'<'} <code>checkin_plate_min_confidence</code> (default 80%) → INCONCLUSIVO + recaptura</p>
          </Collapsible>

          <Collapsible title="RF-02 — Validacao do Video — Checkin">
            <p><strong>Output:</strong> <code>APROVADO | REPROVADO | INCONCLUSIVO</code> + confidence + justificativa textual</p>
            <p>Threshold configuravel: <code>checkin_video_min_confidence</code> (default 70%)</p>
          </Collapsible>

          <Collapsible title="RF-03 — Checklist de Integridade — Checkin">
            <p><strong>Itens padrao (editaveis):</strong> Carroceria, Assoalho, Pneus, Lanternas, Parabrisa</p>
            <p><strong>Output por item:</strong></p>
            <CodeBlock>{`{
  "carroceria": {
    "status": "OK",          // OK | NAO_OK | INCONCLUSIVO
    "confidence": 0.92,
    "evidence": "Sem amassados visíveis",
    "applicable": true,      // false se item nao visivel no angulo
    "bbox": { "x": 5, "y": 10, "w": 80, "h": 40, "frame_index": 4 }
  }
}`}</CodeBlock>
            <p>Minimo de itens OK para registrar: configuravel (default: 3 de 5)</p>
          </Collapsible>

          <Collapsible title="RF-04 — Conciliacao Video × Fotos — Checkout">
            <p>Compara assinaturas visuais do checkin (video) com as do checkout (fotos).</p>
            <p><strong>Assinaturas comparadas (editaveis):</strong> Cor predominante, Tipo de implemento, Quantidade de eixos, Lanternas/para-choque, Adesivos/logotipos, Marcas visuais permanentes</p>
            <p><strong>Output:</strong></p>
            <CodeBlock>{`{
  "match": "MESMO_VEICULO",   // MESMO_VEICULO | PROVAVEL | NAO | INCONCLUSIVO
  "confidence": 0.96,
  "details": {
    "cor": "MESMO", "implemento": "MESMO", "eixos": "MESMO",
    "lanternas": "PROVAVEL", "adesivos": "MESMO", "marcas": "MESMO"
  }
}`}</CodeBlock>
            <p>Thresholds: ≥ 90% → MESMO | 70–90% → PROVAVEL | {'<'} 70% → NAO</p>
          </Collapsible>

          <Collapsible title="RF-05 — Deteccao de Carga — Checkout">
            <p><strong>Output:</strong> <code>SIM | NAO | INCONCLUSIVO</code> + confidence</p>
            <p>Threshold: <code>checkout_cargo_min_confidence</code> (default 80%)</p>
          </Collapsible>

          <Collapsible title="RF-06 — Classificacao da Carga — Checkout">
            <p><strong>Taxonomia padrao (editavel — 10 classes):</strong></p>
            <ul>
              <li>Container | Caixotes de madeira / engradados | Tambores / bombonas</li>
              <li>Carga paletizada | Big bag | Sacaria | Volumes avulsos</li>
              <li>Tubos / perfis | Maquinas / equipamentos | Outros (excecao)</li>
            </ul>
            <p>Abaixo do threshold de classificacao → classe "Outros (excecao)"</p>
          </Collapsible>

          <Collapsible title="RF-07 — Evidencia Auditavel — Checkin + Checkout">
            <p>Toda decisao da IA deve conter:</p>
            <ul>
              <li><strong>Frame/foto ancora:</strong> base64 embutido ou URL do Storage</li>
              <li><strong>Bounding box:</strong> coordenadas em % da imagem (x, y, w, h)</li>
              <li><strong>Confidence:</strong> 0.0 a 1.0</li>
              <li><strong>Evidencia textual:</strong> justificativa da IA em linguagem natural</li>
            </ul>
            <p>Coberta em 100% das decisoes (criterio de aceite da spec).</p>
          </Collapsible>

          <h3>Score e Veredicto Final</h3>
          <Table>
            <thead><tr><th>RF</th><th>Nome</th><th>Peso padrao</th></tr></thead>
            <tbody>
              <tr><td>RF-01</td><td>Placa</td><td>15%</td></tr>
              <tr><td>RF-02</td><td>Validacao video</td><td>10%</td></tr>
              <tr><td>RF-03</td><td>Checklist</td><td>30%</td></tr>
              <tr><td>RF-04</td><td>Conciliacao</td><td>20%</td></tr>
              <tr><td>RF-05</td><td>Carga</td><td>15%</td></tr>
              <tr><td>RF-06</td><td>Classificacao</td><td>10%</td></tr>
            </tbody>
          </Table>
          <Table>
            <thead><tr><th>Score</th><th>Veredicto</th></tr></thead>
            <tbody>
              <tr><td>≥ 70</td><td>APROVADO</td></tr>
              <tr><td>40–69</td><td>INCONCLUSIVO</td></tr>
              <tr><td>{'<'} 40</td><td>REPROVADO</td></tr>
            </tbody>
          </Table>
          <p style={{ fontSize: 13, color: colors.textSecondary }}>
            Todos os pesos e thresholds sao configuráveis em <code>/configuracoes</code> {'>'} Aba Laudo.
          </p>
        </Section>

        {/* ---- 7. UPLOAD INCREMENTAL ---- */}
        <Section>
          <h2 id="upload-incremental">7. Upload Incremental (Sprint 11)</h2>
          <p>
            Arquitetura de checkout multi-CD: cada foto e enviada para o Supabase Storage
            imediatamente apos a captura, em vez de acumular tudo e enviar em um unico payload.
          </p>

          <h3>Fluxo</h3>
          <CodeBlock>{`
Operador captura foto 1 → upload imediato para Storage → thumbnail mostra check ✓
Operador captura foto 2 → upload imediato para Storage → thumbnail mostra check ✓
...foto N
Operador clica "Analisar" → envia apenas: { inspection_id, photo_paths: [url1, url2, ...] }
Edge Function: baixa fotos do Storage em lotes de 10 → Gemini → salva resultado
          `.trim()}</CodeBlock>

          <h3>Beneficios</h3>
          <Table>
            <thead><tr><th>Aspecto</th><th>Antes (payload unico)</th><th>Agora (incremental)</th></tr></thead>
            <tbody>
              <tr><td>Payload para Edge</td><td>~5MB base64</td><td>~1KB (so paths)</td></tr>
              <tr><td>Rede instavel</td><td>40 fotos perdidas</td><td>Retry por foto individual</td></tr>
              <tr><td>Edge timeout</td><td>Upload + IA + DB em 60s</td><td>So IA + DB em 60s</td></tr>
              <tr><td>Bbox checkout</td><td>Dependia de config persist_storage</td><td>Fotos sempre no Storage</td></tr>
            </tbody>
          </Table>

          <h3>Path no Storage</h3>
          <CodeBlock>{`{inspection_id}/foto-{001..040}.jpg
Exemplo: afcb5bd1-2140.../foto-001.jpg

Bucket: vistoria-photos
Policy: autenticados podem fazer upload
Leitura: publica`}</CodeBlock>
        </Section>

        {/* ---- 8. LAUDO ---- */}
        <Section>
          <h2 id="laudo">8. Laudo de Inspecao (<code>/resultado/:id</code>)</h2>
          <p>
            URL permanente e auditavel. Duas views conforme o role do usuario logado.
          </p>

          <h3>View Operador (role: operador)</h3>
          <ul>
            <li>Veredicto grande (APROVADO / INCONCLUSIVO / REPROVADO)</li>
            <li>Placa + CD + hora</li>
            <li>Checklist resumido (contadores: X OK, Y NAO OK, Z INC.)</li>
            <li>Tipo de carga + conciliacao</li>
            <li>ID da inspecao + tempo de processamento</li>
            <li>Botao [Novo Checkout]</li>
          </ul>

          <h3>View Gestor/Admin (role: gestor ou admin)</h3>
          <ul>
            <li>Tudo da view operador</li>
            <li><strong>RF-01 a RF-07 detalhados:</strong> status + confidence + evidencia textual + frame/foto + bounding box overlay</li>
            <li><strong>Identificacao:</strong> GPS checkin + GPS checkout, OS, CT-e, operadores</li>
            <li><strong>Cobertura RF-07:</strong> X/X decisoes com evidencia (meta: 100%)</li>
            <li><strong>Meta tecnica:</strong> engine, modelo IA, prompt version, config usada, processing_time_ms</li>
            <li><strong>Timeline:</strong> cada evento com ator, timestamp e GPS (de <code>vistoria_logs</code>)</li>
            <li><strong>StarRating por RF:</strong> gestor avalia cada secao (1-5 estrelas) + campo de correcao → salvo em <code>agent_feedback</code></li>
            <li>Botoes [Imprimir] [Compartilhar]</li>
          </ul>

          <h3>Bounding Box Overlay</h3>
          <p>
            Componente inline que recebe coordenadas em % (<code>x, y, w, h</code>) e desenha
            um retangulo semitransparente sobre o frame ou foto. Coordenadas fornecidas diretamente
            pela IA no JSON de resposta.
          </p>

          <h3>Aprendizado Continuo (StarRating)</h3>
          <p>Feedback salvo em <code>agent_feedback</code> (<code>agent_id = 'vistoria'</code>):</p>
          <CodeBlock>{`{
  agent_id: 'vistoria',
  action_type: 'rf06_review',
  action_id: inspection_id,
  rating: 3,
  user_comment: "Era sacaria, nao big bag",
  was_edited: true,
  edit_diff: { "rf06_class": { "from": "big_bag", "to": "sacaria" } }
}`}</CodeBlock>
        </Section>

        {/* ---- 9. ROTAS ---- */}
        <Section>
          <h2 id="rotas">9. Rotas e Paginas</h2>
          <p>Dominio: <strong>vistoria.proagentes.ai</strong></p>
          <Table>
            <thead>
              <tr><th>Rota</th><th>Componente</th><th>Auth / Role</th><th>Descricao</th></tr>
            </thead>
            <tbody>
              <tr><td><code>/</code></td><td>VistorIA (index.js)</td><td>Publico</td><td>Landing — spec dos RFs + demo por persona</td></tr>
              <tr><td><code>/login</code></td><td>Login.js</td><td>Publico</td><td>Email + senha. Redirect por role apos login</td></tr>
              <tr><td><code>/checkin</code></td><td>CheckinFlow.js</td><td>operador</td><td>Executor A — 4 steps (video)</td></tr>
              <tr><td><code>/checkout</code></td><td>CheckoutFlow.js</td><td>operador</td><td>Executor B — 5 steps (fotos). Lista checkins pendentes</td></tr>
              <tr><td><code>/checkout/:id</code></td><td>CheckoutFlow.js</td><td>operador</td><td>Checkout pre-selecionando checkin especifico</td></tr>
              <tr><td><code>/resultado/:id</code></td><td>InspectionResult.js</td><td>operador</td><td>Laudo permanente. View simples (operador) ou completa (gestor)</td></tr>
              <tr><td><code>/dashboard</code></td><td>Dashboard.js</td><td>gestor</td><td>Pendentes / Completas / Expiradas + filtros + SLA</td></tr>
              <tr><td><code>/configuracoes</code></td><td>AdminSettings.js</td><td>admin</td><td>8 abas — 51 hiperparametros em vistoria_config</td></tr>
              <tr><td><code>/proposta</code></td><td>Proposta.js</td><td>Publico</td><td>Proposta comercial interativa</td></tr>
              <tr><td><code>/docs</code></td><td>Docs.js</td><td>Publico</td><td>Esta documentacao</td></tr>
              <tr><td><code>/validacao</code></td><td>redirect → /checkin</td><td>—</td><td>Rota legada redirecionada</td></tr>
            </tbody>
          </Table>

          <h3>Redirect apos Login por Role/Function</h3>
          <Table>
            <thead><tr><th>Role</th><th>Function</th><th>Destino</th></tr></thead>
            <tbody>
              <tr><td>admin</td><td>admin</td><td><code>/configuracoes</code></td></tr>
              <tr><td>gestor</td><td>gestao</td><td><code>/dashboard</code></td></tr>
              <tr><td>operador</td><td>portaria</td><td><code>/checkin</code></td></tr>
              <tr><td>operador</td><td>expedicao</td><td><code>/checkout</code></td></tr>
            </tbody>
          </Table>

          <h3>Estrutura de Arquivos</h3>
          <CodeBlock>{`src/modules/VistorIA/
├── index.js                    # Landing page (demo por persona + terms)
├── components/
│   ├── theme.js                # Design tokens — vistoriaColors
│   └── VistorIARouteGuard.js   # Auth + role guard — redireciona para /login
└── pages/
    ├── Login.js                # Tela de login + resolveDestination()
    ├── CheckinFlow.js          # Executor A — 4 steps (video + IA)
    ├── CheckoutFlow.js         # Executor B — 5 steps (fotos + upload incremental)
    ├── InspectionResult.js     # Laudo (2 views + bbox + StarRating)
    ├── Dashboard.js            # Painel gestor (3 secoes + filtros)
    ├── AdminSettings.js        # Configuracoes (8 abas + vistoria_config)
    ├── Proposta.js             # Proposta comercial
    └── Docs.js                 # Esta pagina

supabase/functions/
├── vistoria-checkin/index.ts   # RF-01/02/03 — v10
├── vistoria-checkout/index.ts  # RF-04/05/06 + veredicto — v10
├── vistoria-api/index.ts       # REST API para TMS/ERP
└── vistoria-workflow-executor/ # Edge Function legada (nao usada nas rotas principais)`}</CodeBlock>
        </Section>

        {/* ---- 10. BANCO DE DADOS ---- */}
        <Section>
          <h2 id="banco-dados">10. Banco de Dados</h2>
          <p>PostgreSQL (Supabase). Row Level Security (RLS) em todas as tabelas.</p>

          <Collapsible title="vistoria_inspections — Registro principal de inspecoes" defaultOpen>
            <Table>
              <thead><tr><th>Coluna</th><th>Tipo</th><th>Descricao</th></tr></thead>
              <tbody>
                <tr><td><code>id</code></td><td>UUID PK</td><td>ID da inspecao</td></tr>
                <tr><td><code>placa</code></td><td>TEXT</td><td>Placa OCR do checkin</td></tr>
                <tr><td><code>cd_name</code></td><td>TEXT NOT NULL</td><td>Centro de distribuicao</td></tr>
                <tr><td><code>status</code></td><td>TEXT</td><td>aguardando_checkout | processando | completa | expirada</td></tr>
                <tr><td><code>checkin_at</code></td><td>TIMESTAMPTZ</td><td>Timestamp do checkin</td></tr>
                <tr><td><code>checkin_operator</code></td><td>TEXT</td><td>Nome do Executor A</td></tr>
                <tr><td><code>checkin_user_id</code></td><td>UUID FK</td><td>auth.users</td></tr>
                <tr><td><code>checkin_gps</code></td><td>JSONB</td><td>{'{'}lat, lng, accuracy{'}'}</td></tr>
                <tr><td><code>checkin_video_frames</code></td><td>JSONB</td><td>Frames base64 ou refs storage</td></tr>
                <tr><td><code>checkin_data</code></td><td>JSONB</td><td>{'{'}plate:{'{'}text,confidence,bbox,frame_base64{'}'}, checklist, validation{'}'}</td></tr>
                <tr><td><code>os_number</code></td><td>TEXT</td><td>Ordem de Servico (opcional)</td></tr>
                <tr><td><code>cte_number</code></td><td>TEXT</td><td>CT-e (opcional)</td></tr>
                <tr><td><code>vehicle_type</code></td><td>TEXT</td><td>Tipo de veiculo</td></tr>
                <tr><td><code>checkout_at</code></td><td>TIMESTAMPTZ</td><td>Timestamp do checkout</td></tr>
                <tr><td><code>checkout_operator</code></td><td>TEXT</td><td>Nome do Executor B</td></tr>
                <tr><td><code>checkout_user_id</code></td><td>UUID FK</td><td>auth.users</td></tr>
                <tr><td><code>checkout_gps</code></td><td>JSONB</td><td>{'{'}lat, lng, accuracy{'}'}</td></tr>
                <tr><td><code>checkout_photos</code></td><td>JSONB</td><td>Fotos base64 (legado)</td></tr>
                <tr><td><code>checkout_photo_urls</code></td><td>JSONB</td><td>URLs Storage (incremental)</td></tr>
                <tr><td><code>checkout_data</code></td><td>JSONB</td><td>{'{'}cargo, conciliation, photo_details[]{'}'}</td></tr>
                <tr><td><code>result</code></td><td>JSONB</td><td>Laudo completo consolidado (RF-01 a RF-07)</td></tr>
                <tr><td><code>score</code></td><td>INTEGER</td><td>0–100</td></tr>
                <tr><td><code>verdict</code></td><td>TEXT</td><td>APROVADO | REPROVADO | INCONCLUSIVO</td></tr>
                <tr><td><code>completed_at</code></td><td>TIMESTAMPTZ</td><td>Timestamp do laudo gerado</td></tr>
                <tr><td><code>processing_time_ms</code></td><td>INTEGER</td><td>Tempo da IA (ms)</td></tr>
                <tr><td><code>engine_version</code></td><td>TEXT</td><td>v1 (default)</td></tr>
              </tbody>
            </Table>
          </Collapsible>

          <Collapsible title="vistoria_logs — Rastreabilidade e auditoria">
            <Table>
              <thead><tr><th>Coluna</th><th>Tipo</th><th>Descricao</th></tr></thead>
              <tbody>
                <tr><td><code>id</code></td><td>UUID PK</td><td></td></tr>
                <tr><td><code>inspection_id</code></td><td>UUID FK</td><td>Ref: vistoria_inspections</td></tr>
                <tr><td><code>event_type</code></td><td>TEXT</td><td>checkin_started | checkin_completed | checkout_started | checkout_completed | config_changed | error</td></tr>
                <tr><td><code>actor_name</code></td><td>TEXT</td><td>Nome do usuario ou "Sistema"</td></tr>
                <tr><td><code>actor_id</code></td><td>UUID FK</td><td>auth.users</td></tr>
                <tr><td><code>gps</code></td><td>JSONB</td><td>{'{'}lat, lng, accuracy{'}'}</td></tr>
                <tr><td><code>details</code></td><td>JSONB</td><td>Payload livre (varia por nivel de log)</td></tr>
                <tr><td><code>created_at</code></td><td>TIMESTAMPTZ</td><td></td></tr>
              </tbody>
            </Table>
            <p style={{ fontSize: 13 }}>Tres niveis de log (configuravel): Minimo | Normal | Detalhado</p>
          </Collapsible>

          <Collapsible title="vistoria_config — Hiperparametros (51 chaves)">
            <p>Tabela key/value JSONB. Carregada pelas Edge Functions a cada request. Alteracoes tomam efeito na proxima inspecao sem necessidade de deploy.</p>
            <Table>
              <thead><tr><th>Prefixo</th><th>Aba</th><th>Exemplos</th></tr></thead>
              <tbody>
                <tr><td><code>checkin_</code></td><td>Checkin</td><td>plate_min_confidence, video_duration_min, checklist_items, prompt</td></tr>
                <tr><td><code>checkout_</code></td><td>Checkout</td><td>cargo_min_confidence, min_photos, cargo_taxonomy, prompt</td></tr>
                <tr><td><code>conciliation_</code></td><td>Conciliacao</td><td>confidence_same, confidence_probable, block_if_no, prompt</td></tr>
                <tr><td><code>laudo_</code></td><td>Laudo</td><td>score_approved, score_inconclusive, weight_rf01..06, expiration_hours</td></tr>
                <tr><td><code>general_</code></td><td>Geral</td><td>primary_model, fallback_model, cds, vehicle_types, log_level</td></tr>
                <tr><td><code>api_</code></td><td>API</td><td>key, fields_returned, tms_field_mapping</td></tr>
              </tbody>
            </Table>
          </Collapsible>

          <Collapsible title="vistoria_users — Usuarios e roles por instalacao">
            <Table>
              <thead><tr><th>Coluna</th><th>Tipo</th><th>Descricao</th></tr></thead>
              <tbody>
                <tr><td><code>id</code></td><td>UUID PK</td><td></td></tr>
                <tr><td><code>auth_user_id</code></td><td>UUID FK</td><td>auth.users</td></tr>
                <tr><td><code>name</code></td><td>TEXT</td><td>Nome do usuario</td></tr>
                <tr><td><code>email</code></td><td>TEXT</td><td>Email</td></tr>
                <tr><td><code>role</code></td><td>TEXT</td><td>operador | gestor | admin</td></tr>
                <tr><td><code>function</code></td><td>TEXT</td><td>portaria | expedicao | gestao | admin (determina redirect apos login)</td></tr>
                <tr><td><code>is_active</code></td><td>BOOLEAN</td><td></td></tr>
              </tbody>
            </Table>
          </Collapsible>
        </Section>

        {/* ---- 11. EDGE FUNCTIONS ---- */}
        <Section>
          <h2 id="edge-functions">11. Edge Functions</h2>

          <Collapsible title="vistoria-checkin — v10 (RF-01, RF-02, RF-03)" defaultOpen>
            <p><strong>Endpoint:</strong></p>
            <CodeBlock>{`POST https://rotohdtbuqpeymjaiybu.supabase.co/functions/v1/vistoria-checkin
Headers: Authorization: Bearer {JWT} | Content-Type: application/json`}</CodeBlock>
            <p><strong>Request:</strong></p>
            <CodeBlock>{`{
  "video_frames": ["base64...", ...],   // 8 frames extraidos do video
  "cd_name": "CD Sao Paulo",
  "operator_name": "Joao Silva",
  "user_id": "uuid",
  "gps": { "lat": -23.55, "lng": -46.63, "accuracy": 12 },
  "os_number": "45892",                // opcional
  "cte_number": "35260300001",         // opcional
  "vehicle_type": "Carreta",           // opcional
  "demo": false
}`}</CodeBlock>
            <p><strong>Response (sucesso):</strong></p>
            <CodeBlock>{`{
  "success": true,
  "inspection_id": "uuid",
  "placa": { "text": "ABC1D23", "confidence": 0.97, "status": "OK",
             "bbox": { "x": 15, "y": 40, "w": 25, "h": 8, "frame_index": 2 },
             "frame_base64": "base64_do_frame_2" },
  "checklist": {
    "carroceria": { "status": "OK", "confidence": 0.92, "evidence": "...", "bbox": {...} },
    ...
  },
  "validation": { "status": "APROVADO", "confidence": 0.94, "evidence": "..." },
  "processing_time_ms": 18500
}`}</CodeBlock>
            <p>Apos sucesso: registro em <code>vistoria_inspections</code> com <code>status = 'aguardando_checkout'</code>.</p>
          </Collapsible>

          <Collapsible title="vistoria-checkout — v10 (RF-04, RF-05, RF-06 + veredicto)">
            <p><strong>Request:</strong></p>
            <CodeBlock>{`{
  "inspection_id": "uuid",             // obrigatorio
  "photo_paths": [                     // preferencial (upload incremental)
    "https://....supabase.co/storage/v1/object/public/vistoria-photos/uuid/foto-001.jpg",
    ...
  ],
  "cargo_photos": ["base64..."],       // legado (retrocompat — demo, testes)
  "operator_name": "Maria Santos",
  "user_id": "uuid",
  "gps": { "lat": -23.55, "lng": -46.63, "accuracy": 8 }
}`}</CodeBlock>
            <p><strong>Response (sucesso):</strong></p>
            <CodeBlock>{`{
  "success": true,
  "inspection_id": "uuid",
  "verdict": "APROVADO",
  "score": 92,
  "cargo": { "present": "SIM", "class": "Carga paletizada", "confidence": 0.89,
             "bbox": { "x": 5, "y": 20, "w": 90, "h": 60, "photo_index": 0 } },
  "conciliation": { "match": "MESMO_VEICULO", "confidence": 0.96, "details": {...} },
  "checklist_summary": { "ok": 4, "not_ok": 0, "inc": 1 },
  "processing_time_ms": 21000
}`}</CodeBlock>
            <p>Apos sucesso: registro atualizado com <code>status = 'completa'</code>.</p>
          </Collapsible>

          <Collapsible title="vistoria-api — REST publica para TMS/ERP">
            <p><strong>Autenticacao:</strong> header <code>x-api-key: vst-...</code> (valida contra <code>api_keys</code>)</p>
            <CodeBlock>{`GET /api/v1/inspections/:id
GET /api/v1/inspections?placa=ABC1D23
GET /api/v1/inspections?status=completa&cd=CD+Sao+Paulo`}</CodeBlock>
            <p>Campos retornados configuraveis em <code>/configuracoes</code> {'>'} Aba API.</p>
          </Collapsible>

          <h3>Resolucao de API Keys (Gemini / OpenAI)</h3>
          <ol>
            <li>Variavel de ambiente (<code>GOOGLE_AI_API_KEY</code> ou <code>OPENAI_API_KEY</code>)</li>
            <li>Tabela <code>api_keys</code> (service = 'google_ai' ou 'openai', is_active = true)</li>
            <li>Configuravel em <code>/admin/configuracoes?tab=integracoes</code></li>
          </ol>
          <InfoBox $color="#fef3c7" $border="#f59e0b">
            A API key Gemini ativa suporta apenas <code>gemini-2.5-pro</code>. Trocar para <code>gemini-2.0-flash</code> retorna 404.
            Nao alterar o modelo primario sem validar a key primeiro.
          </InfoBox>
        </Section>

        {/* ---- 12. CONFIGURACOES ---- */}
        <Section>
          <h2 id="configuracoes">12. Configuracoes (<code>/configuracoes</code>)</h2>
          <p>
            8 abas. Todas as regras de negocio e hiperparametros persistidos em <code>vistoria_config</code>.
            Alteracoes tomam efeito na proxima inspecao sem deploy. Acesso restrito: role <code>admin</code>.
          </p>
          <Table>
            <thead><tr><th>Aba</th><th>Conteudo</th></tr></thead>
            <tbody>
              <tr><td>Checkin</td><td>Thresholds placa/video/checklist, duracao video, frames, itens do checklist (editaveis), prompt da IA</td></tr>
              <tr><td>Checkout</td><td>Thresholds carga/classificacao, min/max fotos, taxonomia de carga (editavel), prompt da IA</td></tr>
              <tr><td>Conciliacao</td><td>Thresholds MESMO/PROVAVEL, assinaturas visuais (editaveis), bloquear se NAO, prompt</td></tr>
              <tr><td>Laudo</td><td>Scores APROVADO/INC, pesos por RF (6 sliders somando 100%), expiracao, persistencia Storage, retencao</td></tr>
              <tr><td>Geral</td><td>CDs cadastrados, tipos de veiculo, provider primario+fallback, hiperparametros IA (temperature, max_tokens), nivel de log, notificacoes</td></tr>
              <tr><td>API</td><td>API key (vst-) com [Regenerar][Copiar][Testar], sistemas conectados, campos retornados, mapeamento TMS/ERP</td></tr>
              <tr><td>Custos</td><td>Estimativa de custo por inspecao por modelo (Gemini 2.5 Pro, GPT-4o, etc.) em USD e BRL</td></tr>
              <tr><td>Motoristas</td><td>Gestao de motoristas cadastrados</td></tr>
            </tbody>
          </Table>
          <p style={{ fontSize: 13, color: colors.textSecondary }}>
            Footer de auditoria em cada aba: "Ultima alteracao: [usuario] | [data]". Registra <code>config_changed</code> em <code>vistoria_logs</code>.
          </p>
          <InfoBox>
            Prompts: cada aba exibe o prompt default read-only + botao "Personalizar" para override editavel + "Restaurar padrao" para limpar o override. Prompt real usado pela IA e sempre visivel.
          </InfoBox>
        </Section>

        {/* ---- 13. AUTENTICACAO ---- */}
        <Section>
          <h2 id="autenticacao">13. Autenticacao e Roles</h2>

          <h3>Provider</h3>
          <ul>
            <li>Supabase Auth — email + senha</li>
            <li>JWT com <code>autoRefreshToken</code> e <code>persistSession</code></li>
            <li>Safety timeout: 8s no AuthContext, 15s em paginas com fetch</li>
          </ul>

          <h3>Roles</h3>
          <Table>
            <thead><tr><th>Role</th><th>Acesso</th></tr></thead>
            <tbody>
              <tr><td><code>operador</code></td><td>Checkin, checkout, resultado (view simples)</td></tr>
              <tr><td><code>gestor</code></td><td>Tudo do operador + dashboard + resultado (view completa com laudo detalhado)</td></tr>
              <tr><td><code>admin</code></td><td>Tudo do gestor + configuracoes</td></tr>
            </tbody>
          </Table>

          <h3>Guard de Rotas (VistorIARouteGuard)</h3>
          <CodeBlock>{`
Operador acessa /checkin
      |
      v
Tem sessao? --> NAO --> /login (state: { from: '/checkin' })
      |                    |
     SIM                apos login --> volta para /checkin
      |
      v
Role >= minRole? --> NAO --> "Acesso restrito"
      |
     SIM --> renderiza pagina
          `.trim()}</CodeBlock>

          <h3>Usuarios configurados (demo)</h3>
          <Table>
            <thead><tr><th>Email</th><th>Role</th><th>Function</th><th>Destino</th></tr></thead>
            <tbody>
              <tr><td>vega@vegarobotics.com.br</td><td>admin</td><td>admin</td><td>/configuracoes</td></tr>
              <tr><td>portaria@vistoria.demo</td><td>operador</td><td>portaria</td><td>/checkin</td></tr>
              <tr><td>expedicao@vistoria.demo</td><td>operador</td><td>expedicao</td><td>/checkout</td></tr>
            </tbody>
          </Table>
        </Section>

        {/* ---- 14. API REST ---- */}
        <Section>
          <h2 id="api-rest">14. API REST para TMS/ERP</h2>
          <p>
            Edge Function <code>vistoria-api</code>. Autenticacao via API key dedicada
            (prefixo <code>vst-</code>), gerenciada em <code>/configuracoes {'>'} API</code>.
          </p>

          <h3>Endpoints</h3>
          <CodeBlock>{`# Laudo por ID
GET /api/v1/inspections/:id
x-api-key: vst-xxxxxxxxxxxxxxxx

# Busca por placa
GET /api/v1/inspections?placa=ABC1D23

# Lista com filtros
GET /api/v1/inspections?status=completa&cd=CD+Sao+Paulo&limit=50`}</CodeBlock>

          <h3>Exemplo de resposta</h3>
          <CodeBlock>{`{
  "id": "afcb5bd1-...",
  "placa": "ABC1D23",
  "cd_name": "CD Sao Paulo",
  "verdict": "APROVADO",
  "score": 92,
  "checkin_at": "2026-03-17T09:14:02Z",
  "completed_at": "2026-03-17T14:30:54Z",
  "cargo_type": "Carga paletizada",
  "conciliation": "MESMO_VEICULO",
  "checklist": {
    "carroceria": "OK", "assoalho": "OK", "pneus": "OK",
    "lanternas": "OK", "parabrisa": "INCONCLUSIVO"
  }
}`}</CodeBlock>

          <h3>Mapeamento para TMS/ERP</h3>
          <p>Configuravel em <code>/configuracoes {'>'} API {'>'} Mapeamento para Sistema Legado</code>:</p>
          <CodeBlock>{`placa       --> PLACA_VEICULO
verdict     --> STATUS_INSPECAO
score       --> NOTA_INSPECAO
cargo_type  --> TIPO_CARGA
cd_name     --> CODIGO_CD
completed_at -> DATA_INSPECAO`}</CodeBlock>
        </Section>

        {/* ---- 15. DESIGN SYSTEM ---- */}
        <Section>
          <h2 id="design-system">15. Design System</h2>
          <p>Definido em <code>src/modules/VistorIA/components/theme.js</code> — objeto <code>vistoriaColors</code>.</p>

          <h3>Paleta de Cores</h3>
          <Table>
            <thead><tr><th>Token</th><th>Valor</th><th>Uso</th></tr></thead>
            <tbody>
              <tr><td><code>primary</code></td><td><span style={{ background: '#0EA5E9', color: '#fff', padding: '1px 8px', borderRadius: 4 }}>#0EA5E9</span></td><td>Botoes, links, destaques</td></tr>
              <tr><td><code>primaryDark</code></td><td><span style={{ background: '#0284C7', color: '#fff', padding: '1px 8px', borderRadius: 4 }}>#0284C7</span></td><td>Hover, headers</td></tr>
              <tr><td><code>success</code></td><td><span style={{ background: '#10B981', color: '#fff', padding: '1px 8px', borderRadius: 4 }}>#10B981</span></td><td>APROVADO, GPS ok, itens OK</td></tr>
              <tr><td><code>warning</code></td><td><span style={{ background: '#F59E0B', color: '#fff', padding: '1px 8px', borderRadius: 4 }}>#F59E0B</span></td><td>INCONCLUSIVO, atencao</td></tr>
              <tr><td><code>danger</code></td><td><span style={{ background: '#EF4444', color: '#fff', padding: '1px 8px', borderRadius: 4 }}>#EF4444</span></td><td>REPROVADO, erros, NAO OK</td></tr>
              <tr><td><code>textPrimary</code></td><td><span style={{ background: '#0f172a', color: '#fff', padding: '1px 8px', borderRadius: 4 }}>#0f172a</span></td><td>Texto principal</td></tr>
              <tr><td><code>textSecondary</code></td><td><span style={{ background: '#475569', color: '#fff', padding: '1px 8px', borderRadius: 4 }}>#475569</span></td><td>Texto secundario</td></tr>
              <tr><td><code>background</code></td><td><span style={{ background: '#ffffff', color: '#333', padding: '1px 8px', borderRadius: 4, border: '1px solid #ddd' }}>#ffffff</span></td><td>Fundo de cards</td></tr>
              <tr><td><code>backgroundAlt</code></td><td><span style={{ background: '#f8fafc', color: '#333', padding: '1px 8px', borderRadius: 4, border: '1px solid #ddd' }}>#f8fafc</span></td><td>Fundo de paginas</td></tr>
            </tbody>
          </Table>

          <h3>Principios de Design</h3>
          <ul>
            <li><strong>Mobile-first:</strong> operadores usam celular no patio/doca. Viewfinder fullscreen, touch targets 44px+</li>
            <li><strong>Veredictos acessiveis:</strong> cor + icone + texto (daltônicos) — verde ✅ OK, amarelo ⚠️ INC., vermelho ❌ NAO OK</li>
            <li><strong>Skeleton loading:</strong> em listas, thumbnails e imagens durante carregamento</li>
            <li><strong>Barra de progresso global:</strong> gradiente acima do header durante carregamentos</li>
            <li><strong>Colapsaveis no mobile:</strong> secoes do laudo colapsaveis para nao sobrecarregar</li>
            <li><strong>styled-components:</strong> transient props ($variant, $active) para evitar warnings DOM</li>
            <li>Animacoes: <code>fadeIn</code>, <code>pulseGlow</code>, <code>shimmer</code> (skeleton)</li>
          </ul>
        </Section>

        {/* ---- 16. DEPLOY ---- */}
        <Section>
          <h2 id="deploy">16. Deploy e Infraestrutura</h2>
          <Table>
            <thead><tr><th>Componente</th><th>Plataforma</th><th>Trigger</th><th>Versao atual</th></tr></thead>
            <tbody>
              <tr><td>Frontend</td><td>Vercel</td><td>Push para <code>master</code></td><td>auto-deploy</td></tr>
              <tr><td>vistoria-checkin</td><td>Supabase Edge</td><td>Deploy via MCP / CLI</td><td>v10</td></tr>
              <tr><td>vistoria-checkout</td><td>Supabase Edge</td><td>Deploy via MCP / CLI</td><td>v10</td></tr>
              <tr><td>vistoria-api</td><td>Supabase Edge</td><td>Deploy via MCP / CLI</td><td>v1</td></tr>
              <tr><td>Banco de dados</td><td>Supabase</td><td>Migrations SQL aplicadas</td><td>9 migrations</td></tr>
              <tr><td>Storage</td><td>Supabase</td><td>Bucket vistoria-photos criado</td><td>ativo</td></tr>
              <tr><td>DNS</td><td>Cloudflare</td><td>CNAME → Vercel</td><td>ativo</td></tr>
            </tbody>
          </Table>

          <h3>URLs</h3>
          <ul>
            <li><strong>Producao:</strong> vistoria.proagentes.ai</li>
            <li><strong>Supabase project:</strong> rotohdtbuqpeymjaiybu.supabase.co</li>
            <li><strong>Storage:</strong> ...supabase.co/storage/v1/object/public/vistoria-photos/</li>
          </ul>

          <h3>Migrations aplicadas</h3>
          <CodeBlock>{`20260306_vistoria_tables.sql          -- tabelas iniciais (legado)
20260312_vistoria_inspections.sql    -- nova tabela principal
20260312_vistoria_logs.sql           -- logs de rastreabilidade
20260312_vistoria_config.sql         -- 51 hiperparametros com defaults
20260312_vistoria_users_function.sql -- coluna function em vistoria_users
20260313_vistoria_ai_usage.sql       -- tracking de uso de IA
20260313_vistoria_expiration.sql     -- logica de expiracao (24h)
20260313_vistoria_rls_fix.sql        -- correcoes de politicas RLS
20260313_vistoria_users_function.sql -- fix adicional function column`}</CodeBlock>
        </Section>

        {/* ---- 17. EXCECOES ---- */}
        <Section>
          <h2 id="excecoes">17. Tabela de Excecoes</h2>
          <Table>
            <thead><tr><th>Situacao</th><th>Resposta da IA</th><th>Tela exibida</th><th>Acao do operador</th></tr></thead>
            <tbody>
              <tr><td>Placa ilegivel no video</td><td>RF-01 = INCONCLUSIVO</td><td>"Placa nao identificada"</td><td>[Refazer Video]</td></tr>
              <tr><td>Video insuficiente (curto/escuro)</td><td>RF-02 = INCONCLUSIVO</td><td>"Video insuficiente"</td><td>[Refazer Video]</td></tr>
              <tr><td>Item do checklist danificado</td><td>RF-03 item = NAO_OK</td><td>"ATENCAO" + itens NOK listados</td><td>[Novo Checkin] com alerta</td></tr>
              <tr><td>Item nao visivel no angulo</td><td>RF-03 item = INCONCLUSIVO (applicable=false)</td><td>Item INC com motivo</td><td>[Novo Checkin]</td></tr>
              <tr><td>Foto sem area de carga</td><td>RF-05 = INCONCLUSIVO</td><td>"Carga nao identificada"</td><td>[Refazer Fotos]</td></tr>
              <tr><td>Carga nao classifica na taxonomia</td><td>RF-06 = "Outros (excecao)"</td><td>Classe "Outros" no laudo</td><td>Gestor corrige via StarRating</td></tr>
              <tr><td>Veiculo diferente no checkout</td><td>RF-04 = NAO</td><td>"NAO e o mesmo veiculo"</td><td>[Refazer Fotos] ou [Trocar Checkin]</td></tr>
              <tr><td>Checkout sem checkin previo</td><td>—</td><td>"Nenhum checkin pendente"</td><td>Veiculo deve passar pela portaria</td></tr>
              <tr><td>Checkin expirado (sem checkout em 24h)</td><td>—</td><td>Card "Expirada" no Dashboard</td><td>Novo checkin necessario</td></tr>
            </tbody>
          </Table>
        </Section>

        {/* ---- 18. HISTORICO ---- */}
        <Section>
          <h2 id="historico">18. Historico de Implementacao</h2>

          <Collapsible title="Sprints 1–9 — Implementacao base (12/03/2026)" defaultOpen>
            <Table>
              <thead><tr><th>Sprint</th><th>Entrega</th><th>Subtasks</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Banco de dados — 3 migrations, 51 defaults</td><td>5/5</td></tr>
                <tr><td>2</td><td>Edge Functions — checkin, checkout, api (Gemini 2.5 Pro + fallback)</td><td>5/5</td></tr>
                <tr><td>3</td><td>Auth, roles, VistorIARouteGuard, rotas</td><td>5/5</td></tr>
                <tr><td>4</td><td>CheckinFlow.js — 4 steps + video guiado</td><td>7/7</td></tr>
                <tr><td>5</td><td>CheckoutFlow.js — 5 steps + fotos</td><td>8/8</td></tr>
                <tr><td>6</td><td>InspectionResult.js — 2 views + bbox + StarRating</td><td>7/7</td></tr>
                <tr><td>7</td><td>Dashboard.js — 3 secoes + filtros + paginacao</td><td>10/10</td></tr>
                <tr><td>8</td><td>AdminSettings.js — 6 abas + landing demo por persona</td><td>10/10</td></tr>
                <tr><td>9</td><td>Polimento, responsividade, docs</td><td>8/8</td></tr>
              </tbody>
            </Table>
          </Collapsible>

          <Collapsible title="17 Fixes de Producao (12–17/03/2026)">
            <Table>
              <thead><tr><th>#</th><th>Problema</th><th>Solucao</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>styled-components error #12 no CheckinFlow</td><td>SmallSpinner como styled component</td></tr>
                <tr><td>2</td><td>Proxy "Internal proxy error" nas Edge Functions</td><td>Chamadas diretas as Edge Functions (sem proxy Vercel)</td></tr>
                <tr><td>3</td><td>Termos de Uso no meio do fluxo</td><td>Movido para landing page, aceite em localStorage</td></tr>
                <tr><td>4</td><td>Login redirecionava todos para /dashboard</td><td>resolveDestination() por role + function</td></tr>
                <tr><td>5</td><td>Operadores portaria vs expedicao sem distincao</td><td>Coluna function em vistoria_users</td></tr>
                <tr><td>6</td><td>Gemini retornava texto livre ao inves de JSON</td><td>responseMimeType: 'application/json' obrigatorio</td></tr>
                <tr><td>7</td><td>Textos de login restritivos</td><td>"Acesso VistorIA" — genericos</td></tr>
                <tr><td>8</td><td>Prompt generico no DB sobrescrevia prompt estruturado</td><td>Limpeza dos prompts custom; prompt default usado</td></tr>
                <tr><td>9</td><td>Chaves config com ponto vs underscore</td><td>Renomeadas: checkin. → checkin_ (e demais)</td></tr>
                <tr><td>10</td><td>Log insert com coluna inexistente (actor)</td><td>Corrigido para actor_name</td></tr>
                <tr><td>11</td><td>Frontend buscava placa como string simples</td><td>extractPlateText() — trata objeto e string</td></tr>
                <tr><td>12</td><td>Prompt real da IA invisivel nas configuracoes</td><td>PromptField: default read-only + "Personalizar"</td></tr>
                <tr><td>13</td><td>Gemini confundia O com 0 na placa (SELOCOO)</td><td>normalizePlate() por posicao Mercosul</td></tr>
                <tr><td>14</td><td>Checkout sem fotos demo</td><td>Botao "Carregar Fotos Demo" com ?demo=1</td></tr>
                <tr><td>15</td><td>TDZ — verdict declarado apos useCallback que o usava</td><td>Movido para antes do useCallback</td></tr>
                <tr><td>16</td><td>Loop auth no Puppeteer E2E</td><td>Navegacao SPA via pushState (preserva SDK)</td></tr>
                <tr><td>17</td><td>gemini-2.0-flash retorna 404 para esta API key</td><td>Revertido para gemini-2.5-pro; timeout 25s → 45s</td></tr>
              </tbody>
            </Table>
          </Collapsible>

          <Collapsible title="Sprints 10–12 — Upload Incremental Multi-CD (17/03/2026)">
            <Table>
              <thead><tr><th>Sprint</th><th>Entrega</th><th>Commit</th></tr></thead>
              <tbody>
                <tr><td>10</td><td>vistoria-checkout v10 — aceita photo_paths[] + status processando</td><td>a4e08a96</td></tr>
                <tr><td>11</td><td>CheckoutFlow — upload incremental por foto (overlay spinner/check/erro)</td><td>6dfa52a7</td></tr>
                <tr><td>12</td><td>vistoria-checkin v10 — frame_base64 embutido no frame-evidencia para bbox</td><td>87f80ae1</td></tr>
              </tbody>
            </Table>
          </Collapsible>

          <Collapsible title="Teste E2E Ciclo Completo — 17/03/2026">
            <p>Inspection ID: <code>afcb5bd1-2140-4538-8c7b-3c68010eeba3</code></p>
            <p>19 screenshots capturados. Todos os 7 RFs validados.</p>
            <p>Resultado: INCONCLUSIVO (esperado — fotos demo de outro veiculo, conciliacao NAO passou)</p>
            <p>Evidencias: <code>vistoria-photos/e2e-2026-03-17/</code></p>
          </Collapsible>
        </Section>

        <VersionInfo>
          VistorIA Docs v2.0 — 17/03/2026<br />
          Sprints 1–12 | 17 fixes de producao | E2E validado<br />
          Gerado por Claude Code (claude-sonnet-4-6)
        </VersionInfo>
      </Content>
    </Container>
  );
}
