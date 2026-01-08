"use client";

import { 
  ShieldCheck, Globe, Activity, Lock, Copy, ExternalLink, 
  Wallet, TrendingUp, RefreshCw, ShoppingCart, Banknote, 
  ArrowRightLeft, CheckCircle2, Zap, Users, Eye, Clock, 
  Briefcase, BarChart3, Database, Heart, Vote, PiggyBank,
  Percent, Star, Share2
} from "lucide-react";

const icons: any = {
  ShieldCheckIcon: ShieldCheck,
  GlobeIcon: Globe,
  ActivityIcon: Activity,
  LockIcon: Lock,
  CopyIcon: Copy,
  ExternalLinkIcon: ExternalLink,
  WalletIcon: Wallet,
  TrendingUpIcon: TrendingUp,
  RefreshCwIcon: RefreshCw,
  ShoppingCartIcon: ShoppingCart,
  BanknoteIcon: Banknote,
  ArrowRightLeftIcon: ArrowRightLeft,
  CheckCircleIcon: CheckCircle2,
  ZapIcon: Zap,
  UsersIcon: Users,
  EyeIcon: Eye,
  ClockIcon: Clock,
  BriefcaseIcon: Briefcase,
  BarChartIcon: BarChart3,
  DatabaseIcon: Database,
  HeartIcon: Heart,
  VoteIcon: Vote,
  PiggyBankIcon: PiggyBank,
  PercentIcon: Percent,
  StarIcon: Star,
  ShareIcon: Share2
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  variant?: 'solid' | 'outline'; // Lucide icons are mostly outline, ignoring variant for now or mapping it
}

export default function AppIcon({ name, size = 24, className = "", variant }: IconProps) {
  const IconComponent = icons[name] || icons[name + "Icon"] || Activity;
  
  return <IconComponent size={size} className={className} />;
}
