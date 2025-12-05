import React from "react";
import type { Pinpoint } from "../../types";
import { PinpointDetails } from "./PinpointDetails";
import { calculateDistance, formatDistance } from "../../utils/locationUtils";

interface BottomSheetProps {
  pinpoints: Pinpoint[];
  selectedPinpoint: Pinpoint | null;
  isOpen: boolean;
  onToggle: () => void;
  onPinpointClick: (pinpoint: Pinpoint) => void;
  onClosePinpointDetails: () => void;
  onAddPost: (
    pinpointId: string,
    postData: {
      type: "alert" | "cleaning" | "both";
      text: string;
      photos?: Array<{ url: string }>;
    }
  ) => Promise<boolean>;
  onDeletePinpoint: (pinpointId: string) => Promise<boolean>;
  userLocation?: { lat: number; lng: number } | null;
}

const getPinpointIcon = (pinpoint: Pinpoint): string => {
  if (!pinpoint.posts || pinpoint.posts.length === 0) return "📍";

  const hasAlert = pinpoint.posts.some(
    (p) => p.type === "alert" || p.type === "both"
  );
  const hasCleaning = pinpoint.posts.some(
    (p) => p.type === "cleaning" || p.type === "both"
  );

  if (hasAlert && hasCleaning) return "🔄";
  if (hasAlert) return "⚠️";
  if (hasCleaning) return "🧹";
  return "📍";
};

const getLastActionText = (action: string): string => {
  switch (action) {
    case "ALERT":
      return "⚠️ Alerta";
    case "CLEANING":
      return "🧹 Limpeza";
    case "BOTH":
      return "🔄 Ambos";
    default:
      return action;
  }
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  pinpoints,
  selectedPinpoint,
  isOpen,
  onToggle,
  onPinpointClick,
  onClosePinpointDetails,
  onAddPost,
  onDeletePinpoint,
  userLocation,
}) => {
  const [filterLastAction, setFilterLastAction] = React.useState<string>("all");

  // Calculate distances and sort pinpoints by distance
  const sortedPinpoints = React.useMemo(() => {
    if (!userLocation) return pinpoints;

    return pinpoints
      .map((pinpoint) => ({
        ...pinpoint,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          pinpoint.latitude,
          pinpoint.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [pinpoints, userLocation]) as Array<Pinpoint & { distance?: number }>;

  // Filter pinpoints by lastActionSummary
  const filteredPinpoints = React.useMemo(() => {
    if (filterLastAction === "all") return sortedPinpoints;
    return sortedPinpoints.filter(
      (p) => p.lastActionSummary === filterLastAction
    );
  }, [sortedPinpoints, filterLastAction]);

  // *** NEW HANDLER ***
  // This function will both clear the pin and close the sheet
  const handleCloseDetails = () => {
    onClosePinpointDetails(); // Clears the selected pin
    onToggle(); // Toggles the bottom sheet (from open to closed)
  };

  // If a pinpoint is selected, show its details
  if (selectedPinpoint) {
    return (
      <div className="bottom-sheet expanded">
        <PinpointDetails
          pinpoint={selectedPinpoint}
          onClose={handleCloseDetails} // <-- Use the new handler here
          onAddPost={onAddPost}
          onDelete={onDeletePinpoint}
        />
      </div>
    );
  }

  // Otherwise show the pinpoints list
  if (sortedPinpoints.length === 0) return null;

  return (
    <div className={`bottom-sheet ${isOpen ? "expanded" : "collapsed"}`}>
      {/* Handle bar for dragging */}
      <div className="bottom-sheet-handle" onClick={onToggle}>
        <div className="handle-bar"></div>
      </div>

      {/* Bottom sheet header */}
      <div className="bottom-sheet-header" onClick={onToggle}>
        <div className="header-content">
          <div className="header-icon">📍</div>
          <div className="header-text">
            <h3>Pontos</h3>
            <p>
              {sortedPinpoints.length}{" "}
              {sortedPinpoints.length === 1 ? "ponto" : "pontos"}
            </p>
          </div>
        </div>
        <div className="expand-icon">{isOpen ? "⌄" : "⌃"}</div>
      </div>

      {/* Pinpoints list - Only visible when expanded */}
      {isOpen && (
        <div className="bottom-sheet-content">
          <div className="pinpoints-filter" style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", whiteSpace: "nowrap" }}>Status:</label>
            <select
              value={filterLastAction}
              onChange={(e) => setFilterLastAction(e.target.value)}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                fontSize: 13,
                cursor: "pointer",
                backgroundColor: "white",
                flex: 1,
              }}
            >
              <option value="all">Todos</option>
              <option value="ALERT">⚠️ Alerta</option>
              <option value="CLEANING">🧹 Limpeza</option>
              <option value="BOTH">🔄 Ambos</option>
            </select>
          </div>

          <div className="rivers-list">
            {filteredPinpoints.length === 0 ? (
              <p style={{ padding: "16px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
                Nenhum ponto encontrado com o status selecionado.
              </p>
            ) : (
              filteredPinpoints.map((pinpoint) => (
                <div
                  key={pinpoint.id}
                  className="river-item"
                  onClick={() => onPinpointClick(pinpoint)}
                >
                  <div className="river-info">
                    <div className="river-icon">{getPinpointIcon(pinpoint)}</div>
                    <div className="river-details">
                      <h4 className="river-name">
                        {userLocation && pinpoint.distance !== undefined
                          ? `${formatDistance(pinpoint.distance)} de distância`
                          : `${pinpoint.latitude.toFixed(
                              4
                            )}, ${pinpoint.longitude.toFixed(4)}`}
                      </h4>
                      <p className="river-meta">
                        {pinpoint.posts?.length || 0}{" "}
                        {(pinpoint.posts?.length || 0) === 1
                          ? "postagem"
                          : "postagens"}{" "}
                        • {pinpoint.lastActionSummary ? getLastActionText(pinpoint.lastActionSummary) : "Sem status"}
                      </p>
                    </div>
                  </div>
                  <div className="river-action">
                    <div className="navigate-icon">→</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
