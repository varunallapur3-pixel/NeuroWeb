import React from "react";
import Vortex from "./Vortex.jsx";
import KineticGrid from "./KineticGrid.jsx";

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ Dynamic Cosmic Neural Background System ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

export class BackgroundBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() { return { failed: false }; }
  componentDidCatch(err) { console.error("Background render error:", err); }
  render() {
    return this.props.children;
  }
}

export function NeuralBackground({ isGraphView = false }) {
  if (isGraphView) {
    return (
      <KineticGrid
        background="#030408"
        dotColor="#FFFFFF"
        lineColor="#38BDF8"
        trailColor="#A855F7"
        spacing={35}
        radius={350}
        strength={4}
        trail={true}
      />
    );
  }

  return (
    <Vortex
      background="#030408"
      topRadius={420}
      waistRadius={85}
      waistPosition={50}
      bottomRadius={1150}
      twist={3.2}
      zoom={75}
      speed={10}
      direction="right"
      dots={true}
      comets={true}
      lineOptions={{ count: 200, color: "#a5f3fc", glow: 12 }}
      dotOptions={{ count: 6000, size: 20, color: "#38bdf8", glow: 15, flicker: 10 }}
      cometOptions={{ count: 12, speed: 7, color: "#c084fc", glow: 15, tail: 22, delay: 5 }}
    />
  );
}

export { Vortex, KineticGrid };
