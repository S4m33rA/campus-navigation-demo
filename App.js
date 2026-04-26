import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

const ROUTE_PROFILES = [
  {
    id: "fastest",
    title: "Fastest",
    eta: "9 min",
    description: "Shortest walk with normal pace.",
    tags: ["Most direct", "2 road crossings"]
  },
  {
    id: "step-free",
    title: "Step-free",
    eta: "12 min",
    description: "Avoid stairs and steep ramps.",
    tags: ["Wheelchair-friendly", "Lift access"]
  },
  {
    id: "safer-night",
    title: "Safer at night",
    eta: "11 min",
    description: "Better-lit paths and active areas.",
    tags: ["High visibility", "Security cameras"]
  }
];

const LIVE_STEPS = [
  "Head north to Library Walk (120 m)",
  "Turn left at Campus Cafe",
  "Continue to Engineering East Door",
  "Take lift to Level 2",
  "Room 2.14 is on your right"
];

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [screen, setScreen] = useState("home");
  const [selectedRoute, setSelectedRoute] = useState(ROUTE_PROFILES[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState("default");
  const [feedback, setFeedback] = useState(null);

  const completedPercent = useMemo(() => Math.round((currentStep / (LIVE_STEPS.length - 1)) * 100), [currentStep]);

  const colors = highContrast
    ? {
        background: "#000000",
        surface: "#111111",
        text: "#FFFFFF",
        muted: "#D4D4D8",
        brand: "#FACC15",
        brandText: "#111111",
        border: "#FFFFFF"
      }
    : {
        background: "#F5F7FF",
        surface: "#FFFFFF",
        text: "#0F172A",
        muted: "#475569",
        brand: "#1D4ED8",
        brandText: "#FFFFFF",
        border: "#CBD5E1"
      };

  const fontScale = textSize === "large" ? 1.15 : 1;

  const styles = useMemo(() => createStyles(colors, fontScale, isDesktop), [colors, fontScale, isDesktop]);

  const goToRouteSelection = () => {
    if (accessibilityMode) {
      setSelectedRoute(ROUTE_PROFILES[1]);
    }
    setScreen("routes");
  };

  const startNavigation = () => {
    setCurrentStep(0);
    setScreen("live");
  };

  const nextStep = () => {
    if (currentStep < LIVE_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    setScreen("arrival");
  };

  const reroute = () => {
    setCurrentStep(0);
  };

  const restartDemo = () => {
    setFeedback(null);
    setCurrentStep(0);
    setSelectedRoute(ROUTE_PROFILES[0]);
    setScreen("home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style={highContrast ? "light" : "dark"} />
      <StatusBar barStyle={highContrast ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.contentFrame}>
          <Text style={styles.appTitle}>Campus Compass</Text>
          <Text style={styles.appSubtitle}>UX-focused campus navigation demo</Text>
          {isDesktop && <Text style={styles.desktopBadge}>Desktop preview mode</Text>}

          {screen === "home" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Next Class</Text>
              <Text style={styles.classInfo}>COMP341 • Human-Centered Systems</Text>
              <Text style={styles.meta}>Starts in 18 min • Room 2.14, Engineering</Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Accessibility Mode</Text>
                <Switch value={accessibilityMode} onValueChange={setAccessibilityMode} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>High Contrast</Text>
                <Switch value={highContrast} onValueChange={setHighContrast} />
              </View>

              <View style={styles.textSizeRow}>
                <Text style={styles.switchLabel}>Text Size</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[styles.chip, textSize === "default" && styles.chipActive]}
                    onPress={() => setTextSize("default")}
                  >
                    <Text style={[styles.chipText, textSize === "default" && styles.chipTextActive]}>Default</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, textSize === "large" && styles.chipActive]}
                    onPress={() => setTextSize("large")}
                  >
                    <Text style={[styles.chipText, textSize === "large" && styles.chipTextActive]}>Large</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={goToRouteSelection}>
                <Text style={styles.primaryButtonText}>Get Me to Class</Text>
              </TouchableOpacity>
            </View>
          )}

          {screen === "routes" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Choose Route Preference</Text>
              <Text style={styles.meta}>Live alert: South path closed for maintenance.</Text>

              {ROUTE_PROFILES.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={[styles.routeCard, selectedRoute.id === profile.id && styles.routeCardSelected]}
                  onPress={() => setSelectedRoute(profile)}
                >
                  <View style={styles.routeHeader}>
                    <Text style={styles.routeTitle}>{profile.title}</Text>
                    <Text style={styles.routeEta}>{profile.eta}</Text>
                  </View>
                  <Text style={styles.routeDescription}>{profile.description}</Text>
                  <Text style={styles.routeTags}>{profile.tags.join(" • ")}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.primaryButton} onPress={startNavigation}>
                <Text style={styles.primaryButtonText}>Start Navigation</Text>
              </TouchableOpacity>
            </View>
          )}

          {screen === "live" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Live Guidance</Text>
              <Text style={styles.meta}>
                {selectedRoute.title} route • ETA {selectedRoute.eta} • Progress {completedPercent}%
              </Text>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${completedPercent}%` }]} />
              </View>

              <View style={styles.stepCard}>
                <Text style={styles.stepLabel}>Next Step</Text>
                <Text style={styles.stepText}>{LIVE_STEPS[currentStep]}</Text>
                <Text style={styles.stepHint}>Haptic + voice prompt available in production build.</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={reroute}>
                  <Text style={styles.secondaryButtonText}>Reroute</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButtonSmall} onPress={nextStep}>
                  <Text style={styles.primaryButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {screen === "arrival" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>You Arrived</Text>
              <Text style={styles.classInfo}>Engineering Building • Room 2.14</Text>
              <Text style={styles.meta}>Arrived on time with 4 minutes to spare.</Text>

              <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen("feedback")}>
                <Text style={styles.primaryButtonText}>Give Route Feedback</Text>
              </TouchableOpacity>
            </View>
          )}

          {screen === "feedback" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Quick UX Check</Text>
              <Text style={styles.meta}>Was this route accurate and easy to follow?</Text>

              <View style={styles.chipRow}>
                {["Yes", "Somewhat", "No"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.chip, feedback === option && styles.chipActive]}
                    onPress={() => setFeedback(option)}
                  >
                    <Text style={[styles.chipText, feedback === option && styles.chipTextActive]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.meta}>
                {feedback
                  ? `Thanks! Captured response: ${feedback}.`
                  : "Select one option to complete the contest demo flow."}
              </Text>

              <TouchableOpacity style={styles.primaryButton} onPress={restartDemo}>
                <Text style={styles.primaryButtonText}>Restart Demo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors, fontScale, isDesktop) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background
    },
    container: {
      paddingHorizontal: 18,
      paddingVertical: 24,
      gap: 14,
      alignItems: "center"
    },
    contentFrame: {
      width: "100%",
      maxWidth: isDesktop ? 760 : 520
    },
    appTitle: {
      color: colors.text,
      fontSize: 30 * fontScale,
      fontWeight: "800"
    },
    appSubtitle: {
      color: colors.muted,
      fontSize: 14 * fontScale,
      marginBottom: 6
    },
    desktopBadge: {
      alignSelf: "flex-start",
      color: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      fontSize: 12 * fontScale,
      marginBottom: 6
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 21 * fontScale,
      fontWeight: "700"
    },
    classInfo: {
      color: colors.text,
      fontSize: 17 * fontScale,
      fontWeight: "600"
    },
    meta: {
      color: colors.muted,
      fontSize: 13 * fontScale
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    switchLabel: {
      color: colors.text,
      fontSize: 15 * fontScale,
      fontWeight: "500"
    },
    textSizeRow: {
      gap: 8
    },
    chipRow: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap"
    },
    chip: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999
    },
    chipActive: {
      backgroundColor: colors.brand,
      borderColor: colors.brand
    },
    chipText: {
      color: colors.text,
      fontSize: 13 * fontScale,
      fontWeight: "500"
    },
    chipTextActive: {
      color: colors.brandText
    },
    primaryButton: {
      backgroundColor: colors.brand,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12
    },
    primaryButtonSmall: {
      backgroundColor: colors.brand,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 24,
      minWidth: 120
    },
    primaryButtonText: {
      color: colors.brandText,
      fontSize: 15 * fontScale,
      fontWeight: "700"
    },
    routeCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      gap: 6
    },
    routeCardSelected: {
      borderColor: colors.brand,
      backgroundColor: highContrastAware(colors)
    },
    routeHeader: {
      flexDirection: "row",
      justifyContent: "space-between"
    },
    routeTitle: {
      color: colors.text,
      fontSize: 16 * fontScale,
      fontWeight: "700"
    },
    routeEta: {
      color: colors.brand,
      fontSize: 14 * fontScale,
      fontWeight: "700"
    },
    routeDescription: {
      color: colors.text,
      fontSize: 14 * fontScale
    },
    routeTags: {
      color: colors.muted,
      fontSize: 12 * fontScale
    },
    progressTrack: {
      height: 10,
      width: "100%",
      borderRadius: 999,
      backgroundColor: colors.border,
      overflow: "hidden"
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.brand
    },
    stepCard: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      gap: 8
    },
    stepLabel: {
      color: colors.muted,
      fontSize: 12 * fontScale,
      textTransform: "uppercase",
      fontWeight: "700"
    },
    stepText: {
      color: colors.text,
      fontSize: 18 * fontScale,
      fontWeight: "700"
    },
    stepHint: {
      color: colors.muted,
      fontSize: 12 * fontScale
    },
    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 22
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14 * fontScale,
      fontWeight: "600"
    }
  });
}

function highContrastAware(colors) {
  return colors.brandText === "#111111" ? "#DBEAFE" : "#1F2937";
}
