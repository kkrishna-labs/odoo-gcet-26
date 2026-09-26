/**
 * Thin wrapper around lucide-react icons.
 * Usage: <Icon name="plus" className="h-4 w-4" />
 *
 * Maps the string names used throughout the app to lucide components.
 */
import {
  AlertTriangle,
  ArrowRight,
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Grid3x3,
  List,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';

const ICONS = {
  plus:         Plus,
  search:       Search,
  list:         List,
  kanban:       Grid3x3,
  x:            X,
  check:        CheckCircle2,
  trash:        Trash2,
  edit:         Edit2,
  printer:      Printer,
  chevronLeft:  ChevronLeft,
  chevronRight: ChevronRight,
  alert:        AlertTriangle,
  box:          Box,
  arrowRight:   ArrowRight,
  refresh:      RefreshCw,
  spinner:      Loader2,
};

export default function Icon({ name, className = 'h-4 w-4', ...props }) {
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component className={className} aria-hidden="true" {...props} />;
}
