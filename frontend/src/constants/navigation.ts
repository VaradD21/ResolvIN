export interface NavItem {
  label: string;
  href: string;
  badgeKey?: 'escalationsCount';
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Tickets', href: '/' },
  { label: 'Escalations', href: '/escalations', badgeKey: 'escalationsCount' },
  { label: 'New Ticket', href: '/tickets/new' },
];

export const APP_NAME = 'ResolveDesk';
export const APP_TAGLINE = 'Autonomous Support Desk';
