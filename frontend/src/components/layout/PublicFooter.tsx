import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../shared/Logo'
import { ShieldCheck, Phone, Mail, MapPin, ExternalLink } from 'lucide-react'

export const PublicFooter: React.FC = () => {
  return (
    <footer
      className="bg-[#142D4E] text-white border-t border-[#1D3D5C]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Company & Broker Details */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" withTagline={true} />
            <p className="text-sm text-white/75 leading-relaxed max-w-sm">
              FINCORE is an authorised technology platform operated by Fincore Insurance Broking Services Pvt Ltd. We empower Indian families and enterprises with unbiased life insurance assessment, multi-insurer comparison, and end-to-end policy servicing.
            </p>
            <div className="pt-2 space-y-2 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#16856D] flex-shrink-0" />
                <span>Level 7, Crescenzo, G Block, Bandra Kurla Complex, Mumbai, Maharashtra 400051</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#16856D] flex-shrink-0" />
                <span>1800-419-8800 (Mon–Sat, 9:00 AM – 7:00 PM IST)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#16856D] flex-shrink-0" />
                <span>support@fincore.in | advisory@fincore.in</span>
              </div>
            </div>
          </div>

          {/* Col 3: Insurance Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-['Manrope'] mb-4">
              Insurance Products
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <Link to="/insurance?category=term" className="hover:text-white transition-colors">
                  Pure Term Life Insurance
                </Link>
              </li>
              <li>
                <Link to="/insurance?category=rop" className="hover:text-white transition-colors">
                  Return of Premium (TROP)
                </Link>
              </li>
              <li>
                <Link to="/insurance?category=ulip" className="hover:text-white transition-colors">
                  Unit Linked Plans (ULIP)
                </Link>
              </li>
              <li>
                <Link to="/insurance?category=endowment" className="hover:text-white transition-colors">
                  Guaranteed Savings Plans
                </Link>
              </li>
              <li>
                <Link to="/insurance?category=retirement" className="hover:text-white transition-colors">
                  Annuity & Retirement
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-[#16856D] hover:underline font-medium inline-flex items-center gap-1">
                  Multi-Insurer Comparison &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-['Manrope'] mb-4">
              Advisory & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <Link to="/assessment" className="hover:text-white transition-colors">
                  Needs Assessment Tool
                </Link>
              </li>
              <li>
                <Link to="/about#how-it-works" className="hover:text-white transition-colors">
                  How Fincore Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Our Brokerage
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Help Desk & Contact
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Customer Portal Login
                </Link>
              </li>
              <li>
                <Link to="/app" className="text-[#16856D] hover:underline font-medium">
                  Employee CRM Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Regulatory & Governance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-['Manrope'] mb-4">
              Governance & Grievance
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <a
                  href="#grievance"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Grievance Redressal Officer: Mr. Rajeshwar Rao, Principal Officer\nEmail: grievance@fincore.in | Phone: 022-6800-4411\nEscalations to IRDAI Bima Bharosa Portal: bimabharosa.irdai.gov.in')
                  }}
                  className="hover:text-white transition-colors"
                >
                  Grievance Redressal Officer
                </a>
              </li>
              <li>
                <a
                  href="https://bimabharosa.irdai.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>IRDAI Bima Bharosa</span>
                  <ExternalLink className="w-3 h-3 text-white/50" />
                </a>
              </li>
              <li>
                <a
                  href="#ombudsman"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Insurance Ombudsman Portal: cioins.co.in\nCustomers may approach the Insurance Ombudsman within their territorial jurisdiction after approaching the insurer/broker.')
                  }}
                  className="hover:text-white transition-colors"
                >
                  Insurance Ombudsman
                </a>
              </li>
              <li>
                <Link to="/about#security" className="hover:text-white transition-colors">
                  Data Security & Privacy
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#16856D] bg-white/5 px-2.5 py-1 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ISO 27001 Certified Broker</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclosure Banner */}
        <div className="mt-12 pt-8 border-t border-white/10 text-[11px] text-white/60 leading-relaxed space-y-2">
          <p>
            <strong className="text-white/80">Statutory Notice:</strong> Fincore Insurance Broking Services Pvt. Ltd. | Registered Direct Broker (Life & General) with Insurance Regulatory and Development Authority of India (IRDAI) | Registration No: DB-984/2024 | Category: Direct Broker | Certificate valid through 14-Oct-2027 | CIN: U66000MH2024PTC392810.
          </p>
          <p>
            <strong className="text-white/80">Disclaimer:</strong> Insurance is the subject matter of solicitation. The information displayed on this website is for illustrative and comparison purposes only. Quotations provided reflect authorised insurer rate cards or demo data and are subject to underwriting guidelines, health checks, and final insurer policy issuance. Fincore does not underwrite risk or decide claim settlement.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} FINCORE Technologies & Broking Services. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about#terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/about#disclaimer" className="hover:text-white transition-colors">
              Fraud Prevention Notice
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Broker Disclosures
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
