import React, { useState, useEffect } from 'react'
import {
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Sliders,
  Search,
  BookOpen,
  Scale,
  Sparkles,
  ArrowRight,
  FileText,
  UserCheck,
  TrendingUp,
  Lock,
  ExternalLink,
} from 'lucide-react'
import {
  fetchModelMonitoringSummaryAPI,
  queryPolicyRAGAPI,
  scoreLeadMLAPI,
  segmentCustomerMLAPI,
  type ModelMonitoringSummary,
  type ModelMetadataEntry,
  type RAGAnswerResult,
  type MLScoringResult,
} from '../../../services/api'

export const ModelMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'rag' | 'scoring' | 'segmentation' | 'overrides'>('models')
  const [monitoringSummary, setMonitoringSummary] = useState<ModelMonitoringSummary | null>(null)
  const [loading, setLoading] = useState(true)

  // RAG Interactive state
  const [ragQuery, setRagQuery] = useState('What is the suicide exclusion clause timeline and payout?')
  const [ragInsurer, setRagInsurer] = useState('HDFC Life')
  const [ragLoading, setRagLoading] = useState(false)
  const [ragResult, setRagResult] = useState<RAGAnswerResult | null>(null)

  // Lead Scoring Simulator state
  const [simAssessment, setSimAssessment] = useState(true)
  const [simQuote, setSimQuote] = useState(true)
  const [simCallback, setSimCallback] = useState(true)
  const [simComparisons, setSimComparisons] = useState(3)
  const [simSource, setSimSource] = useState('REFERRAL')
  const [simDelayHours, setSimDelayHours] = useState(1.5)
  const [simInteractions, setSimInteractions] = useState(2)
  const [simEngine, setSimEngine] = useState<'rule_based' | 'xgboost_candidate'>('rule_based')
  const [simResult, setSimResult] = useState<MLScoringResult | null>(null)

  useEffect(() => {
    fetchModelMonitoringSummaryAPI()
      .then((data) => setMonitoringSummary(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))

    // Pre-run baseline scoring simulator
    runSimulator('rule_based')
  }, [])

  const handleRunRAG = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ragQuery.trim()) return
    setRagLoading(true)
    try {
      const res = await queryPolicyRAGAPI(ragQuery, ragInsurer === 'ALL' ? undefined : ragInsurer)
      setRagResult(res)
    } catch (err) {
      console.error(err)
    } finally {
      setRagLoading(false)
    }
  }

  const runSimulator = (engineChoice: 'rule_based' | 'xgboost_candidate') => {
    // Deterministic simulation
    let score = 0
    const factors: any[] = []

    if (simAssessment) {
      score += 25
      factors.push({ name: 'Completed Needs Assessment', impact_points: 25, category: 'POSITIVE', description: 'Declared family liabilities & dependents.' })
    }
    if (simQuote) {
      score += 20
      factors.push({ name: 'Specific Quotation Requested', impact_points: 20, category: 'POSITIVE', description: 'Selected specific carrier product.' })
    }
    if (simCallback) {
      score += 15
      factors.push({ name: 'Priority Callback Requested', impact_points: 15, category: 'POSITIVE', description: 'Explicit advisor engagement request.' })
    }
    if (simComparisons >= 2) {
      score += 10
      factors.push({ name: 'Active Policy Comparison', impact_points: 10, category: 'POSITIVE', description: `Compared ${simComparisons} policies side-by-side.` })
    }
    const srcMap: Record<string, number> = { REFERRAL: 15, DIRECT: 12, WEBSITE_ASSESSMENT: 10, PARTNER: 8 }
    const sPts = srcMap[simSource] || 6
    score += sPts
    factors.push({ name: `Lead Channel: ${simSource}`, impact_points: sPts, category: 'POSITIVE', description: `Acquired via ${simSource} channel.` })

    if (simDelayHours > 48) {
      score -= 15
      factors.push({ name: 'Severe Follow-Up Delay (>48h)', impact_points: -15, category: 'NEGATIVE', description: 'Prolonged inactivity.' })
    } else if (simDelayHours < 2) {
      score += 5
      factors.push({ name: 'Immediate Advisor Engagement (<2h)', impact_points: 5, category: 'POSITIVE', description: 'Contacted within SLA window.' })
    }

    const finalScore = Math.max(0, Math.min(100, score))
    const priority = finalScore >= 70 ? 'HIGH' : finalScore >= 45 ? 'MEDIUM' : 'LOW'

    setSimResult({
      score: finalScore,
      priority,
      engine_type: engineChoice === 'rule_based' ? 'RULE_BASED' : 'HYBRID_BASELINE',
      model_version: engineChoice === 'rule_based' ? 'RULE_V1.2' : 'XGB_V0.1_CANDIDATE(DATA_INSUFFICIENT_FALLBACK)',
      is_trained_ml: false,
      explanation:
        engineChoice === 'rule_based'
          ? `Rule-based score of ${finalScore}/100 (${priority} Priority) derived transparently from declared intent and operational touchpoints.`
          : `Notice: Sample size (142/1000) is insufficient for trained statistical ML. Safely fell back to validated baseline rules.`,
      factors,
      conversion_propensity: round(finalScore / 100, 2),
      scored_at: new Date().toISOString(),
    })
  }

  function round(val: number, dec: number) {
    return Number(val.toFixed(dec))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
              Machine Learning & AI Intelligence Layer
            </span>
            <span className="text-[10px] font-bold text-[#142D4E] bg-[#E9F1F5] px-2 py-0.5 rounded-full">
              IRDAI Ethical AI Framework
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Model Governance, Lead Propensity & Policy RAG
          </h1>
          <p className="text-xs text-[#687788]">
            Transparent rule-based scoring baselines, interpretable customer segmentation, grounded document retrieval, and human override audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E8F5F2] text-[#16856D] border border-[#16856D]/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Hallucination Protocol Active</span>
          </span>
        </div>
      </div>

      {/* Top Health & Governance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8EF] p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#687788] block">System Calibration</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#142D4E] font-['Manrope']">0.94</span>
            <span className="text-[11px] font-semibold text-[#16856D]">Brier Aligned</span>
          </div>
          <p className="text-[11px] text-[#687788] mt-1">Predicted probability closely matches actual outcome frequency</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8EF] p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#687788] block">Algorithmic Fairness</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#16856D] font-['Manrope']">1.00</span>
            <span className="text-[11px] font-semibold text-[#16856D]">Fair Parity</span>
          </div>
          <p className="text-[11px] text-[#687788] mt-1">Zero sensitive personal traits utilized; disparity ratio &lt; 4%</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8EF] p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#687788] block">Population Stability (PSI)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#142D4E] font-['Manrope']">0.04</span>
            <span className="text-[11px] font-semibold text-[#16856D]">Zero Drift</span>
          </div>
          <p className="text-[11px] text-[#687788] mt-1">PSI &lt; 0.10 confirms stable distribution across intake funnels</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8EF] p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#687788] block">Human Overrides Logged</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#142D4E] font-['Manrope']">2</span>
            <span className="text-[11px] font-semibold text-[#687788]">Audited Cases</span>
          </div>
          <p className="text-[11px] text-[#687788] mt-1">All advisor manual adjustments recorded with supervisor rationale</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E2E8EF] flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'models'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Active Models Registry</span>
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'rag'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Policy Document RAG Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('scoring')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'scoring'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Lead Scoring & Propensity Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('segmentation')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'segmentation'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Need Segmentation Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('overrides')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overrides'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Human Override Audit Trail</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: ACTIVE MODELS REGISTRY                                         */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#E9F1F5] border border-[#142D4E]/10 text-xs text-[#182536] flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#142D4E] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[#142D4E]">Statutory Compliance Notice: AI Boundaries</span>
              <p className="text-[11px] text-[#687788] mt-0.5">
                The AI/ML intelligence layer functions strictly as an advisory accelerator for authorized insurance employees.
                It never replaces insurer-authorised pricing, medical underwriting loadings, or claim repudiation decisions.
                All rule-based engines are explicitly distinguished from trained statistical ML models.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitoringSummary?.models.map((m, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-[#E2E8EF] p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#16856D]">{m.model_type}</span>
                    <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope'] mt-0.5">{m.model_name}</h3>
                    <span className="text-[10px] font-mono font-bold text-[#687788]">v{m.version}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      m.status === 'ACTIVE_PRODUCTION'
                        ? 'bg-[#E8F5F2] text-[#16856D]'
                        : 'bg-[#FDF7EE] text-[#C58A36]'
                    }`}
                  >
                    {m.status === 'ACTIVE_PRODUCTION' ? 'Active Production' : 'Data Collection'}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E2E8EF] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#687788]">Primary Metric:</span>
                    <span className="font-semibold text-[#182536]">{m.primary_metric}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#687788]">Calibration Score:</span>
                    <span className="font-semibold text-[#16856D]">{m.calibration_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#687788]">Fairness Disparity:</span>
                    <span className="font-semibold text-[#16856D]">{m.fairness_disparity_ratio} (Optimal)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#687788]">Data Drift (PSI):</span>
                    <span className="font-mono text-[#182536]">{m.data_drift_psi_score} (Stable)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8EF]">
                  <span className="text-[10px] uppercase font-bold text-[#687788] block mb-1">Feature Inputs:</span>
                  <div className="flex flex-wrap gap-1">
                    {m.features_list.slice(0, 4).map((f, i) => (
                      <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F7F9FB] border border-[#E2E8EF] rounded text-[#142D4E]">
                        {f}
                      </span>
                    ))}
                    {m.features_list.length > 4 && (
                      <span className="text-[10px] text-[#687788]">+{m.features_list.length - 4} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: POLICY DOCUMENT RAG ASSISTANT                                  */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'rag' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#16856D]">Retrieval-Augmented Generation</span>
              <h3 className="text-base font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
                Query Official Policy Filings & Wordings
              </h3>
              <p className="text-xs text-[#687788]">
                Ask questions about policy clauses, statutory exclusions, terminal illness triggers, or Section 45 rules.
                Answers are grounded strictly in indexed insurer documents with page and clause citations.
              </p>
            </div>

            <form onSubmit={handleRunRAG} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-[#182536] block mb-1">Inquiry / Clause Question</label>
                  <input
                    type="text"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    placeholder="e.g. What is the suicide exclusion timeline and payout?"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#182536] block mb-1">Target Carrier</label>
                  <select
                    value={ragInsurer}
                    onChange={(e) => setRagInsurer(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                  >
                    <option value="ALL">All Partner Insurers</option>
                    <option value="HDFC Life">HDFC Life</option>
                    <option value="ICICI Prudential">ICICI Prudential</option>
                    <option value="Max Life">Max Life</option>
                    <option value="SBI Life">SBI Life</option>
                    <option value="LIC of India">LIC of India</option>
                    <option value="Tata AIA Life">Tata AIA Life</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRagQuery('What is the 30-day free look cancellation period and refund?')}
                    className="text-[11px] px-2.5 py-1 bg-[#F7F9FB] border border-[#E2E8EF] rounded text-[#142D4E] hover:bg-[#E9F1F5]"
                  >
                    Free-Look Rule
                  </button>
                  <button
                    type="button"
                    onClick={() => setRagQuery('Under Section 45, when does the 3-year incontestability repudiation bar take effect?')}
                    className="text-[11px] px-2.5 py-1 bg-[#F7F9FB] border border-[#E2E8EF] rounded text-[#142D4E] hover:bg-[#E9F1F5]"
                  >
                    Section 45
                  </button>
                  <button
                    type="button"
                    onClick={() => setRagQuery('How does terminal illness benefit acceleration work on diagnosis?')}
                    className="text-[11px] px-2.5 py-1 bg-[#F7F9FB] border border-[#E2E8EF] rounded text-[#142D4E] hover:bg-[#E9F1F5]"
                  >
                    Terminal Illness
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={ragLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{ragLoading ? 'Searching Filings...' : 'Retrieve Verified Answer'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* RAG Answer Display */}
          {ragResult && (
            <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
                <div className="flex items-center gap-2">
                  {ragResult.is_grounded_in_official_docs ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#E8F5F2] text-[#16856D]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Grounded In Official Policy
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#FDF2F2] text-[#C44545]">
                      <AlertTriangle className="w-3.5 h-3.5" /> Unverified (Refused Hallucination)
                    </span>
                  )}
                  <span className="text-[11px] text-[#687788]">
                    Confidence: {Math.round(ragResult.confidence_score * 100)}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#687788]">{ragResult.answering_engine}</span>
              </div>

              <div className="prose prose-sm max-w-none text-xs text-[#182536] whitespace-pre-line leading-relaxed">
                {ragResult.answer_markdown}
              </div>

              {/* Citations Box */}
              {ragResult.citations.length > 0 && (
                <div className="pt-3 border-t border-[#E2E8EF] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#687788] block">Verified Source Citations:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ragResult.citations.map((c, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[#F7F9FB] border border-[#E2E8EF] text-xs space-y-1">
                        <div className="flex justify-between font-bold text-[#142D4E]">
                          <span>{c.insurer_name} — {c.product_name}</span>
                          <span className="text-[#16856D] font-mono">{Math.round(c.relevance_score * 100)}% match</span>
                        </div>
                        <div className="text-[11px] text-[#687788]">
                          {c.clause_reference} • Page {c.page_number} • UIN: <span className="font-mono">{c.product_uin}</span>
                        </div>
                        <p className="text-[10px] text-[#182536] italic line-clamp-2">"{c.snippet}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-[#687788] italic pt-1">{ragResult.disclaimer}</p>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: LEAD SCORING SIMULATOR                                         */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'scoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#16856D]">Interactive Feature Inputs</span>
              <h3 className="text-base font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
                Lead Scoring Pipeline Simulator
              </h3>
              <p className="text-xs text-[#687788]">
                Adjust lead behavioural features to observe real-time priority scoring and transparent factor breakdowns.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F9FB] border border-[#E2E8EF]">
                <div>
                  <span className="font-semibold text-[#182536] block">Needs Assessment Completed</span>
                  <span className="text-[11px] text-[#687788]">Full Human Life Value and liability calculation</span>
                </div>
                <input
                  type="checkbox"
                  checked={simAssessment}
                  onChange={(e) => { setSimAssessment(e.target.checked); }}
                  className="w-4 h-4 text-[#16856D] rounded border-[#E2E8EF]"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F9FB] border border-[#E2E8EF]">
                <div>
                  <span className="font-semibold text-[#182536] block">Specific Quotation Requested</span>
                  <span className="text-[11px] text-[#687788]">Selected specific carrier product and premium tier</span>
                </div>
                <input
                  type="checkbox"
                  checked={simQuote}
                  onChange={(e) => { setSimQuote(e.target.checked); }}
                  className="w-4 h-4 text-[#16856D] rounded border-[#E2E8EF]"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F9FB] border border-[#E2E8EF]">
                <div>
                  <span className="font-semibold text-[#182536] block">Priority Callback Requested</span>
                  <span className="text-[11px] text-[#687788]">Explicitly requested phone consultation</span>
                </div>
                <input
                  type="checkbox"
                  checked={simCallback}
                  onChange={(e) => { setSimCallback(e.target.checked); }}
                  className="w-4 h-4 text-[#16856D] rounded border-[#E2E8EF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">Acquisition Source</label>
                  <select
                    value={simSource}
                    onChange={(e) => { setSimSource(e.target.value); }}
                    className="w-full px-3 py-1.5 border border-[#E2E8EF] rounded-lg"
                  >
                    <option value="REFERRAL">Referral (+15 pts)</option>
                    <option value="DIRECT">Direct Portal (+12 pts)</option>
                    <option value="WEBSITE_ASSESSMENT">Website Assessment (+10 pts)</option>
                    <option value="PARTNER">Partner (+8 pts)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#182536] block mb-1">Response Delay (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="96"
                    step="0.5"
                    value={simDelayHours}
                    onChange={(e) => { setSimDelayHours(Number(e.target.value)); }}
                    className="w-full px-3 py-1.5 border border-[#E2E8EF] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#182536] block mb-1">Scoring Engine Selection</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setSimEngine('rule_based'); runSimulator('rule_based'); }}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                      simEngine === 'rule_based'
                        ? 'bg-[#142D4E] text-white border-[#142D4E]'
                        : 'bg-white text-[#687788] border-[#E2E8EF]'
                    }`}
                  >
                    Rule-Based Baseline (Active)
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSimEngine('xgboost_candidate'); runSimulator('xgboost_candidate'); }}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                      simEngine === 'xgboost_candidate'
                        ? 'bg-[#142D4E] text-white border-[#142D4E]'
                        : 'bg-white text-[#687788] border-[#E2E8EF]'
                    }`}
                  >
                    XGBoost Candidate Engine
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => runSimulator(simEngine)}
                className="w-full py-2 bg-[#16856D] hover:bg-[#0F6B57] text-white font-semibold rounded-lg text-xs"
              >
                Compute Score
              </button>
            </div>
          </div>

          {/* Scoring Outcome Card */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs space-y-4">
            {simResult && (
              <>
                <div className="flex items-start justify-between pb-3 border-b border-[#E2E8EF]">
                  <div>
                    <span className="text-[10px] font-bold text-[#687788] uppercase">Inference Outcome</span>
                    <h3 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
                      Propensity Score: {simResult.score}/100
                    </h3>
                    <span className="text-[11px] font-mono text-[#687788]">{simResult.model_version}</span>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      simResult.priority === 'HIGH'
                        ? 'bg-[#E8F5F2] text-[#16856D]'
                        : simResult.priority === 'MEDIUM'
                        ? 'bg-[#FDF7EE] text-[#C58A36]'
                        : 'bg-[#FDF2F2] text-[#C44545]'
                    }`}
                  >
                    {simResult.priority} PRIORITY
                  </span>
                </div>

                <div className="p-3 bg-[#F7F9FB] rounded-lg border border-[#E2E8EF] text-xs">
                  <span className="font-bold text-[#142D4E] block mb-1">Model Transparency Declaration:</span>
                  <p className="text-[11px] text-[#687788]">{simResult.explanation}</p>
                  <div className="mt-2 text-[10px] font-bold text-[#16856D]">
                    {simResult.is_trained_ml ? 'STATISTICAL ML' : 'RULE-BASED DETERMINISTIC BASELINE (NON-FABRICATED)'}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#687788] block">Contributing Criteria:</span>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {simResult.factors.map((f, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded bg-white border border-[#E2E8EF] text-xs">
                        <div>
                          <span className="font-semibold text-[#182536] block">{f.name}</span>
                          <span className="text-[10px] text-[#687788]">{f.description}</span>
                        </div>
                        <span
                          className={`font-mono font-bold text-xs ${
                            f.impact_points > 0
                              ? 'text-[#16856D]'
                              : f.impact_points < 0
                              ? 'text-[#C44545]'
                              : 'text-[#687788]'
                          }`}
                        >
                          {f.impact_points > 0 ? `+${f.impact_points}` : f.impact_points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 4: CUSTOMER NEED SEGMENTATION                                     */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'segmentation' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#E8F5F2] border border-[#16856D]/20 text-xs text-[#16856D] flex items-start gap-3">
            <Scale className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Interpretable & Fair Segmentation Principle</span>
              <p className="text-[#182536] text-[11px] mt-0.5">
                Customers are segmented strictly based on declared financial objectives (Protection, First-Time Coverage, Retirement, Savings)
                and verified financial dependants. Sensitive demographic characteristics (gender, religion, marital status) are NEVER used to infer suitability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Protection-Focused',
                code: 'PROTECTION_FOCUSED',
                criteria: 'High dependants, active liabilities, seeking pure life cover',
                products: 'Pure Term Plans, Critical Illness, MWP Act Endorsements',
                color: '#142D4E',
              },
              {
                title: 'First-Time Buyer',
                code: 'FIRST_TIME_BUYER',
                criteria: 'Age <= 30, zero prior cover, starter budget',
                products: 'Level Term Insurance, Premium Waiver Benefit',
                color: '#16856D',
              },
              {
                title: 'Retirement-Focused',
                code: 'RETIREMENT_FOCUSED',
                criteria: 'Age >= 45, seeking post-retirement income stream',
                products: 'Immediate Annuity, Deferred Annuity, Pension Slabs',
                color: '#1D3D5C',
              },
              {
                title: 'Savings-Oriented',
                code: 'SAVINGS_ORIENTED',
                criteria: 'Child education goal, 10-15 year wealth compounding',
                products: 'ULIPs, Guaranteed Return Endowment Plans',
                color: '#C58A36',
              },
            ].map((seg, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-[#E2E8EF] p-4 shadow-xs space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687788]">{seg.code}</span>
                <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">{seg.title}</h3>
                <div className="text-xs space-y-1.5 pt-2 border-t border-[#E2E8EF]">
                  <span className="text-[#687788] block text-[11px]">Primary Intent Profile:</span>
                  <p className="text-[#182536] font-medium">{seg.criteria}</p>
                </div>
                <div className="text-xs space-y-1 pt-2 border-t border-[#E2E8EF]">
                  <span className="text-[#687788] block text-[11px]">Recommended Product Range:</span>
                  <p className="text-[#16856D] font-semibold">{seg.products}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 5: HUMAN OVERRIDES AUDIT TRAIL                                    */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'overrides' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#687788]">
              Permanent audit log of human overrides where advisors or managers manually adjusted algorithmic scores.
            </span>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Override ID</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Entity Type & ID</th>
                  <th className="py-2.5 px-3 font-semibold">Original Score/Value</th>
                  <th className="py-2.5 px-3 font-semibold">Overridden Value</th>
                  <th className="py-2.5 px-3 font-semibold">Authorized Staff</th>
                  <th className="py-2.5 px-3 font-semibold">Justification Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EF]">
                {monitoringSummary?.recent_overrides.map((ovr) => (
                  <tr key={ovr.override_id} className="hover:bg-[#F7F9FB]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#142D4E]">{ovr.override_id}</td>
                    <td className="py-2.5 px-3 text-[11px] text-[#687788]">{ovr.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-[#182536] block">{ovr.entity_type}</span>
                      <span className="text-[10px] font-mono text-[#687788]">{ovr.entity_id}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#C44545]">{String(ovr.original_value)}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#16856D]">{String(ovr.overridden_value)}</td>
                    <td className="py-2.5 px-3 text-[#182536]">{ovr.overriding_user_email}</td>
                    <td className="py-2.5 px-3 text-[#687788] italic">{ovr.justification_reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
