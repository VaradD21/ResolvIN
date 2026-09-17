import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, PlusCircle, AlertCircle, Ticket } from 'lucide-react';
import { NAV_ITEMS, APP_NAME, APP_TAGLINE } from '../../constants/navigation';
import { API_BASE_URL } from '../../api/client';

interface NavbarProps {
  unresolvedEscalationsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ unresolvedEscalationsCount = 0 }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-xs group-hover:bg-brand-700 transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                {APP_NAME}
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                {APP_TAGLINE}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => {
              const showBadge = item.badgeKey === 'escalationsCount' && unresolvedEscalationsCount > 0;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `relative px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.href === '/' && <Ticket className="w-4 h-4" />}
                  {item.href === '/escalations' && <AlertCircle className="w-4 h-4" />}
                  {item.href === '/tickets/new' && <PlusCircle className="w-4 h-4" />}
                  <span>{item.label}</span>
                  {showBadge && (
                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                      {unresolvedEscalationsCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Backend Connection Pill */}
          <div className="hidden md:flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            <span className="font-mono text-slate-600 truncate max-w-[180px]" title={API_BASE_URL}>
              {API_BASE_URL}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
