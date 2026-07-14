"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// Ported from the reference build's Pannellum-based 360° tour.
// Pannellum is a free, open-source panorama viewer (github.com/mpetroff/pannellum) —
// nothing proprietary here, just needs its script + CSS and real equirectangular photos.

type Scene = { id: string; name: string };

const TOUR_SCENES: Scene[] = [
  { id: "reception", name: "Reception" },
  { id: "coworking", name: "Coworking Floor" },
  { id: "office", name: "Private Office" },
  { id: "meeting", name: "Boardroom" },
  { id: "lounge", name: "Community Lounge" },
];

const TOUR_LINKS: Record<string, [string, number][]> = {
  reception: [["coworking", 25], ["lounge", -135]],
  coworking: [["office", 30], ["reception", 165]],
  office: [["meeting", 15], ["coworking", 170]],
  meeting: [["lounge", 25], ["office", -160]],
  lounge: [["reception", 40], ["meeting", -150]],
};

// Map each scene to its panorama image. Swap these for real equirectangular
// photos as they're shot — until then this will show broken images, which
// is expected (see README note on 360 photography requirements).
const TOUR_IMAGES: Record<string, string> = {
  reception: "/images/tour/reception.jpg",
  coworking: "/images/tour/coworking.jpg",
  office: "/images/tour/office.jpg",
  meeting: "/images/tour/meeting.jpg",
  lounge: "/images/tour/lounge.jpg",
};

declare global {
  interface Window {
    pannellum: any;
  }
}

export default function VirtualTour({
  open,
  onClose,
  startScene = "reception",
}: {
  open: boolean;
  onClose: () => void;
  startScene?: string;
}) {
  const viewerRef = useRef<any>(null);
  const [currentScene, setCurrentScene] = useState(startScene);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Load Pannellum's script + CSS from CDN once
  useEffect(() => {
    if (window.pannellum) {
      setScriptsLoaded(true);
      return;
    }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.css";
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.js";
    script.onload = () => setScriptsLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!open || !scriptsLoaded) return;

    const scenes: Record<string, any> = {};
    TOUR_SCENES.forEach((s) => {
      const hotSpots = (TOUR_LINKS[s.id] || []).map(([target, yaw]) => {
        const t = TOUR_SCENES.find((x) => x.id === target);
        return {
          pitch: -3,
          yaw,
          type: "scene",
          text: t?.name ?? target,
          sceneId: target,
          cssClass: "tour-hs tour-hs--go",
        };
      });
      scenes[s.id] = {
        title: s.name,
        type: "equirectangular",
        panorama: TOUR_IMAGES[s.id],
        autoLoad: true,
        hotSpots,
      };
    });

    viewerRef.current = window.pannellum.viewer("pano", {
      default: {
        firstScene: startScene,
        autoLoad: true,
        sceneFadeDuration: 900,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        compass: false,
        autoRotate: -2,
        autoRotateInactivityDelay: 3500,
        hfov: 100,
      },
      scenes,
    });

    viewerRef.current.on("scenechange", (sceneId: string) => {
      setCurrentScene(sceneId);
    });

    return () => {
      viewerRef.current?.destroy?.();
      viewerRef.current = null;
    };
  }, [open, scriptsLoaded, startScene]);

  if (!open) return null;

  const activeScene = TOUR_SCENES.find((s) => s.id === currentScene);

  return (
    <div className="fixed inset-0 z-[300] bg-charcoal">
      <div id="pano" className="absolute inset-0" />

      <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-charcoal/80 to-transparent">
        <span className="font-display text-lg text-cream">
          <span className="text-sage-300 italic">flo</span>work.{" "}
          <span className="ml-2 text-xs align-middle bg-cream/10 rounded-full px-3 py-1 uppercase tracking-wide">
            360&deg; Virtual Tour
          </span>
        </span>
        <button
          onClick={onClose}
          aria-label="Close virtual tour"
          className="text-cream/80 hover:text-cream"
        >
          <X size={28} />
        </button>
      </div>

      <div className="absolute bottom-24 left-4 md:left-6 text-cream">
        <p className="font-display text-xl">{activeScene?.name}</p>
        <p className="text-xs text-cream/60">Drag to look around · tap a room to move</p>
      </div>

      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 flex-wrap px-4">
        {TOUR_SCENES.map((s) => (
          <button
            key={s.id}
            onClick={() => viewerRef.current?.loadScene(s.id)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              currentScene === s.id
                ? "bg-sage-500 text-cream"
                : "bg-cream/10 text-cream/70 hover:bg-cream/20"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}