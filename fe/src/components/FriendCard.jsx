import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { DateTime } from "luxon";
import "flag-icons/css/flag-icons.min.css";

function getCountryFlagClass(countryCode) {
  return `fi fi-${countryCode.toLowerCase()}`;
}

function getLocalTime(timezoneId) {
  return DateTime.now().setZone(timezoneId);
}

function formatTime(dt) {
  return dt.toFormat("h:mm a");
}

function isWorkingHours(dt) {
  const hour = dt.hour;
  return hour >= 9 && hour < 18;
}

export function FriendCard({ friend, onEdit, onDelete }) {
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

  const localTime = getLocalTime(friend.timezone_id);
  const isWorking = isWorkingHours(localTime);

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`relative transition-all hover:shadow-lg ${isDragging ? "shadow-xl ring-2 ring-primary" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Drag handle */}
            <button
              className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            {/* Flag */}
            <span className={`${getCountryFlagClass(friend.country_code)} text-2xl`} />

            {/* Friend info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{friend.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{friend.city}</p>
            </div>

            {/* Time and status */}
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums">{formatTime(localTime)}</p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  isWorking
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {isWorking ? "Working" : "Personal Time"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(friend)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(friend)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
