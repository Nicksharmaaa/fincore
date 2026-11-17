import React, { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { INSURANCE_CATEGORIES, PRODUCTS_CATALOG, type ProductItem } from '../data/products'
import {
  Search,
  Filter,
  ShieldCheck,
  ArrowRight,
  Scale,
  Sparkles,
  Check,
  Info,
  Calendar,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  PhoneCall,
  Clock,
  HelpCircle,
  SlidersHorizontal,
} from 'lucide-react'
import { fetchProductsAPI } from '../../../services/api'
import { EnquiryModal, type EnquiryType } from '../../../components/EnquiryModal'

export const InsuranceCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'

  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory)
  const [insurerFilter, setInsurerFilter] = useState<string>('all')
  const [coverageFilter, setCoverageFilter] = useState<string>('all')
  const [termFilter, setTermFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Backend Products State
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS_CATALOG)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Enquiry Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<EnquiryType>('QUOTE_REQUEST')
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)

  // Load products from backend
  useEffect(() => {
    let isMounted = true
    const loadProducts = async () => {
      setIsLoading(true)
      try {
        const data = await fetchProductsAPI(categoryFilter, insurerFilter !== 'all' ? insurerFilter : undefined)
        if (isMounted && data.length > 0) {
          setProducts(data)
        }
      } catch (e) {
        console.warn('Using local catalog', e)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadProducts()
    return () => {
      isMounted = false
    }
  }, [categoryFilter, insurerFilter])

  const insurersList = useMemo(() => {
    return Array.from(new Set(PRODUCTS_CATALOG.map((p) => p.insurer)))
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter
      const matchesInsurer =
        insurerFilter === 'all' || product.insurer === insurerFilter

      // Coverage filter
      let matchesCoverage = true
      if (coverageFilter === '50l') {
        matchesCoverage = product.indicativeSumAssured.includes('50')
      } else if (coverageFilter === '1cr') {
        matchesCoverage = product.indicativeSumAssured.includes('1') || product.indicativeSumAssured.includes('50')
      } else if (coverageFilter === '2cr+') {
        matchesCoverage = true
      }

      // Term filter
      let matchesTerm = true
      if (termFilter === 'whole_life') {
        matchesTerm = product.category === 'whole_life' || product.maturityAge.includes('100') || product.maturityAge.includes('85')
      } else if (termFilter === 'under_30') {
        matchesTerm = !product.policyTerm.includes('100')
      }

      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.insurer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesInsurer && matchesCoverage && matchesTerm && matchesSearch
    })
  }, [products, categoryFilter, insurerFilter, coverageFilter, termFilter, searchQuery])

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat)
    if (cat === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', cat)
    }
    setSearchParams(searchParams)
  }

  // Active category description helper
  const currentCategoryObj = useMemo(() => {
    if (categoryFilter === 'all') return null
    return INSURANCE_CATEGORIES.find((c) => c.id === categoryFilter)
  }, [categoryFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2E8EF]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F5F2] text-[#16856D] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Authorised Life Insurance Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#142D4E] font-['Manrope']">
            Life Insurance Product Catalogue
          </h1>
          <p className="text-sm text-[#687788] mt-1 max-w-2xl">
            Browse verified policy options across 5 core categories from India’s leading life insurers. Indicative quotes &bull; Demo rate cards clearly marked.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E2E8EF] hover:bg-white text-[#142D4E] text-xs font-semibold transition-colors shadow-2xs"
          >
            <span>Needs Calculator</span>
          </Link>
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Scale className="w-4 h-4 text-[#16856D]" />
            <span>Multi-Plan Comparison</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Interactive Filter & Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8EF] shadow-2xs space-y-4">
        {/* Category Tabs: All 5 categories + All */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'term', label: 'Term Life' },
            { id: 'whole_life', label: 'Whole Life' },
            { id: 'savings', label: 'Savings & Endowment' },
            { id: 'ulip', label: 'ULIPs' },
            { id: 'retirement', label: 'Retirement & Annuity' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-[#142D4E] text-white shadow-2xs'
                  : 'bg-[#F7F9FB] text-[#687788] hover:bg-[#E9F1F5] hover:text-[#182536]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Multi-Dimensional Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-[#E2E8EF] text-xs">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#687788] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, insurer, or keyword..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs text-[#182536] focus:outline-hidden focus:border-[#142D4E]"
            />
          </div>

          {/* Insurer Filter */}
          <div>
            <select
              value={insurerFilter}
              onChange={(e) => setInsurerFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs text-[#182536] font-medium focus:outline-hidden focus:border-[#142D4E]"
            >
              <option value="all">All Authorised Insurers</option>
              {insurersList.map((ins) => (
                <option key={ins} value={ins}>
                  {ins}
                </option>
              ))}
            </select>
          </div>

          {/* Coverage Filter */}
          <div>
            <select
              value={coverageFilter}
              onChange={(e) => setCoverageFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs text-[#182536] font-medium focus:outline-hidden focus:border-[#142D4E]"
            >
              <option value="all">All Coverage Amounts</option>
              <option value="50l">Up to ₹50 Lakh</option>
              <option value="1cr">₹1 Crore Benchmark</option>
              <option value="2cr+">₹2 Crore+ High Sum Assured</option>
            </select>
          </div>

          {/* Policy Term Filter */}
          <div>
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs text-[#182536] font-medium focus:outline-hidden focus:border-[#142D4E]"
            >
              <option value="all">All Policy Terms</option>
              <option value="under_30">10 to 30 Years</option>
              <option value="whole_life">Whole Life (Till Age 85/100)</option>
            </select>
          </div>

          {/* Product Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs text-[#182536] font-medium focus:outline-hidden focus:border-[#142D4E]"
            >
              <option value="active">Active (Open for Inception)</option>
              <option value="all">All Regulatory Filings</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Educational Context Strip */}
      {currentCategoryObj && (
        <div className="bg-[#E8F5F2] border border-[#16856D]/30 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#142D4E]">
            <BookOpen className="w-4 h-4 text-[#16856D]" />
            <span>Category Guidance: {currentCategoryObj.title}</span>
          </div>
          <p className="text-xs text-[#182536] leading-relaxed">
            {currentCategoryObj.desc}
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-4 text-[11px] text-[#687788]">
            <span>
              <strong>Suitability:</strong> {currentCategoryObj.idealFor}
            </span>
            <span>&bull;</span>
            <span>
              <strong>Benchmark:</strong> {currentCategoryObj.minRecommendedCover}
            </span>
          </div>
        </div>
      )}

      {/* 4. Product Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#16856D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#687788]">Loading authorised product specifications...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8EF] p-12 text-center space-y-3">
          <p className="text-sm font-bold text-[#142D4E]">No matching policies found</p>
          <p className="text-xs text-[#687788]">
            Try adjusting your search criteria or resetting filters to explore all life insurance products.
          </p>
          <button
            onClick={() => {
              setCategoryFilter('all')
              setInsurerFilter('all')
              setCoverageFilter('all')
              setTermFilter('all')
              setSearchQuery('')
            }}
            className="px-4 py-2 rounded-lg bg-[#142D4E] text-white text-xs font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-[#E2E8EF] p-6 hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative"
            >
              {/* Demo Data Tag */}
              {product.isDemoData && (
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C58A36] bg-[#FFF8EE] border border-[#C58A36]/30 px-1.5 py-0.5 rounded">
                    Demo Data
                  </span>
                </div>
              )}

              {/* Card Header: Carrier & Category */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF] pr-16">
                  <span className="text-xs font-bold text-[#142D4E]">{product.insurer}</span>
                  <span className="text-[11px] font-semibold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                    {product.claimSettlementRatio} CSR
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1 text-[10px] text-[#687788]">
                    <span className="font-mono bg-[#F7F9FB] px-1.5 py-0.5 rounded border border-[#E2E8EF]">
                      UIN: {product.uinNumber}
                    </span>
                    <span>&bull;</span>
                    <span className="font-semibold text-[#142D4E]">{product.categoryLabel}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#142D4E] font-['Manrope']">{product.name}</h3>
                  <p className="text-xs text-[#687788] mt-1 line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>
                </div>

                {/* Key Benefits Preview */}
                <div className="space-y-1.5 pt-2 border-t border-[#E2E8EF]">
                  {product.keyBenefits.slice(0, 3).map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#182536]">
                      <Check className="w-3.5 h-3.5 text-[#16856D] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Eligibility specs */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-[#687788] bg-[#F7F9FB] p-2.5 rounded-lg border border-[#E2E8EF]/60">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#687788]">
                      Entry Age
                    </span>
                    <span className="font-semibold text-[#182536]">{product.entryAge}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#687788]">
                      Policy Term
                    </span>
                    <span className="font-semibold text-[#182536]">{product.policyTerm}</span>
                  </div>
                </div>
              </div>

              {/* Card Bottom: Premium & Actions */}
              <div className="pt-4 border-t border-[#E2E8EF] space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-[#687788] block">Indicative Monthly Premium</span>
                    <span className="text-xl font-black text-[#142D4E] font-['Manrope']">
                      ₹{product.startingPremiumMonthly.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-[#687788]"> / mo</span>
                    </span>
                  </div>
                  <span className="text-xs text-[#16856D] font-bold">
                    {product.indicativeSumAssured}
                  </span>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedProduct(product)
                      setModalType('QUOTE_REQUEST')
                      setModalOpen(true)
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white text-xs font-semibold transition-colors shadow-2xs"
                  >
                    Request Official Quote
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/insurance/${product.id}`}
                      className="w-full text-center py-1.5 px-3 rounded-lg border border-[#E2E8EF] hover:border-[#142D4E] text-xs font-semibold text-[#142D4E] transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/compare?p1=${product.id}`}
                      className="w-full text-center py-1.5 px-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] hover:bg-[#E9F1F5] text-xs font-semibold text-[#142D4E] transition-colors"
                    >
                      Compare Plan
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Statutory Regulatory Notice Strip */}
      <div className="p-4 rounded-xl bg-[#E9F1F5] text-xs text-[#687788] flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-[#16856D] shrink-0" />
        <p className="leading-relaxed">
          <strong>Mandatory Notice:</strong> All premiums displayed above are indicative and based on healthy 30-year-old non-smoker profiles. Final quotes depend on underwriting, age, and medical parameters assessed by the respective insurance provider. Fincore operates as an authorised insurance broker under IRDAI Direct Broker Regulations.
        </p>
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        enquiryType={modalType}
        productName={selectedProduct?.name}
        insurerName={selectedProduct?.insurer}
        productId={selectedProduct?.id}
        desiredSumAssured={10000000}
      />
    </div>
  )
}
