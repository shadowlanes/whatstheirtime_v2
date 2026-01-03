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
      <div className={`relative bg-white rounded-2xl border border-purple-100 shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-purple-100 hover:-translate-y-0.5 ${isDragging ? "shadow-xl ring-2 ring-purple-400" : ""}`}>
        <div className="p-5">
          <div className="flex items-center gap-4">
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
