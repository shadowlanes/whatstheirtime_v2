import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";
import { getOffsetTime, formatTime, getDayNightState, getDayNightDisplay } from "@/utils/timeUtils";

function getCountryFlagClass(countryCode) {
  return `fi fi-${countryCode.toLowerCase()}`;
}

export function FriendCard({ friend, timeOffsetMinutes = 0, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: friend.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const localTime = getOffsetTime(friend.timezone_id, timeOffsetMinutes);
  const dayNightState = getDayNightState(localTime);
  const dayNightDisplay = getDayNightDisplay(dayNightState);

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`relative rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${dayNightDisplay.cardGradient} ${dayNightDisplay.borderColor} ${isDragging ? "shadow-xl ring-2 ring-purple-400" : "hover:shadow-purple-100/50"}`}>
        <div className="p-4 sm:p-5">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-start gap-3">
            {/* Drag handle */}
            <button
              className="cursor-grab active:cursor-grabbing touch-none text-purple-300 hover:text-purple-500 transition-colors pt-1"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            {/* Flag */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center shadow-inner flex-shrink-0">
              <span className={`${getCountryFlagClass(friend.country_code)} text-xl`} />
            </div>

            {/* Friend info and time - stacked */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-foreground truncate">{friend.name}</h3>
              <p className="text-xs text-muted-foreground font-medium truncate mb-2">{friend.city}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-2xl font-extrabold tabular-nums gradient-text">{formatTime(localTime)}</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${dayNightDisplay.className}`}>
                  <span className="text-sm">{dayNightDisplay.icon}</span>
                  <span className="hidden xs:inline">{dayNightDisplay.label}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(friend)}
                className="h-8 w-8 rounded-lg text-purple-400 hover:text-purple-600 hover:bg-purple-50"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(friend)}
                className="h-8 w-8 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Drag handle */}
            <button
              className="cursor-grab active:cursor-grabbing touch-none text-purple-300 hover:text-purple-500 transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            {/* Flag */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center shadow-inner">
              <span className={`${getCountryFlagClass(friend.country_code)} text-2xl`} />
            </div>

            {/* Friend info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground truncate">{friend.name}</h3>
              <p className="text-sm text-muted-foreground font-medium truncate">{friend.city}</p>
            </div>

            {/* Time and status */}
            <div className="text-right">
              <p className="text-3xl font-extrabold tabular-nums gradient-text">{formatTime(localTime)}</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${dayNightDisplay.className}`}>
                <span>{dayNightDisplay.icon}</span>
                {dayNightDisplay.label}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(friend)}
                className="h-9 w-9 rounded-xl text-purple-400 hover:text-purple-600 hover:bg-purple-50"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(friend)}
                className="h-9 w-9 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
