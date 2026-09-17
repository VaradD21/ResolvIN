import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBrands } from '../hooks/useBrands';
import { createTicket } from '../api/ticketsApi';
import { BackendNotice } from '../components/common/BackendNotice';
import {
  Send,
  ArrowLeft,
  Mail,
  Building2,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const NewTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { brands, loading: loadingBrands, missingEndpoint, isFallback } = useBrands();

  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [brandId, setBrandId] = useState<number>(1);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    const trimmedEmail = customerEmail.trim();
    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setSubmitError('Please enter a valid customer email address.');
      return;
    }
    if (!trimmedSubject) {
      setSubmitError('Please enter a ticket subject line.');
      return;
    }
    if (!trimmedBody) {
      setSubmitError('Please enter the customer message inquiry body.');
      return;
    }
    if (!brandId) {
      setSubmitError('Please select a target brand.');
      return;
    }

    setSubmitting(true);
    try {
      const createdTicket = await createTicket({
        customerEmail: trimmedEmail,
        subject: trimmedSubject,
        body: trimmedBody,
        brandId,
      });

      // Navigate directly to the newly created ticket detail page to observe async events
      navigate(`/tickets/${createdTicket.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create ticket';
      setSubmitError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Support Ticket</h1>
        <p className="text-sm text-slate-500 mt-1">
          Simulate an incoming customer inquiry. Upon submission, ResolveDesk&apos;s Spring Boot pipeline
          will autonomously classify intent and evaluate brand policy.
        </p>
      </div>

      {/* Notice if GET /brands endpoint is pending */}
      {(missingEndpoint || isFallback) && (
        <BackendNotice
          endpoint="GET /brands"
          type="info"
          message="Backend GET /brands endpoint is not yet implemented. Brand dropdown has been pre-populated with default seed brand data (e.g. Acme Clothing, Brand ID: 1) for seamless testing."
        />
      )}

      {/* Error alert */}
      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        {/* Brand Dropdown */}
        <div>
          <label htmlFor="brandId" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Target Brand *</span>
          </label>
          <select
            id="brandId"
            value={brandId}
            onChange={(e) => setBrandId(Number(e.target.value))}
            disabled={loadingBrands || submitting}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} (ID: #{b.id})
              </option>
            ))}
          </select>
        </div>

        {/* Customer Email */}
        <div>
          <label htmlFor="customerEmail" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Customer Email Address *</span>
          </label>
          <input
            id="customerEmail"
            type="email"
            placeholder="customer@example.in"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            disabled={submitting}
            required
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Subject Line *</span>
          </label>
          <input
            id="subject"
            type="text"
            placeholder="e.g., Where is my order #123? / Request for exchange"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={submitting}
            required
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100"
          />
        </div>

        {/* Body Message */}
        <div>
          <label htmlFor="body" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Customer Inquiry Body *
          </label>
          <textarea
            id="body"
            rows={5}
            placeholder="Describe the issue, include order numbers or items if applicable..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={submitting}
            required
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100 resize-y"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Ticket...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
